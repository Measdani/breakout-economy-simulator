'use client'

import { useState } from 'react'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import { submitSimulation } from '@/app/actions/submissions'

interface Props {
  config: PolicyConfig
  result: SimulationResult
  isOpen: boolean
  onClose: () => void
  configName?: string
}

export default function SubmitModal({ config, result, isOpen, onClose, configName }: Props) {
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
      await submitSimulation(config, result, name || undefined, email || undefined, configName)
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, minHeight: '100vh' }}>
      <div style={{ width: '280px', padding: '0.75rem', backgroundColor: '#1a2332', border: '1.5px solid rgba(0, 217, 255, 0.6)', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#00ff00', marginBottom: '0.25rem', textAlign: 'center' }}>✓ DEPLOYED - Submit Model</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '0.75rem', textAlign: 'center' }}>Share your policy configuration with the community</p>

        {success ? (
          <div style={{ textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✓</div>
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
              <p style={{ fontSize: '0.6rem', color: '#94a3b8', lineHeight: '1.2' }}>Your model's outcome</p>
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 217, 255, 0.05)'
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 217, 255, 0.05)'
                  }}
                />
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3a5268'
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.7)'
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a3f52'
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)'
                    e.currentTarget.style.boxShadow = 'none'
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #2563eb, #16a34a)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.4)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.25)'
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
