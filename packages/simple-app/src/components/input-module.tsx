import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDynamicForm } from '@/lib/form';
import v from 'voca';

export function InputModule() {
  const { moduleOptions, handleModuleChange } = useDynamicForm();

  return (
    <div>
      <label htmlFor="module-select" className="block text-sm font-medium mb-2">
        Module
      </label>
      <Select onValueChange={handleModuleChange}>
        <SelectTrigger id="module-select" aria-label="Select module">
          <SelectValue placeholder="Select a module" />
        </SelectTrigger>
        <SelectContent>
          {moduleOptions.map(({ value, label }) => (
            <SelectItem
              key={value}
              value={value}
              aria-label={`Module: ${label}`}
            >
              {v.capitalize(label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
