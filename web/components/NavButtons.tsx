'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavButtons() {
  const pathname = usePathname()

  const isLeaderboard = pathname === '/leaderboard'
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Link
        href="/leaderboard"
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '0.25rem',
          transition: 'all 0.2s',
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: isLeaderboard ? '#a855f7' : '#9333ea',
          border: isLeaderboard ? '1px solid #c084fc' : '1px solid #9333ea',
          display: 'inline-block',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isLeaderboard) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#a855f7'
          }
        }}
        onMouseLeave={(e) => {
          if (!isLeaderboard) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#9333ea'
          }
        }}
      >
        🏆 Submissions
      </Link>
      <Link
        href="/admin"
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '0.25rem',
          transition: 'all 0.2s',
          textDecoration: 'none',
          color: '#ffffff',
          backgroundColor: isAdmin ? '#64748b' : '#475569',
          border: isAdmin ? '1px solid #94a3b8' : '1px solid #475569',
          display: 'inline-block',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isAdmin) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#64748b'
          }
        }}
        onMouseLeave={(e) => {
          if (!isAdmin) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#475569'
          }
        }}
      >
        ⚙️ Admin
      </Link>
    </div>
  )
}
