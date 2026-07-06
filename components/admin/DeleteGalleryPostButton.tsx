'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteGalleryPost } from '@/app/actions/gallery'

export function DeleteGalleryPostButton({ postId, title }: { postId: string, title: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone and will delete all associated images.`)) return
    
    setIsDeleting(true)
    try {
      const res = await deleteGalleryPost(postId)
      if (!res.success) {
        alert(res.error || 'Failed to delete post')
      }
    } catch (err) {
      alert('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-500/20"
      aria-label="Delete post"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Delete
    </button>
  )
}