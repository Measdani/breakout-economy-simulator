'use client'

import { useState } from 'react'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import { submitSimulation } from '@/app/actions/submissions'

interface Props {
  config: PolicyConfig
  result: SimulationResult
  isOpen: boolean
  onClose: () => void
}

export default function SubmitModal({ config, result, isOpen, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await submitSimulation(config, result, name || undefined, email || undefined)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setName('')
        setEmail('')
      }, 2000)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-dark-slate via-darker-slate to-darker-navy rounded-2xl p-8 max-w-md w-full border border-blue-500/40 shadow-2xl">
        <h2 className="text-3xl font-bold text-bright mb-2">Submit Your Model</h2>
        <p className="text-muted text-sm mb-6">Share your policy configuration with the community</p>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-green-400 text-lg">Submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-darker-navy/60 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
              <p className="text-xs text-muted mb-2 uppercase tracking-wide">Fiscal Balance</p>
              <p
                className={`text-3xl font-bold ${
                  result.balance.isSolvent ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wide">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-4 py-3 bg-darker-navy border border-border-slate/50 rounded-lg text-bright focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wide">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-darker-navy border border-border-slate/50 rounded-lg text-bright focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-darker-navy border border-border-slate text-muted rounded-lg hover:bg-darker-slate hover:text-bright transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-400 transition disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
