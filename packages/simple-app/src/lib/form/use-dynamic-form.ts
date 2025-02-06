import type { SubjectPayload } from '@fuels/streams';
import { DeliverPolicy, DeliverPolicyType } from '@fuels/streams';
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
      subjectPayload: SubjectPayload | null;
      deliverPolicy: DeliverPolicy;
      deliverPolicyType: DeliverPolicyType;
      blockNumber: string;
    },
    events: {} as
      | { type: 'CHANGE.MODULE'; value: keyof SubjectsDefinition }
      | { type: 'CHANGE.VARIANT'; value: any }
      | { type: 'CHANGE.FIELD'; fieldName: string; value: string }
      | { type: 'CHANGE.DELIVER_POLICY_TYPE'; value: DeliverPolicyType }
      | { type: 'CHANGE.BLOCK_NUMBER'; value: string },
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
    updateSubjectPayload: assign({
      subjectPayload: ({ context }) => {
        if (!context.selectedModule) return null;
        return subjectBuilder.buildPayload({
          selectedModule: context.selectedModule,
          selectedVariant: context.selectedVariant,
          selectedFields: context.selectedFields ?? {},
        });
      },
    }),
    updateDeliverPolicy: assign({
      deliverPolicy: ({ context }) => {
        if (context.deliverPolicyType === DeliverPolicyType.New) {
          return DeliverPolicy.new();
        }
        const blockNum = Number.parseInt(context.blockNumber || '0', 10);
        return DeliverPolicy.fromBlock(blockNum);
      },
    }),
  },
}).createMachine({
  id: 'dynamicForm',
  initial: 'idle',
  context: {
    selectedModule: undefined,
    selectedVariant: null,
    selectedFields: null,
    subject: null,
    formData: null,
    currentFields: [],
    moduleOptions: fieldsManager.getModuleOptions(),
    variantOptions: [],
    subjectClass: null,
    subjectPayload: null,
    deliverPolicy: DeliverPolicy.new(),
    deliverPolicyType: DeliverPolicyType.New,
    blockNumber: '',
  },
  states: {
    idle: {
      entry: ['updateSubject'],
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
        'CHANGE.DELIVER_POLICY_TYPE': {
          actions: [
            assign({
              deliverPolicyType: ({ event }) => event.value,
            }),
            'updateDeliverPolicy',
            'updateSubjectPayload',
          ],
        },
        'CHANGE.BLOCK_NUMBER': {
          actions: [
            assign({
              blockNumber: ({ event }) => event.value,
            }),
            'updateDeliverPolicy',
            'updateSubjectPayload',
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
  subjectPayload: (state: State) => state.context.subjectPayload,
  deliverPolicy: (state: State) => state.context.deliverPolicy,
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
  const subjectPayload = FormContext.useSelector(selectors.subjectPayload);
  const deliverPolicy = FormContext.useSelector(selectors.deliverPolicy);
  const deliverPolicyType = FormContext.useSelector(
    (state) => state.context.deliverPolicyType,
  );
  const blockNumber = FormContext.useSelector(
    (state) => state.context.blockNumber,
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

  const handleDeliverPolicyTypeChange = (value: DeliverPolicyType) => {
    actor.send({ type: 'CHANGE.DELIVER_POLICY_TYPE', value });
  };

  const handleBlockNumberChange = (value: string) => {
    actor.send({ type: 'CHANGE.BLOCK_NUMBER', value });
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
    subjectPayload,
    deliverPolicy,
    deliverPolicyType,
    blockNumber,
    handleDeliverPolicyTypeChange,
    handleBlockNumberChange,
  };
}
