import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Image as ImageIcon, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/utils'
import { DeleteGalleryPostButton } from '@/components/admin/DeleteGalleryPostButton'
import Image from 'next/image'

export const metadata = { title: 'Manage Gallery | UCCI Admin' }

export default async function ManageGalleryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role, chapter_id').eq('id', user!.id).single()
  
  if (!profile) redirect('/login')

  // Super admins see all, chapter admins see only theirs
  let query = supabase
    .from('gallery_posts')
    .select('*, images:gallery_images(id, image_url, display_order), chapter:chapters(name), area:areas(name)')
    .order('created_at', { ascending: false })

  if (profile.role === 'chapter_admin' && profile.chapter_id) {
    query = query.eq('chapter_id', profile.chapter_id)
  }

  const { data: posts } = await query

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-white mb-1">Manage Gallery</h1>
          <p className="text-brand-silver text-sm">View, edit, and manage gallery posts.</p>
        </div>
        <Link href="/admin/gallery/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ImageIcon className="w-12 h-12 text-brand-silver/20 mx-auto mb-3" />
          <h2 className="text-brand-white font-medium">No gallery posts found</h2>
          <p className="text-brand-silver text-sm mt-1 mb-4">Get started by creating your first post.</p>
          <Link href="/admin/gallery/new" className="btn-outline inline-block">Add Post</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map(post => {
            const images = [...(post.images || [])].sort((a, b) => a.display_order - b.display_order)
            const primaryImage = images[0]
            const chapterName = Array.isArray(post.chapter) ? post.chapter[0]?.name : post.chapter?.name
            const areaName = Array.isArray(post.area) ? post.area[0]?.name : post.area?.name

            return (
              <div key={post.id} className="glass-card overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-brand-navy/50 border-b border-brand-gold/10">
                  {primaryImage ? (
                    <Image src={primaryImage.image_url} alt={post.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-brand-silver/20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-brand-navy/80 text-brand-gold text-xs px-2 py-1 rounded">
                    {images.length} photos
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-brand-white text-lg line-clamp-1">{post.title}</h3>
                  <div className="text-xs text-brand-silver/60 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                    <span>{formatDate(post.created_at)}</span>
                    {(chapterName || areaName) && (
                      <span>&bull; {chapterName || areaName}</span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 flex gap-2">
                    <Link href={`/admin/gallery/${post.id}`} className="flex-1 btn-outline py-1.5 px-3 text-xs flex items-center justify-center gap-1.5">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <DeleteGalleryPostButton postId={post.id} title={post.title} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
