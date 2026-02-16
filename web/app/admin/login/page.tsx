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
    <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4">
      <div className="bg-dark-slate rounded-lg p-8 max-w-md w-full border-2 border-slate-600">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-bright">Admin Login</h1>
          <p className="text-muted text-sm mt-2">Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-darker-navy border border-border-slate rounded text-bright focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">Invalid password</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 font-semibold transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-slate">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Simulator
          </Link>
        </div>
      </div>
    </div>
  )
}
