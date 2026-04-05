import { useCanvasStore } from '@/store/canvas-store'
import { HCLPreview } from '@/components/preview/hcl-preview'

export function PreviewPanel() {
  const show = useCanvasStore((s) => s.showPreview)

  if (!show) return null

  return (
    <div className="h-[200px] shrink-0 border-t" style={{ borderTop: '1px solid var(--border)' }}>
      <HCLPreview />
    </div>
  )
}
