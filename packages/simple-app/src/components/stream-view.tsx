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
import { cn } from '@/lib/utils';
import ReactJsonView from '@microlink/react-json-view';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { useRef } from 'react';
import { useDynamicForm } from '../lib/form';
import { useStreamData } from '../lib/stream/use-stream-data';
import { CodeExamples } from './code-examples';
import { useTheme } from './theme-provider';

type StreamViewProps = {
  className?: string;
};

export function StreamView({ className }: StreamViewProps) {
  const { subject } = useDynamicForm();
  const { clear, tab } = useStreamData();

  return (
    <Card
      className={cn('shadow-none rounded-none border-0', className)}
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
      </CardHeader>
      {subject && (
        <div
          className="flex justify-between items-center px-6 py-2 border-b"
          aria-label="Current Subject Query"
        >
          <code className="text-sm text-muted-foreground">
            Subject Query: {subject}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            aria-label="Clear Stream Data"
          >
            <Eraser size={16} /> Clear
          </Button>
        </div>
      )}
      {tab === 'data' ? <DataVisualization /> : <CodeExamples />}
    </Card>
  );
}

function DataVisualization() {
  const { subject } = useDynamicForm();
  const { data, isConnecting } = useStreamData();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { isTheme } = useTheme();

  return (
    <CardContent className="pt-6">
      <ScrollArea className="w-full h-[calc(100vh-200px)]" ref={scrollAreaRef}>
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
              subject ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-250px)]'
            }`}
            aria-label="No stream data available"
          >
            No stream data available. Click "Start Listening" to begin receiving
            data.
          </div>
        ) : (
          <>
            <div
              className="flex flex-col gap-4"
              role="log"
              aria-label="Stream Data"
            >
              <AnimatePresence>
                {data.map((item) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    aria-label={`Stream data for ${item.subject}`}
                  >
                    <Card className="min-w-full w-full shadow-none rounded-sm">
                      <CardHeader className="py-0 px-4 mb-4 bg-muted border-b">
                        <div className="flex flex-row justify-between text-sm font-mono items-center h-10">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="truncate max-w-[500px]">
                                  {item.subject}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start">
                                {item.subject}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="m-0 text-slate-400">
                            {new Date(item.timestamp).toLocaleString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <ReactJsonView
                          collapsed={2}
                          name={null}
                          theme={
                            isTheme('dark')
                              ? 'summerfruit'
                              : 'summerfruit:inverted'
                          }
                          displayDataTypes={false}
                          src={item.payload as object}
                          style={{ padding: 0, background: 'transparent' }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <ScrollBar orientation="horizontal" />
          </>
        )}
      </ScrollArea>
    </CardContent>
  );
}
