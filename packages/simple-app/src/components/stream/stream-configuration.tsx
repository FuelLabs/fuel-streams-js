import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StreamForm } from './stream-form';

type StreamConfigurationProps = {
  className?: string;
};

export function StreamConfiguration({ className }: StreamConfigurationProps) {
  return (
    <Card
      className={cn('shadow-none rounded-none border-0', className)}
      aria-label="Stream Configuration Panel"
    >
      <CardHeader layout="row" className="h-20 border-b">
        <div className="flex-1">
          <CardTitle className="text-lg" aria-level={2}>
            Stream Configuration
          </CardTitle>
          <CardDescription>
            Configure your stream settings and parameters below
          </CardDescription>
        </div>
      </CardHeader>
      <StreamForm />
    </Card>
  );
}
