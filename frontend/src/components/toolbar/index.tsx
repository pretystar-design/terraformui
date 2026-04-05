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
  User,
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

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-3">
        <div className="flex items-center gap-1">
          <span className="mr-3 font-bold text-primary">TF Visual</span>
          <button onClick={undo} title={t('toolbar.undo')} className="rounded p-1.5 hover:bg-accent">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} title={t('toolbar.redo')} className="rounded p-1.5 hover:bg-accent">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleSidebar}
            title="Toggle sidebar"
            className={`rounded p-1.5 hover:bg-accent ${showSidebar ? 'text-primary' : ''}`}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={togglePreview}
            title="Toggle preview"
            className={`rounded p-1.5 hover:bg-accent ${showPreview ? 'text-primary' : ''}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={togglePropertyPanel}
            title="Toggle property panel"
            className={`rounded p-1.5 hover:bg-accent ${showPropertyPanel ? 'text-primary' : ''}`}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleExportTF}
            title={t('toolbar.export.tf')}
            className="rounded p-1.5 hover:bg-accent"
          >
            <FileJson className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportZIP}
            title={t('toolbar.export.zip')}
            className="rounded p-1.5 hover:bg-accent"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleValidate}
            title={t('toolbar.validate')}
            className="rounded p-1.5 hover:bg-accent relative"
          >
            {validating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : validationResult ? (
              validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setShowImport(true)}
            title={t('toolbar.import.tfstate')}
            className="rounded p-1.5 hover:bg-accent"
          >
            <FileUp className="h-4 w-4" />
          </button>
          <button
            onClick={saveCurrentProject}
            title={t('toolbar.save')}
            className="rounded p-1.5 hover:bg-accent"
          >
            <Save className={`h-4 w-4 ${saveStatus === 'saved' ? 'text-green-500' : ''}`} />
          </button>
          <button
            onClick={toggleLang}
            title="Toggle language"
            className="rounded p-1.5 hover:bg-accent"
          >
            <Globe className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-l pl-3">
          <div className="flex items-center gap-1.5 rounded px-2 py-1 text-xs">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{user?.name || 'Guest'}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="rounded p-1.5 hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {validationResult && !validationResult.valid && (
        <div className="shrink-0 border-b bg-red-50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-red-700">
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
