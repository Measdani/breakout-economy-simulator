import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SubmissionRecord = {
  id: string
  name: string | null
  config_name: string | null
  token_tax_rate: number | null
  ubi_annual: number | null
  breakout_point: number | null
  is_solvent: boolean | null
  surplus_deficit: number | null
  created_at: string
  result: unknown
  config: unknown
  submission_payload_json: unknown
}

type PolicyDetails = {
  belLevel: number
  sbiBreakoutPoint: number
  healthcareAssumption: string
  retirementReplacement: number | null
  revenueStructure: string
}

type RankedScenario = {
  id: string
  rank: number
  scenario: string
  configName: string
  balance: number
  isSolvent: boolean
  revenue: number
  workIncentive: number
  transactionTaxPct: number
  submittedAt: string
  revenueEfficiencyScore: number
  policy: PolicyDetails
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const revenueModeLabels: Record<string, string> = {
  hybrid: 'Hybrid',
  friction_dominant: 'Friction dominant',
  friction_only: 'Friction only',
}

const healthcareModeLabels: Record<string, string> = {
  baseline: 'Baseline',
  efficiency_reform: 'Efficiency reform',
  structural_replacement: 'Structural replacement',
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return {}
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return null
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = toNullableNumber(value)
  return parsed === null ? fallback : parsed
}

function firstText(values: unknown[], fallback: string): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return fallback
}

function firstNumber(values: unknown[], fallback = 0): number {
  for (const value of values) {
    const parsed = toNullableNumber(value)
    if (parsed !== null) {
      return parsed
    }
  }
  return fallback
}

function firstNullableNumber(values: unknown[]): number | null {
  for (const value of values) {
    const parsed = toNullableNumber(value)
    if (parsed !== null) {
      return parsed
    }
  }
  return null
}

function mapModeLabel(
  rawValue: unknown,
  map: Record<string, string>,
  fallback: string
): string {
  if (typeof rawValue !== 'string') {
    return fallback
  }

  return map[rawValue] ?? fallback
}

function formatBillions(value: number, signed = false): string {
  const billions = value / 1e9
  const sign = signed && billions >= 0 ? '+' : ''
  return `${sign}$${billions.toFixed(1)}B`
}

function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

function getTotalRevenue(result: unknown): number {
  const resultObj = asRecord(result)
  const revenue = asRecord(resultObj.revenue)
  return toNumber(revenue.totalRevenue)
}

function getWorkIncentiveScore(result: unknown): number {
  const resultObj = asRecord(result)
  const citizenModel = asRecord(resultObj.citizenModel)
  const personasRaw = citizenModel.personaOutcomes

  if (!Array.isArray(personasRaw) || personasRaw.length < 2) {
    return 0
  }

  let totalRetention = 0
  let count = 0

  for (let i = 0; i < personasRaw.length - 1; i++) {
    const current = asRecord(personasRaw[i])
    const next = asRecord(personasRaw[i + 1])
    const incomeDiff = toNumber(next.earnedIncome) - toNumber(current.earnedIncome)
    const netDiff = toNumber(next.netIncome) - toNumber(current.netIncome)

    if (incomeDiff > 0) {
      totalRetention += (netDiff / incomeDiff) * 100
      count++
    }
  }

  return count > 0 ? totalRetention / count : 0
}

