import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Use service-role client without cookies — safe for public nav data and allowed inside unstable_cache
function getPublicSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Cached for 5 min — categories/areas rarely change, but are fetched on EVERY page via layout
// Without cache this added 2 DB round-trips to TTFB of every public + admin page
export const getNavData = unstable_cache(
  async () => {
    const supabase = getPublicSupabase()
    const [featuredRes, areasRes] = await Promise.all([
      supabase.from('categories').select('id, name, slug').eq('is_featured', true).order('name').limit(5),
      supabase.from('areas').select('id, name, slug, chapters(id, name, slug)').order('name'),
    ])
    return {
      featuredCategories: (featuredRes.data ?? []) as { id: string; name: string; slug: string }[],
      areasWithChapters: (areasRes.data ?? []) as { id: string; name: string; slug: string; chapters: { id: string; name: string; slug: string }[] }[],
    }
  },
  ['nav-data'],
  { revalidate: 300, tags: ['nav'] }
)
