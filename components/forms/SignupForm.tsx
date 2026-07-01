'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/join'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    setPending(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (authError) {
        setError(authError.message)
        return
      }
      
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div>
        <label htmlFor="signup_name" className="block text-brand-silver text-sm font-medium mb-1">Full Name</label>
        <input
          id="signup_name"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="input-field"
          placeholder="John Doe"
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="signup_email" className="block text-brand-silver text-sm font-medium mb-1">Email Address</label>
        <input
          id="signup_email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          placeholder="admin@ucci.in"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="signup_password" className="block text-brand-silver text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input
            id="signup_password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field pr-10"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver/60 hover:text-brand-silver"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-2 text-base">
        {pending ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing up...</> : 'Sign Up'}
      </button>
    </form>
  )
}