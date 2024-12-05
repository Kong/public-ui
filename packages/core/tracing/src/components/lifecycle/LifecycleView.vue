<template>
  <div class="lifecycle-view">
    <KSkeleton
      v-if="showSkeleton"
      type="spinner"
    />
    <VueFlow
      v-else
      ref="flow"
      :nodes-connectable="false"
      :nodes-draggable="false"
    >
      <template #node-default="nodeProps: NodeProps<LifecycleNodeData>">
        <LifecycleViewNode
          :data="nodeProps.data"
          :source-position="nodeProps.sourcePosition"
          :target-position="nodeProps.targetPosition"
        />
      </template>

      <!-- TODO: This is skipped for now -->
      <!-- <LifecycleViewLegend ref="legend" /> -->

      <Controls :show-interactive="false" />
      <Background />
    </VueFlow>
  </div>
</template>

<script lang="ts" setup>
import { KUI_SPACE_50 } from '@kong/design-tokens'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  getRectOfNodes,
  Position,
  useVueFlow,
  VueFlow,
  type GraphNode,
  type NodeProps,
} from '@vue-flow/core'
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch, type ComponentInstance } from 'vue'
import { LifecycleNodeType } from '../../constants'
import { type LifecycleNode, type LifecycleNodeData, type SpanNode } from '../../types'
import { buildLifecycleGraph } from '../../utils'
import type LifecycleViewLegend from './LifecycleViewLegend.vue'
import LifecycleViewNode from './LifecycleViewNode.vue'

const props = defineProps<{
  rootSpan: SpanNode
  showSkeleton?: boolean
}>()

const flowRef = useTemplateRef<ComponentInstance<typeof VueFlow>>('flow')
const legendRef = useTemplateRef<ComponentInstance<typeof LifecycleViewLegend>>('legend')

const options = {
  nodeGapX: 30,
  nodeGapY: 10,
}

const {
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  updateNode,
  onNodesInitialized,
  onNodeClick,
} = useVueFlow()

const { findNode, fitBounds } = useVueFlow()

/**
 * This function takes a list of nodes, computes the positions, and updated the nodes in-place.
 * @param nodes
 */
