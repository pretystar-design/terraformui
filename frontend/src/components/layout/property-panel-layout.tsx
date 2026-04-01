import { useCanvasStore } from '@/store/canvas-store'
import { PropertyPanel } from '@/components/property-panel'

export function PropertyPanelLayout() {
  const show = useCanvasStore((s) => s.showPropertyPanel)

  if (!show) return null

  return (
    <div className="w-80 shrink-0 border-l bg-background">
      <PropertyPanel />
    </div>
  )
}
