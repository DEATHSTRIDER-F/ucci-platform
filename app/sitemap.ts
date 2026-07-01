import { createServerSupabaseClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/utils/absoluteUrl'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient()

  const now = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/gallery'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/categories'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/join'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Areas + Chapters
  const { data: areas } = await supabase
    .from('areas')
    .select('slug, updated_at, chapters(slug, updated_at)')

  const chapterPages: MetadataRoute.Sitemap = []
  for (const area of areas ?? []) {
    for (const chapter of (area.chapters as Array<{ slug: string; updated_at: string }>) ?? []) {
      chapterPages.push({
        url: absoluteUrl(`/chapters/${area.slug}-${chapter.slug}`),
        lastModified: chapter.updated_at,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map(cat => ({
    url: absoluteUrl(`/categories/${cat.slug}`),
    lastModified: cat.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Approved member profiles only
  const { data: members } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('status', 'approved')

  const memberPages: MetadataRoute.Sitemap = (members ?? []).map(m => ({
    url: absoluteUrl(`/members/${m.id}`),
    lastModified: m.updated_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...chapterPages, ...categoryPages, ...memberPages]
}
