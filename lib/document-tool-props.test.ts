import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areDocumentToolCallPropsEqual,
  areDocumentToolResultPropsEqual,
  type DocumentToolCallComparableProps,
  type DocumentToolResultComparableProps,
} from './document-tool-props';

const callProps: DocumentToolCallComparableProps = {
  type: 'create',
  args: { title: 'Draft' },
  isReadonly: false,
};

const resultProps: DocumentToolResultComparableProps = {
  type: 'create',
  result: { id: 'document-1', title: 'Draft', kind: 'text' },
  isReadonly: false,
};

test('treats deeply equal document tool props as equal', () => {
  assert.equal(
    areDocumentToolCallPropsEqual(callProps, {
      ...callProps,
      args: { title: 'Draft' },
    }),
    true,
  );
  assert.equal(
    areDocumentToolResultPropsEqual(resultProps, {
      ...resultProps,
      result: { id: 'document-1', title: 'Draft', kind: 'text' },
    }),
    true,
  );
});

test('rerenders document tool calls when any prop changes', () => {
  const changedProps: DocumentToolCallComparableProps[] = [
    { ...callProps, type: 'update' },
    { ...callProps, args: { title: 'Updated' } },
    { ...callProps, isReadonly: true },
  ];

  for (const nextProps of changedProps) {
    assert.equal(areDocumentToolCallPropsEqual(callProps, nextProps), false);
  }
});

test('rerenders document tool results when any prop changes', () => {
  const changedProps: DocumentToolResultComparableProps[] = [
    { ...resultProps, type: 'update' },
    {
      ...resultProps,
      result: { id: 'document-2', title: 'Updated', kind: 'code' },
    },
    { ...resultProps, isReadonly: true },
  ];

  for (const nextProps of changedProps) {
    assert.equal(
      areDocumentToolResultPropsEqual(resultProps, nextProps),
      false,
    );
  }
});
