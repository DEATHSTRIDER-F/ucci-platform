import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 – Page Not Found | UCCI',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="font-display text-9xl font-bold text-gradient-gold mb-4">404</div>
        <h1 className="font-display text-3xl font-bold text-brand-white mb-4">Page Not Found</h1>
        <p className="text-brand-silver text-lg mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/categories" className="btn-outline">Browse Members</Link>
        </div>
      </div>
    </div>
  )
}
