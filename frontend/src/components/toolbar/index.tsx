import { useState, useRef, useEffect } from 'react'
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
  ChevronDown,
  FolderOpen,
  Plus,
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
  const projects = useProjectStore((s) => s.projects)
  const currentProject = useProjectStore((s) => s.currentProject)
  const switchProject = useProjectStore((s) => s.switchProject)
  const createProject = useProjectStore((s) => s.createProject)
  const { hcl } = useHCLPreview()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [showImport, setShowImport] = useState(false)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateNodes> | null>(null)
  const [validating, setValidating] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setShowProjectDropdown(false)
    }
  }

  const handleSwitchProject = (id: string) => {
    switchProject(id)
    setShowProjectDropdown(false)
  }

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

        {/* Logo + Project Switcher + Undo/Redo */}
        <div className="flex items-center gap-1">
          <span className="mr-2 flex items-center gap-2 font-bold text-[var(--accent-light)]" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px', fontSize: '16px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
              <line x1="12" y1="22" x2="12" y2="15.5"/>
              <polyline points="22 8.5 12 15.5 2 8.5"/>
            </svg>
            TF Visual
          </span>

          {/* Project Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 hover:bg-[var(--accent-dim)]"
              style={{ color: 'var(--text-primary)', background: showProjectDropdown ? 'var(--accent-dim)' : 'transparent' }}
            >
              <FolderOpen className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              <span className="max-w-[120px] truncate">{currentProject?.name || 'No Project'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Dropdown */}
            {showProjectDropdown && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-[220px] rounded-lg border shadow-lg"
                style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
              >
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {projects.length === 0 ? (
                    <div className="px-3 py-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>No projects yet</div>
                  ) : (
                    projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchProject(p.id)}
                        className={`w-full rounded px-3 py-2 text-left text-[12px] transition-colors ${
                          p.id === currentProject?.id ? 'bg-[var(--accent-dim)] text-[var(--accent-light)]' : 'hover:bg-[var(--bg-card)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {p.nodeCount} nodes · {new Date(p.lastModified).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t p-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="New project..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      className="flex-1 rounded border bg-[var(--bg-input)] px-2 py-1.5 text-[11px] outline-none focus:border-[var(--accent)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="flex items-center justify-center rounded px-2 py-1.5 transition-colors disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
