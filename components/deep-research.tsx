import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeepResearchProps {
  isActive: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  activity?: Array<{
    type:
      | 'search'
      | 'extract'
      | 'analyze'
      | 'reasoning'
      | 'synthesis'
      | 'thought';
    status: 'pending' | 'complete' | 'error';
    message: string;
    timestamp: string;
  }>;
  sources?: Array<{
    url: string;
    title: string;
    relevance: number;
  }>;
}

export function DeepResearch({
  isLoading,
  activity = [],
  sources = [],
}: DeepResearchProps) {
  if (activity.length === 0 && sources.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 w-80 bg-background border rounded-lg shadow-lg p-4 max-h-[80vh] flex flex-col overflow-y-scroll">
      <Tabs defaultValue="activity" className="flex flex-col h-full">
        <TabsList className="w-full">
          <TabsTrigger value="activity" className="flex-1">
            Activity
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex-1">
            Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="flex-1 overflow-y-auto mt-2">
          <div className="space-y-4 pr-2 h-full">
            {[...activity].reverse().map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div
                  className={cn(
                    'size-2 rounded-full shrink-0',
                    item.status === 'pending' && 'bg-yellow-500',
                    item.status === 'complete' && 'bg-green-500',
                    item.status === 'error' && 'bg-red-500',
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                    {item.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sources" className="flex-1 overflow-y-auto mt-2">
          <div className="space-y-4 pr-2">
            {sources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline break-words"
                >
                  {source.title}
                </a>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground truncate">
                    {new URL(source.url).hostname}
                  </div>
                  {/* <div className="text-xs text-muted-foreground">
                    Relevance: {Math.round(source.relevance * 100)}%
                  </div> */}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
