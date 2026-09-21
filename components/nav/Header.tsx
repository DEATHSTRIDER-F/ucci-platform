'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, ChevronRight, LogOut, User, Search, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GlobalSearch } from '@/components/search/GlobalSearch'

interface AreaWithChapters {
  id: string
  name: string
  slug: string
  chapters: Array<{ id: string; name: string; slug: string; is_active?: boolean }>
}

interface FeaturedCategory {
  id: string
  name: string
  slug: string
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  logo_url: string | null
}

interface HeaderProps {
  profile: UserProfile | null
  featuredCategories: FeaturedCategory[]
  areasWithChapters: AreaWithChapters[]
}

const CLOSE_DELAY = 120 // ms — enough to cross a small gap, not noticeable to user

/* ---------- Mobile menu building blocks (floating-card accordion style) ---------- */

function MobileMenuLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors min-h-[48px] flex items-center ${
        active
          ? 'bg-brand-sapphire text-brand-gold'
          : 'text-brand-white/90 hover:bg-brand-sapphire/60 hover:text-brand-white'
      }`}
    >
      {label}
    </Link>
  )
}

function MobileSubLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`block px-4 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] flex items-center ${
        active
          ? 'bg-brand-sapphire text-brand-gold font-medium'
          : 'text-brand-silver hover:text-brand-white hover:bg-brand-sapphire/50'
      }`}
    >
      {label}
    </Link>
  )
}

function MobileMenuGroup({
  label,
  expanded,
  active,
  onToggle,
  children,
  nested = false,
}: {
  label: string
  expanded: boolean
  active: boolean
  onToggle: () => void
  children: ReactNode
  nested?: boolean
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between gap-2 rounded-xl font-medium transition-colors min-h-[48px] ${
          nested ? 'px-4 py-2.5 text-sm' : 'px-4 py-3 text-[15px]'
        } ${
          expanded
            ? 'bg-brand-sapphire/60 text-brand-gold'
            : active
              ? 'text-brand-gold'
              : 'text-brand-white/90 hover:bg-brand-sapphire/60'
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            expanded ? 'rotate-180 text-brand-gold' : 'text-brand-silver/70'
          }`}
        />
      </button>
      {/* Height animation via grid-rows 0fr→1fr with cubic-bezier easing.
          Expanding eases out (fast start, soft landing); collapsing uses a
          standard ease curve. Content stays mounted so the height can
          interpolate; `invisible` + `inert` keep it hidden from sight,
          assistive tech, and keyboard tab order while collapsed. */}
      <div
        className={`grid transition-[grid-template-rows] motion-reduce:transition-none ${
          expanded
            ? 'grid-rows-[1fr] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
            : 'grid-rows-[0fr] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            inert={!expanded}
            className={`pl-3 pb-1 flex flex-col gap-0.5 transition-opacity motion-reduce:transition-none ${
              expanded
                ? 'opacity-100 duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                : 'opacity-0 invisible duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header({ profile, featuredCategories, areasWithChapters }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  // Accordion state for the mobile card menu (single-open per level)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [mobileExpandedArea, setMobileExpandedArea] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeChapterArea, setActiveChapterArea] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Timers for delayed close
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chapterAreaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearDropdownTimer = () => {
    if (dropdownTimer.current) { clearTimeout(dropdownTimer.current); dropdownTimer.current = null }
  }
  const clearChapterAreaTimer = () => {
    if (chapterAreaTimer.current) { clearTimeout(chapterAreaTimer.current); chapterAreaTimer.current = null }
  }

  const openDropdown = useCallback((name: string) => {
    clearDropdownTimer()
    setActiveDropdown(name)
  }, [])

  const closeDropdown = useCallback(() => {
    clearDropdownTimer()
    dropdownTimer.current = setTimeout(() => {
      setActiveDropdown(null)
      setActiveChapterArea(null)
    }, CLOSE_DELAY)
  }, [])

  const openChapterArea = useCallback((id: string) => {
    clearChapterAreaTimer()
    setActiveChapterArea(id)
  }, [])

  const closeChapterArea = useCallback(() => {
    clearChapterAreaTimer()
    chapterAreaTimer.current = setTimeout(() => {
      setActiveChapterArea(null)
    }, CLOSE_DELAY)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false)
    setMobileSearchOpen(false)
    setActiveDropdown(null)
    setActiveChapterArea(null)
    setMobileExpanded(null)
    setMobileExpandedArea(null)
  }, [pathname])

  const toggleMobileSection = useCallback((key: string) => {
    setMobileExpanded(prev => (prev === key ? null : key))
  }, [])

  const toggleMobileArea = useCallback((id: string) => {
    setMobileExpandedArea(prev => (prev === id ? null : id))
  }, [])

  // Lock background scroll while the mobile menu/search is open so the page
  // behind never scrolls "invisibly" and the menu owns the gesture.
  // Lenis is disabled on touch devices, so native overflow locking is enough.
  useEffect(() => {
    const locked = mobileOpen || mobileSearchOpen
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    if (locked) {
      root.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      window.__lenis?.stop()
    } else {
      root.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      window.__lenis?.start()
    }
    return () => {
      root.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      window.__lenis?.start()
    }
  }, [mobileOpen, mobileSearchOpen])

  // Close mobile panels with Escape for keyboard / accessibility users
  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setMobileSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, mobileSearchOpen])

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearDropdownTimer()
    clearChapterAreaTimer()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navLinkClass = (href: string) =>
    `btn-ghost text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isActive(href) ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
    }`

  return (
    <header className="sticky top-0 z-50 bg-brand-sapphire border-b border-brand-gold/20 shadow-lg shadow-brand-navy/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo — scales down on phones so header actions never overflow */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 min-w-0">
            {/* <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-display font-bold text-brand-navy text-lg"> */}
            <div className="h-full w-auto flex items-center">
              <Image src="/ucci.webp" alt="UCCI logo" className="opacity-100 h-12 sm:h-14 lg:h-16 w-auto max-w-[180px] sm:max-w-none object-contain" width={320} height={160} priority />
            </div>
            {/* <span className="font-display font-bold text-brand-white text-xl hidden sm:block">
              <span className="text-brand-gold">UCCI</span>
            </span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1" aria-label="Main navigation">

            {/* Home */}
            <Link href="/" className={navLinkClass('/')}>Home</Link>

            {/* About UCCI */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('about')}
              onMouseLeave={closeDropdown}
            >
              <button
                className={`btn-ghost text-sm font-medium flex items-center gap-1 ${isActive('/about') ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
                  }`}
                aria-expanded={activeDropdown === 'about'}
              >
                About UCCI <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 pt-1 w-48">
                  <div className="glass-card py-2 animate-fade-in">
                    <Link href="/about" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Our Story
                    </Link>
                    <Link href="/about#why-ucci" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Why UCCI
                    </Link>
                    <Link href="/about#how-it-works" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      How It Works
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Chapters — Cascading */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('chapters')}
              onMouseLeave={closeDropdown}
            >
              <button
                className={`btn-ghost text-sm font-medium flex items-center gap-1 ${isActive('/chapters') ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
                  }`}
                aria-expanded={activeDropdown === 'chapters'}
              >
                Chapters <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'chapters' && (
                <div className="absolute top-full left-0 pt-1 w-48">
                  <div className="glass-card py-2 animate-fade-in">
                    {areasWithChapters.map(area => (
                      <div
                        key={area.id}
                        className="relative"
                        onMouseEnter={() => { clearChapterAreaTimer(); openChapterArea(area.id) }}
                        onMouseLeave={closeChapterArea}
                      >
                        <button className="w-full text-left px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors flex items-center justify-between">
                          {area.name}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {activeChapterArea === area.id && (
                          <div
                            className="absolute left-full top-0 pl-1 w-44"
                            onMouseEnter={() => { clearChapterAreaTimer(); openChapterArea(area.id) }}
                            onMouseLeave={closeChapterArea}
                          >
                            <div className="glass-card py-2 animate-fade-in">
                              {area.chapters.map(chapter => (
                                chapter.is_active === false ? (
                                  <span
                                    key={chapter.id}
                                    className="flex items-center justify-between px-4 py-2 text-sm text-brand-silver/40 cursor-not-allowed"
                                    title="Coming soon"
                                  >
                                    {chapter.name}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-champagne/70 border border-brand-gold/30">
                                      Coming Soon
                                    </span>
                                  </span>
                                ) : (
                                  <Link
                                    key={chapter.id}
                                    href={`/chapters/${area.slug}-${chapter.slug}`}
                                    className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors"
                                  >
                                    {chapter.name}
                                  </Link>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('categories')}
              onMouseLeave={closeDropdown}
            >
              <button
                className={`btn-ghost text-sm font-medium flex items-center gap-1 ${isActive('/categories') ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
                  }`}
                aria-expanded={activeDropdown === 'categories'}
              >
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'categories' && (
                <div className="absolute top-full left-0 pt-1 w-56">
                  <div className="glass-card py-2 animate-fade-in">
                    {featuredCategories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-t border-brand-gold/20 mt-1 pt-1">
                      <Link
                        href="/categories"
                        className="block px-4 py-2 text-sm text-brand-gold hover:text-brand-champagne hover:bg-brand-navy/50 transition-colors font-medium"
                      >
                        View All Categories →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Join UCCI */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('join')}
              onMouseLeave={closeDropdown}
            >
              <button
                className={`btn-ghost text-sm font-medium flex items-center gap-1 ${isActive('/join') ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
                  }`}
                aria-expanded={activeDropdown === 'join'}
              >
                Join UCCI <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'join' && (
                <div className="absolute top-full left-0 pt-1 w-56">
                  <div className="glass-card py-2 animate-fade-in">
                    <Link href="/join" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Become a Member
                    </Link>
                    <Link href="/join?tab=head" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Start a Chapter
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <Link href="/contact" className={navLinkClass('/contact')}>Contact Us</Link>

            {/* Gallery */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('gallery')}
              onMouseLeave={closeDropdown}
            >
              <button
                className={`btn-ghost text-sm font-medium flex items-center gap-1 ${isActive('/gallery') ? 'text-brand-gold' : 'text-brand-silver hover:text-brand-white'
                  }`}
                aria-expanded={activeDropdown === 'gallery'}
              >
                Gallery <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === 'gallery' && (
                <div className="absolute top-full left-0 pt-1 w-48">
                  <div className="glass-card py-2 animate-fade-in">
                    <Link href="/gallery" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      News
                    </Link>
                    <Link href="/gallery?tab=events" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Events
                    </Link>
                    <Link href="/gallery?tab=videos" className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors">
                      Videos
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin link for admins */}
            {profile && (profile.role === 'super_admin' || profile.role === 'chapter_head') && (
              <Link href="/admin" className={`${navLinkClass('/admin')} text-brand-gold`}>
                Admin
              </Link>
            )}
          </div>

          {/* Auth Section (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-brand-white">{profile.full_name}</div>
                  <div className="text-xs text-brand-silver truncate max-w-32">{profile.email}</div>
                </div>
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center hover:bg-brand-gold/30 transition-colors"
                  aria-label="My profile"
                  title="My profile"
                >
                  <User className="w-4 h-4 text-brand-gold" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm text-brand-silver hover:text-red-400 flex items-center gap-1"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm !py-2.5 !px-6 inline-flex items-center justify-center leading-none">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              className="btn-ghost p-2"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                if (mobileOpen) setMobileOpen(false)
              }}
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen ? <X className="w-6 h-6 text-brand-white" /> : <Search className="w-6 h-6 text-brand-white" />}
            </button>
            {profile && (
              <Link href="/profile" className="btn-ghost p-2" aria-label="My profile">
                <User className="w-6 h-6 text-brand-white" />
              </Link>
            )}
            <button
              className="btn-ghost p-2"
              onClick={() => {
                setMobileOpen(!mobileOpen)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6 text-brand-white" /> : <Menu className="w-6 h-6 text-brand-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search — own scroll region, capped to viewport below the header */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-brand-sapphire border-t border-brand-gold/20 animate-fade-in">
          <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain p-4">
            <GlobalSearch />
          </div>
        </div>
      )}

      {/* Mobile Menu — full-screen frosted panel with its own close button.
          Covers everything (no bleed-through), never pushes content,
          owns its scroll; no dim backdrop by design. */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] animate-fade-in bg-brand-navy/85 backdrop-blur-xl">
          <div className="h-full overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-4 pt-4 pb-8">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-3 -mr-1 text-brand-silver hover:text-brand-white"
              aria-label="Close menu"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
          <nav
            className="rounded-2xl border border-brand-gold/25 bg-brand-sapphire/80 backdrop-blur-xl shadow-2xl shadow-black/50 px-4 pt-3 pb-5"
            aria-label="Mobile navigation"
          >
            <MobileMenuLink href="/" label="Home" active={pathname === '/'} />

              <MobileMenuGroup
                label="About UCCI"
                expanded={mobileExpanded === 'about'}
                active={isActive('/about')}
                onToggle={() => toggleMobileSection('about')}
              >
                <MobileSubLink href="/about" label="Our Story" active={pathname === '/about'} />
                <MobileSubLink href="/about#why-ucci" label="Why UCCI" active={false} />
                <MobileSubLink href="/about#how-it-works" label="How It Works" active={false} />
              </MobileMenuGroup>

              <MobileMenuGroup
                label="Chapters"
                expanded={mobileExpanded === 'chapters'}
                active={isActive('/chapters')}
                onToggle={() => toggleMobileSection('chapters')}
              >
                {areasWithChapters.map(area => (
                  <MobileMenuGroup
                    key={area.id}
                    nested
                    label={area.name}
                    expanded={mobileExpandedArea === area.id}
                    active={false}
                    onToggle={() => toggleMobileArea(area.id)}
                  >
                    {area.chapters.map(chapter => {
                      const href = `/chapters/${area.slug}-${chapter.slug}`
                      return chapter.is_active === false ? (
                        <span
                          key={chapter.id}
                          className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-brand-silver/40 min-h-[44px]"
                          title="Coming soon"
                        >
                          <span className="truncate">{chapter.name}</span>
                          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-champagne/70 border border-brand-gold/30">
                            Coming Soon
                          </span>
                        </span>
                      ) : (
                        <MobileSubLink key={chapter.id} href={href} label={chapter.name} active={pathname === href} />
                      )
                    })}
                  </MobileMenuGroup>
                ))}
              </MobileMenuGroup>

              <MobileMenuGroup
                label="Categories"
                expanded={mobileExpanded === 'categories'}
                active={isActive('/categories')}
                onToggle={() => toggleMobileSection('categories')}
              >
                {featuredCategories.map(cat => {
                  const href = `/categories/${cat.slug}`
                  return (
                    <MobileSubLink key={cat.id} href={href} label={cat.name} active={pathname === href} />
                  )
                })}
                <MobileSubLink href="/categories" label="View All Categories →" active={pathname === '/categories'} />
              </MobileMenuGroup>

              <MobileMenuGroup
                label="Join UCCI"
                expanded={mobileExpanded === 'join'}
                active={isActive('/join')}
                onToggle={() => toggleMobileSection('join')}
              >
                <MobileSubLink href="/join" label="Become a Member" active={pathname === '/join'} />
                <MobileSubLink href="/join?tab=head" label="Start a Chapter" active={false} />
              </MobileMenuGroup>

              <MobileMenuLink href="/contact" label="Contact Us" active={isActive('/contact')} />

              <MobileMenuGroup
                label="Gallery"
                expanded={mobileExpanded === 'gallery'}
                active={isActive('/gallery')}
                onToggle={() => toggleMobileSection('gallery')}
              >
                <MobileSubLink href="/gallery" label="News" active={pathname === '/gallery'} />
                <MobileSubLink href="/gallery?tab=events" label="Events" active={false} />
                <MobileSubLink href="/gallery?tab=videos" label="Videos" active={false} />
              </MobileMenuGroup>

              {profile && (profile.role === 'super_admin' || profile.role === 'chapter_head') && (
                <MobileMenuLink href="/admin" label="Admin Dashboard" active={isActive('/admin')} />
              )}

              {/* CTA / auth footer inside the card */}
              <div className="p-1 pt-2 mt-1 border-t border-brand-gold/15">
                {profile ? (
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-brand-white truncate">{profile.full_name}</div>
                      <div className="text-xs text-brand-silver truncate">{profile.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex-shrink-0 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 px-3 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 text-[15px] leading-none"
                  >
                    Sign In <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
          </nav>
          </div>
        </div>
      )}
    </header>
  )
}
