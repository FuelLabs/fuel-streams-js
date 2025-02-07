import {
  ClientError,
  type ClientResponse,
  DeliverPolicy,
  FuelNetwork,
} from '@fuels/streams';
import { Client, type Connection } from '@fuels/streams';
import { createActorContext } from '@xstate/react';
import { toast } from 'sonner';
import {
  type StateFrom,
  assign,
  fromCallback,
  fromPromise,
  sendTo,
  setup,
} from 'xstate';
import { LocalStorage } from './local-storage';
import type { Subscription } from './use-subscriptions';

const localStorage = new LocalStorage('@fuel-streams/api-key');

type StreamEvent =
  | {
      type: 'START';
      subscriptions: Subscription[];
      deliverPolicy: DeliverPolicy;
    }
  | { type: 'STOP' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: ClientResponse<any, any> }
  | { type: 'CHANGE_NETWORK'; network: FuelNetwork }
  | { type: 'CHANGE_TAB'; tab: 'data' | 'code' }
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'DISCONNECT' };

type StreamActorInput = {
  deliverPolicy: DeliverPolicy;
  subscriptions: Subscription[];
  network: FuelNetwork;
  apiKey: string | null;
};

type ClientActorInput = {
  network: FuelNetwork;
  apiKey: string | null;
};

const createClientActor = fromPromise<Connection, ClientActorInput>(
  async ({ input: { network, apiKey } }) => {
    if (!apiKey) throw ClientError.MissingApiKey();
    return Client.connect(network, apiKey);
  },
);

const switchNetworkActor = fromPromise<Connection, ClientActorInput>(
  async ({ input: { network, apiKey } }) => {
    if (!apiKey) throw ClientError.MissingApiKey();
    return Client.connect(network, apiKey);
  },
);

const subscriptionActor = fromCallback<StreamEvent, StreamActorInput>(
  ({ sendBack, input, receive }) => {
    let cleanup: (() => void) | undefined;
    let connection: Connection | undefined;

    (async () => {
      const { subscriptions, deliverPolicy, network, apiKey } = input;
      if (!apiKey) throw ClientError.MissingApiKey();
      connection = await Client.connect(network, apiKey);
      const payloads = subscriptions.map((sub) => sub.subjectPayload!);
      const subscription = await connection.subscribeWithPayload(
        deliverPolicy,
        payloads,
      );
      cleanup = subscription.onMessage((data) => {
        sendBack({ type: 'DATA', data });
      });
    })();

    receive((event) => {
      if (event.type === 'STOP') {
        cleanup?.();
        connection?.close();
        sendBack({ type: 'DISCONNECT' });
      }
    });

    return () => {
      cleanup?.();
      connection?.close();
    };
  },
);

