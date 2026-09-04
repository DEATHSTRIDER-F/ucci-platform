import { cache } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CurrentProfile {
  id: string
  full_name: string
  email: string
  role: string
  chapter_id: string | null
  status: string
  logo_url: string | null
}

// Single cached fetch: 1x getUser + 1x profile query per request, shared by all callers.
// Previously getCurrentUser + getCurrentProfile each called getUser separately (2x auth round-trips),
// and root + admin layouts doubled that again (4x on admin pages).
const fetchAuth = cache(async (): Promise<{ user: { id: string } | null; profile: CurrentProfile | null }> => {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }
  const { data } = await supabase.from('profiles').select('id, full_name, email, role, chapter_id, status, logo_url').eq('id', user.id).single()
  return { user: user as { id: string }, profile: (data as CurrentProfile | null) ?? null }
})

export const getAuth = fetchAuth

export const getCurrentUser = cache(async () => {
  const { user } = await fetchAuth()
  return user
})

export const getCurrentProfile = cache(async () => {
  const { profile } = await fetchAuth()
  return profile
})
