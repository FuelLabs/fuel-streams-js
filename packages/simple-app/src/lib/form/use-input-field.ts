import type { FormField, SelectOption } from '@fuels/streams/subjects-def';
import {
  TransactionTypeOptions,
  inputTypeOptions,
  outputTypeOptions,
  receiptTypeOptions,
  transactionStatusOptions,
  utxoStatusOptions,
  utxoTypeOptions,
} from '@fuels/streams/subjects-def';
import { useMemo } from 'react';
import v from 'voca';
import { getFieldType, getTsType } from './form-helpers';

function formatLabel(id: string): string {
  return v.titleCase(v.replaceAll(id, '_', ' '));
}

function getFieldOptions(
  field: FormField,
): readonly SelectOption[] | undefined {
  switch (field.type) {
    case 'TransactionType':
      return TransactionTypeOptions;
    case 'TransactionStatus':
      return transactionStatusOptions;
    case 'UtxoType':
      return utxoTypeOptions;
    case 'UtxoStatus':
      return utxoStatusOptions;
    case 'InputType':
      return inputTypeOptions;
    case 'OutputType':
      return outputTypeOptions;
    case 'ReceiptType':
      return receiptTypeOptions;
    default:
      return undefined;
  }
}

export function useInputField(field: FormField) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const computedValues = useMemo(() => {
    const predefinedOptions = getFieldOptions(field);
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
