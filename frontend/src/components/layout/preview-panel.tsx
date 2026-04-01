import { useCanvasStore } from '@/store/canvas-store'
import { HCLPreview } from '@/components/preview/hcl-preview'

export function PreviewPanel() {
  const show = useCanvasStore((s) => s.showPreview)

  if (!show) return null

  return (
    <div className="h-64 shrink-0 border-t bg-background">
      <HCLPreview />
    </div>
  )
}
