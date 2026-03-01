'use client'

import { useState } from 'react'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import { submitSimulation } from '@/app/actions/submissions'
import { buildSubmissionPayload, type SubmissionDemographics } from '@/lib/submissionPayload'

interface Props {
  config: PolicyConfig
  result: SimulationResult
  isOpen: boolean
  onClose: () => void
  configName?: string
  demographics?: SubmissionDemographics
}

export default function SubmitModal({ config, result, isOpen, onClose, configName, demographics }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userFeedbackText, setUserFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const formatTokenMilsPerThousand = (rate: number) =>
    `${(rate * 100).toFixed(2)} mils / 1,000 tokens total compute`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = buildSubmissionPayload({
        config,
        result,
        userFeedbackText: userFeedbackText || null,
        demographics: demographics ?? null,
      })

      await submitSimulation(
        config,
        result,
        payload,
        name || undefined,
        email || undefined,
        configName
      )

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setName('')
        setEmail('')
        setUserFeedbackText('')
      }, 2000)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, minHeight: '100vh' }}>
      <div style={{ width: '340px', padding: '0.75rem', backgroundColor: '#1a2332', border: '1.5px solid rgba(0, 217, 255, 0.6)', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#00ff00', marginBottom: '0.25rem', textAlign: 'center' }}>Submit Model</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '0.75rem', textAlign: 'center' }}>Share your policy configuration with the community</p>

        {success ? (
          <div style={{ textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>OK</div>
            <p style={{ color: '#4ade80', fontSize: '0.75rem' }}>Submitted successfully!</p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: '0.5rem',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                textAlign: 'center',
                background: result.balance.isSolvent
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                boxShadow: result.balance.isSolvent
                  ? '0 4px 12px rgba(34, 197, 94, 0.1)'
                  : '0 4px 12px rgba(239, 68, 68, 0.1)'
              }}
            >
              <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>FISCAL BALANCE</p>
              <p
                style={{
                  color: '#00D9FF',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                  textShadow: '0 0 8px rgba(0, 217, 255, 0.5)',
                  letterSpacing: '0.03em'
                }}
              >
                {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
              </p>
              <p style={{ fontSize: '0.6rem', color: '#94a3b8', lineHeight: '1.2' }}>Your model outcome</p>
            </div>

            <div
              style={{
                marginBottom: '0.75rem',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                background: 'rgba(15, 23, 42, 0.65)',
              }}
            >
              <p style={{ fontSize: '0.65rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>Submission Preview</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '0.25rem', columnGap: '0.5rem', fontSize: '0.62rem' }}>
                <span style={{ color: '#94a3b8' }}>Revenue Mode</span>
                <span style={{ color: '#e2e8f0', textAlign: 'right' }}>{config.revenueArchitectureMode ?? 'hybrid'}</span>
                <span style={{ color: '#94a3b8' }}>Token Tax Rate</span>
                <span style={{ color: '#e2e8f0', textAlign: 'right' }}>{formatTokenMilsPerThousand(config.tokenTaxRate)}</span>
                <span style={{ color: '#94a3b8' }}>BEL Total Cost</span>
                <span style={{ color: '#e2e8f0', textAlign: 'right' }}>${((result.obligations.ubiCost || 0) / 1e12).toFixed(2)}T</span>
                <span style={{ color: '#94a3b8' }}>Retirement Annual</span>
                <span style={{ color: '#e2e8f0', textAlign: 'right' }}>${((result.obligations.retirementProgramCost ?? 0) / 1e12).toFixed(2)}T</span>
                <span style={{ color: '#94a3b8' }}>Healthcare Federal</span>
                <span style={{ color: '#e2e8f0', textAlign: 'right' }}>${((result.obligations.healthcareProgramCost ?? 0) / 1e12).toFixed(2)}T</span>
                <span style={{ color: '#94a3b8' }}>Surplus/Deficit</span>
                <span style={{ color: result.balance.isSolvent ? '#4ade80' : '#f87171', textAlign: 'right', fontWeight: 600 }}>
                  {result.balance.isSolvent ? '+' : ''}${(result.balance.surplusDeficit / 1e9).toFixed(1)}B
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  style={{
                    width: '100%',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#0f1419',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                    boxSizing: 'border-box'
                  }}
                  maxLength={50}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#0f1419',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Feedback (optional)</label>
                <textarea
                  value={userFeedbackText}
                  onChange={(e) => setUserFeedbackText(e.target.value)}
                  placeholder="What informed your policy choices?"
                  style={{
                    width: '100%',
                    minHeight: '62px',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#0f1419',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.7rem',
                    boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  maxLength={500}
                />
                <p style={{ fontSize: '0.58rem', color: '#64748b', marginTop: '0.2rem', textAlign: 'right' }}>
                  {userFeedbackText.length}/500
                </p>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: '0.25rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#2a3f52',
                    border: '1px solid rgba(0, 217, 255, 0.4)',
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.375rem 0.5rem',
                    background: 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
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
