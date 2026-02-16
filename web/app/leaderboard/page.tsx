import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getLeaderboard() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('surplus_deficit', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

export default async function LeaderboardPage() {
  const submissions = await getLeaderboard()

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs inline-block mb-4 transition">
            ← Back to Simulator
          </Link>
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Compare policies and discover the best approaches</p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-gradient-to-br from-dark-slate to-darker-navy rounded-lg border border-blue-600 p-8 text-center">
            <p className="text-gray-400 text-lg mb-2 italic">No submissions yet.</p>
            <p className="text-bright font-semibold mb-6">Create your first model and join the leaderboard!</p>
            <Link
              href="/"
              className="cta-button inline-block px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg shadow-md"
            >
              <span className="rocket-animate">🚀</span> Start Your Model
            </Link>
          </div>
        ) : (
          <div className="bg-dark-slate rounded-lg border border-border-slate overflow-hidden">
            <table className="w-full">
              <thead className="bg-darker-slate">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted">Name</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Balance</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted">UBI</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Tax Rate</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`border-t border-border-slate transition ${
                      idx === 0
                        ? 'bg-yellow-900/20 hover:bg-yellow-900/30'
                        : 'hover:bg-darker-navy'
                    }`}
                  >
                    <td className={`px-4 py-3 font-bold ${idx === 0 ? 'text-yellow-400 text-lg' : 'text-bright'}`}>
                      {idx === 0 ? '👑 #1' : `#${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 text-bright">{sub.name || 'Anonymous'}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        sub.is_solvent ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {sub.is_solvent ? '+' : ''}${(sub.surplus_deficit / 1e9).toFixed(1)}B
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      ${(sub.ubi_annual / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {(sub.token_tax_rate * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-muted text-sm">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
