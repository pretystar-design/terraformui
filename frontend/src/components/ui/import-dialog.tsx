import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X } from 'lucide-react'
import { parseTFState } from '@/lib/tfstate-parser'
import { useCanvasStore } from '@/store/canvas-store'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadProject = useCanvasStore((s) => s.loadProject)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const { nodes, edges } = parseTFState(content)
          loadProject({ nodes, edges, variables: [], outputs: [] })
          onClose()
        } catch {
          setError('Failed to parse tfstate file')
        }
      }
      reader.readAsText(file)
    },
    [loadProject, onClose],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-lg p-6 shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('import.title')}</h2>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-[var(--accent-dim)] hover:text-[var(--text-primary)]" style={{ color: 'var(--text-muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
            dragging ? 'border-[var(--accent)]' : 'border-[var(--border)]'
          }`}
          style={{ background: dragging ? 'var(--accent-dim)' : 'var(--bg-input)' }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
          <p className="mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>{t('import.drop')}</p>
          <label className="cursor-pointer text-sm underline" style={{ color: 'var(--accent-light)' }}>
            {t('import.browse')}
            <input type="file" accept=".json,.tfstate" className="hidden" onChange={handleChange} />
          </label>
        </div>

        {error && <p className="mt-3 text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>
    </div>
  )
}
