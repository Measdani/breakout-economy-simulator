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
      <div className="bg-gradient-to-br from-dark-slate via-darker-slate to-darker-navy rounded-lg p-6 w-96 border border-blue-500/60 shadow-2xl">
        <h2 className="text-xl font-bold text-bright mb-2 text-center">Submit Your Model</h2>
        <p className="text-muted text-xs mb-5 text-center">Share your policy configuration with the community</p>

        {success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 text-sm">Submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className="mb-7 bg-darker-navy/60 rounded-lg p-4 border border-blue-500/20 backdrop-blur-sm text-center">
              <p className="text-xs text-muted mb-3 uppercase tracking-wide font-semibold">Fiscal Balance</p>
              <p
                className={`text-3xl font-bold mb-3 ${
                  result.balance.isSolvent ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
              </p>
              <p className="text-xs text-muted leading-relaxed">Your model's fiscal outcome after configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wide font-semibold">Name (leave blank to stay anonymous)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-3 py-3 bg-darker-navy border border-border-slate/50 rounded text-bright text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  className="w-full px-3 py-3 bg-darker-navy border border-border-slate/50 rounded text-bright text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {error && <div className="text-red-400 text-xs mt-2 leading-relaxed">{error}</div>}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  style={{ backgroundColor: '#1a2d3d', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#8b94a5' }}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-opacity-80 hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#243847'
                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.6)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a2d3d'
                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                    e.currentTarget.style.color = '#8b94a5'
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                  }}
                  className="flex-1 px-3 py-2.5 font-bold rounded-lg text-sm transition transform"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #2563eb, #16a34a)'
                    e.currentTarget.style.boxShadow = '0 15px 25px -3px rgba(37, 99, 235, 0.5)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
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
