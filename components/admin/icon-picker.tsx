'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon as IconifyIcon } from '@iconify/react'
import { Search, Palette, Loader2, WifiOff } from 'lucide-react'
import { CategoryIcon, hexToRgba, isValidHex } from '@/components/category-icon'
import { cn } from '@/lib/utils/utils'

interface IconPickerProps {
  value: string | null
  color: string
  onIconChange: (name: string) => void
  onColorChange: (color: string) => void
  label?: string
}

const ICONIFY_LIMIT = 150
const DEBOUNCE_MS = 400

export function IconPicker({ value, color, onIconChange, onColorChange, label = 'Category Icon' }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [hexInput, setHexInput] = useState(color)
  const [onlineIcons, setOnlineIcons] = useState<string[]>([])
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [onlineVisible, setOnlineVisible] = useState(ICONIFY_LIMIT)
  // Bounded LRU cache — prevents unbounded memory growth (max 20 queries × 150 = 3k entries)
  const cacheRef = useRef<Map<string, string[]>>(new Map())

  useEffect(() => { setHexInput(color) }, [color])
  useEffect(() => { setOnlineVisible(ICONIFY_LIMIT) }, [search])

  const onlineFiltered = useMemo(() => onlineIcons.slice(0, onlineVisible), [onlineIcons, onlineVisible])

  // ─── Live Iconify search — popular when idle ────────────────────────────
  useEffect(() => {
    const q = search.trim().toLowerCase()
    const effectiveQuery = q.length < 2 ? '__popular__' : q
    const fetchQuery = q.length < 2 ? 'business' : q

    if (cacheRef.current.has(effectiveQuery)) {
      setOnlineIcons(cacheRef.current.get(effectiveQuery)!)
      setOnlineError(null)
      setOnlineLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setOnlineLoading(true)
      setOnlineError(null)
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(fetchQuery)}&limit=${ICONIFY_LIMIT}`)
        if (!res.ok) throw new Error(`Iconify ${res.status}`)
        const data: { icons?: string[] } = await res.json()
        const icons = (data.icons ?? []).slice(0, ICONIFY_LIMIT)
        // Evict oldest if over 20 entries
        if (cacheRef.current.size >= 20) {
          const firstKey = cacheRef.current.keys().next().value as string
          cacheRef.current.delete(firstKey)
        }
        cacheRef.current.set(effectiveQuery, icons)
        setOnlineIcons(icons)
      } catch (e) {
        setOnlineError(e instanceof Error ? e.message : 'Failed to fetch')
        setOnlineIcons([])
      } finally {
        setOnlineLoading(false)
      }
    }, q.length < 2 ? 0 : DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [search])

  const handleHexTextChange = (v: string) => {
    setHexInput(v)
    if (isValidHex(v)) onColorChange(v)
  }

  const handleColorPicker = (v: string) => {
    setHexInput(v)
    onColorChange(v)
  }

  const safeColor = isValidHex(color) ? color : '#D4AF37'
  const bgTint = hexToRgba(safeColor, 0.15)

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      <label className="block text-brand-silver text-xs font-medium">{label}</label>

      {/* Preview + Color selector */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <div
          className="glass-card flex items-center gap-3 px-4 py-3 rounded-xl border-brand-gold/20 shrink-0 w-full sm:w-auto sm:min-w-[220px]"
          aria-label="Icon preview"
        >
          <CategoryIcon name={value} color={safeColor} size={24} />
          <div className="flex-1 min-w-0">
            <p className="text-brand-white text-sm font-medium truncate" title={value ?? undefined}>
              {value ?? 'No icon'}
            </p>
            <p className="text-brand-silver/60 text-xs font-mono">{safeColor.toUpperCase()}</p>
          </div>
          <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: safeColor }} aria-hidden />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 glass-card px-3 py-2.5 rounded-xl border-brand-gold/10">
          <Palette className="w-4 h-4 text-brand-silver/60 shrink-0" aria-hidden />
          <label htmlFor="icon-color-picker" className="sr-only">Pick accent color</label>
          <input
            id="icon-color-picker"
            type="color"
            value={safeColor}
            onChange={e => handleColorPicker(e.target.value)}
            className="w-9 h-9 rounded-lg cursor-pointer shrink-0 border border-brand-silver/20 bg-transparent p-0.5"
            aria-label="Accent color picker"
          />
          <input
            type="text"
            value={hexInput}
            onChange={e => handleHexTextChange(e.target.value)}
            placeholder="#3B82F6"
            maxLength={7}
            className="input-field flex-1 min-w-0 text-sm font-mono py-2 px-3 min-h-[44px]"
            aria-label="Hex color code"
          />
          {!isValidHex(hexInput) && hexInput.length > 0 && (
            <span className="text-red-400 text-xs shrink-0 hidden sm:inline">Invalid</span>
          )}
        </div>
      </div>
      {hexInput && !isValidHex(hexInput) && (
        <p className="text-red-400 text-xs -mt-1 sm:hidden">Invalid hex — use #RRGGBB</p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40 pointer-events-none" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search icons — e.g. Bag, Building, Heart, accountant..."
          className="input-field pl-10 pr-16 text-sm"
          aria-label="Search icons"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver/60 hover:text-brand-silver text-xs px-2 py-1 rounded hover:bg-brand-sapphire/50"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Single Iconify grid — vertical, scroll captures wheel */}
      <div className="flex flex-col gap-2">
        <div
          tabIndex={0}
          className={cn(
            'grid gap-2 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold/30',
            'bg-brand-navy/40 border border-brand-silver/10 scrollbar-thin',
            'grid-cols-4 sm:grid-cols-6 md:grid-cols-9',
            'overflow-y-auto overscroll-contain touch-pan-y isolate'
          )}
          style={{ height: '22rem', minHeight: onlineFiltered.length === 0 && !onlineLoading ? '7rem' : '14rem' }}
          role="grid"
          aria-label="Iconify icon grid"
          onWheel={e => {
            const el = e.currentTarget
            const atTop = el.scrollTop === 0
            const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight
            const scrollingUp = e.deltaY < 0
            const scrollingDown = e.deltaY > 0
            if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) {
              e.stopPropagation()
            }
          }}
        >
          {onlineLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-brand-silver/50 text-sm">
              <Loader2 className="w-6 h-6 mb-2 animate-spin text-brand-gold/60" />
              Searching 200k+ icons for &ldquo;{search || 'business'}&rdquo;…
            </div>
          ) : onlineError ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-brand-silver/50 text-sm">
              <WifiOff className="w-6 h-6 mb-2 opacity-50" />
              Offline — check connection
              <span className="text-xs mt-1 text-brand-silver/30">{onlineError}</span>
            </div>
          ) : onlineFiltered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-brand-silver/50 text-sm">
              No matches — try &ldquo;building&rdquo;, &ldquo;briefcase&rdquo;, &ldquo;medical&rdquo;
            </div>
          ) : (
            onlineFiltered.map(iconName => {
              const isSelected = value === iconName
              return (
                <button
                  key={iconName}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`Select ${iconName} icon`}
                  title={iconName}
                  onClick={() => onIconChange(iconName)}
                  className={cn(
                    'group flex flex-col items-center justify-center gap-1 rounded-xl border p-2 w-full',
                    'min-h-[64px] h-[64px]',
                    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-gold/50',
                    isSelected
                      ? 'bg-brand-gold/15 border-brand-gold/40 shadow-sm'
                      : 'bg-brand-sapphire/40 border-brand-silver/10 text-brand-silver hover:border-brand-gold/30 hover:bg-brand-sapphire/60 hover:text-brand-white'
                  )}
                  style={isSelected ? { backgroundColor: bgTint, borderColor: safeColor + '55', color: safeColor } : undefined}
                >
                  <IconifyIcon icon={iconName} width={20} height={20} className="shrink-0" aria-hidden style={isSelected ? { color: safeColor } : undefined} />
                  <span className="text-[8px] leading-none font-medium truncate max-w-full opacity-60 group-hover:opacity-100">{iconName}</span>
                </button>
              )
            })
          )}
        </div>
        {onlineIcons.length > onlineFiltered.length && (
          <button
            onClick={() => setOnlineVisible(v => v + 48)}
            className="w-full py-2.5 text-xs font-medium rounded-xl border border-brand-gold/20 bg-brand-gold/5 text-brand-gold hover:bg-brand-gold/10 transition-colors min-h-[44px] relative z-10"
          >
            Load 48 more · {onlineIcons.length - onlineFiltered.length} remaining
          </button>
        )}
        {onlineError && (
          <p className="text-red-400 text-xs inline-flex items-center gap-1"><WifiOff className="w-3 h-3" /> {onlineError}</p>
        )}
      </div>
    </div>
  )
}
