import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { providerCatalog } from '@/lib/provider-data'

// Build lookup maps from provider catalog
const nodeTypeLabels: Record<string, string> = {}
const nodeTypeIcons: Record<string, string> = {}
const nodeTypeProvider: Record<string, string> = {}

for (const catalog of providerCatalog) {
  for (const resources of Object.values(catalog.services)) {
    for (const resource of resources) {
      nodeTypeLabels[resource.type] = resource.name
      nodeTypeIcons[resource.type] = resource.icon || (catalog.provider === 'aws' ? '🟠' : catalog.provider === 'azure' ? '🔵' : '🟢')
      nodeTypeProvider[resource.type] = catalog.provider
    }
  }
}

interface TFNodeData {
  label: string
  type: string
  provider: string
  hasErrors?: boolean
  attributes?: Record<string, unknown>
}

function TFNodeComponent({ data, selected }: NodeProps<TFNodeData>) {
  const label = data.label || data.type
  const icon = nodeTypeIcons[data.type] || '📦'
  const hasErrors = data.hasErrors
  const attributes = data.attributes || {}

  // Get the icon background color based on provider
  const getIconBg = () => {
    if (data.provider === 'aws') return 'var(--orange-dim)'
    if (data.provider === 'azure') return 'var(--cyan-dim)'
    if (data.provider === 'gcp') return 'var(--green-dim)'
    return 'var(--accent-dim)'
  }

  const getIconColor = () => {
    if (data.provider === 'aws') return 'var(--orange)'
    if (data.provider === 'azure') return 'var(--cyan)'
    if (data.provider === 'gcp') return 'var(--green)'
    return 'var(--accent-light)'
  }

  return (
    <div
      className="tf-node"
      style={{
        background: 'var(--bg-card)',
        border: selected ? '2px solid var(--accent)' : hasErrors ? '2px solid var(--red)' : '1px solid var(--border)',
        borderRadius: '12px',
        padding: '14px 16px',
        minWidth: '180px',
        boxShadow: selected
          ? '0 0 0 2px var(--accent-dim), 0 4px 24px rgba(99, 102, 241, 0.15)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease',
        cursor: 'move',
      }}
    >
      {/* Input handle - for dependencies coming INTO this node */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-left"
        style={{
          width: '10px',
          height: '10px',
          background: 'var(--accent)',
          border: '2px solid var(--bg-card)',
          left: '-5px',
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="input-top"
        style={{
          width: '10px',
          height: '10px',
          background: 'var(--accent)',
          border: '2px solid var(--bg-card)',
          top: '-5px',
        }}
      />

      {/* Node header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: getIconBg(),
            color: getIconColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {data.type}
          </div>
        </div>
      </div>

      {/* Node attributes */}
      {Object.keys(attributes).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {Object.entries(attributes).slice(0, 3).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                }}
              >
                {key}
              </span>
              <span
                style={{
                  color: 'var(--green)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {typeof value === 'string' && value.startsWith('aws_') ? value : `"${value}"`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Output handle - for dependencies going OUT of this node */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-right"
        style={{
          width: '10px',
          height: '10px',
          background: 'var(--accent)',
          border: '2px solid var(--bg-card)',
          right: '-5px',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="output-bottom"
        style={{
          width: '10px',
          height: '10px',
          background: 'var(--accent)',
          border: '2px solid var(--bg-card)',
          bottom: '-5px',
        }}
      />
    </div>
  )
}

export const TFNode = memo(TFNodeComponent)