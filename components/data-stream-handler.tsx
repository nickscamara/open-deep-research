'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { BlockKind } from './block';
import { Suggestion } from '@/lib/db/schema';
import { initialBlockData, useBlock } from '@/hooks/use-block';
import { useUserMessageId } from '@/hooks/use-user-message-id';
import { cx } from 'class-variance-authority';
import { useDeepResearch } from '@/lib/deep-research-context';
import { getMostRecentUserMessageId } from '@/lib/user-message-ids';

type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'spreadsheet-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'user-message-id'
    | 'kind'
    | 'activity-delta'
    | 'source-delta';
  content:
    | string
    | Suggestion
    | {
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
      }
    | {
        url: string;
        title: string;
        relevance: number;
      };
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream, messages } = useChat({ id });
  const { setUserMessageIdFromServer } = useUserMessageId();
  const { setBlock } = useBlock();
  const { addActivity, addSource } = useDeepResearch();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      if (delta.type === 'user-message-id') {
        const clientMessageId = getMostRecentUserMessageId(messages);

        if (clientMessageId) {
          setUserMessageIdFromServer(clientMessageId, delta.content as string);
        }
        return;
      }

      setBlock((draftBlock) => {
        if (!draftBlock) {
          return { ...initialBlockData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftBlock,
              documentId: delta.content as string,
              status: 'streaming',
            };

          case 'title':
            return {
              ...draftBlock,
              title: delta.content as string,
              status: 'streaming',
            };

          case 'kind':
            return {
              ...draftBlock,
              kind: delta.content as BlockKind,
              status: 'streaming',
            };

          case 'text-delta':
            return {
              ...draftBlock,
              content: draftBlock.content + (delta.content as string),
              isVisible:
                draftBlock.status === 'streaming' &&
                draftBlock.content.length > 400 &&
                draftBlock.content.length < 450
                  ? true
                  : draftBlock.isVisible,
              status: 'streaming',
            };

          case 'code-delta':
            return {
              ...draftBlock,
              content: delta.content as string,
              isVisible:
                draftBlock.status === 'streaming' &&
                draftBlock.content.length > 300 &&
                draftBlock.content.length < 310
                  ? true
                  : draftBlock.isVisible,
              status: 'streaming',
            };
          case 'spreadsheet-delta':
            return {
              ...draftBlock,
              content: delta.content as string,
              isVisible: true,
              status: 'streaming',
            };

          case 'clear':
            return {
              ...draftBlock,
              content: '',
              status: 'streaming',
            };

          case 'finish':
            return {
              ...draftBlock,
              status: 'idle',
            };

          case 'activity-delta':
            const activity = delta.content as {
              type: 'search' | 'extract' | 'analyze' | 'thought' | 'reasoning';
              status: 'pending' | 'complete' | 'error';
              message: string;
              timestamp: string;
            };
            addActivity(activity);
            return {
              ...draftBlock,
              status: 'streaming',
            };

          case 'source-delta':
            const source = delta.content as {
              url: string;
              title: string;
              relevance: number;
            };
            addSource(source);
            return {
              ...draftBlock,
              status: 'streaming',
            };

          default:
            return draftBlock;
        }
      });
    });
  }, [
    dataStream,
    setBlock,
    setUserMessageIdFromServer,
    addActivity,
    addSource,
    messages,
  ]);

  return null;
}
