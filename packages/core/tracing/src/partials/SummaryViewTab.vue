<template>
  <div class="summary-view">
    <div class="lifecycle-view-wrapper">
      <LifecycleView
        :root-span="rootSpan"
        :show-skeleton="showSkeleton"
      />
    </div>

    <div class="payload-table-wrapper">
      <PayloadTable :show-skeleton="showSkeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LifecycleView from '../components/lifecycle/LifecycleView.vue'
import PayloadTable from '../components/payload/PayloadTable.vue'
import type { SpanNode } from '../types/spans'

defineProps<{
  rootSpan: SpanNode
  showSkeleton?: boolean
}>()
</script>

<style lang="scss" scoped>
.summary-view {
  margin-top: $kui-space-70;

  .lifecycle-view-wrapper {
    border: 1px solid $kui-color-border;
    border-radius: $kui-border-radius-20;
    overflow: hidden;
  }

  .payload-table-wrapper {
    margin-top: $kui-space-70;
  }
}
</style>
