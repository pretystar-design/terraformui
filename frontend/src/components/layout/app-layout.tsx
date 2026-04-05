import { Canvas } from '@/components/canvas'
import { Sidebar } from '@/components/layout/sidebar'
import { PropertyPanelLayout } from '@/components/layout/property-panel-layout'
import { PreviewPanel } from '@/components/layout/preview-panel'
import { Toolbar } from '@/components/toolbar'

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
            <Canvas />
          </div>
          <PreviewPanel />
        </div>
        <PropertyPanelLayout />
      </div>
    </div>
  )
}
