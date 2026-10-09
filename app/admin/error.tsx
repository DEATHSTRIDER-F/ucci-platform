'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin panel error:', error)
  }, [error])

  return (
    <div className="glass-card p-12 text-center max-w-lg mx-auto mt-10">
      <h1 className="font-display text-2xl font-bold text-brand-white mb-2">
        Something went wrong
      </h1>
      <p className="text-brand-silver text-sm mb-6">
        The admin panel hit an unexpected error. Your data is safe — try again
        or return to the dashboard.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/admin" className="btn-outline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
