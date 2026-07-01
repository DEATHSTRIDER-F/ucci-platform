import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CategoriesManagerClient } from '@/components/admin/CategoriesManagerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories | UCCI Admin' }

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">Business Categories</h1>
      <p className="text-brand-silver mb-6">Manage business categories available in UCCI chapters.</p>
      <CategoriesManagerClient categories={categories ?? []} />
    </div>
  )
}
