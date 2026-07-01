import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Tag, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Members | Admin',
}

export default async function AdminMembersPage() {
  const supabase = await createServerSupabaseClient()

  // Get auth user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile to check role and chapter
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, chapter_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'chapter_admin')) {
    redirect('/unauthorized')
  }

  const isSuperAdmin = profile.role === 'super_admin'

  // Fetch approved members
  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      business_name,
      email,
      created_at,
      chapter:chapters(id, name, area:areas(name)),
      category:categories(name)
    `)
    .eq('status', 'approved')
    .neq('role', 'super_admin')
    .neq('role', 'chapter_admin')

  // Apply scope
  if (!isSuperAdmin && profile.chapter_id) {
    query = query.eq('chapter_id', profile.chapter_id)
  }

  const { data: members, error } = await query

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Failed to load members: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-white">Members Directory</h1>
          <p className="text-brand-silver text-sm mt-1">
            {isSuperAdmin ? 'Viewing all approved members globally' : 'Viewing approved members in your chapter'}
          </p>
        </div>
        <div className="bg-brand-sapphire px-4 py-2 rounded-lg border border-brand-gold/20 text-brand-gold font-medium">
          {members.length} Total Members
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-navy/50 border-b border-brand-gold/20">
              <tr>
                <th className="px-6 py-4 font-medium text-brand-silver">Member / Business</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Contact</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Chapter & Category</th>
                <th className="px-6 py-4 font-medium text-brand-silver">Joined</th>
                <th className="px-6 py-4 font-medium text-brand-silver text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-silver/60">
                    No approved members found.
                  </td>
                </tr>
              ) : (
                members.map((member: any) => {
                  const chapterName = Array.isArray(member.chapter) ? member.chapter[0]?.name : member.chapter?.name
                  const areaName = Array.isArray(member.chapter) ? (Array.isArray(member.chapter[0]?.area) ? member.chapter[0]?.area[0]?.name : member.chapter[0]?.area?.name) : (Array.isArray(member.chapter?.area) ? member.chapter?.area[0]?.name : member.chapter?.area?.name)
                  const categoryName = Array.isArray(member.category) ? member.category[0]?.name : member.category?.name

                  return (
                    <tr key={member.id} className="hover:bg-brand-navy/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-brand-white">{member.business_name || member.full_name}</div>
                        {member.business_name && <div className="text-brand-silver/60 text-xs mt-0.5">{member.full_name}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-brand-silver">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-champagne mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{chapterName} ({areaName})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-silver/60 text-xs">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-silver">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="inline-flex items-center gap-1 text-brand-gold hover:text-brand-champagne transition-colors text-sm font-medium"
                        >
                          View Profile <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}