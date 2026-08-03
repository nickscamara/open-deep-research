import equal from 'fast-deep-equal';

export interface BlockComparableProps {
  chatId: string;
  input: string;
  setInput: unknown;
  handleSubmit: unknown;
  isLoading: boolean;
  stop: unknown;
  attachments: unknown[];
  setAttachments: unknown;
  append: unknown;
  messages: unknown[];
  setMessages: unknown;
  reload: unknown;
  votes: unknown;
  isReadonly: boolean;
  searchMode: string;
  setSearchMode: unknown;
}

export function areBlockPropsEqual(
  prevProps: BlockComparableProps,
  nextProps: BlockComparableProps,
) {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.input === nextProps.input &&
    prevProps.setInput === nextProps.setInput &&
    prevProps.handleSubmit === nextProps.handleSubmit &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.stop === nextProps.stop &&
    equal(prevProps.attachments, nextProps.attachments) &&
    prevProps.setAttachments === nextProps.setAttachments &&
    prevProps.append === nextProps.append &&
    equal(prevProps.messages, nextProps.messages) &&
    prevProps.setMessages === nextProps.setMessages &&
    prevProps.reload === nextProps.reload &&
    equal(prevProps.votes, nextProps.votes) &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.searchMode === nextProps.searchMode &&
    prevProps.setSearchMode === nextProps.setSearchMode
  );
}
