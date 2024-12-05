<template>
  <div class="payload-table">
    <KSkeleton
      v-if="showSkeleton"
      :table-columns="2"
      :table-rows="8"
      type="table"
    />

    <template v-else>
      <div class="title">
        {{ t('payload.section_title') }}
      </div>

      <div class="attributes">
        <template
          v-for="row in rows"
          :key="row.key"
        >
          <ConfigCardItem
            :item="{
              type: ConfigurationSchemaType.Text,
              key: row.key,
              label: te(`payload.attributes.${row.key}` as TranslationKey) ? t(`payload.attributes.${row.key}` as TranslationKey) : row.key,
              value: row.value
            }"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ConfigCardItem, ConfigurationSchemaType } from '@kong-ui-public/entities-shared'
import composables from '../../composables'
import type { TranslationKey } from '../../composables/useI18n'
import { WATERFALL_ROW_COLUMN_GAP } from '../../constants'

const { i18n: { t, te } } = composables.useI18n()

defineProps<{ showSkeleton?: boolean }>()

const rows = [{
  key: 'status_code',
  value: 200,
}, {
  key: 'upstream_status_code',
  value: 200,
}, {
  key: 'start_time',
  value: new Date().toISOString(),
}, {
  key: 'latency',
  value: 20,
}]
</script>

<style lang="scss" scoped>
.payload-table {
  align-items: flex-start;
  display: flex;
  flex-direction: column;

  .title {
    background-color: $kui-color-background-neutral-weakest;
    border-bottom: 1px solid $kui-color-border-neutral-weaker;
    box-sizing: border-box;
    font-size: $kui-font-size-30;
    font-weight: $kui-font-weight-semibold;
    padding: $kui-space-60 v-bind(WATERFALL_ROW_COLUMN_GAP);
    width: 100%;
  }

  .attributes {
    width: 100%;

    :deep(.config-card-details-value) {
      font-family: $kui-font-family-code;
      font-size: $kui-font-size-30;

      .copy-text {
        font-size: $kui-font-size-30;
      }
    }

    :deep(.config-card-details-row) {
      column-gap: v-bind(WATERFALL_ROW_COLUMN_GAP);
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: $kui-space-60 v-bind(WATERFALL_ROW_COLUMN_GAP);

      .config-card-details-label,
      .config-card-details-value {
        padding: 0;
        width: 100%;
      }
    }

  }
}
</style>
