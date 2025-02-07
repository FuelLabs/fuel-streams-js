import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useDeliverPolicy } from '@/lib/form/use-deliver-policy';
import { DeliverPolicyType } from '@fuels/streams';
import { Settings2 } from 'lucide-react';

export function DeliverPolicySelector() {
  const {
    deliverPolicyType,
    blockNumber,
    handleDeliverPolicyTypeChange,
    handleBlockNumberChange,
  } = useDeliverPolicy();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Switch
          id="historical-data"
          checked={deliverPolicyType === DeliverPolicyType.FromBlock}
          onCheckedChange={(checked) =>
            handleDeliverPolicyTypeChange(
              checked ? DeliverPolicyType.FromBlock : DeliverPolicyType.New,
            )
          }
          aria-label="Toggle historical data"
        />
        <label htmlFor="historical-data" className="text-sm font-medium">
          Historical data
        </label>
      </div>

      {deliverPolicyType === DeliverPolicyType.FromBlock && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              aria-label="Configure block number"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="space-y-2">
              <h4 className="font-medium">Historical Data Settings</h4>
              <div className="space-y-1">
                <label
                  htmlFor="block-number"
                  className="text-sm text-muted-foreground"
                >
                  Start from block
                </label>
                <Input
                  id="block-number"
                  type="number"
                  placeholder="Enter block number"
                  value={blockNumber}
                  onChange={(e) =>
                    handleBlockNumberChange(Number(e.target.value))
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
