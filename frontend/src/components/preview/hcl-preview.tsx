import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
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
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{t('preview.title')}</h3>
        {hcl && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t('preview.copied') : t('preview.copy')}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
        {hcl ? (
          <pre className="text-sm">
            <code
              className="language-hcl"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        ) : (
          <p className="text-sm text-gray-500">{t('preview.empty')}</p>
        )}
      </div>
    </div>
  )
}
