import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unauthorized | UCCI',
  robots: { index: false, follow: false },
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="font-display text-8xl font-bold text-red-500/40 mb-4">403</div>
        <h1 className="font-display text-3xl font-bold text-brand-white mb-4">Access Denied</h1>
        <p className="text-brand-silver text-lg mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Please contact your chapter admin if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/contact" className="btn-outline">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
