// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o',
    label: 'GPT 4o',
    apiIdentifier: 'gpt-4o',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT 4o Mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'Affordable for complex, multi-step tasks',
  },
  {
    id: 'o3-mini',
    label: 'OpenAI o3-Mini',
    apiIdentifier: 'openai/o3-mini',
    description: 'Cost Effective & Fast Reasoning Model',
  },
  {
    id: 'gemini-2-flash',
    label: 'Gemini 2.0 Flash',
    apiIdentifier: 'google/gemini-2.0-flash-001',
    description: 'Fast and powerful reasoning model with multimodal capabilities',
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o';
