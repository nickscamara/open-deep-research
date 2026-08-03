import assert from 'node:assert/strict';
import test from 'node:test';

import { areBlockPropsEqual, type BlockComparableProps } from './block-props';

const setInput = () => {};
const handleSubmit = () => {};
const stop = () => {};
const setAttachments = () => {};
const append = () => {};
const setMessages = () => {};
const reload = () => {};
const setSearchMode = () => {};
const attachments: unknown[] = [];
const messages: unknown[] = [];
const votes: unknown[] = [];

function createProps(
  overrides: Partial<BlockComparableProps> = {},
): BlockComparableProps {
  return {
    chatId: 'chat-1',
    input: '',
    setInput,
    handleSubmit,
    isLoading: false,
    stop,
    attachments,
    setAttachments,
    append,
    messages,
    setMessages,
    reload,
    votes,
    isReadonly: false,
    searchMode: 'search',
    setSearchMode,
    ...overrides,
  };
}

test('treats identical props as equal', () => {
  const props = createProps();
  assert.equal(areBlockPropsEqual(props, props), true);
});

test('compares message arrays instead of an array to its length', () => {
  assert.equal(
    areBlockPropsEqual(
      createProps({ messages: [{ id: 'message-1', content: 'first' }] }),
      createProps({ messages: [{ id: 'message-1', content: 'first' }] }),
    ),
    true,
  );
  assert.equal(
    areBlockPropsEqual(
      createProps({ messages: [{ id: 'message-1', content: 'first' }] }),
      createProps({ messages: [{ id: 'message-1', content: 'updated' }] }),
    ),
    false,
  );
});

test('rerenders for chat, readonly, and search mode changes', () => {
  const previous = createProps();

  assert.equal(
    areBlockPropsEqual(previous, createProps({ chatId: 'chat-2' })),
    false,
  );
  assert.equal(
    areBlockPropsEqual(previous, createProps({ isReadonly: true })),
    false,
  );
  assert.equal(
    areBlockPropsEqual(previous, createProps({ searchMode: 'deep-research' })),
    false,
  );
});

test('rerenders when callbacks change', () => {
  assert.equal(
    areBlockPropsEqual(createProps(), createProps({ handleSubmit: () => {} })),
    false,
  );
  assert.equal(
    areBlockPropsEqual(createProps(), createProps({ setSearchMode: () => {} })),
    false,
  );
});

test('keeps deep equality for attachments and votes', () => {
  assert.equal(
    areBlockPropsEqual(
      createProps({
        attachments: [{ url: 'https://example.com/image.png' }],
        votes: [{ messageId: 'message-1', isUpvoted: true }],
      }),
      createProps({
        attachments: [{ url: 'https://example.com/image.png' }],
        votes: [{ messageId: 'message-1', isUpvoted: true }],
      }),
    ),
    true,
  );
});
