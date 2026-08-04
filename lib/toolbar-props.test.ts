import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areToolbarPropsEqual,
  type ToolbarComparableProps,
} from './toolbar-props';

const setIsToolbarVisible = () => undefined;
const append = () => undefined;
const stop = () => undefined;
const setMessages = () => undefined;

const props: ToolbarComparableProps = {
  isToolbarVisible: false,
  setIsToolbarVisible,
  isLoading: false,
  append,
  stop,
  setMessages,
  blockKind: 'text',
};

test('treats unchanged toolbar props as equal', () => {
  assert.equal(areToolbarPropsEqual(props, { ...props }), true);
});

test('rerenders when any toolbar prop changes', () => {
  const changedProps: ToolbarComparableProps[] = [
    { ...props, isToolbarVisible: true },
    { ...props, setIsToolbarVisible: () => undefined },
    { ...props, isLoading: true },
    { ...props, append: () => undefined },
    { ...props, stop: () => undefined },
    { ...props, setMessages: () => undefined },
    { ...props, blockKind: 'code' },
  ];

  for (const nextProps of changedProps) {
    assert.equal(areToolbarPropsEqual(props, nextProps), false);
  }
});
