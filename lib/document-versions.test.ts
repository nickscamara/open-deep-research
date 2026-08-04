import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getRestoredDocumentVersions,
  restoreDocumentVersion,
} from './document-versions';

const versions = ['first', 'second', 'third', 'fourth'];

test('keeps the selected document version and every earlier version', () => {
  assert.deepEqual(getRestoredDocumentVersions(versions, 1), [
    'first',
    'second',
  ]);
});

test('can restore the first document version', () => {
  assert.deepEqual(getRestoredDocumentVersions(versions, 0), ['first']);
});

test('keeps all versions when the version index is invalid', () => {
  assert.deepEqual(getRestoredDocumentVersions(versions, -1), versions);
  assert.deepEqual(
    getRestoredDocumentVersions(versions, versions.length),
    versions,
  );
  assert.deepEqual(getRestoredDocumentVersions(versions, 1.5), versions);
});

test('returns restored document data instead of the response object', async () => {
  const restored = await restoreDocumentVersion(versions, 1, async () => ({
    ok: true,
  }));

  assert.deepEqual(restored, ['first', 'second']);
});

test('rejects a failed restore request', async () => {
  await assert.rejects(
    restoreDocumentVersion(versions, 1, async () => ({ ok: false })),
    /Failed to restore document version/,
  );
});
