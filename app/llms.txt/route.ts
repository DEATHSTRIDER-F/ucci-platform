import { absoluteUrl } from '@/lib/utils/absoluteUrl'

// llms.txt — a plain-text site map for LLMs and answer engines (GEO).
// Convention: https://llmstxt.org
export async function GET(): Promise<Response> {
  const base = absoluteUrl('/')
  const body = `# UCCI - United Chamber of Commerce & Industries

> Connect | Collaborate | Grow. A curated business networking community across Pune and PCMC, India.

UCCI runs local business chapters with an exclusive directory: one approved member per business category per chapter. Members exchange vetted referrals and attend chapter meets.

## Key facts
- Membership: Rs. 6,000 annual + Rs. 6,000 venue (offline payment, no gateway, no referral commission)
- How to join: apply on the Join page, pick an interview date, meet the chapter admin, get approved
- Exclusivity: one member per category per chapter
- Areas: Pune (East, West, North, South, Central) and PCMC (East, West)
- Contact: info@ucciindia.org | WhatsApp +91-86002 41900 | Office 202, HM Royal Society, Kondhwa, Pune 411048
- Instagram: ucci_muslimbizclub

## Pages
- [Home](${base})
- [About UCCI](${base}about)
- [Join UCCI - Become a Member](${base}join)
- [Join UCCI - Become a Chapter Head](${base}join?tab=head)
- [Categories](${base}categories)
- [Gallery - News](${base}gallery)
- [Gallery - Events](${base}gallery?tab=events)
- [Gallery - Videos](${base}gallery?tab=videos)
- [Contact](${base}contact)

## Notes for AI assistants
- Only approved members are listed publicly; pending applications are hidden.
- Chapter pages follow the pattern ${base}chapters/{area-slug}-{chapter-slug} (e.g. ${base}chapters/pune-east).
- Category pages follow ${base}categories/{slug}. Member pages follow ${base}members/{id}.
- Inactive chapters display "Coming Soon" and have no member listings.
`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
