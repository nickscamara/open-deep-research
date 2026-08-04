import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areMessagesPropsEqual,
  type MessagesComparableProps,
} from './messages-props';

const setMessages = () => undefined;
const reload = () => undefined;
const props: MessagesComparableProps = {
  chatId: 'chat-1',
  isLoading: false,
  votes: [],
  messages: [{ id: 'message-1', content: 'first' }],
  setMessages,
  reload,
  isReadonly: false,
  isBlockVisible: false,
};

test('treats unchanged message list props as equal', () => {
  assert.equal(areMessagesPropsEqual(props, { ...props }), true);
});

test('keeps streaming message lists updating', () => {
  assert.equal(
    areMessagesPropsEqual(
      { ...props, isLoading: true },
      { ...props, isLoading: true },
    ),
    false,
  );
});

test('skips background updates while the block stays visible', () => {
  assert.equal(
    areMessagesPropsEqual(
      { ...props, isBlockVisible: true },
      {
        ...props,
        chatId: 'chat-2',
        messages: [{ id: 'message-2', content: 'second' }],
        isBlockVisible: true,
      },
    ),
    true,
  );
});

test('rerenders when any visible message list prop changes', () => {
  const changedProps: MessagesComparableProps[] = [
    { ...props, chatId: 'chat-2' },
    { ...props, isLoading: true },
    { ...props, votes: [{ messageId: 'message-1', isUpvoted: true }] },
    { ...props, messages: [{ id: 'message-1', content: 'updated' }] },
    { ...props, setMessages: () => undefined },
    { ...props, reload: () => undefined },
    { ...props, isReadonly: true },
    { ...props, isBlockVisible: true },
  ];

  for (const nextProps of changedProps) {
    assert.equal(areMessagesPropsEqual(props, nextProps), false);
  }
});
