import { z } from 'zod'

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
// Lucide PascalCase ("ShoppingBag") OR Iconify "prefix:name" ("lucide:shopping-bag", "mdi:account-tie", "tabler:building-skyscraper")
const iconNameRegex = /^([A-Za-z][A-Za-z0-9]*|[a-z0-9-]+:[a-z0-9-]+)$/

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.').max(100, 'Name must be ≤100 characters.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only.')
    .transform(v => v.toLowerCase()),
  is_featured: z.boolean().default(false),
  meta_description: z.string().trim().max(300, 'Meta description must be ≤300 chars.').optional().or(z.literal('')),
  alt_text: z.string().trim().max(255).optional().or(z.literal('')),
  icon_name: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(''))
    .refine(v => !v || iconNameRegex.test(v), { message: 'Invalid icon name (e.g. ShoppingBag or lucide:shopping-bag).' }),
  icon_color: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(v => !v || hexColorRegex.test(v), { message: 'Color must be hex #RRGGBB (e.g. #3B82F6).' }),
})

export type CategoryInput = z.infer<typeof categorySchema>

/** Validates and normalizes — empty strings become null-ready values */
export function validateCategoryInput(raw: Record<string, unknown>): { success: true; data: CategoryInput } | { success: false; error: string } {
  const parsed = categorySchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first.message }
  }
  return { success: true, data: parsed.data }
}

export function normalizeCategoryPayload(data: CategoryInput) {
  return {
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    is_featured: data.is_featured,
    meta_description: data.meta_description?.trim() ? data.meta_description.trim() : null,
    alt_text: data.alt_text?.trim() ? data.alt_text.trim() : null,
    icon_name: data.icon_name?.trim() ? data.icon_name.trim() : null,
    icon_color: data.icon_color?.trim() ? data.icon_color.trim().toUpperCase() : null,
  }
}
