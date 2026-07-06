import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditGalleryFormClient } from '@/components/admin/EditGalleryFormClient'

export const metadata = { title: 'Edit Gallery Post | UCCI Admin' }

export default async function EditGalleryPostPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role, chapter_id').eq('id', user!.id).single()
  
  if (!profile) redirect('/login')

  const { data: post } = await supabase
    .from('gallery_posts')
    .select('*, images:gallery_images(id, image_url, alt_text, display_order)')
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  // Ensure chapter admin can only edit their own chapter's posts
  if (profile.role === 'chapter_admin' && profile.chapter_id !== post.chapter_id) {
    redirect('/unauthorized')
  }

  const { data: areas } = await supabase.from('areas').select('id, name, chapters(id, name)').order('name')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Edit Gallery Post</h1>
      <p className="text-brand-silver mb-6">Update details and manage photos for this post.</p>
      
      <EditGalleryFormClient 
        post={post as any}
        areas={areas ?? []}
        adminProfile={{ id: profile.id, role: profile.role, chapter_id: profile.chapter_id }}
      />
    </div>
  )
}