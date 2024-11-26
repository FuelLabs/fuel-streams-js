import {
  BlocksStream,
  Client,
  InputsStream,
  LogsStream,
  type Network,
  OutputsStream,
  ReceiptsStream,
  type Stream,
  type Subscription,
  TransactionsStream,
} from '@fuels/streams';
import type { ModuleKeys } from '@fuels/streams/subjects-def';
import { createActorContext } from '@xstate/react';
// import { createBrowserInspector } from '@statelyai/inspect';
import { toast } from 'sonner';
import {
  type StateFrom,
  assign,
  fromCallback,
  fromPromise,
  setup,
} from 'xstate';

// const { inspect } = createBrowserInspector();

export type StreamData = {
  subject: string;
  payload: unknown;
  timestamp: string;
};

type StreamEvent =
  | { type: 'START'; subject: string; selectedModule: ModuleKeys }
  | { type: 'STOP' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: StreamData }
  | { type: 'CHANGE_NETWORK'; network: string }
  | { type: 'CHANGE_TAB'; tab: 'data' | 'code' };

type StreamActorInput = {
  subject: string;
  selectedModule: ModuleKeys;
};

type ClientActorInput = {
  network: keyof typeof Network;
};

async function getStreamFromModule(
  client: Client,
  mod: ModuleKeys,
): Promise<Stream> {
  switch (mod) {
    case 'blocks':
      return BlocksStream.init(client);
    case 'transactions':
      return TransactionsStream.init(client);
    case 'logs':
      return LogsStream.init(client);
    case 'inputs':
      return InputsStream.init(client);
    case 'outputs':
      return OutputsStream.init(client);
    case 'receipts':
      return ReceiptsStream.init(client);
    default:
      throw new Error(`Unsupported module type: ${mod}`);
  }
}

const createClientActor = fromPromise<Client, ClientActorInput>(
  async ({ input }) => Client.connect(input),
);

const switchNetworkActor = fromPromise<Client, ClientActorInput>(
  async ({ input: { network } }) => {
    const client = Client.getInstance();
    return client.switchNetwork(network);
  },
);

const subscriptionActor = fromCallback<StreamEvent, StreamActorInput>(
  ({ sendBack, input }) => {
    let subscription: Subscription;
    const abortController = new AbortController();

    (async () => {
      const { selectedModule, subject } = input;
      const client = Client.getInstance();
      const stream = await getStreamFromModule(client, selectedModule);
      subscription = await stream.subscribeWithString(subject);

      if (abortController.signal.aborted) return;
      for await (const msg of subscription) {
        if (abortController.signal.aborted) break;
        const payload = msg.json();
        sendBack({ type: 'DATA', data: payload });
      }
    })();

    return () => {
      abortController.abort();
      subscription?.stop();
    };
  },
);

const streamMachine = setup({
  types: {
    context: {} as {
      subject: string | null;
      selectedModule: ModuleKeys | null;
      data: StreamData[];
      network: keyof typeof Network;
      tab: 'data' | 'code';
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
        return [event.data].concat(context.data);
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
    network: 'mainnet',
    tab: 'data',
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
          selectedModule: context.selectedModule as ModuleKeys,
          subject: context.subject as string,
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
};

export const StreamDataContext = createActorContext(streamMachine);

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const isConnecting = StreamDataContext.useSelector(selectors.isConnecting);
  const data = StreamDataContext.useSelector(selectors.data);
  const network = StreamDataContext.useSelector(selectors.network);
  const tab = StreamDataContext.useSelector(selectors.tab);

  function start(data: Omit<StreamActorInput, 'client'>) {
    actor.send({ type: 'START', ...data });
  }

  function stop() {
    actor.send({ type: 'STOP' });
  }

  function clear() {
    actor.send({ type: 'CLEAR' });
  }

  function changeNetwork(network: string) {
    stop();
    actor.send({ type: 'CHANGE_NETWORK', network });
  }

  function changeTab(tab: 'data' | 'code') {
    stop();
    actor.send({ type: 'CHANGE_TAB', tab });
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
  };
}
