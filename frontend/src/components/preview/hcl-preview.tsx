import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Code2 } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-hcl'
import { useHCLPreview } from '@/hooks/use-hcl-preview'

export function HCLPreview() {
  const { t } = useTranslation()
  const { hcl } = useHCLPreview()
  const [copied, setCopied] = useState(false)

  const highlighted = hcl
    ? Prism.highlight(hcl, Prism.languages.hcl || Prism.languages.markup, 'hcl')
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hcl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-secondary)]">
          <Code2 className="h-3.5 w-3.5" style={{ color: 'var(--accent-light)' }} />
          {t('preview.title')}
        </div>
        {hcl && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-all duration-150 hover:text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
          >
            {copied ? <Check className="h-3 w-3 text-[var(--green)]" /> : <Copy className="h-3 w-3" />}
            {copied ? t('preview.copied') : t('preview.copy')}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4" style={{ background: 'var(--bg-code)' }}>
        {hcl ? (
          <pre className="text-[11.5px] leading-[1.6]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
            <code
              className="language-hcl hcl-code"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('preview.empty')}</p>
        )}
      </div>
    </div>
  )
}
