import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  type OnConnect,
  type Node,
  type Edge,
  MarkerType,
  SelectionMode,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useCanvasStore } from '@/store/canvas-store'
import { useKeyboardShortcuts } from '@/hooks'
import { providerCatalog } from '@/lib/provider-data'
import { TFNode } from './tf-node'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const nodeTypes = { tfNode: TFNode }

const nodeTypeLabels: Record<string, string> = {}
const nodeTypeIcons: Record<string, string> = {}
for (const catalog of providerCatalog) {
  for (const resources of Object.values(catalog.services)) {
    for (const resource of resources) {
      nodeTypeLabels[resource.type] = resource.name
      nodeTypeIcons[resource.type] = resource.provider === 'aws' ? '🟠' : resource.provider === 'azure' ? '🔵' : '🟢'
    }
  }
}

function CanvasControls({ zoom }: { zoom: number }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <>
      <div className="absolute bottom-4 right-4 z-5 flex flex-col gap-1">
        <button
          onClick={() => zoomIn()}
          className="flex h-8 w-8 items-center justify-center rounded border text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="flex h-8 w-8 items-center justify-center rounded border text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded border text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div
        className="absolute bottom-4 left-4 z-5 rounded border px-2.5 py-1 text-[11px]"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </>
  )
}

export function Canvas() {
  const storeNodes = useCanvasStore((s) => s.nodes)
  const storeEdges = useCanvasStore((s) => s.edges)
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)
  const addNode = useCanvasStore((s) => s.addNode)
  const addEdgeFn = useCanvasStore((s) => s.addEdge)
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition)
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode)
  const addSelectedNode = useCanvasStore((s) => s.addSelectedNode)
  const clearSelection = useCanvasStore((s) => s.clearSelection)
  const [zoomLevel, setZoomLevel] = useState(1)

  useKeyboardShortcuts()

  const nodes: Node[] = useMemo(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: 'tfNode',
        position: n.position,
        data: {
          label: n.label || n.id,
          type: n.type,
          provider: n.provider,
          hasErrors: !!n.validationErrors && Object.keys(n.validationErrors).length > 0,
          attributes: n.attributes || {},
        },
      })),
    [storeNodes],
  )

  const edges: Edge[] = useMemo(
    () =>
      storeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.type === 'dependency',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
        },
      })),
    [storeEdges],
  )

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) return
      addEdgeFn({ source: params.source, target: params.target, type: 'dependency' })
    },
    [addEdgeFn],
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.shiftKey) {
        // Shift+click: toggle selection (multi-select)
        if (selectedNodeIds.includes(node.id)) {
          // Already selected - this will be handled by removeSelectedNode
          setSelectedNode(node.id)
        } else {
          addSelectedNode(node.id)
        }
      } else {
        // Normal click: single selection
        setSelectedNode(node.id)
      }
    },
    [setSelectedNode, addSelectedNode, selectedNodeIds],
  )

  const onPaneClick = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  const onMove = useCallback((_: unknown, { zoom }: { zoom: number }) => {
    setZoomLevel(zoom)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow')
      const provider = e.dataTransfer.getData('application/provider') || 'aws'
      if (!type) return

      const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const position = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      }

      addNode({
        type,
        label: nodeTypeLabels[type] || type,
        provider: provider || 'aws',
        position,
        attributes: {},
      })
    },
    [addNode],
  )

  return (
    <div className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={(_: React.MouseEvent, node) => {
          updateNodePosition(node.id, node.position)
        }}
        onMove={onMove}
        fitView
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--border)"
          style={{ opacity: 0.3 }}
        />
        <CanvasControls zoom={zoomLevel} />
      </ReactFlow>
    </div>
  )
}
