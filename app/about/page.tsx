import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About UCCI | Our Story & How It Works',
  description:
    'Learn about UCCI — United Chamber of Commerce India. Discover our story, our BNI-inspired networking model, and how our exclusive chapter system helps professionals grow.',
}

const FOUNDERS = [
  {
    image: '/1.png',
    quote:
      'UCCI is more than a business networking platform—it’s a movement to empower, connect, and strengthen the Muslim business community.',
    name: 'MOHAMMED PASHA',
    title: 'Founder & President, UCCI',
    // Tall portrait, head near top — anchor crop to face, trim torso
    position: '50% 8%',
  },
  {
    image: '/2.png',
    quote:
      'At UCCI, we strengthen bonds and empower success. Fostering unity, trust, and growth within the Muslim business community. Together, we build stronger businesses and a brighter future.',
    name: 'SAYEED NAMDAR',
    title: 'Founder Vice President',
    position: '50% 20%',
  },
  {
    image: '/3.png',
    quote:
      'At UCCI, we believe in growing together—not just individual success, but community success. ‘Together, We Grow.’ Success is better when shared.',
    name: 'HAMEED SHAIKH',
    title: 'Founder Vice President',
    // Tall portrait, head near top — anchor crop to face, trim torso
    position: '50% 8%',
  },
  {
    image: '/4.png',
    quote:
      'UCCI brings Muslim entrepreneurs and professionals together to create meaningful business relationships, exchange referrals, and foster collaborations.',
    name: 'ABOOBAKAR MEMON',
    title: 'Founder Vice President',
    // Head sits slightly lower — anchor just above center
    position: '50% 12%',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Hero */}
      <div className="page-hero text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-title mb-4">
            About <span className="text-gradient-gold">UCCI</span>
          </h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            United Chamber of Commerce India — Where Elite Professionals Network
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="our-story-heading">
        <div className="glass-card p-8 md:p-12">
          <h2 id="our-story-heading" className="font-display text-3xl font-bold text-brand-gold mb-6">Our Story</h2>
          <div className="space-y-4 text-brand-silver leading-relaxed">
            <p>
              UCCI — United Chamber of Commerce India — was founded with a singular vision: to create a
              structured, high-trust business networking ecosystem for professionals in Pune and the PCMC region.
              Inspired by the proven BNI (Business Network International) model, UCCI brings together one
              professional per business category per chapter, ensuring zero internal competition and maximum
              referral quality.
            </p>
            <p>
              Our network operates on the principle of <span className="text-brand-champagne font-medium">Givers Gain®</span> — 
              when you help others grow their businesses, your own business grows in return. Each UCCI member
              commits to actively referring business to fellow chapter members, creating a powerful, self-sustaining
              referral engine.
            </p>
            <p>
              From our roots in Pune&apos;s bustling business community, UCCI has expanded to serve professionals
              across 7 chapters in two geographic areas: Pune (East, West, North, South, Central) and PCMC
              (East, West). Each chapter maintains a carefully curated membership of vetted, verified professionals
              who are committed to structured networking and business growth.
            </p>
            <p>
              Our strict vetting process — including personal interviews, category exclusivity checks, and
              membership fee confirmation — ensures that every UCCI member you meet is serious about their
              business and their commitment to the network.
            </p>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="founders-heading">
        <h2 id="founders-heading" className="section-title text-center mb-4">
          Our <span className="text-gradient-gold">Founders</span>
        </h2>
        <p className="section-subtitle text-center max-w-2xl mx-auto mb-10">
          The visionaries behind UCCI — building unity, trust, and growth.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOUNDERS.map(founder => (
            <div key={founder.name} className="glass-card p-6 text-center flex flex-col items-center">
              <div className="relative w-40 h-40 mb-5 rounded-full overflow-hidden border-2 border-brand-gold/40 shrink-0 aspect-square">
                <Image
                  src={founder.image}
                  alt={`${founder.name} — ${founder.title}`}
                  fill
                  className="object-cover"
                  style={{ objectPosition: founder.position }}
                  sizes="160px"
                />
              </div>
              <p className="text-brand-silver text-sm leading-relaxed italic mb-4">
                &ldquo;{founder.quote}&rdquo;
              </p>
              <h3 className="font-display text-base font-bold text-brand-white tracking-wide">
                {founder.name}
              </h3>
              <p className="text-brand-gold text-xs font-medium mt-1">{founder.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-brand-sapphire" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="values-heading" className="section-title text-center mb-10">
            Our <span className="text-gradient-gold">Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Exclusivity',
                icon: '🏆',
                desc: 'One professional per category per chapter ensures zero competition within the network, maximizing referral value for every member.',
              },
              {
                title: 'Trust',
                icon: '🤝',
                desc: 'Every member is personally vetted through face-to-face interviews. We vouch for every professional in our network.',
              },
              {
                title: 'Growth',
                icon: '📈',
                desc: 'Structured weekly meetings, referral tracking, and accountability systems ensure consistent business growth for all members.',
              },
            ].map(val => (
              <div key={val.title} className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">{val.icon}</div>
                <h3 className="font-display text-xl font-bold text-brand-white mb-3">{val.title}</h3>
                <p className="text-brand-silver">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="how-heading">
        <h2 id="how-heading" className="section-title text-center mb-10">
          How It <span className="text-gradient-gold">Works</span>
        </h2>
        <div className="space-y-6">
          {[
            {
              step: '01',
              title: 'Submit Your Application',
              desc: 'Fill out the member profile form with your business details, select your chapter and category, and upload your company logo. You\'ll also schedule an interview appointment with your chapter admin.',
            },
            {
              step: '02',
              title: 'Vetting Interview',
              desc: 'Attend a personal interview with your Chapter Admin or our Super Admin. This conversation helps us understand your business, verify your commitment, and ensure you\'re a good fit for the UCCI community.',
            },
            {
              step: '03',
              title: 'Membership Fee & Approval',
              desc: 'Pay the ₹10,000 annual membership fee (offline) to confirm your commitment. Once confirmed, your admin will approve your application and activate your profile.',
            },
            {
              step: '04',
              title: 'Go Live in the Directory',
              desc: 'Your profile is immediately published on the UCCI platform — visible in the public directory, searchable by potential clients, and indexed by search engines for organic discovery.',
            },
            {
              step: '05',
              title: 'Network & Receive Referrals',
              desc: 'Attend chapter meetings, exchange quality referrals with fellow members, and grow your business through the power of structured, trust-based networking.',
            },
          ].map((item, i) => (
            <div key={item.step} className="glass-card p-6 flex gap-6">
              <div className="font-display text-3xl font-bold text-brand-gold/30 flex-shrink-0 w-12">{item.step}</div>
              <div>
                <h3 className="font-display text-lg font-bold text-brand-white mb-2">{item.title}</h3>
                <p className="text-brand-silver leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="/join" className="btn-primary text-base">
            Start Your Application →
          </a>
        </div>
      </section>
    </div>
  )
}
