'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(false)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
      setPassword('')
    }
    setIsLoading(false)
  }

  return (
    <div
      className="bg-deep-navy"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        className="bg-dark-slate rounded-lg p-6 border-2 border-blue-500/50"
        style={{
          width: '100%',
          maxWidth: '360px',
          margin: '0 auto',
          borderRadius: '16px'
        }}
      >
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold text-bright">Admin Login</h1>
          <p className="text-muted text-xs mt-1">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 bg-darker-navy border border-border-slate rounded text-bright text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', borderRadius: '10px' }}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">Invalid password</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded font-semibold text-sm transition"
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#1e3a8a' : '#2563eb',
              color: '#ffffff',
              border: '1px solid #1d4ed8',
              opacity: isLoading ? 0.65 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              borderRadius: '10px'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border-slate text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs">
            &larr; Back to Simulator
          </Link>
        </div>
      </div>
    </div>
  )
}
