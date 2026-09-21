'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sub?: string
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  options?: SelectOption[]
  groups?: SelectGroup[]
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  ariaLabel?: string
}

/**
 * Theme-based searchable dropdown (frosted glass) — replaces native <select> sitewide.
 * Type to filter; click-outside / Escape closes; fully keyboard reachable (tab + arrows via native input).
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  options = [],
  groups,
  placeholder = '-- Select --',
  disabled,
  allowClear,
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const flat = useMemo(() => groups?.flatMap(g => g.options) ?? options, [groups, options])
  const selected = flat.find(o => o.value === value) ?? null

  const q = query.trim().toLowerCase()
  const matches = (o: SelectOption) =>
    !q || o.label.toLowerCase().includes(q) || (o.sub?.toLowerCase().includes(q) ?? false)

  const visibleGroups = useMemo(() => {
    if (!groups) return null
    return groups
      .map(g => ({ ...g, options: g.options.filter(matches) }))
      .filter(g => g.options.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, query])

  const visibleFlat = useMemo(() => options.filter(matches), [options, query])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  const renderOption = (o: SelectOption) => {
    const active = o.value === value
    return (
      <button
        key={o.value}
        type="button"
        role="option"
        aria-selected={active}
        onClick={() => pick(o.value)}
        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors min-h-[44px] ${
          active ? 'text-brand-gold bg-brand-gold/10' : 'text-brand-silver hover:text-brand-white hover:bg-brand-navy/60'
        }`}
      >
        <span className="min-w-0">
          <span className="block truncate">{o.label}</span>
          {o.sub && <span className="block text-xs text-brand-silver/50 truncate">{o.sub}</span>}
        </span>
        {active && <Check className="w-4 h-4 flex-shrink-0" />}
      </button>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return
          setOpen(o => !o)
          setQuery('')
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className={`input-field flex items-center justify-between gap-2 text-left !py-3 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${selected ? '' : '!text-brand-silver/50'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {allowClear && selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={e => { e.stopPropagation(); pick('') }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick('') } }}
              className="p-1 text-brand-silver/60 hover:text-brand-white"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-brand-silver/60 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-brand-gold/25 bg-brand-sapphire/85 backdrop-blur-md shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-2 border-b border-brand-gold/15">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to search..."
                aria-label="Search options"
                className="w-full bg-brand-navy/60 border border-brand-silver/20 rounded-lg pl-9 pr-3 py-2.5 text-sm text-brand-white placeholder:text-brand-silver/40 focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
          <div role="listbox" className="max-h-60 overflow-y-auto py-1">
            {visibleGroups ? (
              visibleGroups.length === 0 ? (
                <Empty />
              ) : (
                visibleGroups.map(g => (
                  <div key={g.label}>
                    <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-champagne/70">
                      {g.label}
                    </div>
                    {g.options.map(renderOption)}
                  </div>
                ))
              )
            ) : visibleFlat.length === 0 ? (
              <Empty />
            ) : (
              visibleFlat.map(renderOption)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Empty() {
  return <div className="px-4 py-6 text-center text-sm text-brand-silver/50">No matches — try different text.</div>
}
