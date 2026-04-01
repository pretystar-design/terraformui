import type { CanvasNode, CanvasEdge } from '@/types'

interface TFStateResource {
  module?: string
  mode: 'managed' | 'data'
  type: string
  name: string
  provider: string
  instances: Array<{
    attributes: Record<string, unknown>
    dependencies?: string[]
  }>
}

interface TFStateV4 {
  version: number
  terraform_version: string
  serial: number
  lineage: string
  outputs: Record<string, { value: unknown; type: unknown }>
  resources: TFStateResource[]
}

export function parseTFState(raw: string): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const state: TFStateV4 = JSON.parse(raw)
  const nodes: CanvasNode[] = []
  const edges: CanvasEdge[] = []
  const idMap = new Map<string, string>()

  for (const resource of state.resources) {
    if (resource.mode !== 'managed') continue

    const resourceId = `${resource.type}.${resource.name}`
    const shortId = resourceId.replace(/\./g, '_')
    idMap.set(resourceId, shortId)

    const instance = resource.instances[0]
    const attributes = instance?.attributes ?? {}

    const providerName = resource.provider.split('.')[0] ?? 'aws'
    const position = { x: Math.random() * 600, y: Math.random() * 400 }

    const node: CanvasNode = {
      id: shortId,
      type: resource.type,
      label: resource.name,
      provider: providerName,
      position,
      attributes: flattenAttributes(attributes),
      imported: true,
      metadata: { createdAt: Date.now(), updatedAt: Date.now() },
    }
    nodes.push(node)

    for (const dep of instance?.dependencies ?? []) {
      const depShort = idMap.get(dep) ?? dep.replace(/\./g, '_')
      edges.push({
        id: `${depShort}->${shortId}`,
        source: depShort,
        target: shortId,
        type: 'dependency',
      })
    }
  }

  return { nodes, edges }
}

function flattenAttributes(attrs: Record<string, unknown>): Record<string, string | number | boolean | object> {
  const result: Record<string, string | number | boolean | object> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value
    } else if (Array.isArray(value)) {
      result[key] = value
    } else if (typeof value === 'object' && value !== null) {
      result[key] = JSON.stringify(value)
    }
  }
  return result
}
