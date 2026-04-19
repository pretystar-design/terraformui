import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { CanvasNode, CanvasEdge, TerraformVariable, TerraformOutput } from '@/types'

export function exportAsTF(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  saveAs(blob, filename)
}

export async function exportAsZIP(
  files: Record<string, string>,
  projectName: string
) {
  const zip = new JSZip()
  const folder = zip.folder(projectName)!

  for (const [name, content] of Object.entries(files)) {
    if (content) folder.file(name, content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${projectName}.zip`)
}

export interface TerraformExportOptions {
  includeProviders?: boolean
  includeVariables?: boolean
  includeOutputs?: boolean
  includeReadme?: boolean
  projectName?: string
  author?: string
}

/**
 * Generate a complete Terraform project structure for export.
 */
export async function exportTerraformProject(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  variables: TerraformVariable[],
  outputs: TerraformOutput[],
  options: TerraformExportOptions = {}
): Promise<{ files: Record<string, string>; projectName: string }> {
  const {
    includeProviders = true,
    includeVariables = true,
    includeOutputs = true,
    includeReadme = true,
    projectName = 'terraform-project',
    author = 'TerraformUI',
  } = options

  const files: Record<string, string> = {}

  // Generate providers.tf
  if (includeProviders) {
    files['providers.tf'] = generateProvidersBlock(nodes)
  }

  // Generate main.tf
  files['main.tf'] = generateMainTF(nodes, edges)

  // Generate variables.tf
  if (includeVariables && variables.length > 0) {
    files['variables.tf'] = generateVariablesTF(variables)
  }

  // Generate outputs.tf
  if (includeOutputs && outputs.length > 0) {
    files['outputs.tf'] = generateOutputsTF(outputs)
  }

  // Generate README.md
  if (includeReadme) {
    files['README.md'] = generateReadme(projectName, nodes, variables, outputs, author)
  }

  return { files, projectName }
}

function generateProvidersBlock(nodes: CanvasNode[]): string {
  const providers = new Set(nodes.map(n => n.provider))
  const lines: string[] = []

  lines.push('terraform {')
  lines.push('  required_version = ">= 1.0"')
  lines.push('  required_providers {')

  for (const provider of providers) {
    let source = 'hashicorp/unknown'
    switch (provider) {
      case 'aws':
        source = 'hashicorp/aws'
        break
      case 'azure':
        source = 'hashicorp/azurerm'
        break
      case 'gcp':
        source = 'hashicorp/google'
        break
    }
    lines.push(`    ${provider} = {`)
    lines.push(`      source = "${source}"`)
    lines.push('    }')
  }

  lines.push('  }')
  lines.push('}')
  lines.push('')

  // Add provider configurations
  for (const provider of providers) {
    lines.push(`provider "${provider}" {`)
    switch (provider) {
      case 'aws':
        lines.push('  region = var.aws_region')
        break
      case 'azure':
        lines.push('  features {}')
        break
      case 'gcp':
        lines.push('  project = var.gcp_project')
        lines.push('  region  = var.gcp_region')
        break
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

function generateMainTF(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  // Build dependency map
  const depMap = new Map<string, string[]>()
  for (const edge of edges) {
    const deps = depMap.get(edge.target) ?? []
    deps.push(edge.source)
    depMap.set(edge.target, deps)
  }

  const lines: string[] = []

  for (const node of nodes) {
    lines.push(`# ${node.label || node.id} (${node.type})`)
    lines.push(`resource "${node.type}" "${node.id}" {`)

    // Emit attributes
    const keys = Object.keys(node.attributes).sort()
    for (const key of keys) {
      const value = node.attributes[key]
      lines.push(`  ${key} = ${formatHCLValue(value)}`)
    }

    // Emit depends_on
    const deps = depMap.get(node.id)
    if (deps && deps.length > 0) {
      const depRefs = deps.map(d => {
        const srcNode = nodes.find(n => n.id === d)
        return srcNode ? `${srcNode.type}.${d}` : d
      }).join(', ')
      lines.push(`  depends_on = [${depRefs}]`)
    }

    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

function formatHCLValue(value: unknown): string {
  if (typeof value === 'string') {
    // Check for Terraform expressions
    if (
      value.startsWith('${') ||
      value.startsWith('aws_') ||
      value.startsWith('azurerm_') ||
      value.startsWith('google_') ||
      value.includes('.id') ||
      value.includes('.arn') ||
      value.includes('.name')
    ) {
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
    const items = value.map(formatHCLValue).join(', ')
    return `[${items}]`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `    ${k} = ${formatHCLValue(v)}`)
      .join('\n')
    return `{\n${entries}\n  }`
  }
  return '""'
}

function generateVariablesTF(variables: TerraformVariable[]): string {
  const lines: string[] = []

  lines.push('# Variables')
  lines.push('')

  // Add default variables for cloud providers
  lines.push('variable "aws_region" {')
  lines.push('  type        = string')
  lines.push('  description = "AWS region"')
  lines.push('  default     = "us-east-1"')
  lines.push('}')
  lines.push('')

  lines.push('variable "gcp_project" {')
  lines.push('  type        = string')
  lines.push('  description = "GCP project ID"')
  lines.push('  default     = "my-project"')
  lines.push('}')
  lines.push('')

  lines.push('variable "gcp_region" {')
  lines.push('  type        = string')
  lines.push('  description = "GCP region"')
  lines.push('  default     = "us-central1"')
  lines.push('}')
  lines.push('')

  lines.push('variable "azure_location" {')
  lines.push('  type        = string')
  lines.push('  description = "Azure region"')
  lines.push('  default     = "eastus"')
  lines.push('}')
  lines.push('')

  // Add user-defined variables
  for (const v of variables) {
    lines.push(`variable "${v.name}" {`)
    lines.push(`  type        = ${v.type}`)
    if (v.description) {
      lines.push(`  description = "${v.description}"`)
    }
    if (v.default !== undefined) {
      lines.push(`  default     = ${formatHCLValue(v.default)}`)
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

function generateOutputsTF(outputs: TerraformOutput[]): string {
  const lines: string[] = []

  lines.push('# Outputs')
  lines.push('')

  // Add summary outputs
  lines.push('output "resource_count" {')
  lines.push('  description = "Total number of resources"')
  lines.push('  value       = length(local.resources)')
  lines.push('}')
  lines.push('')

  for (const o of outputs) {
    lines.push(`output "${o.name}" {`)
    lines.push(`  value = ${o.value}`)
    if (o.description) {
      lines.push(`  description = "${o.description}"`)
    }
    if (o.sensitive) {
      lines.push('  sensitive   = true')
    }
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

function generateReadme(
  projectName: string,
  nodes: CanvasNode[],
  variables: TerraformVariable[],
  outputs: TerraformOutput[],
  author: string
): string {
  const lines: string[] = []

  lines.push(`# ${projectName}`)
  lines.push('')
  lines.push('Generated by TerraformUI')
  lines.push('')
  lines.push(`**Created:** ${new Date().toLocaleDateString()}`)
  lines.push('')
  lines.push('## Resources')
  lines.push('')

  // Group by type
  const typeCount: Record<string, number> = {}
  for (const node of nodes) {
    typeCount[node.type] = (typeCount[node.type] || 0) + 1
  }

  for (const [type_, count] of Object.entries(typeCount)) {
    lines.push(`- ${type_} (${count})`)
  }

  lines.push('')
  lines.push('## Usage')
  lines.push('')
  lines.push('```bash')
  lines.push('# Initialize')
  lines.push('terraform init')
  lines.push('')
  lines.push('# Validate')
  lines.push('terraform validate')
  lines.push('')
  lines.push('# Plan')
  lines.push('terraform plan -out=tfplan')
  lines.push('')
  lines.push('# Apply')
  lines.push('terraform apply tfplan')
  lines.push('```')
  lines.push('')

  // Variables table
  if (variables.length > 0) {
    lines.push('## Variables')
    lines.push('')
    lines.push('| Name | Type | Default | Description |')
    lines.push('|------|------|---------|-------------|')
    for (const v of variables) {
      const defaultVal = v.default !== undefined ? String(v.default) : '-'
      const desc = v.description || '-'
      lines.push(`| ${v.name} | ${v.type} | ${defaultVal} | ${desc} |`)
    }
    lines.push('')
  }

  // Outputs
  if (outputs.length > 0) {
    lines.push('## Outputs')
    lines.push('')
    for (const o of outputs) {
      if (o.description) {
        lines.push(`- **${o.name}**: ${o.description}`)
      } else {
        lines.push(`- **${o.name}**`)
      }
    }
    lines.push('')
  }

  lines.push('## License')
  lines.push('')
  lines.push(`Generated by ${author} using TerraformUI`)

  return lines.join('\n')
}

/**
 * Export project as a single .tf file.
 */
export function exportAsSingleTF(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  variables: TerraformVariable[],
  outputs: TerraformOutput[]
): string {
  const parts: string[] = []

  parts.push(generateProvidersBlock(nodes))
  parts.push(generateMainTF(nodes, edges))

  if (variables.length > 0) {
    parts.push(generateVariablesTF(variables))
  }

  if (outputs.length > 0) {
    parts.push(generateOutputsTF(outputs))
  }

  return parts.filter(Boolean).join('\n')
}
