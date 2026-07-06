'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Tag, MapPin, Calendar, Image, MessageSquare, Settings, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login?redirectTo=/admin'
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .single()

      if (!data || (data.role !== 'super_admin' && data.role !== 'chapter_admin')) {
        window.location.href = '/unauthorized'
        return
      }

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    )
  }

  const isSuperAdmin = profile.role === 'super_admin'

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { href: '/admin/applications', icon: FileText, label: 'Applications' },
    { href: '/admin/members', icon: Users, label: 'Members' },
    { href: '/admin/inquiries', icon: MessageSquare, label: 'Lead Inquiries' },
    { href: '/admin/availability', icon: Calendar, label: 'Availability' },
    { href: '/admin/gallery', icon: Image, label: 'Manage Gallery' },
    ...(isSuperAdmin ? [
      { href: '/admin/categories', icon: Tag, label: 'Categories' },
      { href: '/admin/areas', icon: MapPin, label: 'Areas & Chapters' },
      { href: '/admin/admins', icon: Users, label: 'Chapter Admins' },
      { href: '/admin/slides', icon: Settings, label: 'Hero Slides' },
      { href: '/admin/contacts', icon: MessageSquare, label: 'Contact Inquiries' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-brand-navy flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-sapphire border-r border-brand-gold/20 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-brand-gold/20">
          <div className="text-brand-gold font-display font-bold text-lg">Admin Panel</div>
          <div className="text-brand-silver text-sm mt-1">{profile.full_name}</div>
          <div className="text-brand-silver/60 text-xs">{profile.email}</div>
          <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-brand-gold/20 text-brand-gold' : 'bg-brand-sapphire/80 text-brand-champagne border border-brand-champagne/30'}`}>
            {isSuperAdmin ? 'Super Admin' : 'Chapter Admin'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  isActive 
                    ? 'bg-brand-gold/10 text-brand-gold font-medium border-l-2 border-brand-gold' 
                    : 'text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 border-l-2 border-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-gold' : 'text-brand-silver/60 group-hover:text-brand-gold'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-brand-gold/20">
          <Link href="/" className="flex items-center gap-2 text-brand-silver/60 hover:text-brand-silver text-sm transition-colors">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
