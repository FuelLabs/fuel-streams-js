import {
  ClientError,
  type ClientResponse,
  FuelNetwork,
  type SubscriptionPayload,
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

const localStorage = new LocalStorage('@fuel-streams/api-key');

type StreamEvent =
  | {
      type: 'START';
      subject: string;
      subscriptionPayload: SubscriptionPayload;
    }
  | { type: 'STOP_CONNECTION' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: ClientResponse<any, any> }
  | { type: 'CHANGE_NETWORK'; network: FuelNetwork }
  | { type: 'CHANGE_TAB'; tab: 'data' | 'code' }
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'DISCONNECT' };

type StreamActorInput = {
  subject: string;
  subscriptionPayload: SubscriptionPayload;
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
      const { subscriptionPayload: payload, network, apiKey } = input;
      if (!apiKey) throw ClientError.MissingApiKey();
      connection = await Client.connect(network, apiKey);
      const subscription = await connection.subscribeWithPayload(payload);
      cleanup = subscription.onMessage((data) => {
        sendBack({ type: 'DATA', data });
      });
    })();

    receive((event) => {
      if (event.type === 'STOP_CONNECTION') {
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
      subject: string | null;
      subscriptionPayload: SubscriptionPayload | null;
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
      subject: ({ event }) => {
        if (event.type !== 'START') return null;
        return event.subject;
      },
      subscriptionPayload: ({ event }) => {
        if (event.type !== 'START') return null;
        return event.subscriptionPayload;
      },
    }),
    newDataFromSubscription: assign({
      data: ({ context, event }) => {
        if (event.type !== 'DATA') return [];
        return [event.data, ...context.data.slice(0, 19)];
      },
    }),
    clearData: assign({
      data: () => [],
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
      subject: () => null,
      subscriptionPayload: () => null,
      data: () => [],
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
    subject: null,
    subscriptionPayload: null,
    data: [],
    tab: 'data',
    network: FuelNetwork.Staging,
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
        subject: () => null,
        subscriptionPayload: () => null,
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
        input: ({ context }) => {
          if (!context.subject || !context.subscriptionPayload) {
            throw new Error('Missing required subscription parameters');
          }
          return {
            subject: context.subject,
            subscriptionPayload: context.subscriptionPayload,
            network: context.network,
            apiKey: context.apiKey,
          };
        },
        onError: {
          target: 'ready',
          actions: ['notifySubscriptionError'],
        },
      },
      on: {
        DATA: {
          actions: ['newDataFromSubscription'],
        },
        STOP_CONNECTION: {
          actions: sendTo('subscribe', { type: 'STOP_CONNECTION' }),
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
  data: (state: State) => state.context.data,
  network: (state: State) => state.context.network,
  tab: (state: State) => state.context.tab,
};

export const StreamDataContext = createActorContext(streamMachine);

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const isConnecting = StreamDataContext.useSelector(selectors.isConnecting);
  const isConnected = StreamDataContext.useSelector(selectors.isConnected);
  const data = StreamDataContext.useSelector(selectors.data);
  const network = StreamDataContext.useSelector(selectors.network);
  const tab = StreamDataContext.useSelector(selectors.tab);
  const apiKey = StreamDataContext.useSelector((state) => state.context.apiKey);

  function start(subject: string, subscriptionPayload: SubscriptionPayload) {
    actor.send({ type: 'START', subject, subscriptionPayload });
  }

  function stop() {
    actor.send({ type: 'STOP_CONNECTION' });
  }

  function clear() {
    actor.send({ type: 'CLEAR' });
  }

  function changeNetwork(network: FuelNetwork) {
    stop();
    actor.send({ type: 'CHANGE_NETWORK', network });
  }

  function changeTab(tab: 'data' | 'code') {
    stop();
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
    data,
    network,
    tab,
    isConnecting,
    isSubscribing,
    isConnected,
    apiKey,
    setApiKey,
  };
}
