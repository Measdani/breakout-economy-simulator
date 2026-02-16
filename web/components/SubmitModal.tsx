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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="bg-gradient-to-br from-dark-slate via-darker-slate to-darker-navy rounded-lg p-4 w-80 border border-blue-500/60 shadow-2xl">
        <h2 className="text-xl font-bold text-bright mb-1">Submit Your Model</h2>
        <p className="text-muted text-xs mb-3">Share your policy configuration with the community</p>

        {success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 text-sm">Submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className="mb-5 bg-darker-navy/60 rounded-lg p-3 border border-blue-500/20 backdrop-blur-sm">
              <p className="text-xs text-muted mb-2 uppercase tracking-wide font-semibold">Fiscal Balance</p>
              <p
                className={`text-2xl font-bold mb-1 ${
                  result.balance.isSolvent ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
              </p>
              <p className="text-xs text-muted">Your model's fiscal outcome after configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wide font-semibold">Name (leave blank to stay anonymous)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-3 py-2 bg-darker-navy border border-border-slate/50 rounded text-bright text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wide font-semibold">Email (optional, for updates)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-darker-navy border border-border-slate/50 rounded text-bright text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {error && <div className="text-red-400 text-xs mt-2">{error}</div>}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 py-2.5 bg-darker-navy/80 border border-blue-400/30 text-muted rounded-lg text-sm font-medium hover:bg-darker-slate hover:text-bright hover:border-blue-400/60 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white font-bold rounded-lg text-sm hover:from-blue-500 hover:via-blue-400 hover:to-green-400 shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
