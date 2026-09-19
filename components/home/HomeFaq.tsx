import { HOME_FAQS } from '@/lib/data/faq'

// Visible FAQ (native <details> — no JS, fully crawlable) paired 1:1 with FAQPage JSON-LD.
export function HomeFaq() {
  return (
    <section className="py-16 bg-brand-navy" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="section-title">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
          <p className="section-subtitle">Everything you need to know about joining UCCI</p>
        </div>
        <div className="space-y-3">
          {HOME_FAQS.map(f => (
            <details key={f.question} className="glass-card px-6 py-4 group">
              <summary className="font-display font-semibold text-brand-white cursor-pointer list-none flex items-center justify-between gap-4 min-h-[44px] [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="text-brand-gold text-xl leading-none group-open:rotate-45 transition-transform flex-shrink-0">+</span>
              </summary>
              <p className="text-brand-silver text-sm leading-relaxed mt-2">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
