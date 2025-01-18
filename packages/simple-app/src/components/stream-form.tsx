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
import {
  transactionKindOptions,
  transactionStatusOptions,
  utxoTypeOptions,
} from '@fuels/streams/subjects-def';
import { Play, Square } from 'lucide-react';
import v from 'voca';
import { ApiKeyPopover } from './api-key-popover';

function formatLabel(id: string): string {
  return v.titleCase(v.replaceAll(id, '_', ' '));
}

function humanize(label: string): string {
  return v.titleCase(v.replaceAll(label, '_', ' '));
}

function getFieldOptions(type: string) {
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
    subscriptionPayload,
  } = useDynamicForm();

  const {
    start,
    stop,
    isSubscribing,
    changeDeliveryPolicy,
    deliverPolicy,
    isConnected,
    apiKey,
    setApiKey,
  } = useStreamData();

  function handleSubmit() {
    if (!selectedModule || !subscriptionPayload || !subject) return;
    start({ subject, subscriptionPayload });
  }

  return (
    <div className="space-y-4" aria-label="Stream Configuration Form">
      <div className="flex items-center justify-between">
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
        <ApiKeyPopover
          isConnected={isConnected}
          apiKey={apiKey}
          onSubmit={setApiKey}
        />
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
                  {v.capitalize(label)}
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
        )}
      </div>

      {currentFields.map((field) => {
        const predefinedOptions = getFieldOptions(field.type);
        const hasOptions = field.options || predefinedOptions;

        return (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium mb-1"
            >
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
                  <SelectValue
                    placeholder={`Select ${formatLabel(field.id)}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(predefinedOptions || field.options)?.map(
                    ({ value, label }) => (
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
      })}

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
