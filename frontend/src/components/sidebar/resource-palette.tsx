import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { providerCatalog, searchResources } from '@/lib/provider-data'

// Debounce delay for search (ms)
const SEARCH_DEBOUNCE_MS = 150

// Provider icon mapping
const providerIcons: Record<string, string> = {
  aws: '🟠',
  azure: '🔵',
  gcp: '🟢',
}

const providerIconClasses: Record<string, string> = {
  aws: 'resource-icon-aws',
  azure: 'resource-icon-azure',
  gcp: 'resource-icon-gcp',
}

export function ResourcePalette() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeProvider, setActiveProvider] = useState('aws')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const filtered = debouncedQuery ? searchResources(debouncedQuery) : null
  const catalogs = providerCatalog.filter((c) => !query || c.provider === activeProvider)

  const handleDragStart = (e: React.DragEvent, type: string, provider: string) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.setData('application/provider', provider)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b p-3" style={{ borderColor: 'var(--border)' }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input w-full h-[34px] rounded-md border bg-[var(--bg-input)] pl-8 pr-3 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Provider tabs */}
      {!query && (
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {providerCatalog.map((c) => (
            <button
              key={c.provider}
              onClick={() => setActiveProvider(c.provider)}
              className={`provider-tab flex-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.8px] transition-all duration-150 border-b-2 ${
                activeProvider === c.provider
                  ? 'provider-tab-active'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              style={{ borderColor: activeProvider === c.provider ? 'var(--accent)' : 'transparent' }}
            >
              {c.provider}
            </button>
          ))}
        </div>
      )}

      {/* Resource list */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filtered
          ? filtered.map((r) => (
              <div
                key={r.type}
                draggable
                onDragStart={(e) => handleDragStart(e, r.type, r.provider)}
                className="mb-0.5 flex cursor-grab items-center gap-2.5 rounded p-2 text-sm transition-all duration-120 hover:bg-[var(--bg-card)] active:cursor-grabbing"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm ${providerIconClasses[r.provider] || ''}`}>
                  {providerIcons[r.provider] || r.provider[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-[var(--text-primary)] text-[12px]">{r.name}</div>
                  <div className="truncate text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>{r.type}</div>
                </div>
              </div>
            ))
          : catalogs.map((catalog) =>
              Object.entries(catalog.services).map(([service, resources]) => (
                <div key={`${catalog.provider}-${service}`} className="mb-3">
                  <h4 className="mb-1.5 px-1.5 text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    {service}
                  </h4>
                  {resources.map((r) => (
                    <div
                      key={r.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, r.type, r.provider)}
                      className="mb-0.5 flex cursor-grab items-center gap-2.5 rounded p-2 text-sm transition-all duration-120 hover:bg-[var(--bg-card)] active:cursor-grabbing"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm ${providerIconClasses[r.provider] || ''}`}>
                        {providerIcons[r.provider] || r.provider[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--text-primary)] text-[12px]">{r.name}</div>
                        <div className="truncate text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>{r.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )),
            )}
      </div>
    </div>
  )
}
