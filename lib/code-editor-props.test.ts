import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areCodeEditorPropsEqual,
  type CodeEditorComparableProps,
} from './code-editor-props';

const suggestions: unknown[] = [];
const saveContent = () => undefined;
const props: CodeEditorComparableProps = {
  content: 'print("first")',
  saveContent,
  status: 'idle',
  isCurrentVersion: true,
  currentVersionIndex: 0,
  suggestions,
};

test('treats unchanged code editor props as equal', () => {
  assert.equal(areCodeEditorPropsEqual(props, { ...props }), true);
});

test('rerenders when the save callback changes', () => {
  assert.equal(
    areCodeEditorPropsEqual(props, {
      ...props,
      saveContent: () => undefined,
    }),
    false,
  );
});

test('preserves streaming updates and other prop comparisons', () => {
  assert.equal(
    areCodeEditorPropsEqual(
      { ...props, status: 'streaming' },
      { ...props, status: 'streaming' },
    ),
    false,
  );

  const changedProps: CodeEditorComparableProps[] = [
    { ...props, content: 'print("second")' },
    { ...props, status: 'streaming' },
    { ...props, isCurrentVersion: false },
    { ...props, currentVersionIndex: 1 },
    { ...props, suggestions: [] },
  ];

  for (const nextProps of changedProps) {
    assert.equal(areCodeEditorPropsEqual(props, nextProps), false);
  }
});
