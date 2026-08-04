import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addUserMessageIdMapping,
  getMostRecentUserMessageId,
  resolveUserMessageId,
} from './user-message-ids';

test('keeps a server ID for each optimistic client message', () => {
  const firstMapping = addUserMessageIdMapping(
    undefined,
    'client-1',
    'server-1',
  );
  const mappings = addUserMessageIdMapping(
    firstMapping,
    'client-2',
    'server-2',
  );

  assert.equal(resolveUserMessageId(mappings, 'client-1'), 'server-1');
  assert.equal(resolveUserMessageId(mappings, 'client-2'), 'server-2');
});

test('falls back to the existing ID for messages loaded from the server', () => {
  assert.equal(
    resolveUserMessageId({}, 'persisted-message'),
    'persisted-message',
  );
});

test('finds the latest user message instead of the latest message overall', () => {
  assert.equal(
    getMostRecentUserMessageId([
      { id: 'user-1', role: 'user' },
      { id: 'assistant-1', role: 'assistant' },
      { id: 'user-2', role: 'user' },
      { id: 'assistant-2', role: 'assistant' },
    ]),
    'user-2',
  );
  assert.equal(
    getMostRecentUserMessageId([{ id: 'assistant', role: 'assistant' }]),
    undefined,
  );
});
