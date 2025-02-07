import { Button } from '@/components/ui/button';
import { useDeliverPolicy } from '@/lib/form/use-deliver-policy';
import { useStreamData } from '@/lib/stream/use-stream-data';
import { useSubscriptions } from '@/lib/stream/use-subscriptions';
import { Play, Plus, Square } from 'lucide-react';
import { SubscriptionList } from '../subscriptions/subscription-list';
import { SubscriptionModal } from '../subscriptions/subscription-modal';
import { CardContent } from '../ui/card';
import { DeliverPolicySelector } from './deliver-policy-selector';

export function StreamForm() {
  const { start, stop, isSubscribing } = useStreamData();
  const { subscriptions, startAdding } = useSubscriptions();
  const { deliverPolicy } = useDeliverPolicy();
  const canStart = subscriptions.length > 0;

  function handleSubmit() {
    if (!subscriptions.length) return;
    start(subscriptions, deliverPolicy);
  }

  return (
    <div className="space-y-4" aria-label="Stream Configuration Form">
      <div
        className="flex justify-between items-center px-6 h-12 border-b"
        aria-label="Current Subject Query"
      >
        <DeliverPolicySelector />
        <SubscriptionModal />
        <Button size="xs" onClick={startAdding}>
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </div>
      <CardContent className="space-y-4">
        <SubscriptionList />
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={!canStart}
            onClick={isSubscribing ? stop : handleSubmit}
            variant={
              isSubscribing ? 'destructive' : canStart ? 'default' : 'outline'
            }
            className="flex-1"
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
      </CardContent>
    </div>
  );
}
