import type { CanvasNode, CanvasEdge, TerraformVariable, TerraformOutput } from './models'

export interface ProviderConfig {
  source: string
  version?: string
  region?: string
  alias?: string
  config: Record<string, string>
}

export interface Project {
  id: string
  name: string
  description?: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  variables: TerraformVariable[]
  outputs: TerraformOutput[]
  providers: Record<string, ProviderConfig>
  createdAt: number
  updatedAt: number
  lastSavedAt?: number
}

export interface ProjectSnapshot {
  id: string
  projectId: string
  timestamp: number
  message?: string
  state: {
    nodes: CanvasNode[]
    edges: CanvasEdge[]
    variables: TerraformVariable[]
    outputs: TerraformOutput[]
  }
}

export interface ProjectMetadata {
  id: string
  name: string
  lastModified: number
  nodeCount: number
  versionCount: number
}