const layout = (nodes: LifecycleNode[]): LifecycleNode[] => {
  if (nodes.length === 0) {
    return []
  }

  let clientNode: GraphNode | undefined
  let upstreamNode: GraphNode | undefined

  const requestNodes: GraphNode[] = []
  const requestBox = {
    width: 0,
    height: 0,
  }

  const responseNodes: GraphNode[] = []
  const responseBox = {
    width: 0,
    height: 0,
  }

  for (let i = 0; i < nodes.length; i++) {
    const id = nodes[i].id
    const node = findNode<LifecycleNodeData, any>(id)
    if (!node) {
      throw new Error(`Graph node with ID "${id}" is not found`)
    }

    switch (node.data.type) {
      case LifecycleNodeType.CLIENT:
        if (i !== 0) {
          throw new Error('The client node did not appear first')
        }

        node.targetPosition = Position.Bottom
        node.sourcePosition = Position.Top
        clientNode = node
        break
      case LifecycleNodeType.REQUEST:
        if (!clientNode) {
          throw new Error('Encountered a request node before the client node')
        } if (upstreamNode) {
          throw new Error('Encountered a request node after the upstream node')
        }

        node.targetPosition = Position.Left
        node.sourcePosition = Position.Right

        requestNodes.push(node)
        requestBox.width += node.dimensions.width + (requestBox.width > 0 ? options.nodeGapX : 0)
        if (node.dimensions.height > requestBox.height) {
          requestBox.height = node.dimensions.height
        }
        break
      case LifecycleNodeType.UPSTREAM:
        if (!clientNode) {
          throw new Error('Encountered the upstream node before the client node')
        } else if (upstreamNode) {
          throw new Error(`Duplicate upstream node at index ${i}`)
        }

        node.targetPosition = Position.Top
        node.sourcePosition = Position.Bottom

        upstreamNode = node
        break
      case LifecycleNodeType.RESPONSE:
        if (i === 0) {
          throw new Error('Encountered a response node before the client node')
        } else if (!upstreamNode) {
          throw new Error('Encountered a response node before the upstream node')
        }

        node.targetPosition = Position.Right
        node.sourcePosition = Position.Left

        responseNodes.push(node)
        responseBox.width += node.dimensions.width + (responseBox.width > 0 ? options.nodeGapX : 0)
        if (node.dimensions.height > responseBox.height) {
          responseBox.height = node.dimensions.height
        }
        break
      default:
        throw new Error(`Unknown node type: ${node.data.type}`)
    }
  }

  if (!clientNode) {
    throw new Error('Missing the client node')
  } else if (!upstreamNode) {
    throw new Error('Missing the upstream node')
  }

  // "lr" stands for "left and right": refers to the client and upstream nodes
  const lrHeight = Math.max(clientNode.dimensions.height, upstreamNode.dimensions.height)
  const lrOffsetY = Math.abs(clientNode.dimensions.height - upstreamNode.dimensions.height) / 2

  // "tb" stands for "top and bottom": refers to the request and response nodes
  const tbWidth = Math.max(requestBox.width, responseBox.width)
  const tbOffsetX = Math.abs(requestBox.width - responseBox.width) / 2

  clientNode.position.y = requestBox.height + options.nodeGapY

  let x = clientNode.position.x + clientNode.dimensions.width
  if (requestBox.width < responseBox.width) {
    x += tbOffsetX
  }
  for (const node of requestNodes) {
    x += options.nodeGapX
    node.position.x = x
    node.position.y = (requestBox.height - node.dimensions.height) / 2
    x += node.dimensions.width
  }

  upstreamNode.position.x = clientNode.position.x + clientNode.dimensions.width + options.nodeGapX + tbWidth + options.nodeGapX
  upstreamNode.position.y = requestBox.height + options.nodeGapY

  x = clientNode.position.x + clientNode.dimensions.width + options.nodeGapX + tbWidth + options.nodeGapX
  if (responseBox.width < requestBox.width) {
    x -= tbOffsetX
  }

  const bottomBaseY = requestBox.height + options.nodeGapY + lrHeight + options.nodeGapY
  for (const node of responseNodes) {
    x -= options.nodeGapX + node.dimensions.width
    node.position.x = x
    node.position.y = bottomBaseY + (responseBox.height - node.dimensions.height) / 2
  }

  if (clientNode.dimensions.height < upstreamNode.dimensions.height) {
    clientNode.position.y += lrOffsetY
  } else {
    upstreamNode.position.y += lrOffsetY
  }

  return nodes
}

const currentGraph = computed(() => buildLifecycleGraph(props.rootSpan))

onNodesInitialized((nodes) => {
  for (const diff of layout(nodes)) {
    updateNode(diff.id, diff)
  }
  nextTick(() => {
    fitNodes()
  })
})

watch(
  currentGraph,
  (newGraph, oldGraph) => {
    removeNodes(oldGraph?.nodes ?? [])
    removeEdges(oldGraph?.edges ?? [])

    addNodes(newGraph?.nodes ?? [])
    addEdges(newGraph?.edges ?? [])
  },
  { immediate: true },
)

const fitNodes = () => {
  if (!flowRef.value?.nodes) {
    return
  }
  const rect = getRectOfNodes(flowRef.value.nodes)
  // const legendOuterBounds = (legendRef.value?.$el.getBoundingClientRect?.()?.height ?? 0) + 2 * 8
  rect.width += parseFloat(KUI_SPACE_50) * 2
  rect.height += parseFloat(KUI_SPACE_50) * 2
  fitBounds(rect)
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    fitNodes()
  })
  if (legendRef.value) {
    resizeObserver.observe(legendRef.value.$el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// onNodeClick((e: NodeMouseEvent) => {
//   const node = e.node as ExtendedNode

//   switch (node.data?.extendedType) {
//     case 'span': {
//       if (node.data?.child) {
//         currentGraph.value = node.data?.child
//       }
//       break
//     }
//     case 'parent': {
//       if (node.data.parent) {
//         currentGraph.value = node.data.parent
//       }
//       break
//     }
//   }
// })
</script>

<style lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/node-resizer/dist/style.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.lifecycle-view {
  height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .k-skeleton {
    width: auto;
  }
}

.vue-flow__node {
  border: $kui-border-width-10 solid black;
  border-radius: $kui-border-radius-30;
  box-shadow: 0 2px 4px #00000010;
  padding: 0;
  width: auto;
  word-wrap: break-word;
}
</style>
