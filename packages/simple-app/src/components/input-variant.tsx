import {
  Select,
  SelectClear,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDynamicForm } from '@/lib/form';
import v from 'voca';

function humanize(label: string): string {
  return v.titleCase(v.replaceAll(label, '_', ' '));
}

export function InputVariant() {
  const { variantOptions, selectedVariant, handleVariantChange } =
    useDynamicForm();

  if (variantOptions.length === 0) {
    return null;
  }

  return (
    <div>
      <label
        htmlFor="variant-select"
        className="block text-sm font-medium mb-2"
      >
        Variant
      </label>
      <Select onValueChange={handleVariantChange} value={selectedVariant ?? ''}>
        {selectedVariant && (
          <SelectClear
            onClick={() => handleVariantChange('')}
            aria-label="Clear variant selection"
          />
        )}
        <SelectTrigger id="variant-select" aria-label="Select variant">
          <SelectValue placeholder="Select a variant" />
        </SelectTrigger>
        <SelectContent>
          {variantOptions.map(({ value, label }) => (
            <SelectItem
              key={value}
              value={value}
              aria-label={`Variant: ${label}`}
            >
              {humanize(label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
