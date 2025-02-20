import { ClientError, type ClientResponse } from '@fuels/streams';
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
import { useConnection } from './use-connection';
import { useDeliverPolicy } from './use-deliver-policy';
import { useStreamTab } from './use-stream-tab';
import { useSubscriptions } from './use-subscriptions';

const connectionActor = fromPromise(async () => {
  const { connect, isConnected } = useConnection.getState();
  const { abi } = useStreamTab.getState();
  if (!isConnected) {
    await connect(abi);
  }
});

type StreamEvent =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'CLEAR' }
  | { type: 'DATA'; data: ClientResponse<any, any> }
  | { type: 'ERROR'; error: Error }
  | { type: 'DISCONNECT' };

const subscriptionActor = fromCallback<StreamEvent, null>(
  ({ sendBack, receive }) => {
    let cleanup: (() => void) | undefined;
    let cleanupError: (() => void) | undefined;
    let isCleanedUp = false;

    const performCleanup = async () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      cleanup?.();
      cleanupError?.();

      const connection = useConnection.getState().connection;
      const { deliverPolicy } = useDeliverPolicy.getState();
      const { subscriptions } = useSubscriptions.getState();
      const payloads = subscriptions.map((sub) => sub.subjectPayload!);

      if (connection?.isConnected()) {
        try {
          await connection.unsubscribe(deliverPolicy, payloads);
        } catch (error) {
          // Ignore unsubscribe errors during cleanup
          console.warn('Error during unsubscribe:', error);
        }
      }

      sendBack({ type: 'DISCONNECT' });
    };

    const connection = useConnection.getState().connection;
    const { subscriptions } = useSubscriptions.getState();
    const { deliverPolicy } = useDeliverPolicy.getState();
    const payloads = subscriptions.map((sub) => sub.subjectPayload!);

    if (!connection) {
      throw new Error('No active connection');
    }

    (async () => {
      try {
        const subscription = await connection.subscribeWithPayload(
          deliverPolicy,
          payloads,
        );

        cleanup = subscription.onMessage((data) => {
          sendBack({ type: 'DATA', data });
        });

        cleanupError = subscription.onMessageError((error) => {
          sendBack({ type: 'ERROR', error });
        });
      } catch (error) {
        sendBack({ type: 'ERROR', error: error as Error });
        await performCleanup();
      }
    })();

    receive(async (event) => {
      if (event.type === 'STOP') {
        await performCleanup();
      }
    });

    return async () => {
      await performCleanup();
    };
  },
);

export const streamMachine = setup({
  types: {
    context: {} as {
      data: Array<ClientResponse<any, any>>;
    },
  },
  actors: {
    subscriptionActor,
    connectionActor,
  },
  actions: {
    newDataFromSubscription: assign({
      data: ({ context, event }) => {
        if (event.type !== 'DATA') return context.data;
        return [event.data, ...context.data.slice(0, 19)];
      },
    }),
    clearData: assign({
      data: () => [],
    }),
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
  initial: 'connecting',
  context: {
    data: [],
  },
  states: {
    connecting: {
      invoke: {
        id: 'connect',
        src: 'connectionActor',
        onDone: 'idle',
        onError: 'idle',
      },
    },
    idle: {
      on: {
        START: {
          target: 'subscribing',
          guard: () => useConnection.getState().isConnected,
        },
      },
    },
    subscribing: {
      invoke: {
        id: 'subscribe',
        src: 'subscriptionActor',
        input: () => null,
        onError: {
          target: 'idle',
          actions: ['notifySubscriptionError'],
        },
      },
      on: {
        DATA: {
          actions: ['newDataFromSubscription'],
        },
        STOP: {
          actions: [sendTo('subscribe', { type: 'STOP' })],
        },
        DISCONNECT: {
          target: 'connecting',
        },
        ERROR: {
          actions: ['notifySubscriptionError'],
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
export const StreamDataContext = createActorContext(streamMachine);
const selectors = {
  isSubscribing: (state: State) => state.matches('subscribing'),
  data: (state: State) => state.context.data,
};

export function useStreamData() {
  const actor = StreamDataContext.useActorRef();
  const isSubscribing = StreamDataContext.useSelector(selectors.isSubscribing);
  const data = StreamDataContext.useSelector(selectors.data);

  function start() {
    actor.send({ type: 'START' });
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
    isSubscribing,
  };
}
