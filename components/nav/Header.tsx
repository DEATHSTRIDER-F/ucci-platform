'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, ChevronRight, LogOut, User, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GlobalSearch } from '@/components/search/GlobalSearch'

interface AreaWithChapters {
  id: string
  name: string
  slug: string
  chapters: Array<{ id: string; name: string; slug: string }>
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

export function Header({ profile, featuredCategories, areasWithChapters }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
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
  }, [pathname])

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearDropdownTimer()
    clearChapterAreaTimer()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
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

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {/* <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-display font-bold text-brand-navy text-lg"> */}
            <div className="h-auto w-auto">
              <Image src="/ucci.png" alt="Logo" className="opacity-" width={40} height={10} />
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
                                <Link
                                  key={chapter.id}
                                  href={`/chapters/${area.slug}-${chapter.slug}`}
                                  className="block px-4 py-2 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors"
                                >
                                  {chapter.name}
                                </Link>
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

            {/* Start a Chapter */}
            <Link href="/join" className={navLinkClass('/join')}>
              Start a Chapter
            </Link>

            {/* Contact */}
            <Link href="/contact" className={navLinkClass('/contact')}>Contact Us</Link>

            {/* Gallery */}
            <Link href="/gallery" className={navLinkClass('/gallery')}>Gallery</Link>

            {/* Admin link for admins */}
            {profile && (profile.role === 'super_admin' || profile.role === 'chapter_admin') && (
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
                <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-gold" />
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm text-brand-silver hover:text-red-400 flex items-center gap-1"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
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

      {/* Mobile Search */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-brand-sapphire border-t border-brand-gold/20 animate-fade-in p-4">
          <GlobalSearch />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-brand-sapphire border-t border-brand-gold/20 animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            <Link href="/" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Home</Link>
            <Link href="/about" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Our Story</Link>
            <Link href="/about#how-it-works" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">How It Works</Link>

            {/* Mobile Chapters */}
            <div className="py-2">
              <div className="px-3 py-1 text-xs text-brand-champagne font-semibold uppercase tracking-wider">Chapters</div>
              {areasWithChapters.map(area => (
                <div key={area.id}>
                  <div className="px-6 py-1 text-xs text-brand-silver/60 font-medium">{area.name}</div>
                  {area.chapters.map(chapter => (
                    <Link
                      key={chapter.id}
                      href={`/chapters/${area.slug}-${chapter.slug}`}
                      className="block py-2 px-8 text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 rounded transition-colors"
                    >
                      {chapter.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <Link href="/categories" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Categories</Link>

            <Link href="/join" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Start a Chapter</Link>

            <Link href="/contact" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Contact Us</Link>
            <Link href="/gallery" className="block py-3 px-3 text-brand-silver hover:text-brand-gold rounded-lg hover:bg-brand-navy/50 transition-colors">Gallery</Link>

            {profile && (profile.role === 'super_admin' || profile.role === 'chapter_admin') && (
              <Link href="/admin" className="block py-3 px-3 text-brand-gold font-semibold rounded-lg hover:bg-brand-navy/50 transition-colors">Admin Dashboard</Link>
            )}

            {/* Mobile Auth */}
            <div className="border-t border-brand-gold/20 mt-2 pt-3">
              {profile ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-brand-white">{profile.full_name}</div>
                    <div className="text-xs text-brand-silver">{profile.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 px-3"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn-primary block text-center mx-3">Sign In</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
