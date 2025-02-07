import { Input } from '@/components/ui/input';
import {
  Select,
  SelectClear,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDynamicForm } from '@/lib/form';
import { useInputField } from '@/lib/form/use-input-field';
import type { FormField, SelectOption } from '@fuels/streams/subjects-def';
import { CircleHelp } from 'lucide-react';

export function InputField({ field }: { field: FormField }) {
  const { context, handleFieldChange } = useDynamicForm();
  const { formData } = context;
  const { predefinedOptions, hasOptions, formattedLabel, inputType, tsType } =
    useInputField(field);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={field.id} className="text-sm font-medium">
          {formattedLabel}{' '}
          <span className="ml-1 text-gray-500">({tsType})</span>
        </label>
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleHelp className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {hasOptions ? (
        <Select
          value={formData?.[field.id] || ''}
          onValueChange={(value) => handleFieldChange(field.id, value)}
        >
          {formData?.[field.id] && (
            <SelectClear
              onClick={() => handleFieldChange(field.id, '')}
              aria-label={`Clear ${formattedLabel} selection`}
            />
          )}
          <SelectTrigger id={field.id} aria-label={`Select ${formattedLabel}`}>
            <SelectValue placeholder={`Select ${formattedLabel}`} />
          </SelectTrigger>
          <SelectContent>
            {(predefinedOptions || field.options)?.map(
              ({ value, label }: SelectOption) => (
                <SelectItem
                  key={value}
                  value={value}
                  aria-label={`${formattedLabel}: ${label}`}
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
          type={inputType}
          placeholder={field.type}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          value={formData?.[field.id] || ''}
          aria-label={formattedLabel}
        />
      )}
    </div>
  );
}
