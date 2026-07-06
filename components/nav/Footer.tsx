import Link from 'next/link'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-navy border-t border-brand-gold/20 pt-12 pb-6" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-display font-bold text-brand-navy text-lg">
                U
              </div>
              <span className="font-display font-bold text-brand-white text-xl">
                <span className="text-brand-gold">UCCI</span>
              </span>
            </Link>
            <p className="text-brand-silver text-sm leading-relaxed">
              United Chamber of Commerce India — an elite business networking organization connecting professionals through exclusive referral chapters.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-brand-champagne font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'Our Story' },
                { href: '/about#how-it-works', label: 'How It Works' },
                { href: '/categories', label: 'Categories' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chapters */}
          <div>
            <h3 className="text-brand-champagne font-semibold text-sm uppercase tracking-wider mb-4">Chapters</h3>
            <ul className="space-y-2">
              <li className="text-brand-silver/60 text-xs font-medium">Pune</li>
              {['east', 'west', 'north', 'south', 'central'].map(slug => (
                <li key={slug}>
                  <Link href={`/chapters/pune-${slug}`} className="text-brand-silver text-sm hover:text-brand-gold transition-colors capitalize">
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </Link>
                </li>
              ))}
              <li className="text-brand-silver/60 text-xs font-medium pt-2">PCMC</li>
              {['east', 'west'].map(slug => (
                <li key={`pcmc-${slug}`}>
                  <Link href={`/chapters/pcmc-${slug}`} className="text-brand-silver text-sm hover:text-brand-gold transition-colors capitalize">
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-champagne font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-brand-silver text-sm">
                  Office No 202, Commercial Building 4 HM Royal, Next To Talab Masjid, Kondhwa, Pune - 411048
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:8600241900" className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                  8600241900
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:9552319748" className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                  9552319748
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:8485878785" className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                  8485878785
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="tel:9923309468" className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                  9923309468
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a href="mailto:info@ucci.in" className="text-brand-silver text-sm hover:text-brand-gold transition-colors">
                  info@ucci.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-gold/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-silver/60 text-xs text-center sm:text-left">
            © {currentYear} UCCI — United Chamber of Commerce India. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/join" className="text-brand-gold text-xs hover:text-brand-champagne transition-colors flex items-center gap-1">
              Join UCCI <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
