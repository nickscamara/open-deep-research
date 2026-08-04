import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSpreadsheetValue } from './spreadsheet-data';

test('preserves valid falsy spreadsheet values', () => {
  assert.equal(normalizeSpreadsheetValue(0), '0');
  assert.equal(normalizeSpreadsheetValue(false), 'false');
});

test('normalizes nullish spreadsheet values to empty strings', () => {
  assert.equal(normalizeSpreadsheetValue(null), '');
  assert.equal(normalizeSpreadsheetValue(undefined), '');
});

test('stringifies other spreadsheet values', () => {
  assert.equal(normalizeSpreadsheetValue('value'), 'value');
  assert.equal(normalizeSpreadsheetValue(42), '42');
});
