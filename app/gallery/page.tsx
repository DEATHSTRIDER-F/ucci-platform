import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildGalleryMetadata } from '@/lib/seo/metadata'
import { MasonryGallery } from '@/components/gallery/MasonryGallery'
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
          <MasonryGallery posts={posts as any} />
        )}
      </section>
    </div>
  )
}
