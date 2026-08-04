export interface SuggestedActionsComparableProps {
  chatId: string;
  append: unknown;
}

export function areSuggestedActionsPropsEqual(
  previous: SuggestedActionsComparableProps,
  next: SuggestedActionsComparableProps,
): boolean {
  return previous.chatId === next.chatId && previous.append === next.append;
}
