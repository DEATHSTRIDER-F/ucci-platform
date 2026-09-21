export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { MembersTable } from '@/components/admin/MembersTable'

export const metadata = {
  title: 'Members | Admin',
}

export default async function AdminMembersPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'super_admin' && profile.role !== 'chapter_head') redirect('/unauthorized')
  const supabase = await createServerSupabaseClient()
  const isSuperAdmin = profile.role === 'super_admin'

  // Fetch approved members AND heads — heads show with a badge, not hidden
  const page = 1
  const pageSize = 50
  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      business_name,
      email,
      role,
      created_at,
      chapter:chapters(id, name, area:areas(name)),
      category:categories(name)
    `, { count: 'exact' })
    .eq('status', 'approved')
    .neq('role', 'super_admin')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  // Apply scope
  if (!isSuperAdmin && profile.chapter_id) {
    query = query.eq('chapter_id', profile.chapter_id)
  }

  const { data: members, error, count } = await query

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
          {count ?? members.length} Total Members {count !== null && count > pageSize ? `· showing ${members.length}` : ''}
        </div>
        <Link href="/admin/members/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Member (Offline)
        </Link>
      </div>

      <MembersTable
        members={(members ?? []).map((member: Record<string, unknown>) => {
          const ch = Array.isArray(member.chapter) ? member.chapter[0] : member.chapter
          const chObj = ch as { name?: string; area?: unknown } | undefined
          const areaObj = chObj?.area
          const area = Array.isArray(areaObj) ? areaObj[0] : areaObj
          const cat = Array.isArray(member.category) ? member.category[0] : member.category
          return {
            id: member.id as string,
            full_name: member.full_name as string,
            business_name: (member.business_name as string | null) ?? null,
            email: member.email as string,
            role: member.role as string,
            created_at: member.created_at as string,
            chapterName: (chObj?.name as string | undefined) ?? null,
            areaName: ((area as { name?: string } | undefined)?.name) ?? null,
            categoryName: ((cat as { name?: string } | undefined)?.name) ?? null,
          }
        })}
        total={count ?? members.length}
        pageSize={pageSize}
      />
    </div>
  )
}
