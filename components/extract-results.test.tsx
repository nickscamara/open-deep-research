import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

async function renderExtractedValue(data: string) {
  const { ExtractResults } = await import('./extract-results');

  return renderToStaticMarkup(
    <ExtractResults
      results={{
        url: 'https://example.com/source',
        data,
      }}
    />,
  );
}

test('renders short multiline extracted text as a preformatted block', async () => {
  const markup = await renderExtractedValue('first line\nsecond line');

  assert.match(markup, /<pre class="[^"]*whitespace-pre-wrap/);
  assert.match(markup, /first line\nsecond line/);
});

test('keeps short single-line extracted text inline', async () => {
  const markup = await renderExtractedValue('single line');

  assert.doesNotMatch(markup, /<pre/);
  assert.match(markup, /<span class="text-sm truncate"/);
});
