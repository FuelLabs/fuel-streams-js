import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import { useState } from 'react';

type ApiKeyPopoverProps = {
  isConnected: boolean;
  apiKey: string | null;
  onSubmit: (apiKey: string) => void;
  className?: string;
} & Omit<PopoverPrimitive.PopoverProps, 'children'>;

const apiKeyPill = cva(
  'inline-flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer border',
);

const statusDot = cva('w-2 h-2 rounded-full', {
  variants: {
    status: {
      connected: 'bg-green-500',
      disconnected: 'bg-gray-500',
    },
  },
  defaultVariants: {
    status: 'disconnected',
  },
});

export function ApiKeyPopover({
  isConnected,
  apiKey,
  onSubmit,
  className,
  ...popoverProps
}: ApiKeyPopoverProps) {
  const [value, setValue] = useState(apiKey || '');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...popoverProps}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={apiKeyPill({ className })}
          aria-label={isConnected ? 'Edit API Key' : 'Connect API Key'}
        >
          <div
            className={statusDot({
              status: isConnected ? 'connected' : 'disconnected',
            })}
          />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {isConnected ? 'Edit API Key' : 'Connect with API Key'}
            </h4>
            <p className="text-sm text-muted-foreground">
              Enter your API key to connect to the Fuel Streams service.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              id="api-key"
              placeholder="Enter your API key"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">{isConnected ? 'Update' : 'Connect'}</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
