export type AttributeType =
  | 'string'
  | 'number'
  | 'bool'
  | 'list'
  | 'map'
  | 'object'
  | 'set'
  | 'any'

export interface ProviderAttribute {
  name: string
  type: AttributeType
  required: boolean
  description?: string
  defaultValue?: string | number | boolean
  allowedValues?: string[]
  sensitive?: boolean
  deprecated?: boolean
  category?: string
}

export interface ProviderResource {
  type: string
  name: string
  service: string
  provider: string
  icon?: string
  description?: string
  documentationUrl?: string
  attributes: ProviderAttribute[]
  examples?: Array<{ name: string; hcl: string }>
}

export interface ProviderModule {
  source: string
  name: string
  version: string
  description?: string
  inputs: ProviderAttribute[]
  outputs: Array<{ name: string; description?: string }>
  provider: string
}

export interface ProviderCatalog {
  provider: string
  name: string
  version: string
  services: Record<string, ProviderResource[]>
  modules?: ProviderModule[]
}
