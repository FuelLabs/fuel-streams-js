import type { SubjectPayload } from '@fuels/streams';
import type {
  FormField,
  ModuleKeys,
  SelectOption,
} from '@fuels/streams/subjects-def';
import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';
import type { Nullable } from '../utils';

export type SubscriptionProps = {
  subject: string;
  formData: Record<string, string>;
  currentFields: FormField[];
  moduleOptions: SelectOption[];
  variantOptions: SelectOption[];
  selectedModule: ModuleKeys;
  selectedVariant: string;
  selectedFields: Record<string, string>;
  subjectClass: string;
  subjectPayload: SubjectPayload;
};

export type Subscription = SubscriptionProps & {
  id: string;
  isActive: boolean;
};

export const subscriptionsMachine = setup({
  types: {
    context: {} as {
      subscriptions: Subscription[];
      selectedSubscription: Subscription | null;
    },
    events: {} as
      | {
          type: 'ADD_SUBSCRIPTION';
          input: SubscriptionProps;
        }
      | { type: 'REMOVE_SUBSCRIPTION'; id: string }
      | {
          id: string;
          type: 'EDIT_SUBSCRIPTION';
          input: Nullable<SubscriptionProps>;
        }
      | { type: 'START_ADDING' }
      | { type: 'START_EDITING'; id: string }
      | { type: 'CANCEL' },
  },
  actions: {
    clearSelectedSubscription: assign({
      selectedSubscription: () => null,
    }),
    setSelectedSubscription: assign({
      selectedSubscription: ({ context, event }) => {
        if (event.type !== 'START_EDITING') return null;
        return context.subscriptions.find((sub) => sub.id === event.id) ?? null;
      },
    }),
    addSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'ADD_SUBSCRIPTION') return context.subscriptions;
        const newSubscription: Subscription = {
          ...event.input,
          id: crypto.randomUUID(),
          isActive: false,
        };
        return [...context.subscriptions, newSubscription];
      },
    }),
    removeSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'REMOVE_SUBSCRIPTION') return context.subscriptions;
        return context.subscriptions.filter((sub) => sub.id !== event.id);
      },
    }),
    editSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'EDIT_SUBSCRIPTION') return context.subscriptions;
        const newProps = event.input as SubscriptionProps;
        return context.subscriptions.map((sub) =>
          sub.id === event.id ? { ...sub, ...newProps } : sub,
        );
      },
    }),
  },
}).createMachine({
  id: 'subscriptionsMachine',
  initial: 'idle',
  context: {
    subscriptions: [],
    selectedSubscription: null,
  },
  states: {
    idle: {
      tags: ['closed'],
      entry: 'clearSelectedSubscription',
      on: {
        REMOVE_SUBSCRIPTION: { actions: 'removeSubscription' },
        START_ADDING: 'adding',
        START_EDITING: {
          target: 'editing',
          actions: 'setSelectedSubscription',
        },
      },
    },
    adding: {
      tags: ['opened'],
      on: {
        ADD_SUBSCRIPTION: {
          actions: 'addSubscription',
          target: 'idle',
        },
        CANCEL: 'idle',
      },
    },
    editing: {
      tags: ['opened'],
      on: {
        EDIT_SUBSCRIPTION: {
          actions: 'editSubscription',
          target: 'idle',
        },
        CANCEL: 'idle',
      },
    },
  },
});

export const SubscriptionsContext = createActorContext(subscriptionsMachine);

type State = StateFrom<typeof subscriptionsMachine>;

const selectors = {
  subscriptions: (state: State) => state.context.subscriptions,
  isAdding: (state: State) => state.matches('adding'),
  isEditing: (state: State) => state.matches('editing'),
  selectedSubscription: (state: State) => state.context.selectedSubscription,
  isOpened: (state: State) => state.hasTag('opened'),
};

export function useSubscriptions() {
  const actor = SubscriptionsContext.useActorRef();
  const subscriptions = SubscriptionsContext.useSelector(
    selectors.subscriptions,
  );
  const isAdding = SubscriptionsContext.useSelector(selectors.isAdding);
  const isEditing = SubscriptionsContext.useSelector(selectors.isEditing);
  const isOpened = SubscriptionsContext.useSelector(selectors.isOpened);
  const selectedSubscription = SubscriptionsContext.useSelector(
    selectors.selectedSubscription,
  );

  function startAdding() {
    actor.send({ type: 'START_ADDING' });
  }

  function startEditing(id: string) {
    actor.send({ type: 'START_EDITING', id });
  }

  function cancel() {
    actor.send({ type: 'CANCEL' });
  }

  function addSubscription(input: SubscriptionProps) {
    actor.send({ type: 'ADD_SUBSCRIPTION', input });
  }

  function removeSubscription(id: string) {
    actor.send({ type: 'REMOVE_SUBSCRIPTION', id });
  }

  function editSubscription(id: string, input: Nullable<SubscriptionProps>) {
    actor.send({ id, type: 'EDIT_SUBSCRIPTION', input });
  }

  return {
    subscriptions,
    isAdding,
    isEditing,
    isOpened,
    selectedSubscription,
    startAdding,
    startEditing,
    cancel,
    addSubscription,
    removeSubscription,
    editSubscription,
  };
}
