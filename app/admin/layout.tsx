import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Tag, MapPin, Calendar, Image, MessageSquare, Settings, Home } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'chapter_admin')) {
    redirect('/unauthorized')
  }

  const isSuperAdmin = profile.role === 'super_admin'

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { href: '/admin/applications', icon: FileText, label: 'Applications' },
    { href: '/admin/inquiries', icon: MessageSquare, label: 'Lead Inquiries' },
    { href: '/admin/availability', icon: Calendar, label: 'Availability' },
    { href: '/admin/gallery/new', icon: Image, label: 'Add Gallery Post' },
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
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 transition-colors group"
            >
              <item.icon className="w-4 h-4 text-brand-silver/60 group-hover:text-brand-gold transition-colors" />
              {item.label}
            </Link>
          ))}
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
