import {
  type ModuleKeys,
  type SubjectsDefinition,
  subjectsDefinitions,
} from '@fuels/streams/subjects-def';
import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';
import type { SubscriptionProps } from '../stream/use-subscriptions';
import type { Nullable } from '../utils';
import { FormFieldsManager, SubjectBuilder } from './form-helpers';

const fieldsManager = new FormFieldsManager(subjectsDefinitions);
const subjectBuilder = new SubjectBuilder(subjectsDefinitions);

export const formMachine = setup({
  types: {
    input: {} as Nullable<SubscriptionProps>,
    context: {} as Nullable<SubscriptionProps>,
    events: {} as
      | { type: 'CHANGE.MODULE'; value: keyof SubjectsDefinition }
      | { type: 'CHANGE.VARIANT'; value: any }
      | { type: 'CHANGE.FIELD'; fieldName: string; value: string },
  },
  actions: {
    updateModuleFields: assign({
      currentFields: ({ event }) => {
        return fieldsManager.getModuleFields(event.value as ModuleKeys);
      },
      selectedFields: () => ({}),
      variantOptions: ({ event }) => {
        return fieldsManager.getVariantOptions(event.value as ModuleKeys);
      },
      subjectClass: ({ event }) => {
        const mod = fieldsManager.getModule(event.value as ModuleKeys);
        if (!mod?.variants) return mod?.subject ?? null;
        return mod?.subject ?? null;
      },
    }),
    updateVariantFields: assign({
      currentFields: ({ context, event }) => {
        if (!context.selectedModule) return [];
        return fieldsManager.getModuleFields(
          context.selectedModule,
          event.value,
        );
      },
      selectedFields: () => ({}),
      subjectClass: ({ context, event }) => {
        if (!context.selectedModule) return null;
        const mod = fieldsManager.getModule(context.selectedModule);
        if (!mod?.variants) return mod?.subject ?? null;
        const variant = mod.variants[event.value];
        return variant?.subject ?? mod?.subject ?? null;
      },
    }),
    updateField: assign({
      formData: ({ context, event }) => {
        if (event.type !== 'CHANGE.FIELD') return context.formData;
        return {
          ...context.formData,
          [event.fieldName]: event.value,
        };
      },
      selectedFields: ({ context, event }) => {
        if (event.type !== 'CHANGE.FIELD') return context.selectedFields;
        return {
          ...context.selectedFields,
          [event.fieldName]: event.value.trim(),
        };
      },
    }),
    updateSubject: assign({
      subject: ({ context }) => {
        return subjectBuilder.buildSubject({
          selectedModule: context.selectedModule as ModuleKeys,
          selectedVariant: context.selectedVariant ?? null,
          currentFields: context.currentFields ?? [],
          selectedFields: context.selectedFields ?? {},
        });
      },
    }),
    updateSubjectPayload: assign({
      subjectPayload: ({ context }) => {
        if (!context.selectedModule) return null;
        return subjectBuilder.buildPayload({
          selectedModule: context.selectedModule,
          selectedVariant: context.selectedVariant ?? null,
          selectedFields: context.selectedFields ?? {},
        });
      },
    }),
  },
}).createMachine({
  id: 'dynamicForm',
  initial: 'idle',
  context: ({ input }) => ({
    ...input,
    moduleOptions: fieldsManager.getModuleOptions(),
  }),
  states: {
    idle: {
      entry: [
        'updateModuleFields',
        'updateVariantFields',
        'updateSubject',
        'updateSubjectPayload',
      ],
      on: {
        'CHANGE.MODULE': {
          actions: [
            assign({
              selectedModule: ({ event }) => event.value as ModuleKeys,
              selectedVariant: () => null,
              formData: () => ({}),
              selectedFields: () => ({}),
            }),
            'updateModuleFields',
            'updateSubject',
            'updateSubjectPayload',
          ],
        },
        'CHANGE.VARIANT': {
          actions: [
            assign({
              selectedVariant: ({ event }) => event.value,
              formData: () => ({}),
            }),
            'updateVariantFields',
            'updateSubject',
            'updateSubjectPayload',
          ],
        },
        'CHANGE.FIELD': {
          actions: ['updateField', 'updateSubject', 'updateSubjectPayload'],
        },
      },
    },
  },
});

type State = StateFrom<typeof formMachine>;
const selectors = { context: (state: State) => state.context };
export const FormContext = createActorContext(formMachine);

export function useDynamicForm() {
  const actor = FormContext.useActorRef();
  const context = FormContext.useSelector(selectors.context);

  function handleModuleChange(value: keyof SubjectsDefinition) {
    actor.send({ type: 'CHANGE.MODULE', value });
  }

  function handleVariantChange(value: string) {
    actor.send({ type: 'CHANGE.VARIANT', value });
  }

  function handleFieldChange(fieldName: string, value: string) {
    actor.send({ type: 'CHANGE.FIELD', fieldName, value });
  }

  return {
    handleFieldChange,
    handleModuleChange,
    handleVariantChange,
    context,
  };
}
