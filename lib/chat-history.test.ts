import assert from 'node:assert/strict';
import test from 'node:test';

import { removeChatById } from './chat-history';

const chats = [
  { id: 'active-chat', title: 'Active' },
  { id: 'other-chat', title: 'Other' },
];

test('removes the requested chat instead of the active chat', () => {
  assert.deepEqual(removeChatById(chats, 'other-chat'), [
    { id: 'active-chat', title: 'Active' },
  ]);
});

test('keeps the list unchanged when the chat is absent', () => {
  assert.deepEqual(removeChatById(chats, 'missing-chat'), chats);
});

test('preserves an undefined history value', () => {
  assert.equal(removeChatById(undefined, 'other-chat'), undefined);
});
