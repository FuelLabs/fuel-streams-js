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
              selectedModule: ({ event }) => event.value as ModuleKeys,
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
  currentFields: (state: State) => state.context.currentFields,
  formData: (state: State) => state.context.formData,
  moduleOptions: (state: State) => state.context.moduleOptions,
  selectedFields: (state: State) => state.context.selectedFields,
  selectedModule: (state: State) => state.context.selectedModule,
  selectedVariant: (state: State) => state.context.selectedVariant,
  subject: (state: State) => state.context.subject,
  subjectClass: (state: State) => state.context.subjectClass,
  variantOptions: (state: State) => state.context.variantOptions,
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
  const selectedFields = DynamicFormContext.useSelector(
    selectors.selectedFields,
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
  };
}
