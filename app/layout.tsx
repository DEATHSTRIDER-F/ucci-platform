import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/nav/Header'
import { Footer } from '@/components/nav/Footer'
import { buildSiteMetadata } from '@/lib/seo/metadata'
import { getNavData } from '@/lib/data/nav'
import { getAuth } from '@/lib/auth/getCurrentProfile'

import { LenisProvider } from '@/components/LenisProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = buildSiteMetadata()

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Single shared auth fetch (1x getUser + 1x profile). Nav data is separately cached for 5 min.
  const [{ profile }, { featuredCategories, areasWithChapters }] = await Promise.all([
    getAuth(),
    getNavData(),
  ])

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Iconify CDN preconnect: CategoryIcon SVGs load faster, less layout shift */}
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.iconify.design" />
      </head>
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
