'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireActionAuth, chapterScopeError } from '@/lib/auth/requireActionAuth'
import { revalidatePath } from 'next/cache'
import { extractYouTubeId, youTubeWatchUrl } from '@/lib/utils/youtube'
import type { GalleryPostType } from '@/lib/types/database'

const BUCKET = 'ucci-media'

async function uploadGalleryImage(b64: string, postId: string, imageId: string): Promise<string | null> {
  const supabase = await createAdminClient()
  const base64Data = b64.split(',')[1]
  if (!base64Data) return null

  const buffer = Buffer.from(base64Data, 'base64')
  const blob = new Blob([buffer], { type: 'image/webp' })
  const path = `gallery/${postId}/${imageId}.webp`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true })

  if (error) { console.error('Gallery image upload error:', error); return null }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function resolveYouTube(input: string | null | undefined): { url: string; videoId: string } | null | { error: string } {
  if (!input?.trim()) return null
  const videoId = extractYouTubeId(input)
  if (!videoId) return { error: 'Invalid YouTube link. Use a watch, shorts, youtu.be, or embed URL.' }
  return { url: youTubeWatchUrl(videoId), videoId }
}

export async function createGalleryPost(data: {
  title: string
  content: string | null
  post_type: GalleryPostType
  youtube_url?: string | null
  area_id: string | null
  chapter_id: string | null
  created_by: string
  images: Array<{ b64: string; alt_text: string; display_order: number }>
}): Promise<{ success: boolean; error?: string }> {
  if (!data.title?.trim()) return { success: false, error: 'Title is required.' }
  const postType: GalleryPostType = data.post_type ?? 'event'
  if (!['news', 'event', 'video'].includes(postType)) return { success: false, error: 'Invalid post type.' }

  // Per-type validation
  let youtubeUrl: string | null = null
  let youtubeVideoId: string | null = null
  if (postType === 'video') {
    const yt = resolveYouTube(data.youtube_url)
    if (yt && 'error' in yt) return { success: false, error: yt.error }
    if (!yt) return { success: false, error: 'YouTube link is required for videos.' }
    youtubeUrl = yt.url
    youtubeVideoId = yt.videoId
  } else if (postType === 'news') {
    const yt = resolveYouTube(data.youtube_url)
    if (yt && 'error' in yt) return { success: false, error: yt.error }
    if (yt) { youtubeUrl = yt.url; youtubeVideoId = yt.videoId }
    if (!data.images?.length && !yt) return { success: false, error: 'News needs at least one image or a YouTube link.' }
  } else {
    if (!data.images?.length) return { success: false, error: 'At least one image is required.' }
  }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  const { caller } = auth

  // Chapter heads can only post into their own chapter — never trust the
  // client-supplied chapter_id / created_by.
  let chapterId = data.chapter_id
  if (caller.role === 'chapter_head') {
    if (!caller.chapter_id) return { success: false, error: 'No chapter assigned to your account.' }
    chapterId = caller.chapter_id
  }

  const supabase = await createAdminClient()

  // Create post
  const { data: post, error: postError } = await supabase
    .from('gallery_posts')
    .insert({
      title: data.title,
      content: data.content,
      post_type: postType,
      youtube_url: youtubeUrl,
      youtube_video_id: youtubeVideoId,
      area_id: data.area_id,
      chapter_id: chapterId,
      created_by: caller.id,
    })
    .select()
    .single()

  if (postError || !post) return { success: false, error: postError?.message ?? 'Failed to create post.' }

  // Videos carry no images
  if (postType === 'video') {
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true }
  }

  // Upload images and create gallery_images records
  const imageInserts = []
  for (const img of data.images) {
    const imageId = crypto.randomUUID()
    const imageUrl = await uploadGalleryImage(img.b64, post.id, imageId)
    if (!imageUrl) continue
    imageInserts.push({
      id: imageId,
      post_id: post.id,
      image_url: imageUrl,
      alt_text: img.alt_text,
      display_order: img.display_order,
    })
  }

  if (imageInserts.length === 0) {
    await supabase.from('gallery_posts').delete().eq('id', post.id)
    return { success: false, error: 'All image uploads failed. Please try again.' }
  }

  const { error: imgError } = await supabase.from('gallery_images').insert(imageInserts)
  if (imgError) return { success: false, error: imgError.message }

  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function updateGalleryPost(
  postId: string,
  data: {
    title: string
    content: string | null
    post_type: GalleryPostType
    youtube_url?: string | null
    area_id: string | null
    chapter_id: string | null
    images: Array<{
      id?: string
      b64?: string
      image_url?: string
      alt_text: string
      display_order: number
    }>
  }
): Promise<{ success: boolean; error?: string }> {
  if (!data.title?.trim()) return { success: false, error: 'Title is required.' }
  const postType: GalleryPostType = data.post_type ?? 'event'
  if (!['news', 'event', 'video'].includes(postType)) return { success: false, error: 'Invalid post type.' }

  let youtubeUrl: string | null = null
  let youtubeVideoId: string | null = null
  if (postType === 'video') {
    const yt = resolveYouTube(data.youtube_url)
    if (yt && 'error' in yt) return { success: false, error: yt.error }
    if (!yt) return { success: false, error: 'YouTube link is required for videos.' }
    youtubeUrl = yt.url
    youtubeVideoId = yt.videoId
  } else if (postType === 'news') {
    const yt = resolveYouTube(data.youtube_url)
    if (yt && 'error' in yt) return { success: false, error: yt.error }
    if (yt) { youtubeUrl = yt.url; youtubeVideoId = yt.videoId }
    if (!data.images?.length && !yt) return { success: false, error: 'News needs at least one image or a YouTube link.' }
  } else {
    if (!data.images?.length) return { success: false, error: 'At least one image is required.' }
  }

  const supabase = await createAdminClient()

  // Authorize against the post's current chapter (not client input)
  const { data: existing } = await supabase
    .from('gallery_posts')
    .select('id, chapter_id')
    .eq('id', postId)
    .single()
  if (!existing) return { success: false, error: 'Post not found.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  const scopeError = chapterScopeError(
    auth.caller,
    (existing as { chapter_id?: string | null }).chapter_id
  )
  if (scopeError) return { success: false, error: scopeError }

  // Chapter heads cannot move posts out of their chapter
  const chapterId =
    auth.caller.role === 'chapter_head' ? (existing as { chapter_id?: string | null }).chapter_id ?? null : data.chapter_id

  // Update post fields
  const { error: postError } = await supabase
    .from('gallery_posts')
    .update({
      title: data.title,
      content: data.content,
      post_type: postType,
      youtube_url: youtubeUrl,
      youtube_video_id: youtubeVideoId,
      area_id: data.area_id,
      chapter_id: chapterId,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (postError) return { success: false, error: postError.message }

  // Handle Images
  const { data: existingImages } = await supabase
    .from('gallery_images')
    .select('id, image_url')
    .eq('post_id', postId)

  const existingImageIds = new Set((existingImages || []).map(img => img.id))

  if (postType === 'video') {
    // Videos carry no images — purge any leftovers
    if (existingImageIds.size > 0) {
      const paths = [...existingImageIds].map(id => `gallery/${postId}/${id}.webp`)
      await supabase.storage.from(BUCKET).remove(paths)
      await supabase.from('gallery_images').delete().eq('post_id', postId)
    }
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true }
  }

  const incomingIds = new Set(data.images.map(img => img.id).filter(Boolean))

  // Images to delete
  const idsToDelete = [...existingImageIds].filter(id => !incomingIds.has(id))
  
  if (idsToDelete.length > 0) {
    const pathsToDelete = idsToDelete.map(id => `gallery/${postId}/${id}.webp`)
    await supabase.storage.from(BUCKET).remove(pathsToDelete)
    await supabase.from('gallery_images').delete().in('id', idsToDelete)
  }

  // Update existing or insert new images
  for (const img of data.images) {
    if (img.id && existingImageIds.has(img.id)) {
      // Update existing
      await supabase
        .from('gallery_images')
        .update({
          alt_text: img.alt_text,
          display_order: img.display_order
        })
        .eq('id', img.id)
    } else if (img.b64) {
      // Insert new
      const newImageId = crypto.randomUUID()
      const imageUrl = await uploadGalleryImage(img.b64, postId, newImageId)
      if (imageUrl) {
        await supabase.from('gallery_images').insert({
          id: newImageId,
          post_id: postId,
          image_url: imageUrl,
          alt_text: img.alt_text,
          display_order: img.display_order
        })
      }
    }
  }

  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
  return { success: true }
}

export async function deleteGalleryPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: existing } = await supabase
    .from('gallery_posts')
    .select('id, chapter_id')
    .eq('id', postId)
    .single()
  if (!existing) return { success: false, error: 'Post not found.' }

  const auth = await requireActionAuth(['super_admin', 'chapter_head'])
  if (!auth.ok) return { success: false, error: auth.error }
  const scopeError = chapterScopeError(
    auth.caller,
    (existing as { chapter_id?: string | null }).chapter_id
  )
  if (scopeError) return { success: false, error: scopeError }

  // List and delete all images from storage
  const { data: images } = await supabase.from('gallery_images').select('id').eq('post_id', postId)
  if (images?.length) {
    const paths = images.map(img => `gallery/${postId}/${img.id}.webp`)
    await supabase.storage.from(BUCKET).remove(paths)
  }

  const { error } = await supabase.from('gallery_posts').delete().eq('id', postId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
  return { success: true }
}
