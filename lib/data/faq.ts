import type { FaqItem } from '@/lib/seo/structured-data'

// Single source of truth — rendered visibly on the homepage AND emitted as
// FAQPage JSON-LD so answer engines (ChatGPT, Perplexity, AI Overviews) can cite us.
export const HOME_FAQS: FaqItem[] = [
  {
    question: 'What is UCCI?',
    answer:
      'UCCI (United Chamber of Commerce & Industries) is a curated business networking community across Pune and PCMC. Members join local chapters, get listed in an exclusive directory, and exchange vetted referrals. Our motto: Connect | Collaborate | Grow.',
  },
  {
    question: 'How do I become a member of UCCI?',
    answer:
      'Fill the Become a Member form on the Join UCCI page, pick an interview date, and meet your chapter admin. After verification and the offline membership fee (Rs. 6,000 membership + Rs. 6,000 venue), your profile goes live in the directory.',
  },
  {
    question: 'What does UCCI membership cost?',
    answer:
      'Rs. 6,000 annual membership plus Rs. 6,000 towards venue costs — Rs. 12,000 total, collected offline. There is no online payment gateway and no commission on referrals.',
  },
  {
    question: 'What is the one-member-per-category rule?',
    answer:
      'Each chapter accepts only one approved member per business category. Your category is exclusively yours in your chapter, so you never compete with another member for the same referrals.',
  },
  {
    question: 'Which areas and chapters does UCCI cover?',
    answer:
      'Seven chapters across two areas: Pune (East, West, North, South, Central) and PCMC (East, West). New chapters show a Coming Soon badge until they launch.',
  },
  {
    question: 'How can I lead a chapter?',
    answer:
      'Apply via the Become a Chapter Head tab on the Join UCCI page with your details and preferred chapter. The UCCI admin team reviews every application and reaches out directly.',
  },
]
