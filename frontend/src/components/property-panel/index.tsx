import { useMemo, useCallback } from 'react'
import { X, Copy, Trash2 } from 'lucide-react'
import { useCanvasStore } from '@/store/canvas-store'
import { providerCatalog } from '@/lib/provider-data'
import type { ProviderAttribute } from '@/types'

// Provider icon mapping
const providerIcons: Record<string, string> = {
  aws: '🟠',
  azure: '🔵',
  gcp: '🟢',
}

const providerIconClasses: Record<string, string> = {
  aws: 'resource-icon-aws',
  azure: 'resource-icon-azure',
  gcp: 'resource-icon-gcp',
}

function getResourceAttributes(type: string): ProviderAttribute[] {
  for (const catalog of providerCatalog) {
    for (const resources of Object.values(catalog.services)) {
      const found = resources.find((r) => r.type === type)
      if (found) return found.attributes
    }
  }
  return []
}

export function PropertyPanel() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const nodes = useCanvasStore((s) => s.nodes)
  const updateNode = useCanvasStore((s) => s.updateNode)
  const deleteNode = useCanvasStore((s) => s.deleteNode)
  const duplicateNode = useCanvasStore((s) => s.duplicateNode)
  const clearSelection = useCanvasStore((s) => s.clearSelection)

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  )

  const schemaAttrs = useMemo(
    () => (selectedNode ? getResourceAttributes(selectedNode.type) : []),
    [selectedNode],
  )

  const handleAttrChange = useCallback(
    (attrName: string, value: string) => {
      if (!selectedNode) return
      updateNode(selectedNode.id, {
        attributes: { ...selectedNode.attributes, [attrName]: value },
      })
    },
    [selectedNode, updateNode],
  )

  const handleLabelChange = useCallback(
    (value: string) => {
      if (!selectedNode) return
      updateNode(selectedNode.id, { label: value })
    },
    [selectedNode, updateNode],
  )

  const handleDuplicate = useCallback(() => {
    if (selectedNode) duplicateNode(selectedNode.id)
  }, [selectedNode, duplicateNode])

  const handleDelete = useCallback(() => {
    if (selectedNode) {
      deleteNode(selectedNode.id)
      clearSelection()
    }
  }, [selectedNode, deleteNode, clearSelection])

  const handleClose = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  if (!selectedNode) return null

  const icon = providerIcons[selectedNode.provider] || selectedNode.provider[0].toUpperCase()
  const iconClass = providerIconClasses[selectedNode.provider] || ''

  // Group attributes by category
  const groupedAttrs = useMemo(() => {
    const groups: Record<string, ProviderAttribute[]> = {}
    for (const attr of schemaAttrs) {
      const category = attr.category || 'basic'
      if (!groups[category]) groups[category] = []
      groups[category].push(attr)
    }
    return groups
  }, [schemaAttrs])

  const renderField = (attr: ProviderAttribute) => {
    const currentValue = selectedNode.attributes[attr.name]
    const valueStr = currentValue !== undefined ? String(currentValue) : ''

    if (attr.type === 'bool') {
      return (
        <div className="mb-3.5" key={attr.name}>
          <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-[var(--text-primary)]">
            {attr.name}
            {attr.required && <span className="text-[10px] text-[var(--red)]">*</span>}
          </label>
          {attr.description && (
            <p className="mb-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {attr.description}
            </p>
          )}
          <select
            className="w-full h-[34px] rounded border bg-[var(--bg-input)] px-2.5 text-[12px] outline-none cursor-pointer transition-colors focus:border-[var(--accent)]"
            style={{ borderColor: 'var(--border)', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', appearance: 'none' }}
            value={valueStr}
            onChange={(e) => handleAttrChange(attr.name, e.target.value === 'true' ? 'true' : 'false')}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
      )
    }

    return (
      <div className="mb-3.5" key={attr.name}>
        <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-[var(--text-primary)]">
          {attr.name}
          {attr.required && <span className="text-[10px] text-[var(--red)]">*</span>}
        </label>
        {attr.description && (
          <p className="mb-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {attr.description}
          </p>
        )}
        <input
          type="text"
          className="w-full h-[34px] rounded border bg-[var(--bg-input)] px-2.5 text-[12px] outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            borderColor: 'var(--border)',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-primary)',
          }}
          value={valueStr}
          onChange={(e) => handleAttrChange(attr.name, e.target.value)}
          placeholder={attr.defaultValue !== undefined ? String(attr.defaultValue) : ''}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded text-[14px] ${iconClass}`}
          >
            {icon}
          </div>
          <div>
            <input
              type="text"
              className="bg-transparent text-[13px] font-semibold text-[var(--text-primary)] outline-none w-full"
              value={selectedNode.label || selectedNode.id}
              onChange={(e) => handleLabelChange(e.target.value)}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <div className="text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
              {selectedNode.type}
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--text-primary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Resource label field */}
        <div className="mb-5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)', letterSpacing: '1px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
            Basic
          </div>

          {/* Non-schema attributes (user-added) */}
          {Object.entries(selectedNode.attributes)
            .filter(([key]) => !schemaAttrs.some((a) => a.name === key))
            .map(([key, value]) => (
              <div className="mb-3.5" key={key}>
                <label className="mb-1 block text-[12px] font-medium text-[var(--text-primary)]">
                  {key}
                </label>
                <input
                  type="text"
                  className="w-full h-[34px] rounded border bg-[var(--bg-input)] px-2.5 text-[12px] outline-none transition-colors focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}
                  value={String(value)}
                  onChange={(e) => handleAttrChange(key, e.target.value)}
                />
              </div>
            ))}

          {/* Schema-based fields grouped by category */}
          {Object.entries(groupedAttrs).map(([category, attrs]) => (
            <div key={category}>
              {category !== 'basic' && (
                <div className="mb-3 mt-4 text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)', letterSpacing: '1px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
                  {category}
                </div>
              )}
              {attrs.map(renderField)}
            </div>
          ))}
        </div>

        {/* Tags section */}
        <div className="mb-5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)', letterSpacing: '1px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
            Tags
          </div>
          <div className="mb-3.5">
            <label className="mb-1 block text-[12px] font-medium text-[var(--text-primary)]">Name</label>
            <input
              type="text"
              className="w-full h-[34px] rounded border bg-[var(--bg-input)] px-2.5 text-[12px] outline-none transition-colors focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}
              value={typeof selectedNode.attributes.tags === 'object' && selectedNode.attributes.tags !== null ? (selectedNode.attributes.tags as Record<string, unknown>).Name as string ?? '' : ''}
              onChange={(e) => handleAttrChange('tags_Name', e.target.value)}
            />
          </div>
          <div className="mb-3.5">
            <label className="mb-1 block text-[12px] font-medium text-[var(--text-primary)]">Environment</label>
            <select
              className="w-full h-[34px] rounded border bg-[var(--bg-input)] px-2.5 text-[12px] outline-none cursor-pointer transition-colors focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', appearance: 'none' }}
              value={typeof selectedNode.attributes.tags === 'object' && selectedNode.attributes.tags !== null ? (selectedNode.attributes.tags as Record<string, unknown>).Environment as string ?? 'staging' : 'staging'}
              onChange={(e) => handleAttrChange('tags_Environment', e.target.value)}
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleDuplicate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-[12px] text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]"
          style={{ fontFamily: "'DM Sans', sans-serif", height: '34px' }}
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </button>
        <button
          onClick={handleDelete}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border bg-transparent px-3 py-2 text-[12px] transition-all duration-150 hover:bg-[var(--red-dim)]"
          style={{ fontFamily: "'DM Sans', sans-serif", height: '34px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)' }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
