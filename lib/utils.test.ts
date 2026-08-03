import assert from 'node:assert/strict';
import test from 'node:test';

import type { Document } from '@/lib/db/schema';

import { getDocumentTimestampByIndex } from './utils';

function makeDocuments(): Array<Document> {
  return [
    { createdAt: new Date('2020-01-01T00:00:00Z') },
    { createdAt: new Date('2021-01-01T00:00:00Z') },
  ] as Array<Document>;
}

test('returns the createdAt for an in-range index', () => {
  const documents = makeDocuments();

  assert.equal(
    getDocumentTimestampByIndex(documents, 1),
    documents[1].createdAt,
  );
});

test('returns a fresh Date when index equals documents.length (out of bounds)', () => {
  const documents = makeDocuments();

  const result = getDocumentTimestampByIndex(documents, documents.length);

  assert.ok(result instanceof Date);
  assert.notEqual(result, documents[0].createdAt);
  assert.notEqual(result, documents[1].createdAt);
});

test('returns a fresh Date for a negative index', () => {
  const documents = makeDocuments();

  assert.ok(getDocumentTimestampByIndex(documents, -1) instanceof Date);
});

test('returns a fresh Date when documents is empty', () => {
  assert.ok(getDocumentTimestampByIndex([], 0) instanceof Date);
});
