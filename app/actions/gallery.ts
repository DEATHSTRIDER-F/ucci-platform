'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function createGalleryPost(data: {
  title: string
  content: string | null
  area_id: string | null
  chapter_id: string | null
  created_by: string
  images: Array<{ b64: string; alt_text: string; display_order: number }>
}): Promise<{ success: boolean; error?: string }> {
  if (!data.title?.trim()) return { success: false, error: 'Title is required.' }
  if (!data.images?.length) return { success: false, error: 'At least one image is required.' }

  const supabase = await createAdminClient()

  // Create post
  const { data: post, error: postError } = await supabase
    .from('gallery_posts')
    .insert({
      title: data.title,
      content: data.content,
      area_id: data.area_id,
      chapter_id: data.chapter_id,
      created_by: data.created_by,
    })
    .select()
    .single()

  if (postError || !post) return { success: false, error: postError?.message ?? 'Failed to create post.' }

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
  return { success: true }
}

export async function deleteGalleryPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  // List and delete all images from storage
  const { data: images } = await supabase.from('gallery_images').select('id').eq('post_id', postId)
  if (images?.length) {
    const paths = images.map(img => `gallery/${postId}/${img.id}.webp`)
    await supabase.storage.from(BUCKET).remove(paths)
  }

  const { error } = await supabase.from('gallery_posts').delete().eq('id', postId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/gallery')
  return { success: true }
}
