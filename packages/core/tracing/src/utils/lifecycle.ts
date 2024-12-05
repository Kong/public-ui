import { MarkerType, type Edge } from '@vue-flow/core'
import { KONG_PHASES, LifecycleNodeType, SPAN_ATTRIBUTE_KEYS, SPAN_NAMES } from '../constants'
import type { LifecycleGraph, LifecycleNodeData, SpanNode } from '../types'
import { getPhaseAndPlugin, unwrapAnyValue } from './spans'
import { getDurationFormatter } from './time'

const SPAN_NAME_KONG_UPSTREAM_PREFIX = 'kong.upstream.'

export const getNodeType = (spanName: string): LifecycleNodeType => {
  if (spanName.startsWith(SPAN_NAME_KONG_UPSTREAM_PREFIX)) {
    return LifecycleNodeType.UPSTREAM
  }
  return LifecycleNodeType.REQUEST
}

const buildPluginNodeData = (node: SpanNode): LifecycleNodeData | undefined => {
  // Try to parse the phase and plugin name from the span name
  const pluginSpan = getPhaseAndPlugin(node.span.name)
  if (!pluginSpan || pluginSpan.suffix) {
    // 1. `undefined` indicates that the span is not a plugin span; we should skip it
    // 2. Only process the root span of the plugin phase
    return undefined
  }

  let nodeType = LifecycleNodeType.REQUEST // We will update this later
  switch (pluginSpan.phase) {
    case KONG_PHASES.CERTIFICATE:
    case KONG_PHASES.REWRITE:
    case KONG_PHASES.ACCESS:
      nodeType = LifecycleNodeType.REQUEST
      break
    case KONG_PHASES.RESPONSE:
    case KONG_PHASES.HEADER_FILTER:
    case KONG_PHASES.BODY_FILTER:
      nodeType = LifecycleNodeType.RESPONSE
      break
    default:
      // Indicates that the phase is not recognized; we should skip it
      return undefined
  }

  let durationNano = node.durationNano ?? 0

  const calculateDuration = (node: SpanNode) => {
    if (node.span.name === SPAN_NAMES.READ_BODY) {
      durationNano -= node.durationNano ?? 0
      return
    }
    node.children.forEach(calculateDuration)
  }

  calculateDuration(node)

  return {
    label: `${pluginSpan.plugin} (${pluginSpan.phase})`,
    type: nodeType,
    durationNano,
    spans: [node],
  }
}

export const buildLifecycleGraph = (root: SpanNode): LifecycleGraph => {
  const fmt = getDurationFormatter()
  const ingressSpans: SpanNode[] = []
  const egressSpans: SpanNode[] = []
  const requestNodesData: LifecycleNodeData[] = []
  const responseNodesData: LifecycleNodeData[] = []
  const upstreamSpans: SpanNode[] = []

  const traverse = (node: SpanNode) => {
    if (node.span.name === SPAN_NAMES.CLIENT_HEADERS || node.span.name === SPAN_NAMES.READ_BODY) {
      if (node.span.parentSpanId === root.span.spanId) {
        ingressSpans.push(node)
      }
    } else if (node.span.name === SPAN_NAMES.FLUSH_TO_DOWNSTREAM) {
      if (node.span.parentSpanId === root.span.spanId) {
        egressSpans.push(node)
      }
    } else if (node.span.name.startsWith(SPAN_NAME_KONG_UPSTREAM_PREFIX)) {
      upstreamSpans.push(node)
    } else {
      const pluginNodeData = buildPluginNodeData(node)
      if (pluginNodeData) {
        switch (pluginNodeData.type) {
          case LifecycleNodeType.REQUEST:
            requestNodesData.push(pluginNodeData)
            break
          case LifecycleNodeType.RESPONSE:
            responseNodesData.push(pluginNodeData)
            break
          default:
            throw new Error('unreachable')
        }
        return
      }
      node.children.forEach(traverse)
    }
  }

  root.children.forEach(traverse)

  const graph: LifecycleGraph = {
    nodes: [],
    edges: [],
  }

  const totalLatencyMsAttr = root.span.attributes?.find((attr) => attr.key === SPAN_ATTRIBUTE_KEYS.KONG_LATENCY_TOTAL)
  const totalLatencyMs = totalLatencyMsAttr && unwrapAnyValue<number>(totalLatencyMsAttr.value) || 0

  graph.nodes.push({
    id: 'client',
    position: { x: 0, y: 0 },
    data: {
      label: 'Client',
      type: LifecycleNodeType.CLIENT,
      durationNano: totalLatencyMs * 1e6,
    },
  })

  requestNodesData.forEach((nodeData, i) => {
    graph.nodes.push({
      id: `request#${i}`,
      position: { x: 0, y: 0 },
      data: nodeData,
    })
  })

  graph.nodes.push({
    id: 'upstream',
    position: { x: 0, y: 0 },
    data: {
      label: 'Upstream',
      type: LifecycleNodeType.UPSTREAM,
      durationNano: upstreamSpans.reduce((duration, span) => duration + (span.durationNano ?? 0), 0),
    },
  })

  responseNodesData.forEach((nodeData, i) => {
    graph.nodes.push({
      id: `response#${i}`,
      position: { x: 0, y: 0 },
      data: nodeData,
    })
  })

  for (let i = 0; i < graph.nodes.length; i++) {
    const j = i < graph.nodes.length - 1 ? i + 1 : 0
    const edge: Edge = {
      id: `${graph.nodes[i].id}->${graph.nodes[j].id}`,
      source: graph.nodes[i].id,
      target: graph.nodes[j].id,
      type: 'smoothstep',
      // animated: true,
      markerEnd: MarkerType.ArrowClosed,
    }
    if (i === 0) {
      edge.label = fmt(ingressSpans.reduce((duration, span) => duration + (span.durationNano ?? 0), 0))
    } else if (i === graph.nodes.length - 1) {
      edge.label = fmt(egressSpans.reduce((duration, span) => duration + (span.durationNano ?? 0), 0))
    }
    graph.edges.push(edge)
  }

  return graph
}
