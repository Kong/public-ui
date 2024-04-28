import type { RateLimitingFormSchema } from '../../types/plugins/rate-limiting'

export const rateLimitingFormSchema: RateLimitingFormSchema = {
  'config-strategy': {
    label: 'Config.Strategy',
    type: 'select',
    default: 'redis',
    values: ['local', 'redis'],
  },
  'config-consumer_groups': {
    label: 'Config.Consumer Groups',
    type: 'input',
    placeholder: 'Enter list of consumer groups',
    hint: 'e.g. group1, group2',
  },
}
