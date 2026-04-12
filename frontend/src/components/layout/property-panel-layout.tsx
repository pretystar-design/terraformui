import { useCanvasStore } from '@/store/canvas-store'
import { PropertyPanel } from '@/components/property-panel'

export function PropertyPanelLayout() {
  const show = useCanvasStore((s) => s.showPropertyPanel)

  if (!show) return null

  return (
    <div className="h-full w-[300px] shrink-0 border-l overflow-hidden" style={{ borderLeft: '1px solid var(--border)' }}>
      <PropertyPanel />
    </div>
  )
}
