import assert from 'node:assert/strict';
import test from 'node:test';

import { getLatestDocument } from './document-preview';

test('selects the latest document from ascending version history', () => {
  const documents = [
    { id: 'document', content: 'first' },
    { id: 'document', content: 'second' },
    { id: 'document', content: 'latest' },
  ];

  assert.deepEqual(getLatestDocument(documents), documents[2]);
});

test('returns undefined for missing or empty history', () => {
  assert.equal(getLatestDocument(undefined), undefined);
  assert.equal(getLatestDocument([]), undefined);
});
