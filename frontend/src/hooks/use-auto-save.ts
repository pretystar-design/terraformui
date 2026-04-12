import { useEffect, useRef } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { useProjectStore } from '@/store/project-store'

const AUTO_SAVE_INTERVAL_MS = 30_000

/**
 * Auto-saves the current project every 30 seconds when there is a current project
 * and canvas nodes exist. Syncs canvas state into the project store before saving.
 */
export function useAutoSave() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const variables = useCanvasStore((s) => s.variables)
  const outputs = useCanvasStore((s) => s.outputs)
  const currentProject = useProjectStore((s) => s.currentProject)
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject)

  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    if (!currentProject) return

    const snapshot = JSON.stringify({ nodes, edges, variables, outputs })
    if (snapshot === lastSavedRef.current) return

    const timer = setInterval(() => {
      const current = JSON.stringify({ nodes, edges, variables, outputs })
      if (current !== lastSavedRef.current && currentProject) {
        // Sync canvas state into project before saving
        currentProject.nodes = nodes
        currentProject.edges = edges
        currentProject.variables = variables
        currentProject.outputs = outputs
        lastSavedRef.current = current
        saveCurrentProject()
      }
    }, AUTO_SAVE_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [nodes, edges, variables, outputs, currentProject, saveCurrentProject])
}