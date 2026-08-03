import assert from 'node:assert/strict';
import test from 'node:test';

import { getForecastStartIndex } from './weather';

const TIMES = [
  '2024-10-07T10:00:00Z',
  '2024-10-07T11:00:00Z',
  '2024-10-07T12:00:00Z',
  '2024-10-07T13:00:00Z',
];

test('returns the first forecast at or after the current time', () => {
  assert.equal(getForecastStartIndex(TIMES, '2024-10-07T10:30:00Z', 2), 1);
});

test('returns zero when the current time is before all forecasts', () => {
  assert.equal(getForecastStartIndex(TIMES, '2024-10-07T09:00:00Z', 2), 0);
});

test('falls back to the latest requested forecasts after the range ends', () => {
  assert.equal(getForecastStartIndex(TIMES, '2024-10-07T14:00:00Z', 2), 2);
});

test('clamps the fallback to zero when fewer forecasts are available', () => {
  assert.equal(getForecastStartIndex(TIMES, '2024-10-07T14:00:00Z', 6), 0);
});

test('returns zero for an empty forecast list', () => {
  assert.equal(getForecastStartIndex([], '2024-10-07T14:00:00Z', 6), 0);
});
