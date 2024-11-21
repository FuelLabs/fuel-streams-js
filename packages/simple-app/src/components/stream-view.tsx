import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cardStyles } from '@/styles/card-styles';
import ReactJsonView from '@microlink/react-json-view';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { Code, Database, Eraser } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDynamicForm } from '../lib/form';
import { useStreamData } from '../lib/stream/use-stream-data';
import { CodeExamples } from './code-examples';
import { useTheme } from './theme-provider';

export function StreamView() {
  const { subject } = useDynamicForm();
  const { clear, stop, isSubscribing } = useStreamData();
  const [tab, setTab] = useState<'data' | 'code'>('data');

  function handleShowCode() {
    stop();
    setTab((s) => (s === 'data' ? 'code' : 'data'));
  }

  return (
    <Card className={cardStyles({ type: 'stream' })}>
      <CardHeader layout="row" className="h-20 border-b">
        <div className="flex-1">
          <CardTitle className="text-lg">Stream Data</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Real-time data stream output will appear here
          </CardDescription>
        </div>
        <Button size="sm" onClick={handleShowCode} disabled={isSubscribing}>
          {tab === 'data' ? <Code size={16} /> : <Database size={16} />}{' '}
          {tab === 'data' ? 'Code Examples' : 'Data'}
        </Button>
      </CardHeader>
      {subject && (
        <div className="flex justify-between items-center px-6 py-2 border-b">
          <code className="text-sm text-muted-foreground">
            Subject Query: {subject}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            disabled={isSubscribing}
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
  const { data } = useStreamData();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { isTheme } = useTheme();

  return (
    <CardContent className="pt-6">
      <ScrollArea className="w-full h-[calc(100vh-200px)]" ref={scrollAreaRef}>
        {data.length === 0 ? (
          <div
            className={`flex items-center justify-center text-muted-foreground ${
              subject ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-250px)]'
            }`}
          >
            No stream data available. Click "Start Listening" to begin receiving
            data.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {data.map((item) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
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
