import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CanvasNode, CanvasEdge, TerraformVariable, TerraformOutput } from '@/types'

interface CanvasState {
  // Nodes and edges
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  variables: TerraformVariable[]
  outputs: TerraformOutput[]

  // Selection
  selectedNodeId: string | null
  selectedNodeIds: string[]

  // UI state
  showPreview: boolean
  showSidebar: boolean
  showPropertyPanel: boolean

  // Undo/redo stacks
  undoStack: Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>
  redoStack: Array<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>

  // Actions
  addNode: (node: Omit<CanvasNode, 'id' | 'metadata'> & { id?: string }) => void
  updateNode: (id: string, updates: Partial<CanvasNode>) => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => void
  addEdge: (edge: Omit<CanvasEdge, 'id'>) => void
  deleteEdge: (id: string) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void

  // Selection
  setSelectedNode: (id: string | null) => void
  addSelectedNode: (id: string) => void
  removeSelectedNode: (id: string) => void
  clearSelection: () => void

  // Variables & outputs
  addVariable: (variable: TerraformVariable) => void
  updateVariable: (name: string, updates: Partial<TerraformVariable>) => void
  deleteVariable: (name: string) => void
  addOutput: (output: TerraformOutput) => void
  updateOutput: (name: string, updates: Partial<TerraformOutput>) => void
  deleteOutput: (name: string) => void

  // UI toggles
  togglePreview: () => void
  toggleSidebar: () => void
  togglePropertyPanel: () => void

  // Undo/redo
  undo: () => void
  redo: () => void

  // Bulk operations
  setNodes: (nodes: CanvasNode[]) => void
  setEdges: (edges: CanvasEdge[]) => void
  loadProject: (data: {
    nodes: CanvasNode[]
    edges: CanvasEdge[]
    variables: TerraformVariable[]
    outputs: TerraformOutput[]
  }) => void

  // Validation
  setValidationErrors: (nodeId: string, errors: Record<string, string>) => void
  clearValidationErrors: (nodeId: string) => void
}

function pushUndo(state: CanvasState): CanvasState {
  return {
    ...state,
    undoStack: [
      ...state.undoStack.slice(-49),
      { nodes: state.nodes, edges: state.edges },
    ],
    redoStack: [],
  }
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  variables: [],
  outputs: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  showPreview: true,
  showSidebar: true,
  showPropertyPanel: false,
  undoStack: [],
  redoStack: [],

  // Node operations
  addNode: (node) =>
    set((state) => {
      const id = (node as { id?: string }).id || `${node.type}_${uuidv4().slice(0, 8)}`
      const newNode: CanvasNode = {
        ...node,
        id,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      }
      return pushUndo({
        ...state,
        nodes: [...state.nodes, newNode],
      })
    }),

  updateNode: (id, updates) =>
    set((state) => {
      const next = state.nodes.map((n) =>
        n.id === id ? { ...n, ...updates, metadata: { createdAt: n.metadata?.createdAt ?? Date.now(), updatedAt: Date.now() } } : n,
      )
      return pushUndo({ ...state, nodes: next })
    }),

  deleteNode: (id) =>
    set((state) => {
      const next = state.nodes.filter((n) => n.id !== id)
      const edges = state.edges.filter((e) => e.source !== id && e.target !== id)
      return pushUndo({
        ...state,
        nodes: next,
        edges,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
      })
    }),

  duplicateNode: (id) =>
    set((state) => {
      const source = state.nodes.find((n) => n.id === id)
      if (!source) return state
      const newId = `${source.type}_${uuidv4().slice(0, 8)}`
      const dup: CanvasNode = {
        ...source,
        id: newId,
        label: `${source.label} (copy)`,
        position: { x: source.position.x + 40, y: source.position.y + 40 },
        metadata: { createdAt: Date.now(), updatedAt: Date.now() },
      }
      return pushUndo({ ...state, nodes: [...state.nodes, dup] })
    }),

  // Edge operations
  addEdge: (edge) =>
    set((state) => {
      const id = `${edge.source}->${edge.target}`
      if (state.edges.some((e) => e.id === id)) return state
      return pushUndo({
        ...state,
        edges: [...state.edges, { ...edge, id }],
      })
    }),

  deleteEdge: (id) =>
    set((state) => pushUndo({ ...state, edges: state.edges.filter((e) => e.id !== id) })),

  updateNodePosition: (id, position) =>
    set((state) => ({
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position, metadata: { createdAt: n.metadata?.createdAt ?? Date.now(), updatedAt: Date.now() } } : n,
      ),
    })),

  // Selection
  setSelectedNode: (id) =>
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
      showPropertyPanel: !!id,
    }),

  addSelectedNode: (id) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.includes(id)
        ? state.selectedNodeIds
        : [...state.selectedNodeIds, id],
    })),

  removeSelectedNode: (id) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
    })),

  clearSelection: () =>
    set({ selectedNodeId: null, selectedNodeIds: [], showPropertyPanel: false }),

  // Variables
  addVariable: (variable) =>
    set((state) => ({ variables: [...state.variables, variable] })),

  updateVariable: (name, updates) =>
    set((state) => ({
      variables: state.variables.map((v) => (v.name === name ? { ...v, ...updates } : v)),
    })),

  deleteVariable: (name) =>
    set((state) => ({ variables: state.variables.filter((v) => v.name !== name) })),

  // Outputs
  addOutput: (output) =>
    set((state) => ({ outputs: [...state.outputs, output] })),

  updateOutput: (name, updates) =>
    set((state) => ({
      outputs: state.outputs.map((o) => (o.name === name ? { ...o, ...updates } : o)),
    })),

  deleteOutput: (name) =>
    set((state) => ({ outputs: state.outputs.filter((o) => o.name !== name) })),

  // UI toggles
  togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  togglePropertyPanel: () => set((state) => ({ showPropertyPanel: !state.showPropertyPanel })),

  // Undo/redo
  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state
      const prev = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        nodes: prev.nodes,
        edges: prev.edges,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { nodes: state.nodes, edges: state.edges }],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        ...state,
        nodes: next.nodes,
        edges: next.edges,
        undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }],
        redoStack: state.redoStack.slice(0, -1),
      }
    }),

  // Bulk operations
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  loadProject: (data) =>
    set({
      nodes: data.nodes,
      edges: data.edges,
      variables: data.variables,
      outputs: data.outputs,
      undoStack: [],
      redoStack: [],
      selectedNodeId: null,
      selectedNodeIds: [],
    }),

  // Validation
  setValidationErrors: (nodeId, errors) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, validationErrors: errors } : n,
      ),
    })),

  clearValidationErrors: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, validationErrors: undefined } : n,
      ),
    })),
}))
