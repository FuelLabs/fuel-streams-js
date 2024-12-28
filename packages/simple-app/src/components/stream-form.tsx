import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectClear,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDynamicForm } from '@/lib/form';
import { useStreamData } from '@/lib/stream/use-stream-data';
import { DeliverPolicy } from '@fuels/streams';
import { Play, Square } from 'lucide-react';
import v from 'voca';

function formatLabel(name: string): string {
  return v.titleCase(v.replaceAll(name, '_', ' '));
}

export function StreamForm() {
  const {
    selectedModule,
    selectedVariant,
    formData,
    currentFields,
    moduleOptions,
    variantOptions,
    handleModuleChange,
    handleVariantChange,
    handleFieldChange,
    subject,
  } = useDynamicForm();

  const { start, stop, isSubscribing, changeDeliveryPolicy, deliverPolicy } =
    useStreamData();

  function handleSubmit() {
    if (!selectedModule || !subject) return;
    start({ subject, selectedModule });
  }

  return (
    <div className="space-y-4" aria-label="Stream Configuration Form">
      <div className="flex items-center gap-4">
        <Switch
          className="mt-1/5"
          id="historical-data"
          checked={deliverPolicy === DeliverPolicy.All}
          onCheckedChange={(checked) =>
            changeDeliveryPolicy(
              checked ? DeliverPolicy.All : DeliverPolicy.New,
            )
          }
          aria-label="Toggle historical data"
        />
        <label htmlFor="historical-data" className="text-sm font-medium">
          Enable historical data
        </label>
      </div>

      <div className={variantOptions.length > 0 ? 'flex gap-4' : ''}>
        <div className={variantOptions.length > 0 ? 'w-1/2' : 'w-full'}>
          <label
            htmlFor="module-select"
            className="block text-sm font-medium mb-2"
          >
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
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {variantOptions.length > 0 && (
          <div className="w-1/2">
            <label
              htmlFor="variant-select"
              className="block text-sm font-medium mb-2"
            >
              Variant
            </label>
            <Select
              onValueChange={handleVariantChange}
              value={selectedVariant ?? ''}
            >
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
                {variantOptions
                  .filter(({ label }) => !label.includes('Generic'))
                  .map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      aria-label={`Variant: ${label}`}
                    >
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {currentFields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium mb-1"
          >
            {formatLabel(field.name)}{' '}
            <code className="text-gray-500">({field.type})</code>
          </label>
          {field.options ? (
            <Select
              value={formData?.[field.name] || ''}
              onValueChange={(value) => handleFieldChange(field.name, value)}
            >
              {formData?.[field.name] && (
                <SelectClear
                  onClick={() => handleFieldChange(field.name, '')}
                  aria-label={`Clear ${formatLabel(field.name)} selection`}
                />
              )}
              <SelectTrigger
                id={field.name}
                aria-label={`Select ${formatLabel(field.name)}`}
              >
                <SelectValue
                  placeholder={`Select ${formatLabel(field.name)}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(({ value, label }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    aria-label={`${formatLabel(field.name)}: ${label}`}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.name}
              type="text"
              placeholder={field.type}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              value={formData?.[field.name] || ''}
              aria-label={formatLabel(field.name)}
            />
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={isSubscribing ? stop : handleSubmit}
        disabled={!selectedModule}
        variant={isSubscribing ? 'destructive' : 'default'}
        className="w-full"
        aria-label={isSubscribing ? 'Stop Listening' : 'Start Listening'}
      >
        {isSubscribing ? (
          <>
            <Square className="mr-2 h-4 w-4" />
            Stop Listening
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Listening
          </>
        )}
      </Button>
    </div>
  );
}
