import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCSV, escapeCSVField } from './spreadsheet';

test('escapeCSVField leaves plain values untouched', () => {
  assert.equal(escapeCSVField('hello'), 'hello');
});

test('escapeCSVField quotes values containing a comma', () => {
  assert.equal(escapeCSVField('a,b'), '"a,b"');
});

test('escapeCSVField escapes embedded double quotes', () => {
  assert.equal(escapeCSVField('a"b'), '"a""b"');
});

test('escapeCSVField quotes values containing newlines', () => {
  assert.equal(escapeCSVField('line1\nline2'), '"line1\nline2"');
  assert.equal(escapeCSVField('line1\r\nline2'), '"line1\r\nline2"');
});

test('escapeCSVField renders null/undefined as empty string', () => {
  assert.equal(escapeCSVField(null), '');
  assert.equal(escapeCSVField(undefined), '');
});

test('buildCSV escapes headers that contain a comma', () => {
  const csv = buildCSV({ headers: ['a,b', 'c'], rows: [['1', '2']] });
  assert.equal(csv.split('\n')[0], '"a,b",c');
});

test('buildCSV quotes cells that contain newlines', () => {
  const csv = buildCSV({ headers: ['h'], rows: [['line1\nline2']] });
  assert.equal(csv, 'h\n"line1\nline2"');
});

test('buildCSV pads short rows to the header width', () => {
  const csv = buildCSV({ headers: ['a', 'b', 'c'], rows: [['1']] });
  assert.equal(csv, 'a,b,c\n1,,');
});

test('buildCSV throws on invalid data', () => {
  assert.throws(() => buildCSV({} as never), {
    message: 'Invalid spreadsheet data',
  });
});
