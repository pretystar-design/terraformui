import type { CanvasNode, CanvasEdge } from '@/types'
import { providerCatalog } from '@/lib/provider-data'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  nodeId: string
  attribute: string
  message: string
}

interface ValidationWarning {
  nodeId: string
  attribute: string
  message: string
}

export function validateNodes(nodes: CanvasNode[], edges: CanvasEdge[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  for (const node of nodes) {
    const schema = findSchema(node.type, node.provider)
    if (!schema) {
      warnings.push({
        nodeId: node.id,
        attribute: '',
        message: `Unknown resource type: ${node.type}`,
      })
      continue
    }

    for (const attr of schema.attributes) {
      if (attr.required && (node.attributes[attr.name] === undefined || node.attributes[attr.name] === '')) {
        errors.push({
          nodeId: node.id,
          attribute: attr.name,
          message: `Required attribute '${attr.name}' is missing`,
        })
      }
    }

    for (const key of Object.keys(node.attributes)) {
      const schemaAttr = schema.attributes.find((a) => a.name === key)
      if (schemaAttr && schemaAttr.deprecated) {
        warnings.push({
          nodeId: node.id,
          attribute: key,
          message: `Attribute '${key}' is deprecated`,
        })
      }
    }
  }

  const edgeTargets = new Set(nodes.map((n) => n.id))
  for (const edge of edges) {
    if (!edgeTargets.has(edge.source)) {
      errors.push({
        nodeId: edge.target,
        attribute: '',
        message: `Edge references non-existent source: ${edge.source}`,
      })
    }
    if (!edgeTargets.has(edge.target)) {
      errors.push({
        nodeId: edge.source,
        attribute: '',
        message: `Edge references non-existent target: ${edge.target}`,
      })
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

function findSchema(type: string, provider: string) {
  const catalog = providerCatalog.find((c) => c.provider === provider)
  if (!catalog) return null
  for (const resources of Object.values(catalog.services)) {
    const found = resources.find((r) => r.type === type)
    if (found) return found
  }
  return null
}
