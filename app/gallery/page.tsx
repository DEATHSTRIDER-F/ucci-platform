import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildGalleryMetadata } from '@/lib/seo/metadata'
import { ImageCarousel } from '@/components/gallery/ImageCarousel'
import { formatDate } from '@/lib/utils/utils'
import { Camera } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = buildGalleryMetadata()

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient()

  const { data: posts } = await supabase
    .from('gallery_posts')
    .select(`
      *,
      images:gallery_images(id, image_url, alt_text, display_order),
      area:areas(name),
      chapter:chapters(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-title">
            UCCI <span className="text-gradient-gold">Gallery</span>
          </h1>
          <p className="section-subtitle">Events, meetings, and moments from UCCI chapters</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Gallery posts">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 text-brand-silver/20 mx-auto mb-4" />
            <h2 className="text-brand-silver text-xl font-display">No gallery posts yet</h2>
            <p className="text-brand-silver/60 mt-2">Check back soon for event photos!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {(posts ?? []).map(post => {
              const images = (post.images ?? []) as Array<{ id: string; image_url: string; alt_text: string; display_order: number }>
              const chapter = Array.isArray(post.chapter) ? post.chapter[0] : post.chapter
              const area = Array.isArray(post.area) ? post.area[0] : post.area
              const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)
              return (
              <article key={post.id} className="glass-card overflow-hidden">
                {/* Image Carousel */}
                {sortedImages.length > 0 && (
                  <ImageCarousel images={sortedImages} />
                )}

                {/* Post Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-display text-xl font-bold text-brand-white">{post.title}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-brand-silver/60">
                        <span>{formatDate(post.created_at)}</span>
                        {chapter && <span>· {(chapter as { name: string }).name} Chapter</span>}
                        {area && <span>· {(area as { name: string }).name}</span>}
                      </div>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-brand-silver mt-4 leading-relaxed">{post.content}</p>
                  )}
                </div>
              </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
