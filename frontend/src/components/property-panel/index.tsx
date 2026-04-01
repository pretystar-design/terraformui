import { useTranslation } from 'react-i18next'
import { X, Copy, Trash2 } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas-store'
import { providerCatalog } from '@/lib/provider-data'

export function PropertyPanel() {
  const { t } = useTranslation()
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const nodes = useCanvasStore((s) => s.nodes)
  const updateNode = useCanvasStore((s) => s.updateNode)
  const deleteNode = useCanvasStore((s) => s.deleteNode)
  const duplicateNode = useCanvasStore((s) => s.duplicateNode)
  const clearSelection = useCanvasStore((s) => s.clearSelection)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        {t('property.no-selection')}
      </div>
    )
  }

  const schema = findSchema(node.type, node.provider)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">{node.label}</h3>
          <p className="text-xs text-muted-foreground">{node.type}</p>
        </div>
        <button onClick={clearSelection} className="rounded p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {(schema?.attributes ?? []).map((attr) => (
          <div key={attr.name} className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              {attr.name}
              {attr.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {attr.description && (
              <p className="mb-1 text-xs text-muted-foreground">{attr.description}</p>
            )}
            <input
              type={attr.type === 'number' ? 'number' : attr.type === 'bool' ? 'text' : 'text'}
              value={String(node.attributes[attr.name] ?? attr.defaultValue ?? '')}
              onChange={(e) => {
                const val = attr.type === 'number' ? Number(e.target.value) : e.target.value
                updateNode(node.id, { attributes: { ...node.attributes, [attr.name]: val } })
              }}
              className={`w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                node.validationErrors?.[attr.name] ? 'border-red-500' : ''
              }`}
            />
            {node.validationErrors?.[attr.name] && (
              <p className="mt-1 text-xs text-red-500">{node.validationErrors[attr.name]}</p>
            )}
            {attr.allowedValues && (
              <select
                value={String(node.attributes[attr.name] ?? '')}
                onChange={(e) =>
                  updateNode(node.id, { attributes: { ...node.attributes, [attr.name]: e.target.value } })
                }
                className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                <option value="">Select...</option>
                {attr.allowedValues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {(!schema || schema.attributes.length === 0) && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Attributes (raw)</label>
            <textarea
              value={JSON.stringify(node.attributes, null, 2)}
              onChange={(e) => {
                try {
                  updateNode(node.id, { attributes: JSON.parse(e.target.value) })
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={8}
              className="w-full rounded-md border bg-background px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t p-3">
        <button
          onClick={() => duplicateNode(node.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <Copy className="h-4 w-4" />
          {t('property.duplicate')}
        </button>
        <button
          onClick={() => {
            deleteNode(node.id)
            clearSelection()
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          {t('property.delete')}
        </button>
      </div>
    </div>
  )
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
