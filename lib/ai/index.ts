import { openai } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';
import { togetherai } from '@ai-sdk/togetherai';
import { deepseek } from '@ai-sdk/deepseek';

import { customMiddleware } from './custom-middleware';

// Valid reasoning models
const VALID_REASONING_MODELS = [
  'o1', 'o1-mini', 'o3-mini',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-reasoner',
  'gpt-4o'
] as const;

// Models that support JSON structured output
const JSON_SUPPORTED_MODELS = ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'] as const;

// Helper to check if model supports JSON
export const supportsJsonOutput = (modelId: string) =>
  JSON_SUPPORTED_MODELS.includes(modelId as typeof JSON_SUPPORTED_MODELS[number]);

// Get reasoning model from env, with JSON support info
const REASONING_MODEL = process.env.REASONING_MODEL || 'o1-mini';
const BYPASS_JSON_VALIDATION = process.env.BYPASS_JSON_VALIDATION === 'true';

// Helper to get the reasoning model based on user's selected model
function getReasoningModel(modelId: string) {
  // If already using a valid reasoning model, keep using it
  if (VALID_REASONING_MODELS.includes(modelId as ReasoningModel)) {
    return modelId;
  }

  const configuredModel = REASONING_MODEL;

  if (!VALID_REASONING_MODELS.includes(configuredModel as ReasoningModel)) {
    const fallback = 'o1-mini';
    console.warn(`Invalid REASONING_MODEL "${configuredModel}", falling back to ${fallback}`);
    return fallback;
  }

  // Warn if trying to use JSON with unsupported model
  if (!BYPASS_JSON_VALIDATION && !supportsJsonOutput(configuredModel)) {
    console.warn(`Warning: Model ${configuredModel} does not support JSON schema. Set BYPASS_JSON_VALIDATION=true to override`);
  }

  return configuredModel;
}

export const customModel = (apiIdentifier: string, forReasoning: boolean = false) => {
  // If it's for reasoning, get the appropriate reasoning model
  const modelId = forReasoning ? getReasoningModel(apiIdentifier) : apiIdentifier;

  // Select provider based on model
  const model = modelId === 'deepseek-ai/DeepSeek-R1'
    ? togetherai(modelId)
    : modelId === 'deepseek-reasoner'
    ? deepseek(modelId)
    : openai(modelId);

  return wrapLanguageModel({
    model,
    middleware: customMiddleware,
  });
};
