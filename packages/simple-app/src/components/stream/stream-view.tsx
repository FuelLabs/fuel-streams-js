import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useConnection } from '@/lib/stream/use-connection';
import { useStreamTab } from '@/lib/stream/use-stream-tab';
import { useSubscriptions } from '@/lib/stream/use-subscriptions';
import { cn } from '@/lib/utils';
import ReactJsonView from '@microlink/react-json-view';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { cva } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { Code, Database, Eraser } from 'lucide-react';
import { useRef } from 'react';
import { useStreamData } from '../../lib/stream/use-stream-data';
import { ApiKeyPopover } from '../api-key-popover';
import { CodeExamples } from '../code-examples';
import { useTheme } from '../theme-provider';

type StreamViewProps = {
  className?: string;
};

const MotionCard = motion(Card);

const headerButton = cva(
  'h-12 gap-2 text-sm font-medium transition-colors rounded-none border-b-2',
  {
    variants: {
      active: {
        true: 'border-primary text-foreground',
        false:
          'border-transparent text-muted-foreground/70 hover:text-foreground hover:border-muted',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export function StreamView({ className }: StreamViewProps) {
  const { clear } = useStreamData();
  const { tab, setTab } = useStreamTab();
  const { subscriptions } = useSubscriptions();

  return (
    <Card
      className={cn('shadow-none rounded-none border-0 max-w-full', className)}
      aria-label="Stream View Panel"
    >
      <CardHeader layout="row" className="h-20 border-b">
        <div className="flex-1">
          <CardTitle className="text-lg" aria-level={2}>
            {tab === 'data' ? 'Data Stream' : 'Code Examples'}
          </CardTitle>
          <CardDescription>
            {tab === 'data'
              ? 'Real-time data stream output will appear here'
              : 'Example code snippets for implementing the stream'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <ApiKeyPopover />
        </div>
      </CardHeader>
      <div
        className="flex justify-between items-center px-6 h-12 border-b"
        aria-label="Current Subject Query"
      >
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <nav className="flex items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTab('data')}
              className={headerButton({ active: tab === 'data' })}
            >
              <Database size={16} />
              Live Data
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!subscriptions.length}
              onClick={() => setTab('code')}
              className={headerButton({ active: tab === 'code' })}
            >
              <Code size={16} />
              How to Use
            </Button>
          </nav>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={clear}
          aria-label="Clear Stream Data"
        >
          <Eraser size={16} /> Clear
        </Button>
      </div>
      {tab === 'data' ? <DataVisualization /> : <CodeExamples />}
    </Card>
  );
}

function DataVisualization() {
  const { data } = useStreamData();
  const { isConnecting } = useConnection();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { subscriptions } = useSubscriptions();
  const { isTheme } = useTheme();

  return (
    <CardContent className="pt-6 max-w-full w-full overflow-x-hidden">
      {isConnecting ? (
        <div
          className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-250px)]"
          role="alert"
          aria-busy="true"
          aria-label="Connection Status"
        >
          <Spinner
            size={32}
            className="text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            Connecting to network...
          </span>
        </div>
      ) : data.length === 0 ? (
        <div
          className={`flex items-center justify-center text-muted-foreground ${
            !subscriptions.length
              ? 'h-[calc(100vh-350px)]'
              : 'h-[calc(100vh-250px)]'
          }`}
          aria-label="No stream data available"
        >
          No stream data available. Click "Start Listening" to begin receiving
          data.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollAreaRef}>
          <AnimatePresence>
            {data.map(({ rawPayload, ...item }) => (
              <MotionCard
                key={item.subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                aria-label={`Stream data for ${item.subject}`}
                className="shadow-none rounded-sm max-w-full w-full overflow-hidden mb-4"
              >
                <CardHeader className="py-0 px-4 mb-4 bg-muted border-b">
                  <div className="flex flex-row justify-between text-sm font-mono items-center h-10">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="truncate max-w-[300px]">
                            {item.subject}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                          {item.subject}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* <div className="m-0 text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div> */}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 overflow-x-auto">
                  <ReactJsonView
                    collapsed={2}
                    name={null}
                    theme={
                      isTheme('dark') ? 'summerfruit' : 'summerfruit:inverted'
                    }
                    displayDataTypes={false}
                    src={{ ...item, payload: rawPayload }}
                    style={{
                      padding: 0,
                      background: 'transparent',
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                    }}
                    enableClipboard={true}
                  />
                </CardContent>
              </MotionCard>
            ))}
          </AnimatePresence>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </CardContent>
  );
}
