import type { Metadata } from 'next'
import Image from 'next/image'
import { Icon } from '@iconify/react'

export const metadata: Metadata = {
  title: 'About UCCI | Our Story, Mission & Vision',
  description:
    'UNITED CHAMBER OF COMMERCE & INDUSTRIES — Connect | Collaborate | Grow. A trusted business community where entrepreneurs build relationships, share knowledge, and grow together. Founded by Mohammad Pasha, Abdul Hameed Shaikh, CMA Sayeed Inamdar & Ar. Aboobakar Memon.',
}

const FOUNDERS = [
  {
    image: '/1.png',
    quote: 'UCCI is more than a business networking platform — it’s a movement to empower, connect, and strengthen the Muslim business community.',
    name: 'MOHAMMED PASHA',
    title: 'Founder & President, UCCI',
    position: '50% 8%',
  },
  {
    image: '/2.png',
    quote: 'At UCCI, we strengthen bonds and empower success. Fostering unity, trust, and growth within the Muslim business community. Together, we build stronger businesses and a brighter future.',
    name: 'SAYEED NAMDAR',
    title: 'Founder Vice President',
    position: '50% 20%',
  },
  {
    image: '/3.png',
    quote: 'At UCCI, we believe in growing together — not just individual success, but community success. ‘Together, We Grow.’ Success is better when shared.',
    name: 'HAMEED SHAIKH',
    title: 'Founder Vice President',
    position: '50% 8%',
  },
  {
    image: '/4.png',
    quote: 'UCCI brings Muslim entrepreneurs and professionals together to create meaningful business relationships, exchange referrals, and foster collaborations.',
    name: 'ABOOBAKAR MEMON',
    title: 'Founder Vice President',
    position: '50% 12%',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Hero */}
      <div className="page-hero text-center !py-10 md:!py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-title mb-4">
            About <span className="text-gradient-gold">UCCI</span>
          </h1>
          <p className="text-brand-champagne font-display text-lg tracking-wide">UNITED CHAMBER OF COMMERCE & INDUSTRIES</p>
          <p className="text-brand-gold font-medium mt-1">Connect | Collaborate | Grow</p>
          <p className="section-subtitle max-w-2xl mx-auto mt-3">More than a platform for business cards — an ecosystem of trusted relationships.</p>
        </div>
      </div>

      {/* Our Story — verbatim from Form 1 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="our-story-heading">
        <div className="glass-card p-8 md:p-12">
          <h2 id="our-story-heading" className="font-display text-3xl font-bold text-brand-gold mb-6">Our Story, Mission & Vision</h2>
          <div className="space-y-5 text-brand-silver leading-relaxed">
            <p>
              <strong className="text-brand-white">UCCI</strong> aims to build a trusted, collaborative, and high-impact business community where entrepreneurs, professionals, business owners, and leaders connect with purpose, create meaningful opportunities, share knowledge, and grow together.
            </p>
            <p>
              The group aims to become more than a platform for exchanging business cards or generating referrals. It seeks to create a strong ecosystem of trusted relationships in which members actively support one another, collaborate on opportunities, exchange expertise, develop strategic partnerships, and contribute to the growth of the wider business community.
            </p>
            <p>
              Our vision is to foster a culture where <span className="text-brand-champagne font-medium">“business through relationships”</span> becomes a shared philosophy—where trust precedes transactions, collaboration creates value, and every member has the opportunity to both give and receive.
            </p>
            <p>
              Over time, the group aspires to establish itself as a respected network known for the quality of its members, the strength of its relationships, the opportunities it creates, and the measurable value it delivers to its members and the community.
            </p>
          </div>
        </div>
      </section>

      {/* Founders — merged: friend portraits + Form 1 names */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="founders-heading">
        <h2 id="founders-heading" className="section-title text-center mb-4">
          Our <span className="text-gradient-gold">Founders</span>
        </h2>
        <p className="section-subtitle text-center max-w-2xl mx-auto mb-10">The visionaries behind UCCI — building unity, trust, and growth.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOUNDERS.map(founder => (
            <div key={founder.name} className="glass-card p-6 text-center flex flex-col items-center">
              <div className="relative w-40 h-40 mb-5 rounded-full overflow-hidden border-2 border-brand-gold/40 shrink-0 aspect-square">
                <Image src={founder.image} alt={`${founder.name} — ${founder.title}`} fill className="object-cover" style={{ objectPosition: founder.position }} sizes="160px" />
              </div>
              <p className="text-brand-silver text-sm leading-relaxed italic mb-4">&ldquo;{founder.quote}&rdquo;</p>
              <h3 className="font-display text-base font-bold text-brand-white tracking-wide">{founder.name}</h3>
              <p className="text-brand-gold text-xs font-medium mt-1">{founder.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Join UCCI — from brochure image */}
      <section id="why-ucci" className="py-16 bg-brand-navy relative overflow-hidden" aria-labelledby="why-heading">
        <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden>
          <div className="absolute top-0 left-0 w-64 h-64 border border-brand-gold/10 rounded-full -translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 right-0 w-96 h-96 border border-brand-gold/10 rounded-full translate-x-32 translate-y-32" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="why-heading" className="font-display text-3xl md:text-4xl font-bold text-brand-white">
              Why Join <span className="text-gradient-gold">UCCI?</span>
            </h2>
            <div className="w-24 h-0.5 bg-brand-gold mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Business Networking', desc: 'Access curated monthly meetings and one-on-one introductions tailored for senior professionals.', icon: 'mdi:account-group' },
              { title: 'Quality B2B Referrals', desc: 'Referral vetting ensures leads are relevant, reducing time-to-close and improving margins.', icon: 'mdi:handshake' },
              { title: 'Brand Promotion', desc: 'Spotlight opportunities across meetings, digital channels and event pipelines.', icon: 'mdi:bullhorn' },
              { title: 'Business Collaborations', desc: 'Find partners for joint ventures, supply chains and cross-promotions.', icon: 'mdi:handshake-outline' },
              { title: 'Leadership Development', desc: 'Executive coaching, peer mentorship and visibility-building roles.', icon: 'mdi:account-star' },
              { title: 'Training & Workshops', desc: 'Practical workshops: sales, digital marketing, compliance, and export readiness.', icon: 'mdi:school' },
              { title: 'Digital Marketing Support', desc: 'Promotional campaigns and spotlight features to amplify your reach.', icon: 'mdi:chart-box' },
              { title: 'Website Listing', desc: 'Member directory listing that drives discovery among businesses and buyers.', icon: 'mdi:web' },
              { title: 'Government Support', desc: 'Access to policy forums, compliance guidance and local government liaisons.', icon: 'mdi:office-building' },
              { title: 'Trusted Business Certificate', desc: 'Credential that enhances credibility with buyers, partners and regulatory bodies.', icon: 'mdi:certificate' },
            ].map(item => (
              <div key={item.title} className="glass-card p-5 text-center hover:border-brand-gold/40 hover:-translate-y-0.5 transition-all flex flex-col">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mb-3 shadow-[0_0_12px_rgba(212,175,55,0.35)] relative overflow-hidden isolate">
                  <Icon icon={item.icon} width={22} height={22} className="text-brand-navy relative z-10" />
                  <div aria-hidden className="absolute inset-0 w-12 h-12 rotate-45 overflow-hidden rounded-full pointer-events-none">
                    <div className="absolute inset-y-0 w-[65%] h-full bg-gradient-to-r from-transparent via-white via-white/90 to-transparent blur-[1px] animate-[glare-r2l_1.8s_linear_infinite]" />
                  </div>
                </div>
                <h3 className="font-display text-sm font-bold text-brand-gold leading-tight">{item.title}</h3>
                <p className="text-brand-silver text-xs mt-2 leading-relaxed flex-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card py-4 px-6 flex items-center justify-center gap-3 border-brand-gold/30">
            <span className="text-brand-gold text-sm hidden sm:inline">● ● ●</span>
            <p className="font-display text-sm md:text-base font-bold tracking-widest text-brand-champagne text-center">
              JOIN UCCI. CONNECT, COLLABORATE & GROW TOGETHER.
            </p>
            <span className="text-brand-gold text-sm hidden sm:inline">● ● ●</span>
          </div>
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
              { title: 'Trust', icon: '🤝', desc: 'Trust precedes transactions. We build relationships first, business follows.' },
              { title: 'Collaboration', icon: '🤲', desc: 'Every member is enabled to both give and receive — sharing expertise, referrals, and opportunities.' },
              { title: 'Impact', icon: '📈', desc: 'Measured by the opportunities we create and the growth we deliver to members and the wider community.' },
            ].map(v => (
              <div key={v.title} className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl font-bold text-brand-white mb-3">{v.title}</h3>
                <p className="text-brand-silver">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — curated model */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="how-heading">
        <h2 id="how-heading" className="section-title text-center mb-4">
          How It <span className="text-gradient-gold">Works</span>
        </h2>
        <p className="text-center text-brand-silver mb-10">Curated onboarding — Admin creates your profile, leads are vetted by UCCI</p>
        <div className="space-y-6">
          {[
            { step: '01', title: 'Inquiry to Admin', desc: 'You fill out the “Start a Chapter” inquiry form. The lead goes directly to UCCI Admin (info@ucciindia.org) for vetting — not directly to a member.' },
            { step: '02', title: 'Schedule a Call', desc: 'UCCI Leadership schedules a call to understand your business, chapter fit, and localities (Kharadi–Pune East, Kothrud–West, etc.).' },
            { step: '03', title: 'Curated Profile Creation', desc: 'Admin manually creates your profile in the preferred chapter. Category exclusivity and locality are verified.' },
            { step: '04', title: 'Membership Confirmed', desc: 'Offline payment: Rs. 6,000 Membership fee + Rs. 6,000 Venue fee. No pay-per-lead, no online gateway — tracked manually.' },
            { step: '05', title: 'Grow Through Relationships', desc: 'Appear in directory, receive vetted leads via Admin, collaborate across 7 chapters in Pune & PCMC.' },
          ].map(item => (
            <div key={item.step} className="glass-card p-6 flex gap-6">
              <div className="font-display text-3xl font-bold text-brand-gold/30 flex-shrink-0 w-12">{item.step}</div>
              <div>
                <h3 className="font-display text-lg font-bold text-brand-white mb-2">{item.title}</h3>
                <p className="text-brand-silver leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/join" className="btn-primary">Start a Chapter — Inquiry →</a>
          <a href="https://wa.me/918600241900" target="_blank" rel="noopener noreferrer" className="btn-outline">WhatsApp +91-86002 41900</a>
        </div>
      </section>
    </div>
  )
}
