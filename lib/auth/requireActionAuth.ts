import { createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

export interface ActionCaller {
  id: string
  role: UserRole
  chapter_id: string | null
}

type AuthResult = { ok: true; caller: ActionCaller } | { ok: false; error: string }

/**
 * Server-action gate: derives the caller from the session (never from
 * client-supplied ids) and enforces an allowlist of roles.
 *
 * Uses the admin client only for identity lookup — RLS is NOT relied upon
 * here because most mutating actions intentionally run with the service role.
 * Every action must additionally scope its own target (e.g. a chapter_head
 * may only touch rows in their own chapter).
 */
export async function requireActionAuth(
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const supabase = await createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be logged in.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, chapter_id')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: UserRole } | null)?.role
  if (!profile || !role || !allowedRoles.includes(role)) {
    return { ok: false, error: 'You do not have permission to do this.' }
  }

  return {
    ok: true,
    caller: {
      id: user.id,
      role,
      chapter_id: (profile as { chapter_id?: string | null }).chapter_id ?? null,
    },
  }
}

/**
 * Chapter scoping for chapter_head callers. Super admins pass through.
 * Returns an error string when the target chapter is outside the caller's
 * scope, otherwise null.
 */
export function chapterScopeError(
  caller: ActionCaller,
  targetChapterId: string | null | undefined
): string | null {
  if (caller.role === 'super_admin') return null
  if (!caller.chapter_id) return 'No chapter assigned to your account.'
  if (!targetChapterId || targetChapterId !== caller.chapter_id) {
    return 'You can only manage content in your own chapter.'
  }
  return null
}
