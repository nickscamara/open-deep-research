import assert from 'node:assert/strict';
import test from 'node:test';

import { getOpenAIBaseURL } from './openai-provider';

test('prefers OPENAI_BASE_URL when both env vars are set', () => {
  const baseURL = getOpenAIBaseURL({
    OPENAI_BASE_URL: 'https://preferred.example.com/v1',
    OPENAI_API_BASE: 'https://alias.example.com/v1',
  });

  assert.equal(baseURL, 'https://preferred.example.com/v1');
});

test('falls back to OPENAI_API_BASE when OPENAI_BASE_URL is missing', () => {
  const baseURL = getOpenAIBaseURL({
    OPENAI_API_BASE: 'https://alias.example.com/v1',
  });

  assert.equal(baseURL, 'https://alias.example.com/v1');
});

test('returns undefined when no base URL is configured', () => {
  assert.equal(getOpenAIBaseURL({}), undefined);
});

test('ignores the .env.example placeholder value', () => {
  assert.equal(getOpenAIBaseURL({ OPENAI_BASE_URL: '****' }), undefined);
});
