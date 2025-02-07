import { useDynamicForm } from '@/lib/form';
import {
  type SubscriptionProps,
  useSubscriptions,
} from '@/lib/stream/use-subscriptions';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { DialogClose, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { InputField } from './input-field';
import { InputModule } from './input-module';
import { InputVariant } from './input-variant';

export function SubscriptionForm() {
  const { context } = useDynamicForm();
  const {
    addSubscription,
    editSubscription,
    isEditing,
    selectedSubscription,
    cancel,
  } = useSubscriptions();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (context.subject && context.subjectPayload) {
      if (isEditing && selectedSubscription) {
        editSubscription(selectedSubscription.id, context);
      } else {
        addSubscription(context as SubscriptionProps);
      }
    }
  };

  const { variantOptions = [], currentFields = [] } = context ?? {};
  const variantOptionsLength = variantOptions?.length ?? 0;
  const currentFieldsLength = currentFields?.length ?? 0;
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <ScrollArea
        className={cn(currentFieldsLength > 3 ? 'h-[300px]' : 'h-auto')}
      >
        <div className="flex flex-col gap-4 px-1 py-2">
          <div className={variantOptionsLength > 1 ? 'flex gap-4' : ''}>
            <div className={variantOptionsLength > 1 ? 'w-1/2' : 'w-full'}>
              <InputModule />
            </div>
            {variantOptionsLength > 1 && (
              <div className="w-1/2">
                <InputVariant />
              </div>
            )}
          </div>

          {currentFields?.map((field) => (
            <InputField key={field.id} field={field} />
          ))}
        </div>
      </ScrollArea>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">{isEditing ? 'Update' : 'Save'}</Button>
      </DialogFooter>
    </form>
  );
}