function getPolicyDetails(submission: SubmissionRecord): PolicyDetails {
  const config = asRecord(submission.config)
  const payload = asRecord(submission.submission_payload_json)
  const scenarioInputs = asRecord(payload.scenario_inputs)
  const selectedPolicy = asRecord(scenarioInputs.selected_policy_variables)
  const retirementInputs = asRecord(scenarioInputs.retirement)
  const metadata = asRecord(payload.model_metadata)

  const replacementRateFromConfig = toNullableNumber(config.replacementRate)
  const replacementRatePctFromConfig =
    replacementRateFromConfig === null ? null : replacementRateFromConfig * 100

  const belLevel = firstNumber(
    [
      config.ubiAnnualPerAdult,
      submission.ubi_annual,
      selectedPolicy.ubi_annual_per_adult,
    ],
    0
  )

  const sbiBreakoutPoint = firstNumber(
    [
      config.breakoutPoint,
      submission.breakout_point,
      selectedPolicy.breakout_point,
    ],
    0
  )

  const revenueStructureRaw = firstText(
    [
      config.revenueArchitectureMode,
      selectedPolicy.revenue_architecture_mode,
      metadata.revenueArchitectureMode,
    ],
    'hybrid'
  )

  const healthcareRaw = firstText(
    [
      config.healthcareMode,
      selectedPolicy.healthcare_mode,
      metadata.healthcareMode,
    ],
    'baseline'
  )

  const retirementReplacement = firstNullableNumber([
    replacementRatePctFromConfig,
    retirementInputs.replacement_rate,
    selectedPolicy.replacement_rate_pct,
  ])

  return {
    belLevel,
    sbiBreakoutPoint,
    healthcareAssumption: mapModeLabel(healthcareRaw, healthcareModeLabels, 'Baseline'),
    retirementReplacement,
    revenueStructure: mapModeLabel(revenueStructureRaw, revenueModeLabels, 'Hybrid'),
  }
}

async function getLeaderboardData() {
  const supabase = createClient()

  const submissionsQuery = supabase
    .from('submissions')
    .select('*')
    .order('surplus_deficit', { ascending: false })
    .limit(25)

  const totalCountQuery = supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    submissionsQuery,
    totalCountQuery,
  ])

  if (error) {
    throw error
  }

  if (countError) {
    console.error('Leaderboard count query error:', countError)
  }

  return {
    submissions: (data ?? []) as SubmissionRecord[],
    totalCount: typeof count === 'number' ? count : (data ?? []).length,
  }
}

function buildRankedScenarios(submissions: SubmissionRecord[]): RankedScenario[] {
  return submissions.map((submission, idx) => {
    const balance = toNumber(submission.surplus_deficit)
    const revenue = getTotalRevenue(submission.result)
    const workIncentive = getWorkIncentiveScore(submission.result)
    const transactionTaxPct = toNumber(submission.token_tax_rate) * 100
    const scenario = firstText(
      [submission.name, submission.config_name],
      `Scenario ${idx + 1}`
    )

    return {
      id: submission.id,
      rank: idx + 1,
      scenario,
      configName: firstText([submission.config_name], 'Custom'),
      balance,
      isSolvent: Boolean(submission.is_solvent),
      revenue,
      workIncentive,
      transactionTaxPct,
      submittedAt: submission.created_at,
      revenueEfficiencyScore:
        transactionTaxPct > 0 ? revenue / transactionTaxPct : revenue,
      policy: getPolicyDetails(submission),
    }
  })
}

