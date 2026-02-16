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
    <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4 py-8">
      <div className="bg-dark-slate rounded-lg p-6 w-full max-w-sm border-2 border-blue-500/50">
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
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 font-semibold text-sm transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border-slate text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs">
            ← Back to Simulator
          </Link>
        </div>
      </div>
    </div>
  )
}
