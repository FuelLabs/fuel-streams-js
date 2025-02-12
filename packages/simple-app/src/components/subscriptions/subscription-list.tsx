import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSubscriptions } from '@/lib/stream/use-subscriptions';
import { Pencil, Trash2 } from 'lucide-react';

export function SubscriptionList() {
  const { subscriptions, removeSubscription, startEditing } =
    useSubscriptions();

  return (
    <>
      {!subscriptions.length ? (
        <div className="text-center text-muted-foreground py-4">
          No saved subscriptions. Click "Save" to add one.
        </div>
      ) : (
        <div className="space-y-2 font-mono">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between px-4 py-1 pr-1 rounded-lg border bg-muted/40"
            >
              <div className="flex-1">
                {subscription.subject.length > 40 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm truncate max-w-[300px] block">
                          {subscription.subject}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{subscription.subject}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-sm block">{subscription.subject}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(subscription.id)}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubscription(subscription.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
