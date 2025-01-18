import { DeliverPolicy } from '@fuels/streams';
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

    if (!this.hasVariants(mod)) {
      return fieldsToArray(mod.fields);
    }

    if (!selectedVariant || !mod.variants) return [];
    const variant = mod.variants[selectedVariant];
    return variant ? fieldsToArray(variant.fields) : [];
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
  }) {
    const { selectedModule, selectedVariant, selectedFields } = params;
    if (!selectedModule)
      return { subject: '', params: {}, deliverPolicy: DeliverPolicy.New };

    const manager = new FormFieldsManager(this.formStructure);
    const mod = manager.getModule(selectedModule);

    // Get the base subject ID
    let subjectId = mod.id;

    // If we have variants and a variant is selected, use the variant's ID
    if (mod.variants && selectedVariant && selectedVariant in mod.variants) {
      const variant = mod.variants[selectedVariant];
      subjectId = variant.id;
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
      deliverPolicy: DeliverPolicy.New,
    };
  }

  buildSubject(params: {
    selectedModule: ModuleKeys;
    selectedVariant: string | null;
    selectedFields: Record<string, string>;
    currentFields: FormField[];
  }) {
    const { selectedModule, selectedVariant, selectedFields } = params;
    if (!selectedModule) return '';

    const manager = new FormFieldsManager(this.formStructure);
    const mod = manager.getModule(selectedModule);
    const hasVariant = manager.hasVariants(mod);
    const noFieldsSelected = !Object.values(selectedFields ?? {}).some(Boolean);
    let format = '';

    // For modules that don't have variants
    if (!hasVariant) {
      if (noFieldsSelected) return mod.wildcard;
      format = mod.format;
    }

    // For modules with variants
    if (
      hasVariant &&
      selectedVariant &&
      mod.variants &&
      selectedVariant in mod.variants
    ) {
      const variant = mod.variants[selectedVariant];
      if (!variant) return mod.wildcard;
      if (noFieldsSelected) return variant.wildcard;
      format = variant.format;
    }

    return format.replace(/\{(\w+)\}/g, (_, field) => {
      const value = selectedFields[field];
      return value ? value : '*';
    });
  }
}