export const streamMachine = setup({
  types: {
    context: {} as {
      deliverPolicy: DeliverPolicy;
      subscriptions: Subscription[];
      data: Array<ClientResponse<any, any>>;
      network: FuelNetwork;
      tab: 'data' | 'code';
      apiKey: string | null;
    },
  },
  actors: {
    subscriptionActor,
    createClientActor,
    switchNetworkActor,
  },
  actions: {
    setSubjectAndPayload: assign({
      subscriptions: ({ event }) => {
        if (event.type !== 'START') return [];
        return event.subscriptions;
      },
      deliverPolicy: ({ event }) => {
        if (event.type !== 'START') return DeliverPolicy.new();
        return event.deliverPolicy;
      },
    }),
    newDataFromSubscription: assign({
      data: ({ context, event }) => {
        if (event.type !== 'DATA') return context.data;
        return [event.data, ...context.data.slice(0, 19)];
      },
    }),
    clearData: assign({
      data: () => [],
    }),
    removeSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'STOP') return context.subscriptions;
        return context.subscriptions.filter((sub) => sub.id !== event.id);
      },
    }),
    setNetwork: assign({
      network: ({ event }) => {
        if (event.type !== 'CHANGE_NETWORK') return 'mainnet';
        return event.network;
      },
    }),
    setTab: assign({
      tab: ({ event }) => {
        if (event.type !== 'CHANGE_TAB') return 'data';
        return event.tab;
      },
    }),
    clearState: assign({
      data: () => [],
      subscriptions: () => [],
      apiKey: () => {
        localStorage.removeApiKey();
        return null;
      },
    }),
    notifyNetworkChange: ({ context }) => {
      toast.success(`Successfully connected to ${context.network}`);
    },
    setApiKey: assign({
      apiKey: ({ event }) => {
        if (event.type !== 'SET_API_KEY') return null;
        localStorage.setApiKey(event.apiKey);
        return event.apiKey;
      },
    }),
    notifyConnectionError: ({ event }) => {
      if (!event.error && event.type !== 'SET_API_KEY') return;
      if (event.error instanceof ClientError) {
        toast.error(event.error.message);
      } else {
        toast.error('Failed to connect to server');
      }
    },
    notifyNetworkError: ({ event }) => {
      if (!event.error && event.type !== 'CHANGE_NETWORK') return;
      if (event.error instanceof ClientError) {
        toast.error(event.error.message);
      } else {
        toast.error('Failed to connect to network');
      }
    },
    notifySubscriptionError: ({ event }) => {
      if (!event.error) return;
      if (event.error instanceof ClientError) {
        toast.error(event.error.message);
      } else {
        toast.error('Failed to subscribe to stream');
      }
    },
  },
}).createMachine({
  id: 'streamMachine',
  initial: 'checkingApiKey',
  context: () => ({
    deliverPolicy: DeliverPolicy.new(),
    subscriptions: [],
    data: [],
    tab: 'data',
    network: import.meta.env.DEV ? FuelNetwork.Local : FuelNetwork.Mainnet,
    apiKey: localStorage.getApiKey(),
  }),
  states: {
    checkingApiKey: {
      tags: ['connecting'],
      always: [
        {
          guard: ({ context }) => {
            const apiKey = localStorage.getApiKey();
            return Boolean(apiKey || context.apiKey);
          },
          actions: assign({
            apiKey: () => localStorage.getApiKey(),
          }),
          target: 'connecting',
        },
        {
          target: 'idle',
        },
      ],
    },
    connecting: {
      tags: ['connecting'],
      invoke: {
        id: 'connect',
        src: 'createClientActor',
        input: ({ context }) => ({
          network: context.network,
          apiKey: context.apiKey,
        }),
        onDone: {
          target: 'ready',
        },
        onError: {
          target: 'idle',
          actions: ['notifyConnectionError'],
        },
      },
    },
    idle: {
      entry: assign({
        data: () => [],
      }),
    },
    ready: {
      tags: ['connected'],
      on: {
        START: {
          actions: ['setSubjectAndPayload'],
          target: 'subscribing',
        },
        CHANGE_NETWORK: {
          target: 'switchingNetwork',
          actions: ['setNetwork'],
        },
        CHANGE_TAB: {
          actions: ['setTab'],
        },
      },
    },
    switchingNetwork: {
      tags: ['connecting'],
      entry: ['clearState'],
      invoke: {
        id: 'switchNetwork',
        src: 'switchNetworkActor',
        input: ({ context }) => ({
          network: context.network,
          apiKey: context.apiKey,
        }),
        onDone: {
          target: 'ready',
          actions: ['notifyNetworkChange'],
        },
        onError: {
          target: 'idle',
          actions: ['notifyNetworkError'],
        },
      },
    },
    subscribing: {
      tags: ['connected'],
      invoke: {
        id: 'subscribe',
        src: 'subscriptionActor',
        input: ({ context }) => ({
          deliverPolicy: context.deliverPolicy,
          subscriptions: context.subscriptions,
          network: context.network,
          apiKey: context.apiKey,
        }),
        onError: {
          target: 'ready',
          actions: ['notifySubscriptionError'],
        },
      },
      on: {
        DATA: {
          actions: ['newDataFromSubscription'],
        },
        STOP: {
          actions: [
            sendTo('subscribe', { type: 'STOP' }),
            'removeSubscription',
          ],
        },
        DISCONNECT: {
          target: 'ready',
        },
        CHANGE_NETWORK: {
          target: 'switchingNetwork',
          actions: ['setNetwork'],
        },
      },
    },
  },
  on: {
    SET_API_KEY: {
      actions: ['clearState', 'setApiKey'],
      target: '.checkingApiKey',
    },
    CLEAR: {
      actions: ['clearData'],
    },
  },
});

type State = StateFrom<typeof streamMachine>;

const selectors = {
  isSubscribing: (state: State) => state.matches('subscribing'),
  isConnecting: (state: State) => state.hasTag('connecting'),
  isConnected: (state: State) => state.hasTag('connected'),
  network: (state: State) => state.context.network,
  tab: (state: State) => state.context.tab,
  data: (state: State) => state.context.data,
  apiKey: (state: State) => state.context.apiKey,
  subscriptions: (state: State) => state.context.subscriptions,
};

export const StreamDataContext = createActorContext(streamMachine);

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const isConnecting = StreamDataContext.useSelector(selectors.isConnecting);
  const isConnected = StreamDataContext.useSelector(selectors.isConnected);
  const network = StreamDataContext.useSelector(selectors.network);
  const tab = StreamDataContext.useSelector(selectors.tab);
  const data = StreamDataContext.useSelector(selectors.data);
  const apiKey = StreamDataContext.useSelector(selectors.apiKey);
  const subscriptions = StreamDataContext.useSelector(selectors.subscriptions);

  function start(subscriptions: Subscription[], deliverPolicy: DeliverPolicy) {
    actor.send({ type: 'START', subscriptions, deliverPolicy });
  }

  function stop() {
    actor.send({ type: 'STOP' });
  }

  function clear() {
    actor.send({ type: 'CLEAR' });
  }

  function changeNetwork(network: FuelNetwork) {
    actor.send({ type: 'CHANGE_NETWORK', network });
  }

  function changeTab(tab: 'data' | 'code') {
    actor.send({ type: 'CHANGE_TAB', tab });
  }

  function setApiKey(apiKey: string) {
    actor.send({ type: 'SET_API_KEY', apiKey });
  }

  return {
    start,
    stop,
    clear,
    changeNetwork,
    changeTab,
    network,
    tab,
    data,
    subscriptions,
    isConnecting,
    isSubscribing,
    isConnected,
    apiKey,
    setApiKey,
  };
}
