import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

test('renders inline code without a block wrapper', async () => {
  const { Markdown } = await import('./markdown');
  const html = renderToStaticMarkup(
    <Markdown>{'Use `inline_code` here.'}</Markdown>,
  );

  assert.match(html, /<p>Use <code/);
  assert.doesNotMatch(html, /<pre/);
});

test('keeps fenced code in a block wrapper', async () => {
  const { Markdown } = await import('./markdown');
  const html = renderToStaticMarkup(
    <Markdown>{'```python\nprint("block")\n```'}</Markdown>,
  );

  assert.match(html, /<pre/);
  assert.match(html, /print\(&quot;block&quot;\)/);
});
