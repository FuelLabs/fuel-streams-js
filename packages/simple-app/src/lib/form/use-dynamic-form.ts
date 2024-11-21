import { createActorContext } from '@xstate/react';
import { type StateFrom, assign, setup } from 'xstate';
import { formStructure } from './form-fields';
import { FormFieldsManager, SubjectBuilder } from './form-helpers';
import type {
  FormField,
  FormModuleType,
  FormStructure,
  SelectOption,
} from './form-types';

const fieldsManager = new FormFieldsManager(formStructure);
const subjectBuilder = new SubjectBuilder(formStructure);

const formMachine = setup({
  types: {
    context: {} as {
      selectedModule?: FormModuleType;
      selectedVariant: string | null;
      subject: string | null;
      formData: Record<string, string> | null;
      selectedFields: Record<string, string> | null;
      currentFields: FormField[];
      moduleOptions: SelectOption[];
      variantOptions: SelectOption[];
      subjectClass: string | null;
    },
    events: {} as
      | { type: 'CHANGE.MODULE'; value: keyof FormStructure }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      | { type: 'CHANGE.VARIANT'; value: any }
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
      subjectClass: ({ event }) => {
        const mod = fieldsManager.getModule(event.value as FormModuleType);
        if (!('variants' in mod)) return mod.subject ?? null;
        return (
          mod.variants[event.value as keyof typeof mod.variants]?.subject ??
          null
        );
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
        if (!('variants' in mod)) return mod.subject ?? null;
        return (
          mod.variants[event.value as keyof typeof mod.variants]?.subject ??
          null
        );
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
  },
  states: {
    idle: {
      on: {
        'CHANGE.MODULE': {
          actions: [
            assign({
              selectedModule: ({ event }) => event.value as FormModuleType,
              selectedVariant: () => null,
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
  subjectClass: (state: State) => state.context.subjectClass,
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
  const subjectClass = DynamicFormContext.useSelector(selectors.subjectClass);
  const handleModuleChange = (value: keyof FormStructure) => {
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
    subjectClass,
    handleModuleChange,
    handleVariantChange,
    handleFieldChange,
  };
}
