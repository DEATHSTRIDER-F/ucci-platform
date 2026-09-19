export type GalleryTab = 'news' | 'events' | 'videos'

export function parseGalleryTab(value: string | null): GalleryTab {
  if (value === 'events' || value === 'videos') return value
  return 'news'
}
