import { useCanvasStore } from '@/store/canvas-store'
import { PropertyPanel } from '@/components/property-panel'

export function PropertyPanelLayout() {
  const show = useCanvasStore((s) => s.showPropertyPanel)

  if (!show) return null

  return (
    <div className="w-[300px] shrink-0 border-l" style={{ borderLeft: '1px solid var(--border)' }}>
      <PropertyPanel />
    </div>
  )
}
