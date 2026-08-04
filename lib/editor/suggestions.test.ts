import assert from 'node:assert/strict';
import test from 'node:test';

import type { Suggestion } from '@/lib/db/schema';

import { documentSchema } from './config';
import { projectWithPositions } from './suggestions';

function createSuggestion(originalText: string): Suggestion {
  return {
    id: 'suggestion-id',
    documentId: 'document-id',
    documentCreatedAt: new Date('2026-01-01T00:00:00Z'),
    originalText,
    suggestedText: 'replacement',
    description: 'description',
    isResolved: false,
    userId: 'user-id',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };
}

test('locates suggestion text across inline mark boundaries', () => {
  const strong = documentSchema.marks.strong.create();
  const doc = documentSchema.node('doc', null, [
    documentSchema.node('paragraph', null, [
      documentSchema.text('hello '),
      documentSchema.text('world', [strong]),
    ]),
  ]);

  const [suggestion] = projectWithPositions(doc, [
    createSuggestion('hello world'),
  ]);

  assert.deepEqual(
    {
      start: suggestion.selectionStart,
      end: suggestion.selectionEnd,
    },
    { start: 1, end: 12 },
  );
});

test('keeps plain text suggestion positions unchanged', () => {
  const doc = documentSchema.node('doc', null, [
    documentSchema.node('paragraph', null, [
      documentSchema.text('before target after'),
    ]),
  ]);

  const [suggestion] = projectWithPositions(doc, [createSuggestion('target')]);

  assert.deepEqual(
    {
      start: suggestion.selectionStart,
      end: suggestion.selectionEnd,
    },
    { start: 8, end: 14 },
  );
});
