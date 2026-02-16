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
        <div className="mb-6 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm inline-block mb-3">
            ← Back to Simulator
          </Link>
          <h1 className="text-3xl font-bold text-bright">🏆 Leaderboard</h1>
          <p className="text-muted text-sm mt-1">Top 20 submissions ranked by fiscal balance</p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-dark-slate rounded-lg border border-border-slate p-8 text-center">
            <p className="text-muted">No submissions yet. Be the first to submit your model!</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
              Go to Simulator →
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
                  <tr key={sub.id} className="border-t border-border-slate hover:bg-darker-navy transition">
                    <td className="px-4 py-3 text-bright font-bold">#{idx + 1}</td>
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
