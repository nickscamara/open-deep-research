import { createOpenAI, openai } from '@ai-sdk/openai';

type OpenAIEnv = Record<string, string | undefined>;

// Resolve a custom OpenAI-compatible base URL from the environment.
// Supports OPENAI_BASE_URL (preferred) and OPENAI_API_BASE (common alias).
// Placeholder values from .env.example ("****") are ignored.
export function getOpenAIBaseURL(
  env: OpenAIEnv = process.env,
): string | undefined {
  const baseURL = env.OPENAI_BASE_URL?.trim() || env.OPENAI_API_BASE?.trim();

  if (!baseURL || baseURL === '****') {
    return undefined;
  }

  return baseURL;
}

// Return an OpenAI provider that honors a custom base URL when configured,
// otherwise fall back to the default provider (api.openai.com).
export function getOpenAIProvider(env: OpenAIEnv = process.env) {
  const baseURL = getOpenAIBaseURL(env);

  if (baseURL) {
    return createOpenAI({ baseURL });
  }

  return openai;
}
