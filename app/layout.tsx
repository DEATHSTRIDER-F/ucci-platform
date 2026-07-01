import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/nav/Header'
import { Footer } from '@/components/nav/Footer'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { createServerSupabaseClient } from '@/lib/supabase/server'

import { LenisProvider } from '@/components/LenisProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = buildSiteMetadata()

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch session and profile for the header
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { id: string; full_name: string; email: string; role: string; status: string; logo_url: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status, logo_url')
      .eq('id', user.id)
      .single()
    profile = data as { id: string; full_name: string; email: string; role: string; status: string; logo_url: string | null }
  }

  // Fetch featured categories and chapter hierarchy for nav
  const { data: featuredCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_featured', true)
    .order('name')
    .limit(5)

  const { data: areasWithChapters } = await supabase
    .from('areas')
    .select('id, name, slug, chapters(id, name, slug)')
    .order('name')

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="bg-brand-navy text-brand-white font-sans antialiased min-h-screen flex flex-col">
        <LenisProvider>
          <Header
            profile={profile}
            featuredCategories={featuredCategories ?? []}
            areasWithChapters={(areasWithChapters as Array<{
              id: string; name: string; slug: string;
              chapters: Array<{ id: string; name: string; slug: string }>
            }>) ?? []}
          />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  )
}
