import type { KonnectBaseEntityConfig, KongManagerBaseEntityConfig, ConfigurationSchema, ConfigurationSchemaItem } from '@kong-ui-public/entities-shared'

/** Konnect Consumer entity config */
export interface KonnectConsumerEntityConfig extends KonnectBaseEntityConfig { }

/** Kong Manager Consumer entity config */
export interface KongManagerConsumerEntityConfig extends KongManagerBaseEntityConfig { }

export interface ConsumerConfigurationSchema extends ConfigurationSchema {
  // basic fields
  id: ConfigurationSchemaItem
  username: ConfigurationSchemaItem
  custom_id: ConfigurationSchemaItem
  updated_at: ConfigurationSchemaItem
  created_at: ConfigurationSchemaItem
  tags: ConfigurationSchemaItem
  username_lower: ConfigurationSchemaItem
  type: ConfigurationSchemaItem
}
