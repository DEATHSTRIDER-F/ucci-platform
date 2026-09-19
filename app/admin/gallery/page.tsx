export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Image as ImageIcon, Edit, PlayCircle, Newspaper, CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/utils/utils'
import { DeleteGalleryPostButton } from '@/components/admin/DeleteGalleryPostButton'
import { GalleryAdminFilter } from '@/components/admin/GalleryAdminFilter'
import { youTubeThumbnail } from '@/lib/utils/youtube'
import Image from 'next/image'

export const metadata = { title: 'Manage Gallery | UCCI Admin' }

const TYPE_META = {
  news: { label: 'News', icon: Newspaper, badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  event: { label: 'Event', icon: CalendarDays, badge: 'bg-green-500/20 text-green-300 border-green-500/30' },
  video: { label: 'Video', icon: PlayCircle, badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
} as const

export default async function ManageGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type: rawType } = await searchParams
  const filter = rawType === 'news' || rawType === 'event' || rawType === 'video' ? rawType : 'all'

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role, chapter_id').eq('id', user!.id).single()

  if (!profile) redirect('/login')

  // Super admins see all, chapter admins see only theirs. Members never reach here (admin layout gate).
  let query = supabase
    .from('gallery_posts')
    .select('*, images:gallery_images(id, image_url, display_order), chapter:chapters(name), area:areas(name)')
    .order('created_at', { ascending: false })

  if (profile.role === 'chapter_admin' && profile.chapter_id) {
    query = query.eq('chapter_id', profile.chapter_id)
  }
  if (filter !== 'all') {
    query = query.eq('post_type', filter)
  }

  const { data: posts } = await query

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-white mb-1">Manage Gallery</h1>
          <p className="text-brand-silver text-sm">Full control over News, Events, and Videos. Members cannot edit these.</p>
        </div>
        <Link href="/admin/gallery/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Post
        </Link>
      </div>

      <GalleryAdminFilter active={filter} />

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
            const postType = (post.post_type ?? 'event') as keyof typeof TYPE_META
            const meta = TYPE_META[postType] ?? TYPE_META.event
            const TypeIcon = meta.icon
            const images = [...(post.images || [])].sort((a, b) => a.display_order - b.display_order)
            const thumb = postType === 'video' && post.youtube_video_id
              ? youTubeThumbnail(post.youtube_video_id)
              : images[0]?.image_url ?? null
            const chapterName = Array.isArray(post.chapter) ? post.chapter[0]?.name : post.chapter?.name
            const areaName = Array.isArray(post.area) ? post.area[0]?.name : post.area?.name

            return (
              <div key={post.id} className="glass-card overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-brand-navy/50 border-b border-brand-gold/10">
                  {thumb ? (
                    <Image src={thumb} alt={post.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-brand-silver/20" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-xs px-2 py-1 rounded border bg-brand-navy/80 backdrop-blur-sm">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-medium ${meta.badge}`}>
                      <TypeIcon className="w-3 h-3" /> {meta.label}
                    </span>
                  </div>
                  {postType !== 'video' && (
                    <div className="absolute top-2 right-2 bg-brand-navy/80 text-brand-gold text-xs px-2 py-1 rounded">
                      {images.length} photos
                    </div>
                  )}
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
