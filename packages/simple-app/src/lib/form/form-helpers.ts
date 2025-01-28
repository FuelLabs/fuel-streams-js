import { DeliverPolicy, type SubscriptionPayload } from '@fuels/streams';
import type {
  Fields,
  FormField,
  ModuleKeys,
  Schema,
  SubjectsDefinition,
} from '@fuels/streams/subjects-def';

export function fieldsToArray(fields: Fields): FormField[] {
  return Object.entries(fields).map(([key, field]) => ({
    id: key,
    type: field.type,
    options: field.options,
    description: field.description,
  }));
}

export class FormFieldsManager {
  constructor(private formStructure: SubjectsDefinition) {}

  hasVariants(mod: Schema): boolean {
    return Boolean(mod.variants);
  }

  getModule<K extends ModuleKeys>(selectedModule: K): Schema {
    return this.formStructure[selectedModule];
  }

  getModuleFields<K extends ModuleKeys>(
    selectedModule: K,
    selectedVariant?: string,
  ): FormField[] {
    if (!selectedModule) return [];
    const mod = this.getModule(selectedModule);

    // Fields that should be hidden when using variants
    const hiddenFields = ['input_type', 'output_type', 'receipt_type'];

    // If no variant is selected, return the main module fields
    if (!selectedVariant) {
      const fields = fieldsToArray(mod.fields);
      // Filter out type fields if module has variants
      return mod.variants
        ? fields.filter((field) => !hiddenFields.includes(field.id))
        : fields;
    }

    // If variant is selected and variants exist, return the variant fields
    if (selectedVariant && mod.variants) {
      const variant = mod.variants[selectedVariant];
      const fields = variant ? fieldsToArray(variant.fields) : [];
      return fields.filter((field) => !hiddenFields.includes(field.id));
    }

    return [];
  }

  getModuleOptions(): { value: string; label: string }[] {
    return Object.entries(this.formStructure).map(([key, value]) => ({
      value: key,
      label: value.id,
    }));
  }

  getVariantOptions(
    selectedModule: ModuleKeys,
  ): { value: string; label: string }[] {
    const mod = this.getModule(selectedModule);
    if (!mod.variants) return [];

    // Return only variant options
    return Object.entries(mod.variants).map(([key, value]) => ({
      value: key,
      label: value.id,
    }));
  }
}

export class SubjectBuilder {
  constructor(private formStructure: SubjectsDefinition) {}

  buildPayload(params: {
    selectedModule: ModuleKeys;
    selectedVariant: string | null;
    selectedFields: Record<string, string>;
    deliverPolicy: DeliverPolicy;
  }): SubscriptionPayload {
    const {
      selectedModule,
      selectedVariant,
      selectedFields,
      deliverPolicy = DeliverPolicy.new(),
    } = params;
    if (!selectedModule)
      return {
        subject: '',
        params: {},
        deliverPolicy,
      };

    const manager = new FormFieldsManager(this.formStructure);
    const mod = manager.getModule(selectedModule);

    // Get the base subject ID
    let subjectId = mod.id;

    // If variant is selected, use the variant's ID
    if (selectedVariant && mod.variants) {
      const variant = mod.variants[selectedVariant];
      if (variant) {
        subjectId = variant.id;
      }
    }

    // Filter out empty or wildcard values from params
    const filteredParams: Record<string, string> = {};
    Object.entries(selectedFields).forEach(([key, value]) => {
      if (value && value !== '*') {
        filteredParams[key] = value;
      }
    });

    return {
      subject: subjectId,
      params: filteredParams,
      deliverPolicy,
    };
  }

  buildSubject(params: {
    selectedModule: ModuleKeys;
    selectedVariant: string | null;
    selectedFields: Record<string, string>;
    currentFields: FormField[];
  }): string {
    const { selectedModule, selectedVariant, selectedFields } = params;
    if (!selectedModule) return '';

    const manager = new FormFieldsManager(this.formStructure);
    const mod = manager.getModule(selectedModule);
    const hasVariant = manager.hasVariants(mod);
    const noFieldsSelected = !Object.values(selectedFields ?? {}).some(Boolean);

    // For modules that don't have variants or when no variant is selected
    if (!hasVariant || !selectedVariant) {
      return noFieldsSelected
        ? mod.wildcard
        : this.replaceFields(mod.format, selectedFields);
    }

    // For modules with variants
    if (hasVariant && mod.variants && selectedVariant in mod.variants) {
      const variant = mod.variants[selectedVariant];
      return noFieldsSelected
        ? variant.wildcard
        : this.replaceFields(variant.format, selectedFields);
    }

    return mod.wildcard;
  }

  private replaceFields(
    format: string,
    selectedFields: Record<string, string>,
  ): string {
    return format.replace(/\{(\w+)\}/g, (_, field) => {
      const value = selectedFields[field];
      return value && value !== '' ? value : '*';
    });
  }
}
