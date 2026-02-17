'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function AdminHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-bright">📊 Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/settings" className="text-blue-400 hover:text-blue-300 text-xs bg-dark-slate px-3 py-2 rounded border border-border-slate">
            ⚙️ Settings
          </Link>
          <button
            onClick={async () => {
              await logout()
            }}
            className="text-red-400 hover:text-red-300 text-xs bg-dark-slate px-3 py-2 rounded border border-red-500/30 hover:border-red-500/60 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>
      <p className="text-muted text-sm text-center hidden" id="stats-placeholder">Loading stats...</p>
      <div className="flex justify-center mt-3">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs inline-block">
          ← Back to Simulator
        </Link>
      </div>
    </div>
  )
}
