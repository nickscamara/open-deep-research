import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areMultimodalInputPropsEqual,
  type MultimodalInputProps,
} from './multimodal-input';

const setInput: MultimodalInputProps['setInput'] = () => {};
const stop: MultimodalInputProps['stop'] = () => {};
const setAttachments: MultimodalInputProps['setAttachments'] = () => {};
const setMessages: MultimodalInputProps['setMessages'] = () => {};
const append: MultimodalInputProps['append'] = async () => null;
const handleSubmit: MultimodalInputProps['handleSubmit'] = () => {};
const setSearchMode: MultimodalInputProps['setSearchMode'] = () => {};
const attachments: MultimodalInputProps['attachments'] = [];
const messages: MultimodalInputProps['messages'] = [];

function createProps(
  overrides: Partial<MultimodalInputProps> = {},
): MultimodalInputProps {
  return {
    chatId: 'chat-1',
    input: '',
    setInput,
    isLoading: false,
    stop,
    attachments,
    setAttachments,
    messages,
    setMessages,
    append,
    handleSubmit,
    searchMode: 'search',
    setSearchMode,
    ...overrides,
  };
}

test('treats identical props as equal', () => {
  const props = createProps();
  assert.equal(areMultimodalInputPropsEqual(props, props), true);
});

test('rerenders when the chat or messages change', () => {
  const previous = createProps();

  assert.equal(
    areMultimodalInputPropsEqual(previous, createProps({ chatId: 'chat-2' })),
    false,
  );
  assert.equal(
    areMultimodalInputPropsEqual(
      previous,
      createProps({
        messages: [{ id: 'message-1', role: 'user', content: 'Hello' }],
      }),
    ),
    false,
  );
});

test('keeps the deep attachment equality optimization', () => {
  const attachment = {
    name: 'image.png',
    url: 'https://example.com/image.png',
    contentType: 'image/png',
  };

  assert.equal(
    areMultimodalInputPropsEqual(
      createProps({ attachments: [attachment] }),
      createProps({ attachments: [{ ...attachment }] }),
    ),
    true,
  );
});

test('rerenders when attachments or submit callbacks change', () => {
  assert.equal(
    areMultimodalInputPropsEqual(
      createProps(),
      createProps({
        attachments: [
          {
            name: 'image.png',
            url: 'https://example.com/image.png',
            contentType: 'image/png',
          },
        ],
      }),
    ),
    false,
  );
  assert.equal(
    areMultimodalInputPropsEqual(
      createProps(),
      createProps({ handleSubmit: () => {} }),
    ),
    false,
  );
});

test('rerenders when search mode props change', () => {
  assert.equal(
    areMultimodalInputPropsEqual(
      createProps(),
      createProps({ searchMode: 'deep-research' }),
    ),
    false,
  );
  assert.equal(
    areMultimodalInputPropsEqual(
      createProps(),
      createProps({ setSearchMode: () => {} }),
    ),
    false,
  );
});
