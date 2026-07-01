import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client — uses the ANON key.
 * Safe for client-side use; restricted by RLS policies.
 * Used for: public reads, auth session management, public inserts (inquiries).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
