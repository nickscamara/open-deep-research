import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONSOLE_MAX_HEIGHT,
  CONSOLE_MIN_HEIGHT,
  getConsoleHeightForKey,
} from './console-resize';

test('adjusts console height with arrow keys', () => {
  assert.equal(getConsoleHeightForKey(300, 'ArrowUp'), 320);
  assert.equal(getConsoleHeightForKey(300, 'ArrowRight'), 320);
  assert.equal(getConsoleHeightForKey(300, 'ArrowDown'), 280);
  assert.equal(getConsoleHeightForKey(300, 'ArrowLeft'), 280);
});

test('clamps keyboard resizing to the console range', () => {
  assert.equal(
    getConsoleHeightForKey(CONSOLE_MAX_HEIGHT, 'ArrowUp'),
    CONSOLE_MAX_HEIGHT,
  );
  assert.equal(
    getConsoleHeightForKey(CONSOLE_MIN_HEIGHT, 'ArrowDown'),
    CONSOLE_MIN_HEIGHT,
  );
  assert.equal(getConsoleHeightForKey(300, 'Home'), CONSOLE_MIN_HEIGHT);
  assert.equal(getConsoleHeightForKey(300, 'End'), CONSOLE_MAX_HEIGHT);
});

test('ignores unrelated keys', () => {
  assert.equal(getConsoleHeightForKey(300, 'Enter'), 300);
});
