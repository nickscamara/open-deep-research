'use client';

import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from './icons';
import { ChevronRight, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ExtractedData {
  url: string;
  data: any;
}

interface ExtractResultsProps {
  results: ExtractedData | ExtractedData[];
  title?: string;
  isLoading?: boolean;
}

export function ExtractResults({
  results,
  title = 'Extracted Data...',
  isLoading = false,
}: ExtractResultsProps) {
  const resultsArray = Array.isArray(results) ? results : [results];
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const handleToggle = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenItems((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">
            Using Firecrawl to extract data...
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span>Extracting data...</span>
        </div>
      </div>
    );
  }

  if (!resultsArray.length) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return value.toString();
    return JSON.stringify(value, null, 2);
  };

  const renderValue = (value: any): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <div className="grid gap-1.5">
          {value.map((item, i) => (
            <div key={i} className="pl-3 border-l border-border">
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="grid gap-1.5">
          {Object.entries(value).map(([k, v], i) => (
            <div
              key={i}
              className="grid grid-cols-[180px,1fr] items-start gap-4"
            >
              <span
                className="text-xs font-medium text-muted-foreground truncate"
                title={k}
              >
                {k}
              </span>
              <div className="text-sm min-w-0">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      );
    }

    const formatted = formatValue(value);
    if (formatted.includes('\n') || formatted.length > 100) {
      return (
        <pre className="text-sm whitespace-pre-wrap break-words bg-muted/50 rounded-md p-2">
          {formatted}
        </pre>
      );
    }

    return (
      <span className="text-sm truncate" title={formatted}>
        {formatted}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="grid gap-3">
        {resultsArray.map((result, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col rounded-lg bg-muted/40 overflow-hidden',
            )}
          >
            <button
              onClick={(e) => handleToggle(e, i)}
              className="flex items-center justify-between w-full p-4 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-5 shrink-0 rounded-sm bg-background ring-1 ring-border text-[10px] font-medium">
                  <FileText size={12} />
                </div>
                <span className="text-sm font-medium hover:underline flex items-center gap-1">
                  {new URL(result.url).hostname}
                  <ExternalLinkIcon
                    size={12}
                    className="text-muted-foreground"
                  />
                </span>
              </div>
              <ChevronRight
                size={16}
                className={cn(
                  'text-muted-foreground transition-transform',
                  openItems[i] && 'rotate-90',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all',
                openItems[i]
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-0 grid gap-1.5 min-w-0">
                  {renderValue(result.data)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
