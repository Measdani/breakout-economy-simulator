import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import Link from 'next/link'

async function getAllSubmissions() {
  if (!isAdmin()) {
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

async function getStatistics(submissions: typeof Array<any>) {
  const totalSubmissions = submissions.length
  const solventCount = submissions.filter((s) => s.is_solvent).length
  const deficitCount = submissions.filter((s) => !s.is_solvent).length
  const avgSurplus =
    submissions.reduce((sum, s) => sum + s.surplus_deficit, 0) / totalSubmissions / 1e9
  const maxSurplus =
    (submissions.reduce((max, s) => (s.surplus_deficit > max ? s.surplus_deficit : max), 0) /
      1e9) ||
    0
  const minSurplus =
    (submissions.reduce((min, s) => (s.surplus_deficit < min ? s.surplus_deficit : min), 0) /
      1e9) ||
    0

  return {
    totalSubmissions,
    solventCount,
    deficitCount,
    avgSurplus,
    maxSurplus,
    minSurplus
  }
}

export default async function AdminPage() {
  const submissions = await getAllSubmissions()
  const stats = await getStatistics(submissions)

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-bright">📊 Admin Dashboard</h1>
            <p className="text-muted mt-2">{stats.totalSubmissions} total submissions</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500">
            ← Back to Simulator
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
        </div>

        {/* Submissions Table */}
        <AdminTable submissions={submissions} />
      </div>
    </div>
  )
}
