/**
 * Generates absolute URLs using NEXT_PUBLIC_SITE_URL environment variable.
 * Used for canonical links, OpenGraph URLs, and sitemap entries.
 * Requirement 17.6: All absolute URLs must use NEXT_PUBLIC_SITE_URL.
 */

export function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    // Fallback for development
    return 'http://localhost:3000'
  }
  // Strip trailing slash
  return siteUrl.replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function memberUrl(id: string): string {
  return absoluteUrl(`/members/${id}`)
}

export function chapterUrl(slug: string): string {
  return absoluteUrl(`/chapters/${slug}`)
}

export function categoryUrl(slug: string): string {
  return absoluteUrl(`/categories/${slug}`)
}
