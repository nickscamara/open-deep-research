import equal from 'fast-deep-equal';

export interface MessagesComparableProps {
  chatId: string;
  isLoading: boolean;
  votes: unknown;
  messages: unknown;
  setMessages: unknown;
  reload: unknown;
  isReadonly: boolean;
  isBlockVisible: boolean;
}

export function areMessagesPropsEqual(
  previous: MessagesComparableProps,
  next: MessagesComparableProps,
): boolean {
  if (previous.isBlockVisible && next.isBlockVisible) {
    return true;
  }

  if (previous.isLoading && next.isLoading) {
    return false;
  }

  return (
    previous.chatId === next.chatId &&
    previous.isLoading === next.isLoading &&
    equal(previous.votes, next.votes) &&
    equal(previous.messages, next.messages) &&
    previous.setMessages === next.setMessages &&
    previous.reload === next.reload &&
    previous.isReadonly === next.isReadonly &&
    previous.isBlockVisible === next.isBlockVisible
  );
}
