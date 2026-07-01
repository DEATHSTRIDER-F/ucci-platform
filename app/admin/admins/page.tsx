import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminsManagerClient } from '@/components/admin/AdminsManagerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chapter Admins | UCCI Admin' }

export default async function AdminsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'super_admin') redirect('/admin')

  const { data: adminsRaw } = await supabase
    .from('profiles')
    .select('*, chapter:chapters(name, area:areas(name))')
    .eq('role', 'chapter_admin')
    .order('full_name')

  const { data: chaptersRaw } = await supabase
    .from('chapters')
    .select('id, name, slug, area:areas(name)')
    .order('name')

  // Flatten Supabase join shape: area can be array or object depending on version
  const chapters = (chaptersRaw ?? []).map(ch => ({
    id: ch.id as string,
    name: ch.name as string,
    slug: ch.slug as string,
    area: Array.isArray(ch.area)
      ? (ch.area[0] as { name: string } | undefined) ?? null
      : (ch.area as { name: string } | null),
  }))

  // Normalize Supabase join arrays → AdminItem shape
  const admins = (adminsRaw ?? []).map(admin => {
    const rawChapter = Array.isArray(admin.chapter) ? admin.chapter[0] : admin.chapter
    const rawArea = rawChapter && (Array.isArray((rawChapter as { area?: unknown }).area) ? (rawChapter as { area?: unknown[] }).area![0] : (rawChapter as { area?: unknown }).area)
    return {
      id: admin.id as string,
      full_name: admin.full_name as string,
      email: admin.email as string,
      role: admin.role as string,
      chapter: rawChapter ? { name: (rawChapter as { name: string }).name, area: rawArea ? { name: (rawArea as { name: string }).name } : undefined } : null,
    }
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Chapter Admins</h1>
      <p className="text-brand-silver mb-6">Create and manage chapter administrator accounts.</p>
      <AdminsManagerClient admins={admins} chapters={chapters} />
    </div>
  )
}
