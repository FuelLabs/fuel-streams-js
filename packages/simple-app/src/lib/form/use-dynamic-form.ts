import type { SubscriptionPayload } from '@fuels/streams';
import {
  type FormField,
  type ModuleKeys,
  type SelectOption,
  type SubjectsDefinition,
  subjectsDefinitions,
} from '@fuels/streams/subjects-def';
import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';
import { FormFieldsManager, SubjectBuilder } from './form-helpers';

const fieldsManager = new FormFieldsManager(subjectsDefinitions);
const subjectBuilder = new SubjectBuilder(subjectsDefinitions);

export const formMachine = setup({
  types: {
    context: {} as {
      selectedModule?: ModuleKeys;
      selectedVariant: string | null;
      subject: string | null;
      formData: Record<string, string> | null;
      selectedFields: Record<string, string> | null;
      currentFields: FormField[];
      moduleOptions: SelectOption[];
      variantOptions: SelectOption[];
      subjectClass: string | null;
      subscriptionPayload: SubscriptionPayload | null;
    },
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
        if (!mod.variants) return mod.subject ?? null;
        return mod.subject ?? null;
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
        if (!mod.variants) return mod.subject ?? null;
        const variant = mod.variants[event.value];
        return variant?.subject ?? mod.subject ?? null;
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
          selectedModule: context.selectedModule as string,
          selectedVariant: context.selectedVariant,
          currentFields: context.currentFields,
          selectedFields: context.selectedFields ?? {},
        });
      },
    }),
    updateSubscriptionPayload: assign({
      subscriptionPayload: ({ context }) => {
        if (!context.selectedModule) return null;
        return subjectBuilder.buildPayload({
          selectedModule: context.selectedModule,
          selectedVariant: context.selectedVariant,
          selectedFields: context.selectedFields ?? {},
        });
      },
    }),
  },
}).createMachine({
  id: 'dynamicForm',
  initial: 'idle',
  context: {
    selectedVariant: null,
    selectedFields: null,
    subject: null,
    formData: null,
    currentFields: [],
    moduleOptions: fieldsManager.getModuleOptions(),
    variantOptions: [],
    subjectClass: null,
    subscriptionPayload: null,
  },
  states: {
    idle: {
      on: {
        'CHANGE.MODULE': {
          actions: [
            assign({
              selectedModule: ({ event }) => event.value as ModuleKeys,
              selectedVariant: () => null,
              formData: () => ({}),
            }),
            'updateModuleFields',
            'updateSubject',
            'updateSubscriptionPayload',
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
            'updateSubscriptionPayload',
          ],
        },
        'CHANGE.FIELD': {
          actions: [
            'updateField',
            'updateSubject',
            'updateSubscriptionPayload',
          ],
        },
      },
    },
  },
});

type State = StateFrom<typeof formMachine>;

const selectors = {
  currentFields: (state: State) => state.context.currentFields,
  formData: (state: State) => state.context.formData,
  moduleOptions: (state: State) => state.context.moduleOptions,
  selectedFields: (state: State) => state.context.selectedFields,
  selectedModule: (state: State) => state.context.selectedModule,
  selectedVariant: (state: State) => state.context.selectedVariant,
  subject: (state: State) => state.context.subject,
  subjectClass: (state: State) => state.context.subjectClass,
  variantOptions: (state: State) => state.context.variantOptions,
  subscriptionPayload: (state: State) => state.context.subscriptionPayload,
};

export const FormContext = createActorContext(formMachine);

export function useDynamicForm() {
  const actor = FormContext.useActorRef();
  const selectedModule = FormContext.useSelector(selectors.selectedModule);
  const selectedVariant = FormContext.useSelector(selectors.selectedVariant);
  const formData = FormContext.useSelector(selectors.formData);
  const currentFields = FormContext.useSelector(selectors.currentFields);
  const moduleOptions = FormContext.useSelector(selectors.moduleOptions);
  const variantOptions = FormContext.useSelector(selectors.variantOptions);
  const subject = FormContext.useSelector(selectors.subject);
  const subjectClass = FormContext.useSelector(selectors.subjectClass);
  const selectedFields = FormContext.useSelector(selectors.selectedFields);
  const subscriptionPayload = FormContext.useSelector(
    selectors.subscriptionPayload,
  );

  const handleModuleChange = (value: keyof SubjectsDefinition) => {
    actor.send({ type: 'CHANGE.MODULE', value });
  };

  const handleVariantChange = (value: string) => {
    actor.send({ type: 'CHANGE.VARIANT', value });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    actor.send({ type: 'CHANGE.FIELD', fieldName, value });
  };

  return {
    currentFields,
    formData,
    handleFieldChange,
    handleModuleChange,
    handleVariantChange,
    moduleOptions,
    selectedFields,
    selectedModule,
    selectedVariant,
    subject,
    subjectClass,
    variantOptions,
    subscriptionPayload,
  };
}
