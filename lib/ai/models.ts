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
  }
] as const;

export const reasoningModels: Array<Model> = [
  {
    id: 'o1',
    label: 'o1',
    apiIdentifier: 'o1',
    description: 'For deep reasoning and complex, multi-step tasks',
  },
  {
    id: 'o1-mini',
    label: 'o1-mini',
    apiIdentifier: 'o1-mini',
    description: 'For deep reasoning and complex, multi-step tasks, cheaper.',
  },
  {
    id: 'o3-mini',
    label: 'o3-mini',
    apiIdentifier: 'o3-mini',
    description: 'For deep reasoning and complex, multi-step tasks, cheaper.',
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o';
export const DEFAULT_REASONING_MODEL_NAME: string = 'o1';
