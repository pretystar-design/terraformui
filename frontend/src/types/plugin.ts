export interface PluginAttributeSchema {
  type: string
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
}

export interface PluginResource {
  type: string
  icon?: string
  schema: {
    required?: string[]
    properties: Record<string, PluginAttributeSchema>
  }
}

export interface PluginManifest {
  name: string
  version: string
  description?: string
  author?: string
  provider: string
  resources: PluginResource[]
  components?: {
    propertyEditor?: string
    nodeRenderer?: string
  }
  minimumAppVersion?: string
}

export interface PluginRegistry {
  plugins: PluginManifest[]
  installed: string[]
}
