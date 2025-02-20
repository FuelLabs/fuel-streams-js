import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStreamTab } from '@/lib/stream/use-stream-tab';
import ReactJsonView from '@microlink/react-json-view';
import type { JsonAbi } from 'fuels';
import { Eye, Plus, Trash, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../theme-provider';

export function AbiSelector() {
  const { abi, setAbi } = useStreamTab();
  const [showAbiDialog, setShowAbiDialog] = useState(false);
  const { isTheme } = useTheme();

  if (abi) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="px-3 gap-2"
            onClick={() => setShowAbiDialog(true)}
          >
            <Eye className="text-gray-500 h-4 w-4 mr-2" />
            ABI loaded
          </Button>
        </div>

        <Dialog open={showAbiDialog} onOpenChange={setShowAbiDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  ABI Content
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => setAbi(null)}
                  >
                    <Trash className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <ReactJsonView
                collapsed={2}
                name={null}
                theme={isTheme('dark') ? 'summerfruit' : 'summerfruit:inverted'}
                displayDataTypes={false}
                src={abi}
                style={{
                  padding: 0,
                  background: 'transparent',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                }}
                enableClipboard={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="xs" variant="outline" className="h-8">
          <Plus className="h-4 w-4" />
          Add ABI
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Upload ABI File</h4>
          <Input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  setAbi(JSON.parse(content) as JsonAbi);
                  setShowAbiDialog(true);
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
