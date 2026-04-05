import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Undo2,
  Redo2,
  Download,
  ShieldCheck,
  FileUp,
  Save,
  Eye,
  PanelLeft,
  PanelRight,
  Globe,
  FileJson,
  CheckCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react'
import { useCanvasStore } from '@/store/canvas-store'
import { useProjectStore } from '@/store/project-store'
import { useAuthStore } from '@/store/auth-store'
import { useHCLPreview } from '@/hooks/use-hcl-preview'
import { exportAsTF, exportAsZIP } from '@/lib/export'
import { validateNodes } from '@/lib/validation'
import { ImportDialog } from '@/components/ui/import-dialog'

export function Toolbar() {
  const { t, i18n } = useTranslation()
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const showPreview = useCanvasStore((s) => s.showPreview)
  const showSidebar = useCanvasStore((s) => s.showSidebar)
  const showPropertyPanel = useCanvasStore((s) => s.showPropertyPanel)
  const togglePreview = useCanvasStore((s) => s.togglePreview)
  const toggleSidebar = useCanvasStore((s) => s.toggleSidebar)
  const togglePropertyPanel = useCanvasStore((s) => s.togglePropertyPanel)
  const setValidationErrors = useCanvasStore((s) => s.setValidationErrors)
  const clearValidationErrors = useCanvasStore((s) => s.clearValidationErrors)
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject)
  const saveStatus = useProjectStore((s) => s.saveStatus)
  const { hcl } = useHCLPreview()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [showImport, setShowImport] = useState(false)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateNodes> | null>(null)
  const [validating, setValidating] = useState(false)

  const handleExportTF = () => {
    if (hcl) exportAsTF(hcl, 'main.tf')
  }

  const handleExportZIP = () => {
    exportAsZIP({
      'main.tf': hcl,
    }, 'terraform-project')
  }

  const handleValidate = () => {
    setValidating(true)
    setTimeout(() => {
      const result = validateNodes(nodes, edges)
      setValidationResult(result)

      for (const node of nodes) {
        const nodeErrors = result.errors.filter((e) => e.nodeId === node.id)
        if (nodeErrors.length > 0) {
          setValidationErrors(node.id, Object.fromEntries(nodeErrors.map((e) => [e.attribute, e.message])))
        } else {
          clearValidationErrors(node.id)
        }
      }
      setValidating(false)
    }, 300)
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <>
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b bg-[var(--bg-toolbar)] px-4 relative"
        style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Gradient accent line */}
        <div className="absolute bottom-[-1px] left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 60%)', opacity: 0.4 }} />

        {/* Logo + Undo/Redo */}
        <div className="flex items-center gap-1">
          <span className="mr-4 font-bold text-[var(--accent-light)]" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px', fontSize: '16px' }}>
            TF Visual
          </span>
          <button onClick={undo} title={t('toolbar.undo')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} title={t('toolbar.redo')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-[2px]">
          <button onClick={toggleSidebar} title="Toggle sidebar"
            className={`flex h-[34px] w-[34px] items-center justify-center rounded transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] ${showSidebar ? 'text-[var(--accent-light)] bg-[var(--accent-dim)]' : 'text-[var(--text-secondary)]'}`}>
            <PanelLeft className="h-4 w-4" />
          </button>
          <button onClick={togglePreview} title="Toggle preview"
            className={`flex h-[34px] w-[34px] items-center justify-center rounded transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] ${showPreview ? 'text-[var(--accent-light)] bg-[var(--accent-dim)]' : 'text-[var(--text-secondary)]'}`}>
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={togglePropertyPanel} title="Toggle property panel"
            className={`flex h-[34px] w-[34px] items-center justify-center rounded transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] ${showPropertyPanel ? 'text-[var(--accent-light)] bg-[var(--accent-dim)]' : 'text-[var(--text-secondary)]'}`}>
            <PanelRight className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[2px]">
          <button onClick={handleExportTF} title={t('toolbar.export.tf')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <FileJson className="h-4 w-4" />
          </button>
          <button onClick={handleExportZIP} title={t('toolbar.export.zip')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handleValidate} title={t('toolbar.validate')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)] relative">
            {validating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            ) : validationResult ? (
              validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-[var(--green)]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[var(--red)]" />
              )
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </button>
          <button onClick={() => setShowImport(true)} title={t('toolbar.import.tfstate')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <FileUp className="h-4 w-4" />
          </button>
          <button onClick={saveCurrentProject} title={t('toolbar.save')}
            className="flex h-[34px] w-[34px] items-center justify-center rounded transition-all duration-150 hover:bg-[var(--accent-dim)]">
            <Save className={`h-4 w-4 ${saveStatus === 'saved' ? 'text-[var(--green)]' : 'text-[var(--text-secondary)]'}`} />
          </button>
          <button onClick={toggleLang} title="Toggle language"
            className="flex h-[34px] w-[34px] items-center justify-center rounded text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--accent-dim)] hover:text-[var(--accent-light)]">
            <Globe className="h-4 w-4" />
          </button>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2.5 border-l pl-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 rounded px-2 py-1 text-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}>
              {userInitials}
            </div>
            <span className="font-semibold text-[var(--text-primary)] text-[12px]">{user?.name || 'Guest'}</span>
            {user?.role && (
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ background: 'var(--green-dim)', color: 'var(--green)', letterSpacing: '0.5px' }}>
                {user.role}
              </span>
            )}
          </div>
          <button onClick={logout} title="Logout"
            className="flex h-[30px] w-[30px] items-center justify-center rounded text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--red-dim)] hover:text-[var(--red)]">
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>

      {/* Validation error bar */}
      {validationResult && !validationResult.valid && (
        <div className="shrink-0 border-b bg-[var(--red-dim)] px-3 py-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--red)' }}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{validationResult.errors.length} error(s):</span>
            <span className="truncate">{validationResult.errors[0]?.message}</span>
          </div>
        </div>
      )}

      <ImportDialog open={showImport} onClose={() => setShowImport(false)} />
    </>
  )
}
