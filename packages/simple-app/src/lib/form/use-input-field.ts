import type { FormField, SelectOption } from '@fuels/streams/subjects-def';
import {
  TransactionTypeOptions,
  transactionStatusOptions,
  utxoTypeOptions,
} from '@fuels/streams/subjects-def';
import { useMemo } from 'react';
import v from 'voca';
import { getFieldType, getTsType } from './form-helpers';

function formatLabel(id: string): string {
  return v.titleCase(v.replaceAll(id, '_', ' '));
}

function getFieldOptions(type: string): readonly SelectOption[] | undefined {
  switch (type) {
    case 'TransactionType':
      return TransactionTypeOptions;
    case 'TransactionStatus':
      return transactionStatusOptions;
    case 'UtxoType':
      return utxoTypeOptions;
    default:
      return undefined;
  }
}

export function useInputField(field: FormField) {
  const computedValues = useMemo(() => {
    const predefinedOptions = getFieldOptions(field.type);
    const hasOptions = field.options || predefinedOptions;
    const formattedLabel = formatLabel(field.id);
    const inputType = getFieldType(field.type);
    const tsType = getTsType(field.type);

    return {
      predefinedOptions,
      hasOptions,
      formattedLabel,
      inputType,
      tsType,
    };
  }, [field.type, field.options, field.id]);

  return computedValues;
}
