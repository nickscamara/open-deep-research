'use client';

import { useCallback } from 'react';
import useSWR from 'swr';

import {
  addUserMessageIdMapping,
  resolveUserMessageId,
  type UserMessageIdMap,
} from '@/lib/user-message-ids';

export function useUserMessageId() {
  const { data: userMessageIds, mutate: setUserMessageIds } =
    useSWR<UserMessageIdMap>('userMessageIdsByClientId', null, {
      fallbackData: {},
    });

  const setUserMessageIdFromServer = useCallback(
    (clientMessageId: string, serverMessageId: string) => {
      setUserMessageIds(
        (current) =>
          addUserMessageIdMapping(current, clientMessageId, serverMessageId),
        false,
      );
    },
    [setUserMessageIds],
  );

  const getUserMessageId = useCallback(
    (clientMessageId: string) =>
      resolveUserMessageId(userMessageIds, clientMessageId),
    [userMessageIds],
  );

  return { getUserMessageId, setUserMessageIdFromServer };
}
