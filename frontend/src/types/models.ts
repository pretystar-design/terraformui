export interface CanvasNode {
  id: string
  type: string
  label: string
  provider: string
  position: { x: number; y: number }
  attributes: Record<string, string | number | boolean | object>
  validationErrors?: Record<string, string>
  imported?: boolean
  metadata?: {
    createdAt: number
    updatedAt: number
    createdBy?: string
  }
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: 'dependency' | 'reference'
  label?: string
}

export interface TerraformVariable {
  name: string
  type: string
  description?: string
  default?: string | number | boolean
  required: boolean
}

export interface TerraformOutput {
  name: string
  value: string
  description?: string
  sensitive?: boolean
}
