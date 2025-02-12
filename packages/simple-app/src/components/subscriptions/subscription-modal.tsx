import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormContext } from '@/lib/form';
import {
  type SubscriptionProps,
  useSubscriptionModal,
  useSubscriptions,
} from '@/lib/stream/use-subscriptions';
import type { Nullable } from '@/lib/utils';
import { SubscriptionForm } from './subscription-form';

export function SubscriptionModal() {
  const { isEditing, cancel, selectedSubscription } = useSubscriptions();
  const { isOpened } = useSubscriptionModal();
  return (
    <Dialog open={isOpened} onOpenChange={cancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'New Subscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify your subscription settings.'
              : 'Select the data you want to subscribe to.'}
          </DialogDescription>
        </DialogHeader>
        <FormContext.Provider
          options={{
            input: selectedSubscription ?? ({} as Nullable<SubscriptionProps>),
          }}
        >
          <SubscriptionForm />
        </FormContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
