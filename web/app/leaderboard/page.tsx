import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'
import { cookies } from 'next/headers'
import { Fragment } from 'react'

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
  scenario: string
  secondaryLabel: string
  isSurveyGenerated: boolean
  balance: number
  isSolvent: boolean
  revenue: number
  workIncentive: number
  tokenTaxPct: number
  submittedAt: string
  revenueEfficiencyScore: number
  policy: PolicyDetails
}

type SupportBand = 'lower' | 'moderate' | 'higher'

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
  const tokenTaxPct = toNumber(submission.token_tax_rate) * 100

  if (policy.revenueStructure === 'Friction only') {
    return 'Minimal State Model'
  }

  if (balance > 0 && tokenTaxPct >= 0.2 && tokenTaxPct <= 0.55) {
    return 'Balanced Federal Model'
  }

  if (balance < 0) {
    return 'Stress Test Scenario'
  }

  if (tokenTaxPct < 0.2) {
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

function isSurveyGeneratedSubmission(submission: SubmissionRecord): boolean {
  const payload = asRecord(submission.submission_payload_json)
  const survey = asRecord(payload.survey_response)
  return typeof survey.survey_name === 'string' && survey.survey_name.trim().length > 0
}

async function getLeaderboardData() {
  const supabase = createServiceClient()

  const submissionsQuery = supabase
    .from('submissions')
    .select(
      'id, name, config_name, token_tax_rate, ubi_annual, breakout_point, is_solvent, surplus_deficit, created_at, result, config, submission_payload_json'
    )
    .order('created_at', { ascending: false })

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
  return submissions.map((submission) => {
    const policy = getPolicyDetails(submission)
    const isSurveyGenerated = isSurveyGeneratedSubmission(submission)
    const scenarioName = isSurveyGenerated ? 'Survey' : chooseScenarioName(submission, policy)
    const secondaryLabel = isSurveyGenerated
      ? 'Survey generated policy'
      : (
        typeof submission.config_name === 'string' &&
        submission.config_name.trim().length > 0 &&
        !isGenericScenarioName(submission.config_name)
          ? submission.config_name.trim()
          : `${policy.revenueStructure} fiscal architecture`
      )

    return {
      id: submission.id,
      scenario: scenarioName,
      secondaryLabel,
      isSurveyGenerated,
      balance: toNumber(submission.surplus_deficit),
      isSolvent: Boolean(submission.is_solvent),
      revenue: getTotalRevenue(submission.result),
      workIncentive: getWorkIncentiveScore(submission.result),
      tokenTaxPct: toNumber(submission.token_tax_rate) * 100,
      submittedAt: submission.created_at,
      revenueEfficiencyScore:
        toNumber(submission.token_tax_rate) > 0
          ? getTotalRevenue(submission.result) / toNumber(submission.token_tax_rate)
          : getTotalRevenue(submission.result),
      policy,
    }
  })
}

function getMedian(values: number[]): number | null {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  if (sorted.length === 0) {
    return null
  }

  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function getSupportBand(belLevel: number): SupportBand {
  if (belLevel < 10000) {
    return 'lower'
  }

  if (belLevel <= 16000) {
    return 'moderate'
  }

  return 'higher'
}

function buildPolicyInsights(rows: RankedScenario[]): string[] {
  if (rows.length === 0) {
    return []
  }

  const belLevels = rows
    .map((row) => row.policy.belLevel)
    .filter((value) => Number.isFinite(value) && value > 0)
  const breakoutPoints = rows
    .map((row) => row.policy.sbiBreakoutPoint)
    .filter((value) => Number.isFinite(value) && value > 0)
  const workIncentives = rows
    .map((row) => row.workIncentive)
    .filter((value) => Number.isFinite(value))

  const supportBandCounts: Record<SupportBand, number> = {
    lower: 0,
    moderate: 0,
    higher: 0,
  }

  for (const belLevel of belLevels) {
    supportBandCounts[getSupportBand(belLevel)] += 1
  }

  const dominantSupportBand = (Object.entries(supportBandCounts) as [SupportBand, number][])
    .reduce((best, current) => (current[1] > best[1] ? current : best), ['moderate', 0])[0]
  const moderateShare = belLevels.length > 0 ? supportBandCounts.moderate / belLevels.length : 0
  const medianBelLevel = getMedian(belLevels)
  const belLevelText =
    medianBelLevel === null
      ? 'income support levels'
      : `income support levels, with a median BEL of ${usdFormatter.format(Math.round(medianBelLevel))} per adult/year`

  let supportInsight = `Submission patterns are still forming around ${belLevelText}.`

  if (belLevels.length > 0) {
    if (moderateShare >= 0.5) {
      supportInsight = `Most submissions cluster around moderate ${belLevelText}.`
    } else if (dominantSupportBand === 'lower') {
      supportInsight = `The most common submissions lean toward lighter ${belLevelText}.`
    } else if (dominantSupportBand === 'higher') {
      supportInsight = `The most common submissions lean toward higher ${belLevelText}.`
    } else {
      supportInsight = `The most common income support range is moderate, with a median BEL of ${usdFormatter.format(Math.round(medianBelLevel ?? 0))} per adult/year.`
    }
  }

  const medianBreakoutPoint = getMedian(breakoutPoints)
  const gradualBreakoutShare =
    breakoutPoints.length > 0
      ? breakoutPoints.filter((value) => value >= 60000).length / breakoutPoints.length
      : 0

  let breakoutInsight = 'Supplement phaseout patterns will appear here as more submissions come in.'

  if (medianBreakoutPoint !== null) {
    if (gradualBreakoutShare >= 0.5) {
      breakoutInsight = `${formatPercent(gradualBreakoutShare * 100, 0)} of submissions keep supplemental support active to at least ${usdFormatter.format(60000)}, with a median breakout point of ${usdFormatter.format(Math.round(medianBreakoutPoint))}.`
    } else {
      breakoutInsight = `Typical submissions phase supplemental support out around ${usdFormatter.format(Math.round(medianBreakoutPoint))} of earned income.`
    }
  }

  const averageWorkIncentive =
    workIncentives.length > 0
      ? workIncentives.reduce((sum, value) => sum + value, 0) / workIncentives.length
      : null
  const strongWorkShare =
    workIncentives.length > 0
      ? workIncentives.filter((value) => value >= 75).length / workIncentives.length
      : 0

  let workInsight = 'Work incentive data will appear once submissions accumulate.'

  if (averageWorkIncentive !== null) {
    if (strongWorkShare >= 0.5) {
      workInsight = `Work incentives stay strong across the dataset: ${formatPercent(strongWorkShare * 100, 0)} of submissions score at least 75%, and the average model lands at ${formatPercent(averageWorkIncentive, 1)}.`
    } else {
      workInsight = `Submitted models average ${formatPercent(averageWorkIncentive, 1)} on the work-incentive metric.`
    }
  }

  return [supportInsight, breakoutInsight, workInsight]
}

function buildTradeoffLine(row: RankedScenario): string {
  const supportBand = getSupportBand(row.policy.belLevel)

  if (row.isSolvent) {
    if (supportBand === 'moderate') {
      return 'This policy maintains solvency with moderate support levels.'
    }

    if (supportBand === 'higher') {
      return 'This policy maintains solvency while offering higher support levels.'
    }

    return 'This policy preserves fiscal balance with lighter support levels.'
  }

  if (supportBand === 'higher' || supportBand === 'moderate') {
    return 'This policy increases support but reduces fiscal balance.'
  }

  return 'This policy falls short of fiscal balance without significantly increasing support levels.'
}

export default async function LeaderboardPage() {
  const { submissions, totalCount } = await getLeaderboardData()
  const rankedScenarios = buildRankedScenarios(submissions)
  const policyInsights = buildPolicyInsights(rankedScenarios)

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

  const cookieStore = await cookies()
  const lastSubmissionId = cookieStore.get('last_submission_id')?.value ?? null

  const yourSubmission =
    lastSubmissionId
      ? rankedScenarios.find((row) => row.id === lastSubmissionId) ?? null
      : null

  const primarySubmission = yourSubmission ?? lastSubmission
  const primaryUserLabel = yourSubmission ? 'You' : 'Last Submission'

  const averageBalance =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((sum, row) => sum + row.balance, 0) / rankedScenarios.length
      : 0

  const averageRevenue =
    rankedScenarios.length > 0
      ? rankedScenarios.reduce((sum, row) => sum + row.revenue, 0) / rankedScenarios.length
      : 0

  const displayRows =
    primarySubmission === null
      ? []
      : [
          {
            id: `primary-${primarySubmission.id}`,
            userLabel: primaryUserLabel,
            scenario: primarySubmission.scenario,
            secondaryLabel: primarySubmission.secondaryLabel,
            tradeoffLine: buildTradeoffLine(primarySubmission),
            balance: primarySubmission.balance,
            isSolvent: primarySubmission.isSolvent,
            revenue: primarySubmission.revenue,
            workIncentive: primarySubmission.workIncentive,
            submittedAt: primarySubmission.submittedAt,
            submissionCount: null as number | null,
            policy: primarySubmission.policy as PolicyDetails | null,
          },
          {
            id: 'average-row',
            userLabel: 'Average',
            scenario: 'All Submitted Scenarios',
            secondaryLabel: 'Average across all simulator submissions',
            tradeoffLine: null as string | null,
            balance: averageBalance,
            isSolvent: averageBalance >= 0,
            revenue: averageRevenue,
            workIncentive: avgWorkIncentive,
            submittedAt: null as string | null,
            submissionCount: totalCount,
            policy: null as PolicyDetails | null,
          },
        ]

  return (
    <PublicSiteShell contentClassName="max-w-none p-0">
      <main className="lb-page">
        <div className="lb-container">
          <section className="lb-hero">
            <div className="lb-kicker">Policy Innovation</div>
            <h1 className="lb-title">Submissions</h1>
            <p className="lb-subtitle">
              Explore the most effective fiscal policy scenarios discovered using the NAiERM economic simulation model. Researchers, students, policymakers, and citizens can test their own ideas and compare outcomes.
            </p>

            <div className="lb-stats">
              <article className="stat">
                <div className="stat-label">Scenarios Tested</div>
                <div className="stat-value">{totalCount.toLocaleString('en-US')}</div>
                <div className="stat-sub">From simulator submissions</div>
              </article>

              <article className="stat">
                <div className="stat-label">Best Fiscal Balance</div>
                <div className="stat-value stat-value-positive">
                  {bestFiscalScenario ? formatBillions(bestFiscalScenario.balance, true) : '$0.0B'}
                </div>
                <div className="stat-sub">Top solvent configuration</div>
              </article>

              <article className="stat">
                <div className="stat-label">Average Work Incentive</div>
                <div className="stat-value stat-value-info">{formatPercent(avgWorkIncentive, 1)}</div>
                <div className="stat-sub">Across all submissions</div>
              </article>

              <article className="stat">
                <div className="stat-label">Most Efficient Revenue Design</div>
                <div className="stat-name">{mostEfficientRevenueScenario?.scenario || 'N/A'}</div>
                <div className="stat-sub">
                  {mostEfficientRevenueScenario
                    ? `${formatBillions(mostEfficientRevenueScenario.revenue)} revenue @ ${formatPercent(mostEfficientRevenueScenario.tokenTaxPct, 2)}`
                    : 'No submissions yet'}
                </div>
              </article>

              <article className="stat">
                <div className="stat-label">Best Work Incentive</div>
                <div className="stat-name">{bestWorkIncentiveScenario?.scenario || 'N/A'}</div>
                <div className="stat-sub">
                  {bestWorkIncentiveScenario
                    ? formatPercent(bestWorkIncentiveScenario.workIncentive, 1)
                    : '0.0%'}
                </div>
              </article>
            </div>

            {policyInsights.length > 0 ? (
              <div className="lb-insights">
                <div className="lb-insights-kicker">Policy Insights</div>
                <h2 className="lb-insights-title">Key Insights from Submissions</h2>
                <ul className="lb-insights-list">
                  {policyInsights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="lb-section">
            <h2 className="lb-h2">How Submissions Work</h2>
            <p className="lb-p">
              Each submission represents a complete policy configuration tested in the simulator.
            </p>
            <ul className="lb-list">
              <li>Fiscal balance</li>
              <li>Sustainable revenue generation</li>
              <li>Work incentive preservation</li>
              <li>Realistic token tax levels</li>
            </ul>
            <p className="lb-p">
              Top results highlight policy combinations that maintain government solvency while
              supporting household economic stability.
            </p>
          </section>

          {rankedScenarios.length === 0 ? (
            <section className="lb-section">
              <h2 className="lb-h2">Submissions</h2>
              <p className="lb-p">No scenarios have been submitted yet.</p>
              <div className="lb-hero-actions">
                <Link href="/model" className="btn-primary">
                  Launch Policy Simulator -&gt;
                </Link>
              </div>
            </section>
          ) : (
            <section className="table-card">
              <div className="table-head">
                <div className="table-head-row">
                  <div>
                    <b>Submissions</b>
                    <br />
                    <small>
                      Tip: add a custom scenario name when submitting so you can find it later.
                    </small>
                  </div>
                  <Link href="/survey" className="pill pill-link">
                    Take the Survey
                  </Link>
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Scenario</th>
                      <th>Fiscal Balance</th>
                      <th>Revenue</th>
                      <th>
                        <span>Work Incentive</span>
                        <span
                          className="info-dot"
                          title="Measures how strongly the policy preserves incentives for employment and productivity."
                          aria-label="Measures how strongly the policy preserves incentives for employment and productivity."
                        >
                          i
                        </span>
                      </th>
                      <th>Number of Submissions</th>
                      <th>Submitted</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row) => {
                      return (
                        <Fragment key={row.id}>
                          <tr>
                            <td>{row.userLabel}</td>
                            <td>
                              <span className="scenario-name">{row.scenario}</span>
                              <span className="scenario-sub">{row.secondaryLabel}</span>
                            </td>
                            <td className={row.isSolvent ? 'value-positive' : 'value-negative'}>
                              {formatBillions(row.balance, true)}
                            </td>
                            <td>{formatBillions(row.revenue)}</td>
                            <td>{formatPercent(row.workIncentive, 1)}</td>
                            <td>{row.submissionCount === null ? '' : row.submissionCount.toLocaleString('en-US')}</td>
                            <td>{row.submittedAt ? formatDate(row.submittedAt) : '-'}</td>
                            <td>
                              {row.policy ? (
                                <details>
                                  <summary className="link-btn">View Policy</summary>
                                  <div className="policy-panel">
                                    <p>
                                      <span>BEL level:</span>{' '}
                                      {usdFormatter.format(row.policy.belLevel)} per adult/year
                                    </p>
                                    <p>
                                      <span>SBI configuration:</span> Breakout at{' '}
                                      {usdFormatter.format(row.policy.sbiBreakoutPoint)}
                                    </p>
                                    <p>
                                      <span>Healthcare assumption:</span>{' '}
                                      {row.policy.healthcareAssumption}
                                    </p>
                                    <p>
                                      <span>Retirement replacement:</span>{' '}
                                      {row.policy.retirementReplacement === null
                                        ? 'Not specified'
                                        : formatPercent(row.policy.retirementReplacement, 0)}
                                    </p>
                                    <p>
                                      <span>Revenue structure:</span> {row.policy.revenueStructure}
                                    </p>
                                  </div>
                                </details>
                              ) : (
                                <span className="scenario-sub">-</span>
                              )}
                            </td>
                          </tr>
                          {row.tradeoffLine ? (
                            <tr className="tradeoff-row">
                              <td colSpan={8}>
                                <div className="tradeoff-note">{row.tradeoffLine}</div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="lb-cta">
            <div>
              <h3>Test Your Own Policy Scenario</h3>
              <p>
                Try different revenue structures, BEL levels, and program assumptions, then submit
                your result to compare outcomes in submissions.
              </p>
            </div>
            <Link href="/model" className="btn-primary">
              Launch the Simulator
            </Link>
          </section>

          <p className="lb-transparency">
            Public submissions pages display policy scenario data only. Optional contact details
            may be provided in private submission records, but they are not shown here.
          </p>
        </div>
      </main>

      <style>{`
        .lb-page {
          background: #f6f8fc;
          color: #0f172a;
          min-height: 100vh;
        }

        .lb-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 20px 60px;
        }

        .lb-hero {
          background: #ffffff;
          border: 1px solid #e6edf7;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
        }

        .lb-kicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .lb-title {
          font-size: 40px;
          line-height: 1.1;
          margin: 0 0 10px;
          color: #0f172a;
          text-align: center;
        }

        .lb-subtitle {
          margin: 0 auto 16px;
          color: #475569;
          max-width: 106ch;
          line-height: 1.55;
          text-align: center;
        }

        .lb-hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .btn-primary {
          background: #1d4ed8;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.15s ease;
        }

        .btn-primary:hover {
          filter: brightness(0.95);
        }

        .btn-ghost {
          background: #ffffff;
          color: #1d4ed8;
          border: 1px solid #cfe0ff;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .lb-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .lb-insights {
          margin-top: 18px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
          border: 1px solid #d6e4ff;
          border-radius: 16px;
          padding: 18px 20px;
        }

        .lb-insights-kicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2563eb;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .lb-insights-title {
          margin: 0;
          font-size: 22px;
          color: #0f172a;
        }

        .lb-insights-list {
          margin: 14px 0 0;
          padding-left: 20px;
          color: #334155;
          line-height: 1.65;
        }

        .lb-insights-list li + li {
          margin-top: 8px;
        }

        .stat {
          background: #fff;
          border: 1px solid #e6edf7;
          border-radius: 14px;
          padding: 14px 14px 12px;
          min-height: 86px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
        }

        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 750;
          margin-top: 6px;
          line-height: 1.1;
          color: #0f172a;
        }

        .stat-name {
          margin-top: 6px;
          font-size: 22px;
          line-height: 1.1;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-value-positive {
          color: #16a34a;
        }

        .stat-value-info {
          color: #2563eb;
        }

        .stat-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.4;
        }

        .lb-section {
          margin-top: 26px;
          background: #fff;
          border: 1px solid #e6edf7;
          border-radius: 16px;
          padding: 18px;
        }

        .lb-h2 {
          font-size: 22px;
          margin: 0 0 10px;
          color: #0f172a;
        }

        .lb-p {
          margin: 0 0 10px;
          color: #475569;
          line-height: 1.5;
        }

        .lb-list {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          line-height: 1.5;
        }

        .table-card {
          margin-top: 14px;
          background: linear-gradient(180deg, #0b1630 0%, #0a1226 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-head {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #e6edf7;
        }

        .table-head-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .table-head small {
          color: rgba(230, 237, 247, 0.75);
        }

        .table-wrap {
          overflow: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 980px;
          color: #e6edf7;
        }

        .table th {
          position: sticky;
          top: 0;
          background: rgba(10, 18, 38, 0.96);
          text-align: left;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(230, 237, 247, 0.85);
          white-space: nowrap;
        }

        .table td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
          vertical-align: top;
        }

        .table th:nth-child(3),
        .table th:nth-child(4),
        .table th:nth-child(5),
        .table th:nth-child(6),
        .table th:nth-child(7),
        .table td:nth-child(3),
        .table td:nth-child(4),
        .table td:nth-child(5),
        .table td:nth-child(6),
        .table td:nth-child(7) {
          text-align: right;
        }

        .table tr {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .table tr:hover td {
          background: rgba(255, 255, 255, 0.03);
        }

        .tradeoff-row td {
          background: rgba(37, 99, 235, 0.08);
          border-bottom: 1px solid rgba(96, 165, 250, 0.16);
          padding-top: 0;
        }

        .tradeoff-row:hover td {
          background: rgba(37, 99, 235, 0.08);
        }

        .tradeoff-note {
          color: #bfdbfe;
          font-size: 13px;
          line-height: 1.5;
          padding: 2px 0 2px 56px;
          font-weight: 600;
        }

        .top-scenario td {
          background: rgba(246, 196, 83, 0.05);
          box-shadow: inset 4px 0 0 #f6c453;
        }

        .top-scenario td:first-child {
          color: #f6c453;
          font-weight: 700;
        }

        .scenario-name {
          display: block;
          font-weight: 700;
          color: #ffffff;
        }

        .scenario-sub {
          display: block;
          margin-top: 4px;
          color: #9fb3c8;
          font-size: 13px;
        }

        .value-positive {
          color: #34d399;
          font-weight: 700;
        }

        .value-negative {
          color: #f87171;
          font-weight: 700;
        }

        .info-dot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.38);
          font-size: 10px;
          margin-left: 5px;
          opacity: 0.9;
          line-height: 1;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: rgba(230, 237, 247, 0.9);
        }

        .pill-link {
          text-decoration: none;
          font-weight: 600;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .pill-link:hover {
          background: rgba(29, 78, 216, 0.22);
          border-color: rgba(96, 165, 250, 0.72);
          color: #ffffff;
        }

        .pill-link:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }

        .link-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #e6edf7;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 7px 10px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          list-style: none;
          transition: background-color 0.15s ease;
        }

        .link-btn::-webkit-details-marker {
          display: none;
        }

        .link-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .policy-panel {
          margin-top: 10px;
          min-width: 250px;
          background: rgba(6, 13, 28, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 10px;
          font-size: 12px;
          color: #dce6f7;
          line-height: 1.5;
        }

        .policy-panel p {
          margin: 0 0 6px;
        }

        .policy-panel p:last-child {
          margin-bottom: 0;
        }

        .policy-panel span {
          color: #9fb3c8;
        }

        .lb-cta {
          margin-top: 22px;
          background: linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%);
          border: 1px solid #e6edf7;
          border-radius: 16px;
          padding: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .lb-cta h3 {
          margin: 0;
          font-size: 18px;
          color: #0f172a;
        }

        .lb-cta p {
          margin: 6px 0 0;
          color: #475569;
          max-width: 70ch;
          line-height: 1.5;
        }

        .lb-transparency {
          margin-top: 16px;
          color: #64748b;
          text-align: center;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 960px) {
          .lb-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .lb-container {
            padding: 30px 14px 44px;
          }

          .lb-title {
            font-size: 32px;
          }

          .lb-stats {
            grid-template-columns: 1fr;
          }

          .lb-insights {
            padding: 16px;
          }

          .lb-insights-title {
            font-size: 20px;
          }
        }
      `}</style>
    </PublicSiteShell>
  )
}
