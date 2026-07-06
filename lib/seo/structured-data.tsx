import { absoluteUrl } from '@/lib/utils/absoluteUrl'
import type { Profile } from '@/lib/types/database'

// ─── Organization Schema (Homepage) ──────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UCCI - United Chamber of Commerce India',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/ucci-logo.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Office No 202, Commercial Building 4 HM Royal, Next To Talab Masjid',
      addressLocality: 'Kondhwa',
      addressRegion: 'Pune',
      postalCode: '411048',
      addressCountry: 'IN',
    },
    telephone: '+918600241900, +919552319748, +918485878785, +919923309468',
    description:
      'UCCI is an elite business networking organization connecting professionals through exclusive referral chapters in Pune and PCMC.',
    sameAs: [],
  }
}

// ─── WebSite Schema (Homepage) ────────────────────────────────────────────────

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UCCI Platform',
    url: absoluteUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl('/')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ─── LocalBusiness/ProfessionalService Schema (Member Profile) ────────────────

type MemberSchemaProfile = Omit<Profile, 'chapter' | 'category'> & {
  chapter?: { name: string; slug?: string; area?: { name: string; slug?: string } | null } | undefined
  category?: { name: string } | undefined
}

export function buildMemberSchema(profile: MemberSchemaProfile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: profile.business_name ?? profile.full_name,
    description: profile.bio ?? undefined,
    telephone: profile.phone ?? undefined,
    url: profile.website_url ?? absoluteUrl(`/members/${profile.id}`),
    image: profile.logo_url ?? undefined,
    address: profile.business_address
      ? {
          '@type': 'PostalAddress',
          streetAddress: profile.business_address,
          addressLocality: profile.chapter?.name ?? 'Pune',
          addressRegion: profile.chapter?.area?.name ?? 'Maharashtra',
          addressCountry: 'IN',
        }
      : undefined,
    parentOrganization: {
      '@type': 'Organization',
      name: 'UCCI',
      url: absoluteUrl('/'),
    },
    knowsAbout: profile.category?.name ?? undefined,
    areaServed: profile.chapter
      ? `${profile.chapter.name}, ${profile.chapter.area?.name ?? ''}, India`
      : 'India',
  }
}

// ─── JSON-LD Script Injector ──────────────────────────────────────────────────

export function JsonLd({ data }: { data: object | object[] }) {
  const schemas = Array.isArray(data) ? data : [data]
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
