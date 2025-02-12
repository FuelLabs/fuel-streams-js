import type { SubjectPayload } from '@fuels/streams';
import type {
  FormField,
  ModuleKeys,
  SelectOption,
} from '@fuels/streams/subjects-def';
import { create } from 'zustand';
import type { Nullable } from '../utils';

// Types from the original file
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

type SubscriptionState = {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  isAdding: boolean;
  isEditing: boolean;

  // Actions
  startAdding: () => void;
  startEditing: (id: string) => void;
  cancel: () => void;
  addSubscription: (input: SubscriptionProps) => void;
  removeSubscription: (id: string) => void;
  editSubscription: (id: string, input: Nullable<SubscriptionProps>) => void;
};

export const useSubscriptions = create<SubscriptionState>((set) => ({
  subscriptions: [],
  selectedSubscription: null,
  isAdding: false,
  isEditing: false,

  startAdding: () =>
    set({
      isAdding: true,
      isEditing: false,
      selectedSubscription: null,
    }),

  startEditing: (id) =>
    set((state) => ({
      isEditing: true,
      isAdding: false,
      selectedSubscription:
        state.subscriptions.find((sub) => sub.id === id) ?? null,
    })),

  cancel: () =>
    set({
      isAdding: false,
      isEditing: false,
      selectedSubscription: null,
    }),

  addSubscription: (input) =>
    set((state) => ({
      subscriptions: [
        ...state.subscriptions,
        {
          ...input,
          id: crypto.randomUUID(),
          isActive: false,
        },
      ],
      isAdding: false,
    })),

  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),

  editSubscription: (id, input) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...(input as SubscriptionProps) } : sub,
      ),
      isEditing: false,
      selectedSubscription: null,
    })),
}));

export function useSubscriptionModal() {
  const state = useSubscriptions();
  const { isAdding, isEditing } = state;
  return {
    ...state,
    isOpened: isAdding || isEditing,
  };
}
