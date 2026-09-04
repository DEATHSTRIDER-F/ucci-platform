'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, Tag, MapPin, Calendar, Image, MessageSquare, Settings, Home } from 'lucide-react'

const ICONS = { Home, FileText, Users, MessageSquare, Calendar, Image, Tag, MapPin, Settings }

type NavItem = { href: string; icon: keyof typeof ICONS; label: string; exact?: boolean }

export function AdminNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
      {navItems.map(item => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = ICONS[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
              isActive
                ? 'bg-brand-gold/10 text-brand-gold font-medium border-l-2 border-brand-gold'
                : 'text-brand-silver hover:text-brand-gold hover:bg-brand-navy/50 border-l-2 border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-gold' : 'text-brand-silver/60 group-hover:text-brand-gold'}`} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
