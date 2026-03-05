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
  secondaryLabel: string
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

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

function isGenericScenarioName(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return (
    normalized.length === 0 ||
    normalized === 'default' ||
    normalized === 'custom' ||
    normalized === 'anonymous' ||
    /^scenario(\s+\d+)?$/.test(normalized)
  )
}

function buildFallbackScenarioName(
  submission: SubmissionRecord,
  policy: PolicyDetails
): string {
  const balance = toNumber(submission.surplus_deficit)
  const transactionTaxPct = toNumber(submission.token_tax_rate) * 100

  if (policy.revenueStructure === 'Friction only') {
    return 'Minimal State Model'
  }

  if (balance > 0 && transactionTaxPct >= 0.2 && transactionTaxPct <= 0.55) {
    return 'Balanced Federal Model'
  }

  if (balance < 0) {
    return 'Stress Test Scenario'
  }

  if (transactionTaxPct < 0.2) {
    return 'Low-Friction Scenario'
  }

  return 'High Growth Scenario'
}

function chooseScenarioName(
  submission: SubmissionRecord,
  policy: PolicyDetails
): string {
  const submittedName = typeof submission.name === 'string' ? submission.name.trim() : ''
  if (submittedName && !isGenericScenarioName(submittedName)) {
    return submittedName
  }

  const configName = typeof submission.config_name === 'string' ? submission.config_name.trim() : ''
  if (configName && !isGenericScenarioName(configName)) {
    return configName
  }

  return buildFallbackScenarioName(submission, policy)
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
  const provisional = submissions.map((submission, idx) => {
    const policy = getPolicyDetails(submission)
    const scenarioName = chooseScenarioName(submission, policy)
    const secondaryLabel =
      typeof submission.config_name === 'string' &&
      submission.config_name.trim().length > 0 &&
      !isGenericScenarioName(submission.config_name)
        ? submission.config_name.trim()
        : `${policy.revenueStructure} architecture`

    return {
      id: submission.id,
      rank: idx + 1,
      scenario: scenarioName,
      secondaryLabel,
      balance: toNumber(submission.surplus_deficit),
      isSolvent: Boolean(submission.is_solvent),
      revenue: getTotalRevenue(submission.result),
      workIncentive: getWorkIncentiveScore(submission.result),
      transactionTaxPct: toNumber(submission.token_tax_rate) * 100,
      submittedAt: submission.created_at,
      revenueEfficiencyScore:
        toNumber(submission.token_tax_rate) > 0
          ? getTotalRevenue(submission.result) / toNumber(submission.token_tax_rate)
          : getTotalRevenue(submission.result),
      policy,
    }
  })

  const counts = new Map<string, number>()
  return provisional.map((row) => {
    const seenCount = (counts.get(row.scenario) ?? 0) + 1
    counts.set(row.scenario, seenCount)

    if (seenCount === 1) {
      return row
    }

    return {
      ...row,
      scenario: `${row.scenario} ${seenCount}`,
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

  const lastSubmission =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((latest, row) => {
          const latestTime = new Date(latest.submittedAt).getTime()
          const rowTime = new Date(row.submittedAt).getTime()
          return rowTime > latestTime ? row : latest
        })
      : null

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="bg-dark-slate rounded-2xl border border-white/15 px-6 py-10 md:px-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-bright mb-5">
            Policy Innovation Leaderboard
          </h1>
          <p className="text-lg text-dimmed max-w-4xl mx-auto">
            Explore the most effective fiscal policy scenarios discovered using
            the NAIERM economic simulation model.
          </p>
          <p className="text-base text-dimmed mt-4 max-w-4xl mx-auto">
            Researchers, students, policymakers, and citizens can test their
            own ideas and compare outcomes.
          </p>
          <p className="text-base text-bright mt-2">Your scenario could be next.</p>

          <div className="mt-7">
            <Link
              href="/model"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition"
            >
              Launch Policy Simulator -&gt;
            </Link>
          </div>

          <div className="mt-6 text-xs text-muted">
            <span className="font-semibold">Total Scenarios Tested:</span>{' '}
            {totalCount.toLocaleString('en-US')}
            {'  '}|{'  '}
            <span className="font-semibold">Last Submission:</span>{' '}
            {lastSubmission ? formatDate(lastSubmission.submittedAt) : 'N/A'}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <article className="bg-dark-slate rounded-xl border border-white/15 p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">
              Scenarios Tested
            </p>
            <p className="text-3xl font-bold text-bright">
              {totalCount.toLocaleString('en-US')}
            </p>
          </article>

          <article className="bg-dark-slate rounded-xl border border-emerald-300/35 p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">
              Best Fiscal Balance
            </p>
            <p className="text-3xl font-bold text-green-400">
              {bestFiscalScenario ? formatBillions(bestFiscalScenario.balance, true) : '$0.0B'}
            </p>
          </article>

          <article className="bg-dark-slate rounded-xl border border-blue-300/30 p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">
              Average Work Incentive
            </p>
            <p className="text-3xl font-bold text-blue-400">
              {formatPercent(avgWorkIncentive, 1)}
            </p>
          </article>

          <article className="bg-dark-slate rounded-xl border border-cyan-300/30 p-5 md:col-span-1 lg:col-span-1">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">
              Most Efficient Revenue Design
            </p>
            <p className="text-base font-semibold text-bright">
              {mostEfficientRevenueScenario?.scenario || 'N/A'}
            </p>
            <p className="text-sm text-dimmed mt-2">
              {mostEfficientRevenueScenario
                ? `${formatBillions(mostEfficientRevenueScenario.revenue)} revenue @ ${formatPercent(mostEfficientRevenueScenario.transactionTaxPct, 2)}`
                : 'No submissions yet'}
            </p>
          </article>

          <article className="bg-dark-slate rounded-xl border border-amber-300/35 p-5 md:col-span-1 lg:col-span-1">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">
              Best Work Incentive
            </p>
            <p className="text-base font-semibold text-bright">
              {bestWorkIncentiveScenario?.scenario || 'N/A'}
            </p>
            <p className="text-sm text-dimmed mt-2">
              {bestWorkIncentiveScenario
                ? formatPercent(bestWorkIncentiveScenario.workIncentive, 1)
                : '0.0%'}
            </p>
          </article>
        </section>

        <section className="bg-dark-slate rounded-2xl border border-white/12 px-6 py-7 md:px-8">
          <h2 className="text-3xl font-semibold text-bright mb-4">
            How the Leaderboard Works
          </h2>
          <p className="text-base text-dimmed mb-4">
            Each submission represents a complete policy configuration tested in
            the simulator.
          </p>
          <ul className="text-base text-dimmed list-disc list-inside space-y-1 mb-4">
            <li>Fiscal balance</li>
            <li>Sustainable revenue generation</li>
            <li>Work incentive preservation</li>
            <li>Realistic transaction tax levels</li>
          </ul>
          <p className="text-base text-dimmed">
            Top results highlight policy combinations that maintain government
            solvency while supporting household economic stability.
          </p>
        </section>

        {rankedScenarios.length === 0 ? (
          <section className="bg-dark-slate rounded-2xl border border-white/12 p-10 text-center">
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
          <section className="bg-dark-slate rounded-2xl border border-white/12 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h2 className="text-3xl font-semibold text-bright">
                Leaderboard Results
              </h2>
              <p className="text-xs text-muted mt-1">
                Tip: Add a custom scenario name when submitting to make your model easier to find.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
                <thead className="bg-darker-slate border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">Scenario</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Fiscal Balance</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Revenue</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Work Incentive</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Transaction Tax</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-muted">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedScenarios.map((row, idx) => {
                    const isTopRow = idx === 0

                    return (
                      <tr
                        key={row.id}
                        className={`border-t border-white/10 transition ${
                          isTopRow ? 'bg-amber-400/10' : 'hover:bg-white/5'
                        }`}
                        style={
                          isTopRow
                            ? {
                                boxShadow:
                                  'inset 4px 0 0 rgba(251,191,36,0.95), inset 0 0 0 1px rgba(251,191,36,0.35), 0 0 20px rgba(251,191,36,0.1)',
                              }
                            : undefined
                        }
                      >
                        <td className={`px-4 py-4 font-semibold ${isTopRow ? 'text-amber-300' : 'text-bright'}`}>
                          {isTopRow ? `#${row.rank} Top Scenario` : `#${row.rank}`}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-bright">{row.scenario}</p>
                          <p className="text-xs text-dimmed mt-1">{row.secondaryLabel}</p>
                        </td>
                        <td className={`px-4 py-4 text-right font-semibold ${row.isSolvent ? 'text-green-400' : 'text-red-400'}`}>
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
                          {formatDate(row.submittedAt)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <details>
                            <summary className="cursor-pointer rounded-md border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/20 transition list-none inline-block">
                              View Policy
                            </summary>
                            <div className="mt-2 min-w-[260px] rounded-md border border-white/10 bg-darker-navy p-3 text-xs text-dimmed space-y-1 leading-5">
                              <p>
                                <span className="text-muted">BEL level:</span>{' '}
                                {usdFormatter.format(row.policy.belLevel)} per adult/year
                              </p>
                              <p>
                                <span className="text-muted">SBI configuration:</span>{' '}
                                Breakout at {usdFormatter.format(row.policy.sbiBreakoutPoint)}
                              </p>
                              <p>
                                <span className="text-muted">Healthcare assumption:</span>{' '}
                                {row.policy.healthcareAssumption}
                              </p>
                              <p>
                                <span className="text-muted">Retirement replacement:</span>{' '}
                                {row.policy.retirementReplacement === null
                                  ? 'Not specified'
                                  : formatPercent(row.policy.retirementReplacement, 0)}
                              </p>
                              <p>
                                <span className="text-muted">Revenue structure:</span>{' '}
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

        <section className="bg-dark-slate rounded-2xl border border-white/12 px-6 py-9 md:px-8 text-center">
          <h2 className="text-3xl font-semibold text-bright mb-4">
            Test Your Own Policy Scenario
          </h2>
          <p className="text-base text-dimmed max-w-4xl mx-auto">
            The NAIERM simulator allows anyone to explore how policy choices
            affect national fiscal balance and work incentives.
          </p>
          <ul className="text-base text-dimmed list-disc list-inside mt-4 max-w-3xl mx-auto text-left space-y-1">
            <li>revenue structures</li>
            <li>BEL economic liquidity levels</li>
            <li>program assumptions</li>
          </ul>
          <p className="text-base text-dimmed max-w-4xl mx-auto mt-4">
            Then submit your results and see how your policy compares on the
            leaderboard. Your model could become the next top scenario.
          </p>
          <div className="mt-7">
            <Link
              href="/model"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition"
            >
              Launch the Simulator
            </Link>
          </div>
        </section>

        <p className="text-xs text-muted text-center pt-1 pb-2 border-t border-white/10">
          All leaderboard scenarios are generated from simulator submissions and
          exported directly from the model dataset. No personally identifying
          information is collected.
        </p>
      </div>
    </div>
  )
}
