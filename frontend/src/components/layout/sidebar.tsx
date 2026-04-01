import { useCanvasStore } from '@/store/canvas-store'
import { ResourcePalette } from '@/components/sidebar/resource-palette'

export function Sidebar() {
  const showSidebar = useCanvasStore((s) => s.showSidebar)

  if (!showSidebar) return null

  return (
    <div className="w-64 shrink-0 border-r bg-background">
      <ResourcePalette />
    </div>
  )
}
