import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import Link from 'next/link'
import { FileText, MessageSquare, Users, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

export const metadata: Metadata = { title: 'Admin Dashboard | UCCI' }

export default async function AdminDashboard() {
  const profile = await getCurrentProfile()
  const supabase = await createServerSupabaseClient()
  const isSuperAdmin = profile?.role === 'super_admin'

  // Parallelize stats â€” was 4 sequential count queries
  const pendingBase = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const inquiryBase = supabase.from('member_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const [pendingRes, inquiryRes, memberRes, contactRes] = await Promise.all([
    (!isSuperAdmin && profile?.chapter_id ? pendingBase.eq('chapter_id', profile.chapter_id) : pendingBase),
    (!isSuperAdmin && profile?.chapter_id ? inquiryBase.eq('chapter_id', profile.chapter_id) : inquiryBase),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    isSuperAdmin ? supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }) : Promise.resolve({ count: 0 } as { count: number }),
  ])

  const pendingCount = (pendingRes as { count: number | null }).count
  const inquiryCount = (inquiryRes as { count: number | null }).count
  const memberCount = (memberRes as { count: number | null }).count
  const contactCount = (contactRes as { count: number | null }).count

  const stats = [
    { label: 'Pending Applications', value: pendingCount ?? 0, icon: FileText, href: '/admin/applications', color: 'text-yellow-400' },
    { label: 'Lead Inquiries', value: inquiryCount ?? 0, icon: MessageSquare, href: '/admin/inquiries', color: 'text-blue-400' },
    { label: 'Total Members', value: memberCount ?? 0, icon: Users, href: '/admin/applications', color: 'text-green-400' },
    ...(isSuperAdmin ? [{ label: 'Contact Inquiries', value: contactCount ?? 0, icon: Calendar, href: '/admin/contacts', color: 'text-purple-400' }] : []),
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-white mb-2">Dashboard</h1>
      <p className="text-brand-silver mb-8">Welcome back. Here&apos;s an overview of your UCCI platform.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="glass-card p-6 hover:border-brand-gold/40 transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <div className="text-brand-silver text-sm">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-brand-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/applications" className="btn-outline w-full text-sm py-2 flex items-center gap-2 justify-center">
              <FileText className="w-4 h-4" /> Review Pending Applications
            </Link>
            <Link href="/admin/inquiries" className="btn-outline w-full text-sm py-2 flex items-center gap-2 justify-center">
              <MessageSquare className="w-4 h-4" /> Review Lead Inquiries
            </Link>
            <Link href="/admin/availability" className="btn-outline w-full text-sm py-2 flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4" /> Manage Availability
            </Link>
            <Link href="/admin/gallery/new" className="btn-outline w-full text-sm py-2 flex items-center gap-2 justify-center">
              Add Gallery Post
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

