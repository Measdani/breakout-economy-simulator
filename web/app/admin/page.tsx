import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import AdminCharts from '@/components/AdminCharts'
import FeedbackTable from '@/components/FeedbackTable'
import AdminHeader from '@/components/AdminHeader'
import QuickSurveyTable, { type QuickSurveySnapshot } from '@/components/QuickSurveyTable'

export const dynamic = 'force-dynamic'

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return {}
}

function prettySurveyValue(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return '-'
  }
  return value.replace(/_/g, ' ')
}

function getQuickSurveySnapshots(submissions: any[]): QuickSurveySnapshot[] {
  const snapshots: QuickSurveySnapshot[] = []

  for (const submission of submissions) {
    const payload = asRecord(submission.submission_payload_json)
    const surveyResponse = asRecord(payload.survey_response)

    if (surveyResponse.survey_name !== 'NAiERM Economic Participation Survey') {
      continue
    }

    const responses = asRecord(surveyResponse.responses)
    const policyModel = asRecord(surveyResponse.policy_model)
    const belMonthlyRaw = policyModel.bel_monthly
    const belMonthly =
      typeof belMonthlyRaw === 'number' && Number.isFinite(belMonthlyRaw)
        ? `$${belMonthlyRaw.toLocaleString('en-US')}`
        : '-'

    snapshots.push({
      id: String(submission.id),
      createdAt: String(submission.created_at),
      alias: String(submission.name ?? responses.alias ?? 'Anonymous'),
      email: prettySurveyValue(submission.email ?? responses.email),
      country: prettySurveyValue(responses.country),
      financialSecurity: prettySurveyValue(responses.financialSecurity),
      policyBelMonthly: belMonthly,
      policyDependent: prettySurveyValue(policyModel.dependent_policy),
      policyRetirement: prettySurveyValue(policyModel.retirement),
      policyHealthcare: prettySurveyValue(policyModel.healthcare),
      responses,
    })
  }

  return snapshots
}

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

async function getFeedback() {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
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
  const feedback = await getFeedback()
  const stats = await getStatistics(submissions)
  const quickSurveySnapshots = getQuickSurveySnapshots(submissions)

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <AdminHeader />

        {/* Stats Summary */}
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.125rem' }}>{stats.totalSubmissions}</span>
          <span style={{ color: '#94a3b8' }}> total submissions</span>
        </p>

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

        {/* Feedback Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-bright mb-4">📝 User Feedback ({feedback.length})</h2>
          <FeedbackTable feedback={feedback} />
        </div>

        {/* Quick Survey Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-bright mb-4">
            Quick Survey Responses ({quickSurveySnapshots.length})
          </h2>
          <QuickSurveyTable snapshots={quickSurveySnapshots} />
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
