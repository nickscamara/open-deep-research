import assert from 'node:assert/strict';
import test from 'node:test';

import { areSuggestedActionsPropsEqual } from './suggested-actions-props';

const append = () => undefined;
const props = {
  chatId: 'chat-1',
  append,
};

test('treats unchanged suggested action props as equal', () => {
  assert.equal(areSuggestedActionsPropsEqual(props, { ...props }), true);
});

test('rerenders suggested actions for a different chat', () => {
  assert.equal(
    areSuggestedActionsPropsEqual(props, { ...props, chatId: 'chat-2' }),
    false,
  );
});

test('rerenders suggested actions for a new append callback', () => {
  assert.equal(
    areSuggestedActionsPropsEqual(props, {
      ...props,
      append: () => undefined,
    }),
    false,
  );
});
