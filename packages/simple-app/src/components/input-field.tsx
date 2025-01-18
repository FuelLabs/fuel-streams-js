import { Input } from '@/components/ui/input';
import {
  Select,
  SelectClear,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDynamicForm } from '@/lib/form';
import {
  type FormField,
  type SelectOption,
  transactionKindOptions,
  transactionStatusOptions,
  utxoTypeOptions,
} from '@fuels/streams/subjects-def';
import v from 'voca';

function formatLabel(id: string): string {
  return v.titleCase(v.replaceAll(id, '_', ' '));
}

function getFieldOptions(type: string): readonly SelectOption[] | undefined {
  switch (type) {
    case 'TransactionKind':
      return transactionKindOptions;
    case 'TransactionStatus':
      return transactionStatusOptions;
    case 'UtxoType':
      return utxoTypeOptions;
    default:
      return undefined;
  }
}

interface InputFieldProps {
  field: FormField;
}

export function InputField({ field }: InputFieldProps) {
  const { formData, handleFieldChange } = useDynamicForm();
  const predefinedOptions = getFieldOptions(field.type);
  const hasOptions = field.options || predefinedOptions;

  return (
    <div>
      <label htmlFor={field.id} className="block text-sm font-medium mb-1">
        {formatLabel(field.id)}{' '}
        <code className="text-gray-500">({field.type})</code>
      </label>
      {hasOptions ? (
        <Select
          value={formData?.[field.id] || ''}
          onValueChange={(value) => handleFieldChange(field.id, value)}
        >
          {formData?.[field.id] && (
            <SelectClear
              onClick={() => handleFieldChange(field.id, '')}
              aria-label={`Clear ${formatLabel(field.id)} selection`}
            />
          )}
          <SelectTrigger
            id={field.id}
            aria-label={`Select ${formatLabel(field.id)}`}
          >
            <SelectValue placeholder={`Select ${formatLabel(field.id)}`} />
          </SelectTrigger>
          <SelectContent>
            {(predefinedOptions || field.options)?.map(
              ({ value, label }: SelectOption) => (
                <SelectItem
                  key={value}
                  value={value}
                  aria-label={`${formatLabel(field.id)}: ${label}`}
                >
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.id}
          type="text"
          placeholder={field.type}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          value={formData?.[field.id] || ''}
          aria-label={formatLabel(field.id)}
        />
      )}
    </div>
  );
}
