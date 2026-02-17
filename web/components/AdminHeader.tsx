'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function AdminHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-bright">📊 Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            href="/admin/settings"
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#60a5fa',
              backgroundColor: 'rgba(30, 58, 138, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '0.25rem',
              transition: 'all 0.2s',
              textDecoration: 'none',
              display: 'inline-block',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(30, 58, 138, 0.5)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(96, 165, 250, 0.8)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(30, 58, 138, 0.3)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.5)'
            }}
          >
            ⚙️ Settings
          </Link>
          <button
            onClick={async () => {
              await logout()
            }}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#f87171',
              backgroundColor: 'rgba(127, 29, 29, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '0.25rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(127, 29, 29, 0.5)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(248, 113, 113, 0.8)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(127, 29, 29, 0.3)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.5)'
            }}
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
