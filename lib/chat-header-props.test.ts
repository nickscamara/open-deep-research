import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areChatHeaderPropsEqual,
  type ChatHeaderComparableProps,
} from './chat-header-props';

const props: ChatHeaderComparableProps = {
  chatId: 'chat-1',
  selectedModelId: 'model-1',
  selectedReasoningModelId: 'reasoning-1',
  selectedVisibilityType: 'private',
  isReadonly: false,
};

test('treats unchanged chat header props as equal', () => {
  assert.equal(areChatHeaderPropsEqual(props, { ...props }), true);
});

test('rerenders when any chat header prop changes', () => {
  const changedProps: ChatHeaderComparableProps[] = [
    { ...props, chatId: 'chat-2' },
    { ...props, selectedModelId: 'model-2' },
    { ...props, selectedReasoningModelId: 'reasoning-2' },
    { ...props, selectedVisibilityType: 'public' },
    { ...props, isReadonly: true },
  ];

  for (const nextProps of changedProps) {
    assert.equal(areChatHeaderPropsEqual(props, nextProps), false);
  }
});
