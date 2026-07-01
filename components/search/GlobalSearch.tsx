'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, X, Loader2, User, Tag, Images, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface MemberResult {
  type: 'member'
  id: string
  full_name: string
  business_name: string | null
  logo_url: string | null
  brand_tagline?: string | null
  category_name?: string | null
  chapter_name?: string | null
}

interface CategoryResult {
  type: 'category'
  id: string
  name: string
  slug: string
  member_count?: number
}

interface GalleryResult {
  type: 'gallery'
  id: string
  title: string
  chapter_name?: string | null
  area_name?: string | null
}

type AnyResult = MemberResult | CategoryResult | GalleryResult

interface SearchGroups {
  members: MemberResult[]
  categories: CategoryResult[]
  gallery: GalleryResult[]
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<SearchGroups>({ members: [], categories: [], gallery: [] })
  const [loading, setLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalResults = groups.members.length + groups.categories.length + groups.gallery.length

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setGroups({ members: [], categories: [], gallery: [] })
      setShowPanel(false)
      setHasSearched(false)
      return
    }

    setLoading(true)
    setShowPanel(true)

    try {
      const supabase = createClient()

      const [
        { data: membersByName },
        { data: membersByCat },
        { data: cats },
        { data: galleryPosts },
      ] = await Promise.all([
        // Members by name or business name
        supabase
          .from('profiles')
          .select(`
            id, full_name, business_name, logo_url, brand_tagline,
            category:categories(name, slug),
            chapter:chapters(name, slug)
          `)
          .eq('status', 'approved')
          .or(`full_name.ilike.%${q}%,business_name.ilike.%${q}%`)
          .limit(5),

        // Members by category name
        supabase
          .from('profiles')
          .select(`
            id, full_name, business_name, logo_url, brand_tagline,
            category:categories!inner(name, slug),
            chapter:chapters(name, slug)
          `)
          .eq('status', 'approved')
          .ilike('categories.name', `%${q}%`)
          .limit(4),

        // Categories by name
        supabase
          .from('categories')
          .select('id, name, slug')
          .ilike('name', `%${q}%`)
          .limit(5),

        // Gallery posts by title or content
        supabase
          .from('gallery_posts')
          .select(`
            id, title,
            chapter:chapters(name),
            area:areas(name)
          `)
          .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
          .limit(3),
      ])

      // Deduplicate members
      const seen = new Set<string>()
      const allMembers: MemberResult[] = []
      for (const p of [...(membersByName ?? []), ...(membersByCat ?? [])]) {
        if (seen.has(p.id)) continue
        seen.add(p.id)
        const cat = Array.isArray(p.category) ? p.category[0] : p.category
        const ch = Array.isArray(p.chapter) ? p.chapter[0] : p.chapter
        allMembers.push({
          type: 'member',
          id: p.id,
          full_name: p.full_name,
          business_name: p.business_name,
          logo_url: p.logo_url,
          brand_tagline: p.brand_tagline,
          category_name: (cat as { name?: string } | null)?.name ?? null,
          chapter_name: (ch as { name?: string } | null)?.name ?? null,
        })
      }

      const allCategories: CategoryResult[] = (cats ?? []).map(c => ({
        type: 'category',
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))

      const allGallery: GalleryResult[] = (galleryPosts ?? []).map(g => {
        const ch = Array.isArray(g.chapter) ? g.chapter[0] : g.chapter
        const ar = Array.isArray(g.area) ? g.area[0] : g.area
        return {
          type: 'gallery',
          id: g.id,
          title: g.title,
          chapter_name: (ch as { name?: string } | null)?.name ?? null,
          area_name: (ar as { name?: string } | null)?.name ?? null,
        }
      })

      setGroups({ members: allMembers, categories: allCategories, gallery: allGallery })
      setHasSearched(true)
    } catch {
      setGroups({ members: [], categories: [], gallery: [] })
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const clear = () => {
    setQuery('')
    setGroups({ members: [], categories: [], gallery: [] })
    setShowPanel(false)
    setHasSearched(false)
    inputRef.current?.focus()
  }

  const closePanel = () => setShowPanel(false)

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowPanel(false)
    }
  }

