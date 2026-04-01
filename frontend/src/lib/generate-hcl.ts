import type { CanvasNode, CanvasEdge } from '@/types'

interface HCLGenerationOptions {
  includeComments?: boolean
  indentation?: string
}

/**
 * GenerateHCL converts a set of canvas nodes and edges into Terraform HCL.
 * TypeScript port of generator.go with edge/dependency support.
 */
export function generateHCL(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options?: HCLGenerationOptions,
): string {
  const indent = options?.indentation ?? '  '
  const lines: string[] = []

  // Build dependency map: target ID -> source IDs
  const depMap = new Map<string, string[]>()
  for (const edge of edges) {
    const deps = depMap.get(edge.target) ?? []
    deps.push(edge.source)
    depMap.set(edge.target, deps)
  }

  for (const node of nodes) {
    if (options?.includeComments) {
      lines.push(`# ${node.label || node.id} (${node.type})`)
    }

    lines.push(`resource "${node.type}" "${node.id}" {`)

    // Emit attributes in sorted order for deterministic output
    const keys = Object.keys(node.attributes).sort()
    for (const key of keys) {
      const value = node.attributes[key]
      lines.push(`${indent}${key} = ${formatValue(value)}`)
    }

    // Emit depends_on if edges target this node
    const deps = depMap.get(node.id)
    if (deps && deps.length > 0) {
      const depList = deps.map((d) => `"${d}"`).join(', ')
      lines.push(`${indent}depends_on = [${depList}]`)
    }

    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Format a value for HCL output.
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    // Check if it's a Terraform expression (contains ${} or references)
    if (value.includes('${') || /^\w+\.\w+\.\w+$/.test(value)) {
      return value
    }
    return `"${value}"`
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (Array.isArray(value)) {
    const items = value.map(formatValue).join(', ')
    return `[${items}]`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `    ${k} = ${formatValue(v)}`)
      .join('\n')
    return `{\n${entries}\n  }`
  }
  return '""'
}

/**
 * Generate provider blocks for the project.
 */
export function generateProviderBlocks(
  providers: Record<string, { source: string; version?: string; region?: string; alias?: string }>,
): string {
  const lines: string[] = []

  for (const [key, config] of Object.entries(providers)) {
    lines.push(`provider "${key}" {`)
    if (config.region) {
      lines.push(`  region = "${config.region}"`)
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate variables.tf content.
 */
export function generateVariablesTF(
  variables: Array<{
    name: string
    type: string
    description?: string
    default?: string | number | boolean
    required: boolean
  }>,
): string {
  const lines: string[] = []

  for (const v of variables) {
    lines.push(`variable "${v.name}" {`)
    lines.push(`  type        = ${v.type}`)
    if (v.description) {
      lines.push(`  description = "${v.description}"`)
    }
    if (v.default !== undefined) {
      lines.push(`  default     = ${formatValue(v.default)}`)
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate outputs.tf content.
 */
export function generateOutputsTF(
  outputs: Array<{ name: string; value: string; description?: string; sensitive?: boolean }>,
): string {
  const lines: string[] = []

  for (const o of outputs) {
    lines.push(`output "${o.name}" {`)
    lines.push(`  value = ${o.value}`)
    if (o.description) {
      lines.push(`  description = "${o.description}"`)
    }
    if (o.sensitive) {
      lines.push('  sensitive = true')
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}
