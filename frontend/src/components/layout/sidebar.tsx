import { useCanvasStore } from '@/store/canvas-store'
import { ResourcePalette } from '@/components/sidebar/resource-palette'

export function Sidebar() {
  const showSidebar = useCanvasStore((s) => s.showSidebar)

  if (!showSidebar) return null

  return (
    <div className="w-[260px] shrink-0 flex flex-col"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      <ResourcePalette />
    </div>
  )
}
