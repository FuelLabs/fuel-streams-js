import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cardStyles } from '@/styles/card-styles';
import { Play, Square } from 'lucide-react';
import v from 'voca';
import { useDynamicForm } from '../lib/form';
import { getIdentifierKindOptions } from '../lib/form/form-helpers';
import { useStreamData } from '../lib/stream/use-stream-data';
import { ThemeToggle } from './theme-toggle';

function formatLabel(name: string): string {
  return v.titleCase(v.replaceAll(name, '_', ' '));
}

export function StreamConfiguration() {
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

  const { start, stop, isSubscribing } = useStreamData();

  function handleSubmit() {
    if (!selectedModule || !subject) return;
    start({ subject, selectedModule });
  }

  return (
    <Card className={cardStyles({ type: 'config' })}>
      <CardHeader className="flex flex-col justify-center h-[79px] border-b mb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Stream Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure your stream settings and parameters below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={variantOptions.length > 0 ? 'flex gap-4' : ''}>
            <div className={variantOptions.length > 0 ? 'w-1/2' : 'w-full'}>
              <label
                htmlFor="module-select"
                className="block text-sm font-medium mb-2"
              >
                Module
              </label>
              <Select onValueChange={handleModuleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
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
                  value={selectedVariant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variantOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
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
                {formatLabel(field.name)} <code>({field.type})</code>
              </label>
              {field.name === 'id_kind' ? (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) =>
                    handleFieldChange(field.name, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select identifier kind" />
                  </SelectTrigger>
                  <SelectContent>
                    {getIdentifierKindOptions().map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
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
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  value={formData[field.name] || ''}
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

          <div className="flex items-center gap-2 absolute bottom-6 left-6">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              viewBox="0 0 344 344"
              aria-label="Fuel Logo"
              width={30}
              height={30}
            >
              <rect x="25" y="37" width="292" height="284" fill="black" />
              <path
                d="M22.8744 0C10.2181 0 0 10.218 0 22.8744V344H284.626C294.246 344 303.497 340.179 310.308 333.368L333.368 310.308C340.179 303.497 344 294.246 344 284.626V0H22.8744ZM224.608 44.231L112.718 156.121C109.956 158.882 106.182 160.447 102.27 160.447C96.5631 160.447 91.3157 157.134 88.8763 151.978L45.5194 60.3402C41.9756 52.8383 47.4525 44.231 55.7374 44.231H224.608ZM44.231 299.769V190.916C44.231 185.117 48.9257 180.422 54.7249 180.422H163.577L44.231 299.769ZM172.598 160.447H136.559L244.998 52.0097C249.968 47.0382 256.734 44.231 263.776 44.231H299.814L191.377 152.668C186.407 157.64 179.64 160.447 172.598 160.447Z"
                fill="#00F58C"
              />
            </svg>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
