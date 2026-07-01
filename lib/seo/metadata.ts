import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/utils/absoluteUrl'
import type { Profile, Chapter, Category, Area } from '@/lib/types/database'

const SITE_NAME = 'UCCI - United Chamber of Commerce India'
const DEFAULT_DESCRIPTION =
  'UCCI is an elite business networking organization connecting professionals across Pune and PCMC through structured referral chapters.'

// ─── Site-level Metadata ──────────────────────────────────────────────────────

export function buildSiteMetadata(): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s | UCCI`,
    },
    description: DEFAULT_DESCRIPTION,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// ─── Member Profile Metadata ──────────────────────────────────────────────────

interface MemberMetaProfile {
  id: string
  full_name: string
  business_name: string | null
  brand_tagline?: string | null
  bio: string | null
  logo_url: string | null
  phone?: string | null
  chapter?: { name: string; area?: { name: string } | null } | null
  category?: { name: string } | null
}

export function buildMemberMetadata(profile: MemberMetaProfile): Metadata {
  const title = `${profile.business_name ?? profile.full_name} | ${profile.category?.name ?? 'Member'}`
  const location = profile.chapter
    ? `${profile.chapter.name}, ${profile.chapter.area?.name ?? ''}`
    : 'UCCI'
  const description =
    profile.bio
      ? `${profile.bio.slice(0, 155)}...`
      : `Connect with ${profile.business_name ?? profile.full_name}, a professional ${profile.category?.name ?? ''} member at UCCI ${location}.`
  const url = absoluteUrl(`/members/${profile.id}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: profile.logo_url ? [{ url: profile.logo_url, alt: profile.business_name ?? profile.full_name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ─── Chapter Page Metadata ────────────────────────────────────────────────────

export function buildChapterMetadata(chapter: Chapter & { area: Area }, memberCount: number): Metadata {
  const title = `UCCI ${chapter.name} Chapter | ${chapter.area.name}`
  const description = `Browse ${memberCount} approved business professionals in the UCCI ${chapter.name} Chapter, ${chapter.area.name}. Find exclusive category-specific members for referrals and networking.`
  const url = absoluteUrl(`/chapters/${chapter.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
  }
}

// ─── Category Page Metadata ───────────────────────────────────────────────────

export function buildCategoryMetadata(category: Category, memberCount: number): Metadata {
  const title = `${category.name} Professionals | UCCI`
  const description =
    category.meta_description ??
    `Find ${memberCount} verified ${category.name} professionals across all UCCI chapters in Pune and PCMC. Connect with exclusive, vetted business experts.`
  const url = absoluteUrl(`/categories/${category.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
  }
}

// ─── Contact Page Metadata ────────────────────────────────────────────────────

export function buildContactMetadata(): Metadata {
  return {
    title: 'Contact Us',
    description: 'Get in touch with UCCI. We are located at Office No 202, Commercial Building 4 HM Royal, Kondhwa, Pune - 411048. Call: 8600241900.',
    alternates: { canonical: absoluteUrl('/contact') },
  }
}

// ─── Gallery Page Metadata ────────────────────────────────────────────────────

export function buildGalleryMetadata(): Metadata {
  return {
    title: 'Gallery | UCCI Events',
    description: 'Explore UCCI events, chapter meetings, and networking moments captured across Pune and PCMC chapters.',
    alternates: { canonical: absoluteUrl('/gallery') },
  }
}
