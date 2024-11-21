import type { formStructure } from './form-fields';

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldOptions = {
  type: string;
  options?: SelectOption[];
};

export type FormField = {
  name: string;
  type: string;
  options?: SelectOption[];
  value?: string;
};

export type Fields = {
  [key: string]: FieldOptions;
};

export type ModuleBase = {
  name: string;
  wildcard: string;
};

export type SimpleModule = ModuleBase & {
  subject: string;
  format: string;
  fields: Fields;
};

export type VariantDefinition = {
  name: string;
  subject: string;
  format: string;
  wildcard: string;
  fields: Fields;
};

export type VariantModule = ModuleBase & {
  variants: {
    [key: string]: VariantDefinition;
  };
};

export type ModuleType = SimpleModule | VariantModule;
export type FormStructure = typeof formStructure;
export type FormModuleType = keyof FormStructure;
