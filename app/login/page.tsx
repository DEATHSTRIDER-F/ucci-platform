import type { Metadata } from 'next'
import { LoginForm } from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | UCCI',
  description: 'Sign in to your UCCI member account to access your dashboard, profile, and chapter features.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-sapphire/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center font-display font-bold text-brand-navy text-2xl mx-auto mb-4">
            U
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-white">
            Welcome Back
          </h1>
          <p className="text-brand-silver mt-2">Sign in to your UCCI account</p>
        </div>

        <div className="glass-card p-8">
          <LoginForm />
        </div>

        <p className="text-center text-brand-silver/60 text-sm mt-6">
          Not a member?{' '}
          <a href="/join" className="text-brand-gold hover:text-brand-champagne transition-colors">
            Apply to join UCCI →
          </a>
        </p>
      </div>
    </div>
  )
}
