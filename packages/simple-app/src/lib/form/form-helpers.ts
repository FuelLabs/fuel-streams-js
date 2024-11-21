import type {
  Fields,
  FormField,
  FormModuleType,
  FormStructure,
  VariantModule,
} from './form-types';

export function fieldsToArray(fields: Fields): FormField[] {
  return Object.entries(fields).map(([name, field]) => ({
    name,
    type: field.type,
    options: field.options,
  }));
}

export class FormFieldsManager {
  constructor(private formStructure: FormStructure) {}

  hasVariants<K extends keyof FormStructure>(
    mod: FormStructure[K],
  ): mod is FormStructure[K] & VariantModule {
    return 'variants' in mod;
  }

  getModule<K extends keyof FormStructure>(selectedModule: K) {
    return this.formStructure[selectedModule] as FormStructure[K];
  }

  getModuleFields<
    K extends keyof FormStructure,
    M extends FormStructure[K] = FormStructure[K],
  >(
    selectedModule: K,
    selectedVariant?: M extends VariantModule ? keyof M['variants'] : never,
  ): FormField[] {
    if (!selectedModule) return [];
    const mod = this.getModule(selectedModule);

    if (!this.hasVariants(mod)) {
      return 'fields' in mod ? fieldsToArray(mod.fields as Fields) : [];
    }

    if (!selectedVariant) return [];
    const variant = mod.variants[selectedVariant as keyof typeof mod.variants];
    return variant ? fieldsToArray(variant.fields) : [];
  }

  getModuleOptions(): { value: string; label: string }[] {
    return Object.entries(this.formStructure).map(([key, value]) => ({
      value: key,
      label: value.name,
    }));
  }

  getVariantOptions(
    selectedModule: FormModuleType,
  ): { value: string; label: string }[] {
    const mod = this.getModule(selectedModule);
    if (!this.hasVariants(mod)) return [];

    return Object.entries(mod.variants).map(([key, value]) => ({
      value: key,
      label: value.name,
    }));
  }
}

export class SubjectBuilder {
  constructor(private formStructure: FormStructure) {}

  buildSubject(params: {
    selectedModule: string;
    selectedVariant: string | null;
    selectedFields: Record<string, string>;
    currentFields: { name: string; type: string }[];
  }) {
    const { selectedModule, selectedVariant, selectedFields } = params;
    if (!selectedModule) return '';

    const manager = new FormFieldsManager(this.formStructure);
    const mod = manager.getModule(selectedModule as keyof FormStructure);
    const hasVariant = manager.hasVariants(mod);
    const noFieldsSelected = !Object.values(selectedFields ?? {}).some(Boolean);
    let format = '';

    // For modules that don't have variants
    if (!hasVariant && 'wildcard' in mod && 'format' in mod) {
      if (noFieldsSelected) return mod.wildcard;
      format = mod.format;
    }

    // For modules with variants
    if (hasVariant) {
      if (!selectedVariant) return mod.wildcard;
      const variant = mod.variants[selectedVariant];
      if (noFieldsSelected) return variant.wildcard;
      format = variant.format;
    }

    return format.replace(/\{(\w+)\}/g, (_, field) => {
      const value = selectedFields[field];
      return value ? value : '*';
    });
  }
}
