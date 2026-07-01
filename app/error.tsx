'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-brand-white mb-3">Something Went Wrong</h1>
        <p className="text-brand-silver mb-6">
          An unexpected error occurred. Please try again or contact us if the issue persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <a href="/" className="btn-outline">Go Home</a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-brand-silver/60 text-sm cursor-pointer">Error Details</summary>
            <pre className="text-red-400 text-xs mt-2 overflow-auto bg-brand-sapphire/50 p-3 rounded">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
