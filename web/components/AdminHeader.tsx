'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function AdminHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-bright">📊 Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/settings" className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 rounded border border-blue-500/50 hover:border-blue-400 transition">
            ⚙️ Settings
          </Link>
          <button
            onClick={async () => {
              await logout()
            }}
            className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-900/30 hover:bg-red-900/50 rounded border border-red-500/50 hover:border-red-400 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
      <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs inline-block">
        ← Back to Simulator
      </Link>
    </div>
  )
}
