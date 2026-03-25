'use client'

import { useState } from 'react'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import { submitFeedback } from '@/app/actions/feedback'
import { HONEYPOT_FIELD_LABEL, HONEYPOT_FIELD_NAME } from '@/lib/honeypot'

interface Props {
  config: PolicyConfig
  result: SimulationResult
  isOpen: boolean
  onClose: () => void
  configName?: string
}

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'question', label: 'Question' },
  { value: 'general', label: 'General Feedback' },
]

export default function FeedbackModal({ config, result, isOpen, onClose, configName }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await submitFeedback({
        name: name || undefined,
        email: email || undefined,
        category,
        message,
        config,
        surplusDeficit: result.balance.surplusDeficit,
        configName,
        honeypot: honeypot || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setName('')
        setEmail('')
        setHoneypot('')
        setCategory('general')
        setMessage('')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, minHeight: '100vh' }}>
      <div style={{ width: '340px', padding: '1rem', backgroundColor: '#1a2332', border: '1.5px solid rgba(0, 217, 255, 0.6)', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e0e7ff', marginBottom: '0.25rem', textAlign: 'center' }}>Send Feedback</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '0.75rem', textAlign: 'center' }}>Help us improve by sharing your thoughts</p>

        {success ? (
          <div style={{ textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✓</div>
            <p style={{ color: '#4ade80', fontSize: '0.75rem' }}>Thank you for your feedback!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              <label htmlFor="feedback-website">{HONEYPOT_FIELD_LABEL}</label>
              <input
                id="feedback-website"
                name={HONEYPOT_FIELD_NAME}
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '0.25rem',
                  color: '#e0e7ff',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                  boxSizing: 'border-box',
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

            {/* Email */}
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
                  boxSizing: 'border-box',
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

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '0.25rem',
                  color: '#e0e7ff',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 217, 255, 0.05)'
                }}
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} style={{ backgroundColor: '#1a2332', color: '#e0e7ff' }}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.6rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '0.25rem',
                  color: '#e0e7ff',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0, 217, 255, 0.05)',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 217, 255, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 217, 255, 0.05)'
                }}
                maxLength={500}
              />
              <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.25rem' }}>{message.length}/500</p>
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
                  transition: 'all 0.2s',
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
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
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
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
