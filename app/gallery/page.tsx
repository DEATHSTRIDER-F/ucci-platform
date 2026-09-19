import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildGalleryMetadata } from '@/lib/seo/metadata'
import { MasonryGallery } from '@/components/gallery/MasonryGallery'
import { GalleryTabs, parseGalleryTab } from '@/components/gallery/GalleryTabs'
import { VideoGrid } from '@/components/gallery/VideoGrid'
import { Camera, Newspaper, CalendarDays, PlayCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = buildGalleryMetadata()

export const dynamic = 'force-dynamic'

const EMPTY = {
  title: 'Nothing here yet',
  subtitle: 'Check back soon for updates!',
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab } = await searchParams
  const tab = parseGalleryTab(rawTab ?? null)
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

  const all = posts ?? []
  const news = all.filter(p => (p.post_type ?? 'event') === 'news')
  const events = all.filter(p => (p.post_type ?? 'event') === 'event')
  const videos = all.filter(p => p.post_type === 'video')

  const counts = { news: news.length, events: events.length, videos: videos.length }

  const copy = {
    news: { title: 'UCCI News', subtitle: 'Latest announcements, coverage, and highlights from across chapters', icon: Newspaper },
    events: { title: 'UCCI Events', subtitle: 'Meetings, gatherings, and moments from UCCI chapters', icon: CalendarDays },
    videos: { title: 'UCCI Videos', subtitle: 'Watch talks, recaps, and stories from the community', icon: PlayCircle },
  }[tab]

  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="section-title">
            UCCI <span className="text-gradient-gold">{copy.title.replace('UCCI ', '')}</span>
          </h1>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="Gallery sections">
        <Suspense fallback={<div className="text-center text-brand-silver py-6">Loading...</div>}>
          <GalleryTabs counts={counts} />
        </Suspense>

        {tab === 'videos' ? (
          videos.length === 0 ? (
            <EmptyState message={EMPTY} />
          ) : (
            <VideoGrid videos={videos as never} />
          )
        ) : tab === 'events' ? (
          events.length === 0 ? (
            <EmptyState message={EMPTY} />
          ) : (
            <MasonryGallery posts={events as never} />
          )
        ) : news.length === 0 ? (
          <EmptyState message={EMPTY} />
        ) : (
          <MasonryGallery posts={news as never} />
        )}
      </section>
    </div>
  )
}

function EmptyState({ message }: { message: { title: string; subtitle: string } }) {
  return (
    <div className="text-center py-20">
      <Camera className="w-16 h-16 text-brand-silver/20 mx-auto mb-4" />
      <h2 className="text-brand-silver text-xl font-display">{message.title}</h2>
      <p className="text-brand-silver/60 mt-2">{message.subtitle}</p>
    </div>
  )
}