export default async function LeaderboardPage() {
  const { submissions, totalCount } = await getLeaderboardData()
  const rankedScenarios = buildRankedScenarios(submissions)

  const avgWorkIncentive =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((sum, row) => sum + row.workIncentive, 0) /
        rankedScenarios.length
      : 0

  const bestFiscalScenario =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((best, row) =>
          row.balance > best.balance ? row : best
        )
      : null

  const mostEfficientRevenueScenario =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((best, row) =>
          row.revenueEfficiencyScore > best.revenueEfficiencyScore ? row : best
        )
      : null

  const bestWorkIncentiveScenario =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((best, row) =>
          row.workIncentive > best.workIncentive ? row : best
        )
      : null

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <section className="bg-dark-slate rounded-xl border border-border-slate p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-bright mb-4">
            Policy Innovation Leaderboard
          </h1>
          <p className="text-lg text-dimmed max-w-4xl mx-auto">
            Explore the highest-performing policy scenarios discovered using
            the NAIERM model.
          </p>
          <p className="text-sm text-dimmed mt-3 max-w-4xl mx-auto">
            Researchers, students, policymakers, and citizens can test their
            fiscal policy ideas using the simulator. The most balanced and
            sustainable outcomes appear here. Your scenario could be next.
          </p>
          <div className="mt-6">
            <Link
              href="/model"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition"
            >
              Launch Policy Simulator -&gt;
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-1">
              Scenarios Tested
            </p>
            <p className="text-2xl font-bold text-bright">
              {totalCount.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-1">
              Best Fiscal Balance
            </p>
            <p className="text-2xl font-bold text-green-400">
              {bestFiscalScenario
                ? formatBillions(bestFiscalScenario.balance, true)
                : '$0.0B'}
            </p>
          </div>
          <div className="bg-dark-slate rounded-lg border border-border-slate p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-1">
              Average Work Incentive
            </p>
            <p className="text-2xl font-bold text-blue-400">
              {formatPercent(avgWorkIncentive, 1)}
            </p>
          </div>
        </section>

        {rankedScenarios.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-slate rounded-lg border border-amber-400/50 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300 mb-2">
                Best Fiscal Balance
              </p>
              <p className="text-sm font-semibold text-bright">
                {bestFiscalScenario?.scenario}
              </p>
              <p className="text-xs text-dimmed mt-1">
                {bestFiscalScenario
                  ? formatBillions(bestFiscalScenario.balance, true)
                  : '$0.0B'}
              </p>
            </div>
            <div className="bg-dark-slate rounded-lg border border-cyan-400/40 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300 mb-2">
                Most Efficient Revenue Design
              </p>
              <p className="text-sm font-semibold text-bright">
                {mostEfficientRevenueScenario?.scenario}
              </p>
              <p className="text-xs text-dimmed mt-1">
                {mostEfficientRevenueScenario
                  ? `${formatBillions(
                      mostEfficientRevenueScenario.revenue
                    )} at ${formatPercent(
                      mostEfficientRevenueScenario.transactionTaxPct,
                      2
                    )}`
                  : '-'}
              </p>
            </div>
            <div className="bg-dark-slate rounded-lg border border-emerald-400/40 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-300 mb-2">
                Best Work Incentive
              </p>
              <p className="text-sm font-semibold text-bright">
                {bestWorkIncentiveScenario?.scenario}
              </p>
              <p className="text-xs text-dimmed mt-1">
                {bestWorkIncentiveScenario
                  ? formatPercent(bestWorkIncentiveScenario.workIncentive, 1)
                  : '0.0%'}
              </p>
            </div>
          </section>
        )}

        <section className="bg-dark-slate rounded-xl border border-border-slate p-6">
          <h2 className="text-2xl font-semibold text-bright mb-3">
            How the Leaderboard Works
          </h2>
          <p className="text-sm text-dimmed mb-3">
            Each submission represents a full policy configuration tested in
            the simulator.
          </p>
          <ul className="text-sm text-dimmed list-disc list-inside space-y-1 mb-3">
            <li>Fiscal balance</li>
            <li>Sustainable revenue generation</li>
            <li>Work incentive preservation</li>
            <li>Realistic transaction tax levels</li>
          </ul>
          <p className="text-sm text-dimmed">
            Top results show combinations that maintain government solvency
            while supporting household economic stability.
          </p>
        </section>

        {rankedScenarios.length === 0 ? (
          <section className="bg-dark-slate rounded-xl border border-border-slate p-8 text-center">
            <p className="text-bright font-semibold mb-2">
              No scenarios have been submitted yet.
            </p>
            <p className="text-sm text-dimmed mb-5">
              Launch the model and submit the first policy scenario.
            </p>
            <Link
              href="/model"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition"
            >
              Launch Policy Simulator -&gt;
            </Link>
          </section>
        ) : (
          <section className="bg-dark-slate rounded-xl border border-border-slate overflow-hidden">
            <div className="px-6 py-4 border-b border-border-slate">
              <h2 className="text-xl font-semibold text-bright">
                Leaderboard Results
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead className="bg-darker-slate border-b border-border-slate">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">
                      Scenario
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">
                      Fiscal Balance
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">
                      Work Incentive
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">
                      Transaction Tax
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankedScenarios.map((row, idx) => {
                    const isTopRow = idx === 0

                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-border-slate ${
                          isTopRow
                            ? 'bg-amber-400/10'
                            : 'hover:bg-darker-navy transition'
                        }`}
                        style={
                          isTopRow
                            ? {
                                boxShadow:
                                  'inset 0 0 0 1px rgba(251, 191, 36, 0.45)',
                              }
                            : undefined
                        }
                      >
                        <td
                          className={`px-4 py-4 font-semibold ${
                            isTopRow ? 'text-amber-300' : 'text-bright'
                          }`}
                        >
                          {isTopRow ? `#${row.rank} Top` : `#${row.rank}`}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-bright">
                            {row.scenario}
                          </p>
                          <p className="text-xs text-dimmed mt-1">
                            {row.configName}
                          </p>
                        </td>
                        <td
                          className={`px-4 py-4 text-right font-semibold ${
                            row.isSolvent ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatBillions(row.balance, true)}
                        </td>
                        <td className="px-4 py-4 text-right text-dimmed">
                          {formatBillions(row.revenue)}
                        </td>
                        <td className="px-4 py-4 text-right text-dimmed">
                          {formatPercent(row.workIncentive, 1)}
                        </td>
                        <td className="px-4 py-4 text-right text-dimmed">
                          {formatPercent(row.transactionTaxPct, 2)}
                        </td>
                        <td className="px-4 py-4 text-right text-dimmed text-sm whitespace-nowrap">
                          {new Date(row.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <details>
                            <summary className="cursor-pointer rounded-md border border-border-slate px-3 py-1.5 text-xs text-bright hover:bg-darker-navy transition list-none inline-block">
                              View Policy
                            </summary>
                            <div className="mt-2 min-w-[250px] rounded-md border border-border-slate bg-darker-navy p-3 text-xs text-dimmed space-y-1 leading-5">
                              <p>
                                <span className="text-muted">BEL level:</span>{' '}
                                {usdFormatter.format(row.policy.belLevel)} per
                                adult/year
                              </p>
                              <p>
                                <span className="text-muted">
                                  SBI configuration:
                                </span>{' '}
                                Breakout at{' '}
                                {usdFormatter.format(row.policy.sbiBreakoutPoint)}
                              </p>
                              <p>
                                <span className="text-muted">
                                  Healthcare assumption:
                                </span>{' '}
                                {row.policy.healthcareAssumption}
                              </p>
                              <p>
                                <span className="text-muted">
                                  Retirement replacement:
                                </span>{' '}
                                {row.policy.retirementReplacement === null
                                  ? 'Not specified'
                                  : formatPercent(
                                      row.policy.retirementReplacement,
                                      0
                                    )}
                              </p>
                              <p>
                                <span className="text-muted">
                                  Revenue structure:
                                </span>{' '}
                                {row.policy.revenueStructure}
                              </p>
                            </div>
                          </details>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="bg-dark-slate rounded-xl border border-border-slate p-8 text-center">
          <h2 className="text-2xl font-semibold text-bright mb-3">
            Test Your Own Policy Scenario
          </h2>
          <p className="text-sm text-dimmed max-w-4xl mx-auto">
            The NAIERM simulator lets anyone explore how policy choices affect
            national fiscal balance and work incentives. Adjust revenue
            structures, BEL levels, and program assumptions, then submit and
            compare outcomes.
          </p>
          <div className="mt-6">
            <Link
              href="/model"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition"
            >
              Launch the Simulator
            </Link>
          </div>
        </section>

        <p className="text-xs text-muted text-center pb-2">
          All leaderboard scenarios are generated from simulator submissions and
          exported directly from the model dataset. No personally identifying
          information is collected.
        </p>
      </div>
    </div>
  )
}
