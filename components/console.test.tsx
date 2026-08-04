import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

test('exposes the current console height through slider semantics', async () => {
  const { Console } = await import('./console');
  const html = renderToStaticMarkup(
    <Console
      consoleOutputs={[
        {
          id: 'output',
          status: 'completed',
          contents: [{ type: 'text', value: 'done' }],
        },
      ]}
      setConsoleOutputs={() => undefined}
    />,
  );

  assert.match(html, /role="slider"/);
  assert.match(html, /aria-label="Resize console"/);
  assert.match(html, /aria-valuemin="100"/);
  assert.match(html, /aria-valuemax="800"/);
  assert.match(html, /aria-valuenow="300"/);
});
