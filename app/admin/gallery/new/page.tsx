import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GalleryFormClient } from '@/components/admin/GalleryFormClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Gallery Post | UCCI Admin' }

export default async function NewGalleryPostPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role, chapter_id').eq('id', user!.id).single()
  if (!profile) redirect('/login')

  const { data: areas } = await supabase.from('areas').select('id, name, chapters(id, name)').order('name')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Add Gallery Post</h1>
      <p className="text-brand-silver mb-6">Share event photos from your chapter.</p>
      <GalleryFormClient
        areas={areas ?? []}
        adminProfile={{ id: profile.id, role: profile.role, chapter_id: profile.chapter_id }}
      />
    </div>
  )
}
