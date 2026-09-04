import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/nav/Header'
import { Footer } from '@/components/nav/Footer'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { getNavData } from '@/lib/data/nav'
import { getCurrentProfile, getCurrentUser } from '@/lib/auth/getCurrentProfile'

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

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()])
  const { featuredCategories, areasWithChapters } = await getNavData()

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
