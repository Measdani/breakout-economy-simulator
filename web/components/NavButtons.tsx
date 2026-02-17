'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavButtons() {
  const pathname = usePathname()

  const isLeaderboard = pathname === '/leaderboard'
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/leaderboard"
        className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
          isLeaderboard
            ? 'bg-purple-500 text-bright border border-purple-400'
            : 'bg-purple-600 hover:bg-purple-500 text-bright border border-purple-600'
        }`}
      >
        🏆 Leaderboard
      </Link>
      <Link
        href="/admin"
        className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
          isAdmin
            ? 'bg-slate-500 text-bright border border-slate-400'
            : 'bg-slate-600 hover:bg-slate-500 text-bright border border-slate-600'
        }`}
      >
        ⚙️ Admin
      </Link>
    </div>
  )
}
