import { Button } from '@/components/ui/button';
import { useDynamicForm } from '@/lib/form';
import { useStreamData } from '@/lib/stream/use-stream-data';
import { Play, Square } from 'lucide-react';
import { ApiKeyPopover } from './api-key-popover';
import { DeliverPolicySelector } from './deliver-policy-selector';
import { InputField } from './input-field';
import { InputModule } from './input-module';
import { InputVariant } from './input-variant';

export function StreamForm() {
  const {
    selectedModule,
    currentFields,
    variantOptions,
    subject,
    subscriptionPayload,
  } = useDynamicForm();

  const { start, stop, isSubscribing } = useStreamData();

  function handleSubmit() {
    if (!selectedModule || !subscriptionPayload || !subject) return;
    start(subject, subscriptionPayload);
  }

  return (
    <div className="space-y-4" aria-label="Stream Configuration Form">
      <div className="flex items-center justify-between">
        <DeliverPolicySelector />
        <ApiKeyPopover />
      </div>

      <div className={variantOptions.length > 1 ? 'flex gap-4' : ''}>
        <div className={variantOptions.length > 1 ? 'w-1/2' : 'w-full'}>
          <InputModule />
        </div>
        {variantOptions.length > 1 && (
          <div className="w-1/2">
            <InputVariant />
          </div>
        )}
      </div>

      {currentFields.map((field) => (
        <InputField key={field.id} field={field} />
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
