export interface ChatHeaderComparableProps {
  chatId: string;
  selectedModelId: string;
  selectedReasoningModelId: string;
  selectedVisibilityType: string;
  isReadonly: boolean;
}

export function areChatHeaderPropsEqual(
  previous: ChatHeaderComparableProps,
  next: ChatHeaderComparableProps,
): boolean {
  return (
    previous.chatId === next.chatId &&
    previous.selectedModelId === next.selectedModelId &&
    previous.selectedReasoningModelId === next.selectedReasoningModelId &&
    previous.selectedVisibilityType === next.selectedVisibilityType &&
    previous.isReadonly === next.isReadonly
  );
}
