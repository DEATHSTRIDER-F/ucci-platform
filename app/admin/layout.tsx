import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuth } from '@/lib/auth/getCurrentProfile'
import { AdminNav } from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Reuses the same request-cached auth as root layout: no extra getUser round-trip.
  const { user, profile } = await getAuth()

  if (!user) redirect('/login?redirectTo=/admin')

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'chapter_admin')) {
    redirect('/unauthorized')
  }

  const isSuperAdmin = profile.role === 'super_admin'

  const navItems = [
    { href: '/admin', icon: 'Home' as const, label: 'Dashboard', exact: true },
    { href: '/admin/applications', icon: 'FileText' as const, label: 'Applications' },
    { href: '/admin/members', icon: 'Users' as const, label: 'Members' },
    { href: '/admin/inquiries', icon: 'MessageSquare' as const, label: 'Lead Inquiries' },
    { href: '/admin/availability', icon: 'Calendar' as const, label: 'Availability' },
    { href: '/admin/gallery', icon: 'Image' as const, label: 'Manage Gallery' },
    ...(isSuperAdmin ? [
      { href: '/admin/categories', icon: 'Tag' as const, label: 'Categories' },
      { href: '/admin/areas', icon: 'MapPin' as const, label: 'Areas & Chapters' },
      { href: '/admin/admins', icon: 'Users' as const, label: 'Chapter Admins' },
      { href: '/admin/slides', icon: 'Settings' as const, label: 'Hero Slides' },
      { href: '/admin/contacts', icon: 'MessageSquare' as const, label: 'Contact Inquiries' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-brand-navy flex">
      <aside className="w-64 bg-brand-sapphire border-r border-brand-gold/20 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-brand-gold/20">
          <div className="text-brand-gold font-display font-bold text-lg">Admin Panel</div>
          <div className="text-brand-silver text-sm mt-1">{profile.full_name}</div>
          <div className="text-brand-silver/60 text-xs">{profile.email}</div>
          <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-brand-gold/20 text-brand-gold' : 'bg-brand-sapphire/80 text-brand-champagne border border-brand-champagne/30'}`}>
            {isSuperAdmin ? 'Super Admin' : 'Chapter Admin'}
          </span>
        </div>
        <AdminNav navItems={navItems} />
        <div className="p-4 border-t border-brand-gold/20">
          <Link href="/" className="flex items-center gap-2 text-brand-silver/60 hover:text-brand-silver text-sm transition-colors">
            ← Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
