import { Button } from '@/components/ui/button';
import { useDeliverPolicy } from '@/lib/form/use-deliver-policy';
import { useStreamData } from '@/lib/stream/use-stream-data';
import { useSubscriptions } from '@/lib/stream/use-subscriptions';
import { Play, Plus, Square } from 'lucide-react';
import { SubscriptionList } from '../subscriptions/subscription-list';
import { SubscriptionModal } from '../subscriptions/subscription-modal';
import { DeliverPolicySelector } from './deliver-policy-selector';

export function StreamForm() {
  const { start, stop, isSubscribing } = useStreamData();
  const { subscriptions, startAdding } = useSubscriptions();
  const { deliverPolicy } = useDeliverPolicy();

  function handleSubmit() {
    if (!subscriptions.length) return;
    start(subscriptions, deliverPolicy);
  }

  return (
    <div className="space-y-4" aria-label="Stream Configuration Form">
      <div className="flex items-center justify-between border-b pb-4">
        <DeliverPolicySelector />
        <SubscriptionModal />
        <Button variant="ghost" size="sm" onClick={startAdding}>
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </div>
      <SubscriptionList />
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={!subscriptions.length}
          onClick={isSubscribing ? stop : handleSubmit}
          variant={isSubscribing ? 'destructive' : 'default'}
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
    </div>
  );
}
