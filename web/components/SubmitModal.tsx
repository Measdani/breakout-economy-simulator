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
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50" style={{ paddingTop: '300px' }}>
      <div className="bg-dark-slate rounded-lg p-8 max-w-md w-full border-2 border-blue-500">
        <h2 className="text-2xl font-bold text-bright mb-4">Submit Your Model</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-green-400 text-lg">Submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-darker-navy rounded p-4 border border-border-slate">
              <p className="text-sm text-muted mb-2">Fiscal Balance:</p>
              <p
                className={`text-2xl font-bold ${
                  result.balance.isSolvent ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 bg-darker-navy border border-border-slate rounded text-bright"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-darker-navy border border-border-slate rounded text-bright"
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
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
