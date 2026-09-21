'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, Crown } from 'lucide-react'
import { submitChapterHeadApplication } from '@/app/actions/chapter-head'

export type HeadApplyState =
  | { kind: 'login' }
  | { kind: 'not-member'; status: string | null }
  | { kind: 'admin' }
  | { kind: 'already-head' }
  | { kind: 'occupied'; headName: string }
  | { kind: 'pending' }
  | { kind: 'rejected' }
  | { kind: 'eligible' }

interface Props {
  state: HeadApplyState
  applicant?: { name: string; email: string; phone: string; chapterId: string; chapterLabel: string }
}

export function StartChapterApply({ state, applicant }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [applying, setApplying] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!applicant) return
    setApplying(true)
    setError('')
    const result = await submitChapterHeadApplication({
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      chapter_id: applicant.chapterId,
      message: `${applicant.name} volunteered to lead the ${applicant.chapterLabel} chapter from the Start a Chapter page.`,
    })
    setApplying(false)
    if (result.success) {
      setDone(true)
      setConfirming(false)
    } else {
      setError(result.error ?? 'Submission failed.')
    }
  }

  if (state.kind === 'login') {
    return (
      <div className="glass-card p-8 text-center">
        <Crown className="w-12 h-12 text-brand-gold mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">Members only</h3>
        <p className="text-brand-silver text-sm mb-5">Only active members can start a chapter. Log in or create an account first.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/login?redirectTo=%2Fjoin%3Ftab%3Dhead" className="btn-primary text-sm">Log In</a>
          <a href="/signup?redirectTo=%2Fjoin%3Ftab%3Dhead" className="btn-outline text-sm">Sign Up</a>
        </div>
      </div>
    )
  }

  if (state.kind === 'not-member') {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">You are not an active member</h3>
        <p className="text-brand-silver text-sm">
          Only approved members can start a chapter. Apply for membership first — once approved, you can come back here.
        </p>
      </div>
    )
  }

  if (state.kind === 'admin') {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">Admin account</h3>
        <p className="text-brand-silver text-sm">
          You manage chapter heads from the admin console instead of applying here.
        </p>
      </div>
    )
  }

  if (state.kind === 'already-head') {
    return (
      <div className="glass-card p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">You are already a Chapter Head</h3>
        <p className="text-brand-silver text-sm">Thank you for leading your chapter!</p>
      </div>
    )
  }

  if (state.kind === 'occupied') {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">Head already assigned</h3>
        <p className="text-brand-silver text-sm">
          A chapter head has already been assigned to someone else ({state.headName}) for your chapter.
        </p>
      </div>
    )
  }

  if (state.kind === 'pending' || done) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-3">⏳</div>
        <h3 className="font-display text-xl font-bold text-brand-white mb-2">Application pending approval</h3>
        <p className="text-brand-silver text-sm">The admin team is reviewing your application. We&apos;ll reach out soon.</p>
      </div>
    )
  }

  // rejected → apply again; eligible → apply
  return (
    <div className="glass-card p-8">
      {state.kind === 'rejected' ? (
        <div className="text-center mb-4">
          <h3 className="font-display text-xl font-bold text-brand-white mb-2">Previous application not approved</h3>
          <p className="text-brand-silver text-sm">You can apply again below.</p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <h3 className="font-display text-xl font-bold text-brand-white mb-2">Your chapter needs a head</h3>
          <p className="text-brand-silver text-sm">
            As an active member of {applicant?.chapterLabel}, you can step up to lead it.
          </p>
        </div>
      )}
      {!confirming ? (
        <div className="text-center">
          <button onClick={() => setConfirming(true)} className="btn-primary">
            {state.kind === 'rejected' ? 'Apply Again' : 'Apply to Start a Chapter'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-brand-silver text-sm mb-4">
            We&apos;ll send the admin your name ({applicant?.name}), email ({applicant?.email}), phone ({applicant?.phone || '—'})
            {' '}and chapter ({applicant?.chapterLabel}).
          </p>
          {error && <p className="text-red-400 text-xs mb-3 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={submit} disabled={applying} className="btn-primary text-sm px-6 disabled:opacity-50 flex items-center gap-2">
              {applying && <Loader2 className="w-4 h-4 animate-spin" />} Submit Application
            </button>
            <button onClick={() => setConfirming(false)} disabled={applying} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
