import type { formStructure } from './form-fields';

// Base types for fields
export type FieldDefinition = {
  type: string;
  optional: boolean;
};

export type Fields = {
  [key: string]: FieldDefinition;
};

// Derive main types from formStructure
export type FormStructure = typeof formStructure;
export type FormModuleType = keyof FormStructure;

// Helper type for form fields
export type FormField = {
  name: string;
  type: string;
  optional: boolean;
  value?: string;
};

// Helper type for variants
export type FormVariant<T extends FormModuleType> =
  T extends keyof FormStructure
    ? FormStructure[T] extends { variants: Record<string, unknown> }
      ? keyof FormStructure[T]['variants'] | 'byId'
      : never
    : never;
