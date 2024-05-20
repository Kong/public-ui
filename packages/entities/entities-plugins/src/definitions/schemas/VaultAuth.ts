import type { VaultAuthSchema } from '../../types/plugins/vault-auth'

export const vaultAuthSchema: VaultAuthSchema = {
  'config-vault': {
    type: 'auto-suggest',
    entity: 'vaults',
    placeholder: 'Select a Vault',
    inputValues: {
      fields: ['prefix', 'name', 'id'],
    },
    modelTransformer: (val: string) => ({ id: val }),
    keyFromObject: 'id',
  },
}
