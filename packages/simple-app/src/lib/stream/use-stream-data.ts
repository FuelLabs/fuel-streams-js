import {
  BlockStream,
  Client,
  ClientOpts,
  InputStream,
  LogStream,
  OutputStream,
  ReceiptStream,
  type Stream,
  type Subscription,
  TransactionStream,
} from '@fuels/streams';
import { createActorContext } from '@xstate/react';
import {
  type StateFrom,
  assign,
  fromCallback,
  fromPromise,
  setup,
} from 'xstate';
import type { FormModuleType } from '../form/form-types';
// import { createBrowserInspector } from '@statelyai/inspect';

// const { inspect } = createBrowserInspector();

export type StreamData = {
  subject: string;
  payload: unknown;
  timestamp: string;
};

type StreamEvent =
  | { type: 'CONNECTED'; client: Client }
  | { type: 'START'; subject: string; selectedModule: FormModuleType }
  | { type: 'STOP' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: StreamData };

type StreamActorInput = {
  subject: string;
  selectedModule: FormModuleType;
  client: Client;
};

async function getStreamFromModule(
  client: Client,
  mod: FormModuleType,
): Promise<Stream> {
  switch (mod) {
    case 'blocks':
      return BlockStream.init(client);
    case 'transactions':
      return TransactionStream.init(client);
    case 'logs':
      return LogStream.init(client);
    case 'inputs':
      return InputStream.init(client);
    case 'outputs':
      return OutputStream.init(client);
    case 'receipts':
      return ReceiptStream.init(client);
    default:
      throw new Error(`Unsupported module type: ${mod}`);
  }
}

const clientActor = fromPromise(async () => {
  return Client.connect(new ClientOpts());
});

const subscriptionActor = fromCallback<StreamEvent, StreamActorInput>(
  ({ sendBack, input }) => {
    let subscription: Subscription;
    const abortController = new AbortController();

    (async () => {
      const { client, selectedModule, subject } = input;
      const stream = await getStreamFromModule(client, selectedModule);
      subscription = await stream.subscribe(subject);

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
      client: Client | null;
      subject: string | null;
      selectedModule: FormModuleType | null;
      data: StreamData[];
    },
  },
  actors: {
    subscriptionActor,
    clientActor,
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
    setClient: assign({
      client: ({ event }) => {
        if (event.type !== 'CONNECTED') return null;
        return event.client;
      },
    }),
    clearData: assign({
      data: () => {
        return [];
      },
    }),
  },
}).createMachine({
  id: 'streamMachine',
  initial: 'connecting',
  context: () => ({
    client: null,
    subject: null,
    selectedModule: null,
    data: [],
  }),
  states: {
    connecting: {
      invoke: {
        id: 'connect',
        src: 'clientActor',
        onDone: {
          target: 'idle',
          actions: assign({
            client: ({ event }) => event.output,
          }),
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
        CLEAR: {
          actions: ['clearData'],
        },
      },
    },
    subscribing: {
      invoke: {
        id: 'subscribe',
        src: 'subscriptionActor',
        input: ({ context }) => ({
          selectedModule: context.selectedModule as FormModuleType,
          subject: context.subject as string,
          client: context.client as Client,
        }),
      },
      on: {
        DATA: {
          actions: ['newDataFromSubscription'],
        },
        STOP: {
          target: 'idle',
        },
      },
    },
  },
});

type State = StateFrom<typeof streamMachine>;

const selectors = {
  isSubscribing: (state: State) => state.matches('subscribing'),
  isConnecting: (state: State) => state.matches('connecting'),
  data: (state: State) => state.context.data,
};

export const StreamDataContext = createActorContext(streamMachine);

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const isConnecting = StreamDataContext.useSelector(selectors.isConnecting);
  const data = StreamDataContext.useSelector(selectors.data);

  function start(data: Omit<StreamActorInput, 'client'>) {
    actor.send({ type: 'START', ...data });
  }

  function stop() {
    actor.send({ type: 'STOP' });
  }

  function clear() {
    actor.send({ type: 'CLEAR' });
  }

  return {
    start,
    stop,
    clear,
    data,
    isConnecting,
    isSubscribing,
  };
}