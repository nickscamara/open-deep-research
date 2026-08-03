import assert from 'node:assert/strict';
import test from 'node:test';

import { parseWebUrl } from './web-url';

test('parses an HTTPS source URL', () => {
  assert.deepEqual(parseWebUrl('https://example.com/path?q=research'), {
    href: 'https://example.com/path?q=research',
    hostname: 'example.com',
  });
});

test('parses an HTTP source URL', () => {
  assert.deepEqual(parseWebUrl('http://example.com/source'), {
    href: 'http://example.com/source',
    hostname: 'example.com',
  });
});

test('rejects malformed and relative URLs', () => {
  assert.equal(parseWebUrl('not a valid url'), null);
  assert.equal(parseWebUrl('/relative/source'), null);
});

test('rejects non-web URL schemes', () => {
  assert.equal(parseWebUrl('javascript:alert(1)'), null);
  assert.equal(parseWebUrl('data:text/plain,source'), null);
});
