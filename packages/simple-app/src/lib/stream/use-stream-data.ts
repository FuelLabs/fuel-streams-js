import { DeliverPolicy, FuelNetwork } from '@fuels/streams';
// import { createBrowserInspector } from '@statelyai/inspect';
import { Client, type Connection } from '@fuels/streams';
import type { ModuleKeys } from '@fuels/streams/subjects-def';
import { createActorContext } from '@xstate/react';
import { toast } from 'sonner';
import {
  type StateFrom,
  assign,
  fromCallback,
  fromPromise,
  setup,
} from 'xstate';

// const { inspect } = createBrowserInspector();

type StreamEvent =
  | { type: 'START'; subject: string; selectedModule: ModuleKeys }
  | { type: 'STOP' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: { subject: string; payload: any } }
  | { type: 'CHANGE_NETWORK'; network: FuelNetwork }
  | { type: 'CHANGE_TAB'; tab: 'data' | 'code' }
  | { type: 'CHANGE_DELIVERY_POLICY'; policy: DeliverPolicy };

type StreamActorInput = {
  subject: string;
  deliverPolicy: DeliverPolicy;
  network: FuelNetwork;
};

type ClientActorInput = {
  network: FuelNetwork;
};

const createClientActor = fromPromise<Connection, ClientActorInput>(
  async ({ input: { network } }) => {
    const client = await Client.new(network);
    return client.connect();
  },
);

const switchNetworkActor = fromPromise<Connection, ClientActorInput>(
  async ({ input: { network } }) => {
    const client = await Client.new(network);
    return client.connect();
  },
);

const subscriptionActor = fromCallback<StreamEvent, StreamActorInput>(
  ({ sendBack, input }) => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { subject, deliverPolicy, network } = input;
      const client = await Client.getInstance(network);
      const connection = await client.connect();
      const subscription = await connection.subscribeWithString(
        subject,
        deliverPolicy,
      );

      cleanup = subscription.onMessage((data) => {
        sendBack({ type: 'DATA', data });
      });
    })();

    return () => {
      cleanup?.();
    };
  },
);

export const streamMachine = setup({
  types: {
    context: {} as {
      subject: string | null;
      selectedModule: ModuleKeys | null;
      data: Array<any>;
      network: FuelNetwork;
      tab: 'data' | 'code';
      deliverPolicy: DeliverPolicy;
    },
  },
  actors: {
    subscriptionActor,
    createClientActor,
    switchNetworkActor,
  },
  actions: {
    setSubjectAndModule: assign({
      subject: ({ event }) => {
        if (event.type !== 'START') return null;
        return event.subject;
      },
      selectedModule: ({ context, event }) => {
        if (event.type !== 'START') return null;
        return event.selectedModule === context.selectedModule
          ? context.selectedModule
          : event.selectedModule;
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
    setDeliveryPolicy: assign({
      deliverPolicy: ({ event }) => {
        if (event.type !== 'CHANGE_DELIVERY_POLICY') return DeliverPolicy.New;
        return event.policy;
      },
    }),
    clearState: assign({
      subject: () => null,
      selectedModule: () => null,
      data: () => [],
    }),
    notifyNetworkChange: ({ context }) => {
      toast.success(`Successfully connected to ${context.network}`);
    },
    notifyNetworkError: () => {
      toast.error('Failed to connect to network');
    },
  },
}).createMachine({
  id: 'streamMachine',
  initial: 'connecting',
  context: () => ({
    subject: null,
    selectedModule: null,
    data: [],
    network: FuelNetwork.Staging,
    tab: 'data',
    deliverPolicy: DeliverPolicy.New,
  }),
  states: {
    connecting: {
      invoke: {
        id: 'connect',
        src: 'createClientActor',
        input: ({ context }) => ({
          network: context.network,
        }),
        onDone: {
          target: 'idle',
        },
        onError: {
          target: 'idle',
        },
      },
    },
    idle: {
      entry: assign({
        subject: () => null,
        selectedModule: () => null,
      }),
      on: {
        START: {
          actions: ['setSubjectAndModule'],
          target: 'subscribing',
        },
        CHANGE_NETWORK: {
          target: 'switchingNetwork',
          actions: ['setNetwork'],
        },
        CHANGE_TAB: {
          actions: ['setTab'],
        },
        CHANGE_DELIVERY_POLICY: {
          actions: ['setDeliveryPolicy'],
        },
      },
    },
    switchingNetwork: {
      entry: ['clearState'],
      invoke: {
        id: 'switchNetwork',
        src: 'switchNetworkActor',
        input: ({ context }) => ({
          network: context.network,
        }),
        onDone: {
          target: 'idle',
          actions: ['notifyNetworkChange'],
        },
        onError: {
          target: 'idle',
          actions: ['notifyNetworkError'],
        },
      },
    },
    subscribing: {
      invoke: {
        id: 'subscribe',
        src: 'subscriptionActor',
        input: ({ context }) => ({
          subject: context.subject as string,
          deliverPolicy: context.deliverPolicy,
          network: context.network,
        }),
      },
      on: {
        DATA: {
          actions: ['newDataFromSubscription'],
        },
        STOP: {
          target: 'idle',
        },
        CHANGE_NETWORK: {
          target: 'switchingNetwork',
          actions: ['setNetwork'],
        },
      },
    },
  },
  on: {
    CLEAR: {
      actions: ['clearData'],
    },
  },
});

type State = StateFrom<typeof streamMachine>;

const selectors = {
  isSubscribing: (state: State) => state.matches('subscribing'),
  isConnecting: (state: State) => {
    return state.matches('connecting') || state.matches('switchingNetwork');
  },
  data: (state: State) => state.context.data,
  network: (state: State) => state.context.network,
  tab: (state: State) => state.context.tab,
  deliverPolicy: (state: State) => state.context.deliverPolicy,
};

export const StreamDataContext = createActorContext(streamMachine);

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const isConnecting = StreamDataContext.useSelector(selectors.isConnecting);
  const data = StreamDataContext.useSelector(selectors.data);
  const network = StreamDataContext.useSelector(selectors.network);
  const tab = StreamDataContext.useSelector(selectors.tab);
  const deliverPolicy = StreamDataContext.useSelector(selectors.deliverPolicy);

  function start(data: Pick<StreamActorInput, 'subject'>) {
    actor.send({ type: 'START', ...data });
  }

  function stop() {
    actor.send({ type: 'STOP' });
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

  function changeDeliveryPolicy(policy: DeliverPolicy) {
    actor.send({ type: 'CHANGE_DELIVERY_POLICY', policy });
  }

  return {
    start,
    stop,
    clear,
    changeNetwork,
    changeTab,
    changeDeliveryPolicy,
    data,
    network,
    tab,
    deliverPolicy,
    isConnecting,
    isSubscribing,
  };
}
