import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';
import { formStructure } from './form-fields';
import { FormFieldsManager, SubjectBuilder } from './form-helpers';
import type { FormModuleType } from './form-types';

const fieldsManager = new FormFieldsManager(formStructure);
const subjectBuilder = new SubjectBuilder();

const formMachine = setup({
  types: {
    context: {} as {
      selectedModule?: FormModuleType;
      selectedVariant: string;
      formData: Record<string, string>;
      selectedFields: Record<string, string>;
      subject: string | null;
      currentFields: { name: string; type: string; optional: boolean }[];
      moduleOptions: { value: string; label: string }[];
      variantOptions: { value: string; label: string }[];
    },
    events: {} as
      | { type: 'CHANGE.MODULE'; value: FormModuleType | '' }
      | { type: 'CHANGE.VARIANT'; value: string }
      | { type: 'CHANGE.FIELD'; fieldName: string; value: string },
  },
  actions: {
    updateModuleFields: assign({
      currentFields: ({ event }) => {
        return fieldsManager.getModuleFields(event.value as FormModuleType);
      },
      selectedFields: () => ({}),
      variantOptions: ({ event }) => {
        return fieldsManager.getVariantOptions(event.value as FormModuleType);
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
        if (!context.selectedModule) return '';
        return subjectBuilder.buildSubject({
          selectedModule: context.selectedModule,
          selectedVariant: context.selectedVariant,
          currentFields: context.currentFields,
          selectedFields: context.selectedFields,
        });
      },
    }),
  },
}).createMachine({
  id: 'dynamicForm',
  initial: 'idle',
  context: {
    selectedVariant: '',
    formData: {},
    selectedFields: {},
    subject: null,
    currentFields: [],
    moduleOptions: fieldsManager.getModuleOptions(),
    variantOptions: [],
  },
  states: {
    idle: {
      on: {
        'CHANGE.MODULE': {
          actions: [
            assign({
              selectedModule: ({ event }) => event.value as FormModuleType,
              selectedVariant: () => '',
              formData: () => ({}),
            }),
            'updateModuleFields',
            'updateSubject',
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
          ],
        },
        'CHANGE.FIELD': {
          actions: ['updateField', 'updateSubject'],
        },
      },
    },
  },
});

type State = StateFrom<typeof formMachine>;

const selectors = {
  selectedModule: (state: State) => state.context.selectedModule,
  selectedVariant: (state: State) => state.context.selectedVariant,
  formData: (state: State) => state.context.formData,
  currentFields: (state: State) => state.context.currentFields,
  moduleOptions: (state: State) => state.context.moduleOptions,
  variantOptions: (state: State) => state.context.variantOptions,
  subject: (state: State) => state.context.subject,
};

export const DynamicFormContext = createActorContext(formMachine);

export function useDynamicForm() {
  const actor = DynamicFormContext.useActorRef();
  const selectedModule = DynamicFormContext.useSelector(
    selectors.selectedModule,
  );
  const selectedVariant = DynamicFormContext.useSelector(
    selectors.selectedVariant,
  );
  const formData = DynamicFormContext.useSelector(selectors.formData);
  const currentFields = DynamicFormContext.useSelector(selectors.currentFields);
  const moduleOptions = DynamicFormContext.useSelector(selectors.moduleOptions);
  const variantOptions = DynamicFormContext.useSelector(
    selectors.variantOptions,
  );
  const subject = DynamicFormContext.useSelector(selectors.subject);

  const handleModuleChange = (value: FormModuleType | '') => {
    actor.send({ type: 'CHANGE.MODULE', value });
  };

  const handleVariantChange = (value: string) => {
    actor.send({ type: 'CHANGE.VARIANT', value });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    actor.send({ type: 'CHANGE.FIELD', fieldName, value });
  };

  return {
    selectedModule,
    selectedVariant,
    formData,
    currentFields,
    moduleOptions,
    variantOptions,
    subject,
    handleModuleChange,
    handleVariantChange,
    handleFieldChange,
  };
}
