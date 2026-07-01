/**
 * Generates URL-safe slugs from strings.
 * Converts to lowercase, replaces spaces/special chars with hyphens.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')        // spaces and underscores → hyphens
    .replace(/[^\w-]+/g, '')        // remove non-word chars (except hyphens)
    .replace(/--+/g, '-')           // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')        // strip leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a numeric suffix if needed.
 * Pass an existingSlug checker function (async).
 */
export async function uniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(text)
  let slug = base
  let counter = 1

  while (await checkExists(slug)) {
    slug = `${base}-${counter}`
    counter++
  }

  return slug
}
