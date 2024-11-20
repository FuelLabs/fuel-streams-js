import v from 'voca';
import type { Fields, FormModuleType, FormStructure } from './form-types';

export function fieldsToArray(
  fields: Fields,
): { name: string; type: string; optional: boolean }[] {
  return Object.entries(fields).map(([name, field]) => ({
    name,
    type: field.type,
    optional: field.optional,
  }));
}

export function getIdentifierKindOptions() {
  return [
    { value: 'address', label: 'Address' },
    { value: 'contract_id', label: 'Contract ID' },
    { value: 'asset_id', label: 'Asset ID' },
    { value: 'predicate_id', label: 'Predicate ID' },
    { value: 'script_id', label: 'Script ID' },
  ];
}

export class FormFieldsManager {
  constructor(private formStructure: FormStructure) {}

  getModuleFields(
    selectedModule: FormModuleType | '',
    selectedVariant?: string,
  ): { name: string; type: string; optional: boolean }[] {
    if (!selectedModule) return [];
    const mod = this.formStructure[selectedModule as FormModuleType];

    if (!this.hasVariants(mod)) {
      return 'fields' in mod ? fieldsToArray(mod.fields) : [];
    }

    if (!selectedVariant) return [];
    if (selectedVariant === 'byId' && mod.byId) {
      return fieldsToArray(mod.byId.fields);
    }

    const variant =
      selectedVariant in mod.variants
        ? mod.variants[selectedVariant as keyof typeof mod.variants]
        : null;

    return variant ? fieldsToArray(variant.fields) : [];
  }

  getModuleOptions(): { value: string; label: string }[] {
    return Object.entries(this.formStructure).map(([key, value]) => ({
      value: key,
      label: value.name,
    }));
  }

  getVariantOptions(selectedModule: FormModuleType) {
    const mod = this.formStructure[selectedModule];
    if (!this.hasVariants(mod)) return [];

    const options = Object.entries(mod.variants).map(([key, value]) => ({
      value: key,
      label: value.name,
    }));

    if (mod.byId) {
      options.unshift({
        value: 'byId',
        label: mod.byId.name,
      });
    }

    return options;
  }

  private hasVariants(
    module: FormStructure[FormModuleType],
  ): module is Extract<
    FormStructure[FormModuleType],
    { variants: { [key: string]: { name: string; fields: Fields } } }
  > & { variants: { [key: string]: { name: string; fields: Fields } } } {
    return 'variants' in module;
  }
}

export class SubjectBuilder {
  buildSubject(params: {
    selectedModule: FormModuleType;
    selectedVariant: string;
    currentFields: { name: string; type: string; optional: boolean }[];
    selectedFields: Record<string, string>;
  }): string {
    const { selectedModule, selectedVariant, currentFields, selectedFields } =
      params;
    if (!selectedModule) return '';

    const parts = this.buildSubjectParts(selectedModule, selectedVariant);

    const fieldsObj = currentFields.reduce((acc, field) => {
      acc[field.name] = { type: field.type, optional: field.optional };
      return acc;
    }, {} as Fields);

    if (!Object.values(selectedFields).some(Boolean)) {
      return `${parts.join('.')}.>`;
    }

    const fieldValues = this.buildFieldValues(fieldsObj, selectedFields);
    return [...parts, ...fieldValues].join('.');
  }

  private buildFieldValues(
    fields: Fields,
    selectedFields: Record<string, string>,
  ): string[] {
    return Object.keys(fields).map((fieldName) =>
      selectedFields[fieldName] ? v.snakeCase(selectedFields[fieldName]) : '*',
    );
  }

  private buildSubjectParts(
    selectedModule: FormModuleType,
    selectedVariant: string,
  ): string[] {
    const mod = v.snakeCase(selectedModule);
    const variant = v.snakeCase(selectedVariant);
    if (selectedVariant === 'byId') {
      return ['by_id', mod];
    }
    if (selectedModule === 'transactions') {
      return [mod];
    }
    return [mod, variant].filter(Boolean);
  }
}
