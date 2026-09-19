import type { SupabaseClient } from '@supabase/supabase-js'

export interface ResolvedChapter {
  area: { id: string; name: string; slug: string }
  chapter: {
    id: string
    name: string
    slug: string
    description: string | null
    is_active: boolean
    cover_image_url: string | null
    info: string | null
    highlights: string | null
  }
}

/**
 * Resolve a `{areaSlug}-{chapterSlug}` URL slug by exact match.
 * The naive split('-')[0] breaks for multi-word slugs (e.g. navi-mumbai-east),
 * which caused 404s — compare the full compound slug instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveChapterSlug(supabase: SupabaseClient<any>, slug: string): Promise<ResolvedChapter | null> {
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, slug, chapters(id, name, slug, description, is_active, cover_image_url, info, highlights)')

  for (const area of areas ?? []) {
    for (const ch of (area.chapters as Array<Record<string, unknown>>) ?? []) {
      if (`${area.slug}-${ch.slug}` === slug) {
        return {
          area: { id: area.id as string, name: area.name as string, slug: area.slug as string },
          chapter: {
            id: ch.id as string,
            name: ch.name as string,
            slug: ch.slug as string,
            description: (ch.description as string | null) ?? null,
            is_active: (ch.is_active as boolean) !== false,
            cover_image_url: (ch.cover_image_url as string | null) ?? null,
            info: (ch.info as string | null) ?? null,
            highlights: (ch.highlights as string | null) ?? null,
          },
        }
      }
    }
  }
  return null
}
