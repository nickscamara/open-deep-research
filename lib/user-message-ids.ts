export type UserMessageIdMap = Record<string, string>;

export function addUserMessageIdMapping(
  current: UserMessageIdMap | undefined,
  clientMessageId: string,
  serverMessageId: string,
): UserMessageIdMap {
  return {
    ...current,
    [clientMessageId]: serverMessageId,
  };
}

export function resolveUserMessageId(
  mappings: UserMessageIdMap | undefined,
  clientMessageId: string,
): string {
  return mappings?.[clientMessageId] ?? clientMessageId;
}

export function getMostRecentUserMessageId(
  messages: readonly { id: string; role: string }[],
): string | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index].role === 'user') {
      return messages[index].id;
    }
  }

  return undefined;
}
