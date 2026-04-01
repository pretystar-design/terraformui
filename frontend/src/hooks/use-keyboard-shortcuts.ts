import { useEffect } from 'react'
import { useCanvasStore } from '@/store/canvas-store'

export function useKeyboardShortcuts() {
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const deleteNode = useCanvasStore((s) => s.deleteNode)
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const clearSelection = useCanvasStore((s) => s.clearSelection)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault()
        deleteNode(selectedNodeId)
      }
      if (e.key === 'Escape') {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, deleteNode, selectedNodeId, clearSelection])
}
