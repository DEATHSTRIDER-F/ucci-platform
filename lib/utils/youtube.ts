/** Extract an 11-char YouTube video ID from watch / shorts / youtu.be / embed / live URLs. */
export function extractYouTubeId(input: string): string | null {
  const url = input.trim()
  if (!url) return null
  // Raw 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url
  const patterns = [
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

export function youTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
