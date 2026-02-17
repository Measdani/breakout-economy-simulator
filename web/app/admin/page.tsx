import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import AdminCharts from '@/components/AdminCharts'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getAllSubmissions() {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function getStatistics(submissions: any[]) {
  const totalSubmissions = submissions.length
  if (totalSubmissions === 0) {
    return {
      totalSubmissions: 0,
      solventCount: 0,
      deficitCount: 0,
      avgSurplus: 0,
      maxSurplus: 0,
      minSurplus: 0,
      avgRevenue: 0,
      avgObligations: 0,
      avgWorkIncentive: 0
    }
  }

  const solventCount = submissions.filter((s) => s.is_solvent).length
  const deficitCount = submissions.filter((s) => !s.is_solvent).length
  const avgSurplus =
    submissions.reduce((sum, s) => sum + s.surplus_deficit, 0) / totalSubmissions / 1e9
  const maxSurplus =
    submissions.reduce((max, s) => (s.surplus_deficit > max ? s.surplus_deficit : max), -Infinity) / 1e9
  const minSurplus =
    submissions.reduce((min, s) => (s.surplus_deficit < min ? s.surplus_deficit : min), Infinity) / 1e9

  const totalRevenue = submissions.reduce((sum, s) => sum + (s.result?.revenue?.totalRevenue || 0), 0) / 1e9
  const avgRevenue = totalRevenue / totalSubmissions
  const totalObligations = submissions.reduce((sum, s) => sum + (s.result?.obligations?.totalObligations || 0), 0) / 1e9
  const avgObligations = totalObligations / totalSubmissions

  const getWorkIncentiveScore = (s: any): number => {
    const personas = s.result?.citizenModel?.personaOutcomes || []
    if (personas.length < 2) return 0
    let totalRetention = 0, count = 0
    for (let i = 0; i < personas.length - 1; i++) {
      const incomeDiff = personas[i + 1].earnedIncome - personas[i].earnedIncome
      const netDiff = personas[i + 1].netIncome - personas[i].netIncome
      if (incomeDiff > 0) {
        totalRetention += (netDiff / incomeDiff) * 100
        count++
      }
    }
    return count > 0 ? totalRetention / count : 0
  }
  const avgWorkIncentive = submissions.reduce((sum, s) => sum + getWorkIncentiveScore(s), 0) / totalSubmissions

  return {
    totalSubmissions,
    solventCount,
    deficitCount,
    avgSurplus,
    maxSurplus,
    minSurplus,
    avgRevenue,
    avgObligations,
    avgWorkIncentive
  }
}

export default async function AdminPage() {
  const submissions = await getAllSubmissions()
  const stats = await getStatistics(submissions)

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-bright">📊 Admin Dashboard</h1>
          </div>
          <p className="text-muted text-sm">{stats.totalSubmissions} total submissions</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs inline-block mt-3">
            ← Back to Simulator
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-bright">{stats.totalSubmissions}</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Solvent</p>
            <p className="text-2xl font-bold text-green-400">{stats.solventCount}</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Deficit</p>
            <p className="text-2xl font-bold text-red-400">{stats.deficitCount}</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Avg Balance</p>
            <p
              className={`text-xl font-bold ${
                stats.avgSurplus >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {stats.avgSurplus >= 0 ? '+' : ''}${stats.avgSurplus.toFixed(1)}B
            </p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Max Surplus</p>
            <p className="text-xl font-bold text-green-400">+${stats.maxSurplus.toFixed(1)}B</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Max Deficit</p>
            <p className="text-xl font-bold text-red-400">${stats.minSurplus.toFixed(1)}B</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Avg Revenue</p>
            <p className="text-xl font-bold text-blue-400">${stats.avgRevenue.toFixed(1)}B</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Avg Obligations</p>
            <p className="text-xl font-bold text-yellow-400">${stats.avgObligations.toFixed(1)}B</p>
          </div>

          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs text-muted mb-1">Avg Work Incentive Score</p>
            <p className="text-xl font-bold text-purple-400">{stats.avgWorkIncentive.toFixed(1)}%</p>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="mb-8">
          <AdminCharts submissions={submissions} />
        </div>

        {/* All Submissions Table */}
        <div>
          <h2 className="text-2xl font-bold text-bright mb-4">All Submissions</h2>
          <AdminTable submissions={submissions} />
        </div>
      </div>
    </div>
  )
}
