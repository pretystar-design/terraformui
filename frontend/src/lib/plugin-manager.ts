import type { PluginManifest, PluginRegistry } from '@/types'

const PLUGINS_STORAGE_KEY = 'tvg-plugins'

export function loadPlugins(): PluginRegistry {
  try {
    const raw = localStorage.getItem(PLUGINS_STORAGE_KEY)
    if (!raw) return { plugins: [], installed: [] }
    const data = JSON.parse(raw)
    return {
      plugins: data.plugins ?? [],
      installed: data.installed ?? [],
    }
  } catch {
    return { plugins: [], installed: [] }
  }
}

export function savePlugins(registry: PluginRegistry) {
  localStorage.setItem(PLUGINS_STORAGE_KEY, JSON.stringify(registry))
}

export function installPlugin(manifest: PluginManifest, registry: PluginRegistry): PluginRegistry {
  const existing = registry.plugins.findIndex((p) => p.name === manifest.name)
  const plugins = [...registry.plugins]
  const installed = [...registry.installed]

  if (existing >= 0) {
    plugins[existing] = manifest
  } else {
    plugins.push(manifest)
  }

  if (!installed.includes(manifest.name)) {
    installed.push(manifest.name)
  }

  const next = { plugins, installed }
  savePlugins(next)
  return next
}

export function uninstallPlugin(name: string, registry: PluginRegistry): PluginRegistry {
  const next = {
    plugins: registry.plugins.filter((p) => p.name !== name),
    installed: registry.installed.filter((n) => n !== name),
  }
  savePlugins(next)
  return next
}

export function getPluginResources(registry: PluginRegistry) {
  const resources: Array<{ type: string; provider: string; icon?: string; schema: PluginManifest['resources'][number]['schema'] }> = []
  for (const plugin of registry.plugins) {
    if (!registry.installed.includes(plugin.name)) continue
    for (const resource of plugin.resources) {
      resources.push({
        type: resource.type,
        provider: plugin.provider,
        icon: resource.icon,
        schema: resource.schema,
      })
    }
  }
  return resources
}
