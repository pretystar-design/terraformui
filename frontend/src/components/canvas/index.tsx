import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useCanvasStore } from '@/store/canvas-store'
import { useKeyboardShortcuts } from '@/hooks'
import { providerCatalog } from '@/lib/provider-data'

const nodeTypeLabels: Record<string, string> = {}
for (const catalog of providerCatalog) {
  for (const resources of Object.values(catalog.services)) {
    for (const resource of resources) {
      nodeTypeLabels[resource.type] = resource.name
    }
  }
}

export function Canvas() {
  const storeNodes = useCanvasStore((s) => s.nodes)
  const storeEdges = useCanvasStore((s) => s.edges)
  const addNode = useCanvasStore((s) => s.addNode)
  const addEdgeFn = useCanvasStore((s) => s.addEdge)
  const updateNodePosition = useCanvasStore((s) => s.updateNodePosition)
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode)
  const clearSelection = useCanvasStore((s) => s.clearSelection)

  useKeyboardShortcuts()

  const nodes: Node[] = useMemo(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: 'default',
        position: n.position,
        data: {
          label: n.label || n.id,
          type: n.type,
          provider: n.provider,
          hasErrors: !!n.validationErrors && Object.keys(n.validationErrors).length > 0,
        },
        className:
          n.validationErrors && Object.keys(n.validationErrors).length > 0
            ? 'node-error'
            : '',
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
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode],
  )

  const onPaneClick = useCallback(() => {
    clearSelection()
  }, [clearSelection])

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
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={(_: React.MouseEvent, node) => {
          updateNodePosition(node.id, node.position)
        }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
