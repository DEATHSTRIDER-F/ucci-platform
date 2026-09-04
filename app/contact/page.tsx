import { buildContactMetadata } from '@/lib/seo/metadata'
import { ContactForm } from '@/components/forms/ContactForm'
import { MapPin, Phone, Clock, Mail } from 'lucide-react'
import { Icon } from '@iconify/react'
import type { Metadata } from 'next'

export const metadata: Metadata = buildContactMetadata()

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-title">Contact <span className="text-gradient-gold">Us</span></h1>
          <p className="section-subtitle">We&apos;d love to hear from you. Reach out to our team.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold text-brand-white mb-6">Get in Touch</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <div className="text-brand-champagne font-semibold text-sm mb-1">Office Address</div>
                    <address className="not-italic text-brand-silver leading-relaxed">
                      Office No.202, Second Floor, Commercial Building 4,<br />
                      HM Royal Society, Opp. Ranka Jewellers, Talab,<br />
                      Kondhwa, Pune – 411048
                    </address>
                    <a href="mailto:info@ucciindia.org" className="inline-flex items-center gap-1.5 text-brand-gold text-sm mt-2 hover:text-brand-champagne">
                      <Mail className="w-4 h-4" /> info@ucciindia.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <div className="text-brand-champagne font-semibold text-sm mb-2">Phone</div>
                    <div className="space-y-1">
                      {['8600241900','9552319748','8485878785','9923309468'].map(num => (
                        <a key={num} href={`tel:${num}`} className="block text-brand-silver hover:text-brand-gold transition-colors text-base font-medium">
                          {num}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:whatsapp" width={20} height={20} className="text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="text-brand-champagne font-semibold text-sm mb-1">WhatsApp</div>
                    <a
                      href="https://wa.me/918600241900"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-champagne transition-colors shadow-md"
                    >
                      <Icon icon="mdi:whatsapp" width={18} height={18} /> Chat on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:instagram" width={20} height={20} className="text-brand-gold" />
                  </div>
                  <div>
                    <div className="text-brand-champagne font-semibold text-sm mb-1">Instagram</div>
                    <a href="https://instagram.com/ucci_muslimbizclub" target="_blank" rel="noopener noreferrer" className="text-brand-silver hover:text-brand-gold transition-colors text-sm font-medium">
                      @ucci_muslimbizclub
                    </a>
                    <div className="text-brand-silver/60 text-xs mt-1">Follow us for events & updates</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <div className="text-brand-champagne font-semibold text-sm mb-1">Business Hours</div>
                    <div className="text-brand-silver">
                      <div>Monday – Saturday: 10:00 AM – 6:00 PM</div>
                      <div className="text-brand-silver/60 text-sm">Sunday: Closed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-0 overflow-hidden aspect-video">
              <iframe
                title="UCCI Location — HM Royal Society, Kondhwa"
                src="https://www.google.com/maps?q=HM+Royal+Society+Kondhwa+Pune+411048&z=15&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Office+No.202+HM+Royal+Society+Kondhwa+Pune+411048"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold text-sm hover:text-brand-champagne inline-flex items-center gap-1 mt-2"
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps →
            </a>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8">
            <h2 className="font-display text-2xl font-bold text-brand-white mb-6">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
