import { createAdminClient } from '@/lib/supabase/server'

/**
 * Validates chapter-category exclusivity before profile creation or approval.
 * Returns true if the slot is available (no approved member exists).
 * Returns false if an approved member already occupies the chapter-category pair.
 *
 * Requirement 8: Chapter Exclusivity Enforcement
 */
export async function isChapterCategoryAvailable(
  chapterId: string,
  categoryId: string,
  excludeProfileId?: string // exclude current profile when editing
): Promise<boolean> {
  const supabase = await createAdminClient()

  let query = supabase
    .from('profiles')
    .select('id')
    .eq('chapter_id', chapterId)
    .eq('category_id', categoryId)
    .eq('status', 'approved')

  if (excludeProfileId) {
    query = query.neq('id', excludeProfileId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Exclusivity check error:', error)
    throw new Error('Failed to validate chapter-category exclusivity.')
  }

  return data === null // null means no conflict — slot is available
}

/**
 * Returns the existing approved member for a chapter-category pair, if any.
 */
export async function getExistingMember(
  chapterId: string,
  categoryId: string
): Promise<{ id: string; business_name: string | null; full_name: string } | null> {
  const supabase = await createAdminClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, business_name, full_name')
    .eq('chapter_id', chapterId)
    .eq('category_id', categoryId)
    .eq('status', 'approved')
    .maybeSingle()

  return data
}
