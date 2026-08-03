import assert from 'node:assert/strict';
import test from 'node:test';

import {
  areBlockActionsPropsEqual,
  type BlockActionsProps,
} from './block-actions';

const block: BlockActionsProps['block'] = {
  title: 'Report',
  documentId: 'document-1',
  kind: 'text',
  content: 'Initial content',
  isVisible: true,
  status: 'idle',
  boundingBox: {
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
};

const handleVersionChange: BlockActionsProps['handleVersionChange'] = () => {};
const setConsoleOutputs: BlockActionsProps['setConsoleOutputs'] = () => {};

function createProps(
  overrides: Partial<BlockActionsProps> = {},
): BlockActionsProps {
  return {
    block,
    handleVersionChange,
    currentVersionIndex: 1,
    isCurrentVersion: true,
    mode: 'read-only',
    setConsoleOutputs,
    ...overrides,
  };
}

test('treats identical props as equal', () => {
  const props = createProps();
  assert.equal(areBlockActionsPropsEqual(props, props), true);
});

test('rerenders when block content or kind changes', () => {
  const previous = createProps();
  const changedContent = createProps({
    block: { ...block, content: 'Updated content' },
  });
  const changedKind = createProps({
    block: { ...block, kind: 'spreadsheet' },
  });

  assert.equal(areBlockActionsPropsEqual(previous, changedContent), false);
  assert.equal(areBlockActionsPropsEqual(previous, changedKind), false);
});

test('rerenders when mode changes', () => {
  assert.equal(
    areBlockActionsPropsEqual(createProps(), createProps({ mode: 'diff' })),
    false,
  );
});

test('rerenders when event handlers change', () => {
  assert.equal(
    areBlockActionsPropsEqual(
      createProps(),
      createProps({ handleVersionChange: () => {} }),
    ),
    false,
  );
  assert.equal(
    areBlockActionsPropsEqual(
      createProps(),
      createProps({ setConsoleOutputs: () => {} }),
    ),
    false,
  );
});
