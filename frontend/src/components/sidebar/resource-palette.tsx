import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { providerCatalog, searchResources } from '@/lib/provider-data'

export function ResourcePalette() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [activeProvider, setActiveProvider] = useState('aws')

  const filtered = query ? searchResources(query) : null
  const catalogs = providerCatalog.filter((c) => !query || c.provider === activeProvider)

  const handleDragStart = (e: React.DragEvent, type: string, provider: string) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.setData('application/provider', provider)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {!query && (
        <div className="flex border-b">
          {providerCatalog.map((c) => (
            <button
              key={c.provider}
              onClick={() => setActiveProvider(c.provider)}
              className={`flex-1 px-3 py-2 text-xs font-medium uppercase transition-colors ${
                activeProvider === c.provider
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`sidebar.${c.provider}`)}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {filtered
          ? filtered.map((r) => (
              <div
                key={r.type}
                draggable
                onDragStart={(e) => handleDragStart(e, r.type, r.provider)}
                className="mb-1 flex cursor-grab items-center gap-2 rounded-md border bg-card p-2 text-sm hover:bg-accent active:cursor-grabbing"
              >
                <div className="h-6 w-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {r.provider[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.type}</div>
                </div>
              </div>
            ))
          : catalogs.map((catalog) =>
              Object.entries(catalog.services).map(([service, resources]) => (
                <div key={`${catalog.provider}-${service}`} className="mb-3">
                  <h4 className="mb-1 px-1 text-xs font-semibold uppercase text-muted-foreground">
                    {service}
                  </h4>
                  {resources.map((r) => (
                    <div
                      key={r.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, r.type, r.provider)}
                      className="mb-1 flex cursor-grab items-center gap-2 rounded-md border bg-card p-2 text-sm hover:bg-accent active:cursor-grabbing"
                    >
                      <div className="h-6 w-6 shrink-0 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {r.provider[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.type}</div>
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
