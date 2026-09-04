import { cache } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getCurrentProfile = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('id, full_name, email, role, chapter_id, status, logo_url').eq('id', user.id).single()
  return data as { id: string; full_name: string; email: string; role: string; chapter_id: string | null; status: string; logo_url: string | null } | null
})
