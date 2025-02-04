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

export const DEFAULT_MODEL_NAME: string = 'gpt-4o';