  const panelVisible = showPanel && query.trim().length >= 2

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      role="search"
      onBlur={handleBlur}
    >
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gold pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          id="global-search"
          name="q"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query.trim().length >= 2) setShowPanel(true) }}
          placeholder="Search members, businesses, categories, gallery..."
          className="w-full bg-brand-sapphire/95 backdrop-blur-md border-2 border-brand-gold/50 focus:border-brand-gold rounded-xl pl-12 pr-12 py-4 text-brand-white placeholder:text-brand-silver/50 focus:outline-none transition-all duration-200 text-base shadow-2xl shadow-brand-navy/80"
          aria-label="Search UCCI"
          aria-expanded={panelVisible}
          aria-autocomplete="list"
          aria-controls="search-results"
          autoComplete="off"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-brand-silver animate-spin" />}
          {query && !loading && (
            <button onClick={clear} className="text-brand-silver hover:text-brand-white transition-colors" aria-label="Clear search">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {panelVisible && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden shadow-2xl shadow-brand-navy/80 z-50 max-h-[32rem] overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-6 text-center">
              <Loader2 className="w-5 h-5 text-brand-gold animate-spin mx-auto" />
              <p className="text-brand-silver text-sm mt-2">Searching...</p>
            </div>

          ) : totalResults > 0 ? (
            <div>
              {/* Members */}
              {groups.members.length > 0 && (
                <section>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-brand-sapphire/50 sticky top-0 bg-brand-sapphire/95 backdrop-blur-sm">
                    <Building2 className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Members & Businesses</span>
                  </div>
                  {groups.members.map(m => (
                    <Link
                      key={m.id}
                      href={`/members/${m.id}`}
                      onClick={closePanel}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-navy/60 transition-colors border-b border-brand-sapphire/30 last:border-0"
                    >
                      {m.logo_url ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-brand-gold/30">
                          <Image src={m.logo_url.split('?')[0]} alt={m.business_name ?? m.full_name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0 border border-brand-gold/30">
                          <User className="w-4 h-4 text-brand-gold" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-brand-white font-medium text-sm truncate">{m.business_name ?? m.full_name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-brand-silver mt-0.5">
                          {m.category_name && <span className="text-brand-champagne">{m.category_name}</span>}
                          {m.category_name && m.chapter_name && <span className="text-brand-silver/40">·</span>}
                          {m.chapter_name && <span>{m.chapter_name}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {/* Categories */}
              {groups.categories.length > 0 && (
                <section>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-brand-sapphire/50 sticky top-0 bg-brand-sapphire/95 backdrop-blur-sm">
                    <Tag className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Categories</span>
                  </div>
                  {groups.categories.map(c => (
                    <Link
                      key={c.id}
                      href={`/categories/${c.slug}`}
                      onClick={closePanel}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-navy/60 transition-colors border-b border-brand-sapphire/30 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-sapphire flex items-center justify-center flex-shrink-0 border border-brand-gold/20">
                        <Tag className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-brand-white font-medium text-sm">{c.name}</div>
                        <div className="text-brand-silver/60 text-xs">Browse all members in this category</div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {/* Gallery */}
              {groups.gallery.length > 0 && (
                <section>
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-brand-sapphire/50 sticky top-0 bg-brand-sapphire/95 backdrop-blur-sm">
                    <Images className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Gallery</span>
                  </div>
                  {groups.gallery.map(g => (
                    <Link
                      key={g.id}
                      href={`/gallery`}
                      onClick={closePanel}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-navy/60 transition-colors border-b border-brand-sapphire/30 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-sapphire flex items-center justify-center flex-shrink-0 border border-brand-gold/20">
                        <Images className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-brand-white font-medium text-sm truncate">{g.title}</div>
                        <div className="text-brand-silver/60 text-xs">
                          {[g.chapter_name, g.area_name].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}
            </div>

          ) : hasSearched ? (
            <div className="px-4 py-8 text-center">
              <p className="text-brand-silver text-sm">No results for &quot;{query}&quot;</p>
              <p className="text-brand-silver/50 text-xs mt-1">Try a member name, business, category, or gallery post</p>
              <Link href="/categories" onClick={closePanel} className="inline-block mt-3 text-brand-gold text-xs hover:text-brand-champagne transition-colors">
                Browse all categories →
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
