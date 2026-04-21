'use client'

import { SubmissionRow } from '@/lib/supabase/types'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Legend, Tooltip, LineChart, Line
} from 'recharts'

interface AdminChartsProps {
  submissions: SubmissionRow[]
}

export default function AdminCharts({ submissions }: AdminChartsProps) {
  if (submissions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
        No submissions yet to visualize.
      </div>
    )
  }

  const n = submissions.length

  // ============ REVENUE DATA ============
  const avgRevenueData = [
    {
      name: 'Token Tax',
      value: submissions.reduce((sum, s) => sum + (s.result?.revenue?.tokenTaxRevenue || 0), 0) / n / 1e9,
    },
    {
      name: 'Income Tax',
      value: submissions.reduce((sum, s) => sum + (s.result?.revenue?.incomeTaxRevenue || 0), 0) / n / 1e9,
    },
    {
      name: 'Welfare Savings',
      value: submissions.reduce((sum, s) => sum + (s.result?.revenue?.welfareSavingsCredit || 0), 0) / n / 1e9,
    },
  ]

  // ============ OBLIGATIONS DATA ============
  const avgObligationsData = [
    {
      name: 'BEL Cost',
      value: submissions.reduce((sum, s) => sum + (s.result?.obligations?.ubiCost || 0), 0) / n / 1e9,
    },
    {
      name: 'Govt Operations',
      value: submissions.reduce((sum, s) => sum + (s.result?.obligations?.govtOperatingRequirement || 0), 0) / n / 1e9,
    },
  ]

  // ============ DEPENDENT BEL ANALYSIS ============
  const avgDependent1 = submissions.reduce((sum, s) => sum + (s.config?.ubiDependent1 || 0), 0) / n / 1000
  const avgDependent2 = submissions.reduce((sum, s) => sum + (s.config?.ubiDependent2 || 0), 0) / n / 1000
  const avgDependent3 = submissions.reduce((sum, s) => sum + (s.config?.ubiDependent3 || 0), 0) / n / 1000
  const totalDependentCost = submissions.reduce((sum, s) => sum + (s.result?.obligations?.dependentUBICost || 0), 0) / n / 1e9

  const avgPctHouseholds1Dep = submissions.reduce((sum, s) => sum + (s.config?.pctHouseholds1Dep || 0), 0) / n
  const avgPctHouseholds2Dep = submissions.reduce((sum, s) => sum + (s.config?.pctHouseholds2Dep || 0), 0) / n
  const avgPctHouseholds3Dep = submissions.reduce((sum, s) => sum + (s.config?.pctHouseholds3Dep || 0), 0) / n

  // ============ WORK INCENTIVE DISTRIBUTION ============
  const getWorkIncentiveScore = (s: SubmissionRow): number => {
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

  const buckets = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
  const workIncentiveCounts = [0, 0, 0, 0, 0]
  submissions.forEach(s => {
    const score = getWorkIncentiveScore(s)
    const idx = Math.min(4, Math.floor(score / 20))
    workIncentiveCounts[idx]++
  })
  const workIncentiveData = buckets.map((label, i) => ({
    range: label,
    count: workIncentiveCounts[i],
  }))

  // ============ BREAKOUT POINT DISTRIBUTION ============
  const allBreakouts = submissions.map(s => s.breakout_point)
  const minBp = Math.floor(Math.min(...allBreakouts) / 10000) * 10000
  const maxBp = Math.ceil(Math.max(...allBreakouts) / 10000) * 10000

  const breakoutBuckets: Record<string, number> = {}
  for (let v = minBp; v <= maxBp; v += 10000) {
    breakoutBuckets[`$${v / 1000}K`] = 0
  }
  submissions.forEach(s => {
    const bucket = `$${Math.floor(s.breakout_point / 10000) * 10}K`
    if (breakoutBuckets[bucket] !== undefined) breakoutBuckets[bucket]++
  })
  const breakoutData = Object.entries(breakoutBuckets).map(([range, count]) => ({ range, count }))

  // ============ BEL DISTRIBUTION ============
  const allUbi = submissions.map(s => s.ubi_annual)
  const minUbi = Math.floor(Math.min(...allUbi) / 2000) * 2000
  const maxUbi = Math.ceil(Math.max(...allUbi) / 2000) * 2000

  const ubiBuckets: Record<string, number> = {}
  for (let v = minUbi; v <= maxUbi; v += 2000) {
    ubiBuckets[`$${v / 1000}K`] = 0
  }
  submissions.forEach(s => {
    const bucket = `$${Math.floor(s.ubi_annual / 2000) * 2}K`
    if (ubiBuckets[bucket] !== undefined) ubiBuckets[bucket]++
  })
  const ubiData = Object.entries(ubiBuckets).map(([range, count]) => ({ range, count }))

  // ============ SCENARIO POPULARITY ============
  const KNOWN_PRESETS = ['Balanced', 'High Growth', 'Safety Net', 'Minimal State', 'Default']
  const scenarioCounts: Record<string, number> = {}
  KNOWN_PRESETS.forEach(p => { scenarioCounts[p] = 0 })

  submissions.forEach(s => {
    const name = s.config_name || 'Default'
    if (scenarioCounts[name] !== undefined) {
      scenarioCounts[name]++
    } else {
      scenarioCounts['Custom'] = (scenarioCounts['Custom'] || 0) + 1
    }
  })

  const scenarioData = Object.entries(scenarioCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // ============ TOP MODELS ============
  const topModels = [...submissions]
    .sort((a, b) => b.surplus_deficit - a.surplus_deficit)
    .slice(0, 10)
    .map((s, idx) => ({
      rank: idx + 1,
      name: s.name || 'Anonymous',
      balance: s.surplus_deficit / 1e9,
      isSolvent: s.is_solvent,
      ubiAnnual: s.ubi_annual,
      tokenTaxRate: s.token_tax_rate,
      breakoutPoint: s.breakout_point,
      date: new Date(s.created_at).toLocaleDateString(),
    }))

  // ============ PERSONA AVERAGE OUTCOMES ============
  const PERSONA_LABELS = ['Starter', 'Professional', 'Manager', 'Executive']
  const personaCount = 4

  const personaTotals = Array.from({ length: personaCount }, () => ({
    earnedIncome: 0, ubi: 0, supplement: 0, incomeTax: 0, netIncome: 0, count: 0,
  }))

  submissions.forEach(s => {
    const personas = s.result?.citizenModel?.personaOutcomes || []
    personas.forEach((p, idx) => {
      if (idx < personaCount) {
        personaTotals[idx].earnedIncome += p.earnedIncome
        personaTotals[idx].ubi += p.ubi
        personaTotals[idx].supplement += p.supplement
        personaTotals[idx].incomeTax += p.incomeTax
        personaTotals[idx].netIncome += p.netIncome
        personaTotals[idx].count++
      }
    })
  })

  const personaAvgData = personaTotals.map((totals, idx) => ({
    persona: PERSONA_LABELS[idx],
    earnedIncome: totals.count > 0 ? totals.earnedIncome / totals.count / 1000 : 0,
    transferIncome: totals.count > 0 ? (totals.ubi + totals.supplement) / totals.count / 1000 : 0,
    incomeTax: totals.count > 0 ? totals.incomeTax / totals.count / 1000 : 0,
    netIncome: totals.count > 0 ? totals.netIncome / totals.count / 1000 : 0,
  }))

  // ============ TOKEN TAX RATE DISTRIBUTION ============
  const allTokenTaxRates = submissions.map(s => s.token_tax_rate)
  const minTaxRate = Math.floor(Math.min(...allTokenTaxRates) * 10000) / 100
  const maxTaxRate = Math.ceil(Math.max(...allTokenTaxRates) * 10000) / 100

  const taxRateBuckets: Record<string, number> = {}
  for (let v = minTaxRate; v <= maxTaxRate; v += 0.1) {
    taxRateBuckets[`${v.toFixed(2)}%`] = 0
  }
  submissions.forEach(s => {
    const rate = s.token_tax_rate * 100
    const bucket = `${(Math.floor(rate * 10) / 10).toFixed(2)}%`
    if (taxRateBuckets[bucket] !== undefined) taxRateBuckets[bucket]++
  })
  const taxRateData = Object.entries(taxRateBuckets)
    .filter(([, count]) => count > 0)
    .map(([range, count]) => ({ range, count }))

  // ============ SOLVENCY OVER TIME ============
  const sortedSubmissions = [...submissions].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const solvencyTimeline: Array<{ date: string; solventPercent: number; deficitPercent: number }> = []
  let solventCount = 0, totalCount = 0
  sortedSubmissions.forEach(s => {
    totalCount++
    if (s.is_solvent) solventCount++
    const date = new Date(s.created_at).toLocaleDateString()
    solvencyTimeline.push({
      date,
      solventPercent: (solventCount / totalCount) * 100,
      deficitPercent: ((totalCount - solventCount) / totalCount) * 100,
    })
  })
  // Keep only unique dates for cleaner timeline
  const uniqueSolvencyTimeline = solvencyTimeline.filter((item, idx, arr) =>
    idx === 0 || item.date !== arr[idx - 1].date
  ).slice(-20) // Last 20 unique dates

  // ============ FISCAL SUSTAINABILITY INDICATORS ============
  const sustainabilityMetrics = {
    stableCount: submissions.filter(s => s.is_solvent && s.surplus_deficit > 0).length,
    deficitCount: submissions.filter(s => !s.is_solvent).length,
    avgBELasPercentGDP: (submissions.reduce((sum, s) => sum + (s.result?.obligations?.ubiCost || 0), 0) / submissions.length) / 28e12 * 100,
    avgTokenTaxPercent: (submissions.reduce((sum, s) => sum + (s.result?.revenue?.tokenTaxRevenue || 0), 0) /
                         submissions.reduce((sum, s) => sum + (s.result?.revenue?.totalRevenue || 0), 0)) * 100 || 0,
  }

  // ============ COLORS ============
  const COLORS = {
    tokenTax: '#3b82f6',
    incomeTax: '#10b981',
    welfareSavings: '#8b5cf6',
    ubiCost: '#f59e0b',
    govtOps: '#ef4444',
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#e0e7ff',
          fontSize: '12px'
        }}>
          <p>{`${payload[0].name}: $${payload[0].value.toFixed(2)}B`}</p>
        </div>
      )
    }
    return null
  }

  const DistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#e0e7ff',
          fontSize: '12px'
        }}>
          <p>{`Count: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  const PersonaTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          padding: '8px 12px',
          borderRadius: '4px',
          color: '#e0e7ff',
          fontSize: '12px'
        }}>
          <p>{`${payload[0].name}: $${payload[0].value.toFixed(1)}K`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {/* ============ FISCAL ANALYSIS ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Fiscal Analysis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Revenue Pie */}
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Average Revenue Sources (Billions)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={avgRevenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(1)}B`}
                  labelLine={false}
                >
                  <Cell fill={COLORS.tokenTax} />
                  <Cell fill={COLORS.incomeTax} />
                  <Cell fill={COLORS.welfareSavings} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Obligations Pie */}
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Average Obligations (Billions)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={avgObligationsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(1)}B`}
                  labelLine={false}
                >
                  <Cell fill={COLORS.ubiCost} />
                  <Cell fill={COLORS.govtOps} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============ DEPENDENT BEL ANALYTICS ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Dependent BEL Strategy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Dependent Tier 1</p>
            <p style={{ color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold' }}>${avgDependent1.toFixed(1)}K</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>First dependent annual</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Dependent Tier 2</p>
            <p style={{ color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold' }}>${avgDependent2.toFixed(1)}K</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Second dependent annual</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Dependent Tier 3+</p>
            <p style={{ color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold' }}>${avgDependent3.toFixed(1)}K</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Third+ dependents annual</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Total Dependent Cost</p>
            <p style={{ color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold' }}>${totalDependentCost.toFixed(1)}B</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Annual budget</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg % HH w/ 1 Dependent</p>
            <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold' }}>{(avgPctHouseholds1Dep * 100).toFixed(1)}%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Of total households</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg % HH w/ 2 Dependents</p>
            <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold' }}>{(avgPctHouseholds2Dep * 100).toFixed(1)}%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Of total households</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg % HH w/ 3+ Dependents</p>
            <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold' }}>{(avgPctHouseholds3Dep * 100).toFixed(1)}%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Of total households</p>
          </div>
        </div>
      </div>

      {/* ============ MODEL DISTRIBUTION ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Model Distribution</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          {/* Work Incentive */}
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Work Incentive Score Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workIncentiveData} margin={{ bottom: 40 }}>
                <XAxis dataKey="range" angle={-30} textAnchor="end" height={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" fill={COLORS.tokenTax} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakout Point */}
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Breakout Point Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={breakoutData} margin={{ bottom: 40 }}>
                <XAxis dataKey="range" angle={-30} textAnchor="end" height={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" fill={COLORS.incomeTax} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* BEL Distribution */}
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>BEL Annual Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ubiData} margin={{ bottom: 40 }}>
                <XAxis dataKey="range" angle={-30} textAnchor="end" height={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" fill={COLORS.welfareSavings} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============ SCENARIO POPULARITY ============ */}
      {scenarioData.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Scenario Popularity</h2>
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scenarioData} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={110} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" fill={COLORS.tokenTax} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============ TOP MODELS ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Top 10 Models by Fiscal Balance</h2>
        <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Rank</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Balance</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>BEL</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Tax Rate</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Breakout</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {topModels.map((model, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(59, 130, 246, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>{model.rank}</td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>{model.name}</td>
                  <td style={{ padding: '0.75rem', color: model.isSolvent ? '#10b981' : '#ef4444' }}>
                    {model.balance >= 0 ? '+' : ''} ${model.balance.toFixed(1)}B
                  </td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>${(model.ubiAnnual / 1000).toFixed(1)}K</td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>{(model.tokenTaxRate * 100).toFixed(3)}%</td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>${(model.breakoutPoint / 1000).toFixed(0)}K</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{model.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ PERSONA OUTCOMES ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Average Persona Outcomes (Thousands)</h2>
        <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={personaAvgData} margin={{ bottom: 40 }}>
              <XAxis dataKey="persona" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis label={{ value: '$K', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<PersonaTooltip />} />
              <Legend />
              <Bar dataKey="earnedIncome" name="Earned Income" fill={COLORS.tokenTax} isAnimationActive={false} />
              <Bar dataKey="transferIncome" name="BEL + Supplement" fill={COLORS.incomeTax} isAnimationActive={false} />
              <Bar dataKey="incomeTax" name="Income Tax" fill={COLORS.govtOps} isAnimationActive={false} />
              <Bar dataKey="netIncome" name="Net Income" fill={COLORS.welfareSavings} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============ POLICY METRICS ============ */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Policy Effectiveness Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Sustainable Models</p>
            <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold' }}>{sustainabilityMetrics.stableCount}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>({((sustainabilityMetrics.stableCount / n) * 100).toFixed(1)}% of total)</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Deficit Models</p>
            <p style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold' }}>{sustainabilityMetrics.deficitCount}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>({((sustainabilityMetrics.deficitCount / n) * 100).toFixed(1)}% of total)</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg BEL as % of GDP</p>
            <p style={{ color: '#60a5fa', fontSize: '2rem', fontWeight: 'bold' }}>{sustainabilityMetrics.avgBELasPercentGDP.toFixed(2)}%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Relative to $28T GDP</p>
          </div>

          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Token Tax Revenue %</p>
            <p style={{ color: '#d8b4fe', fontSize: '2rem', fontWeight: 'bold' }}>{sustainabilityMetrics.avgTokenTaxPercent.toFixed(1)}%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Of total revenue</p>
          </div>
        </div>
      </div>

      {/* ============ TOKEN TAX DISTRIBUTION ============ */}
      {taxRateData.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Token Tax Rate Distribution</h2>
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={taxRateData} margin={{ bottom: 40 }}>
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<DistributionTooltip />} />
                <Bar dataKey="count" fill={COLORS.tokenTax} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============ SOLVENCY TIMELINE ============ */}
      {uniqueSolvencyTimeline.length > 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Solvency Trend Over Time</h2>
          <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={uniqueSolvencyTimeline} margin={{ bottom: 40 }}>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => `${(value as number).toFixed(1)}%`}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="solventPercent"
                  stroke={COLORS.tokenTax}
                  strokeWidth={2}
                  name="Solvent %"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="deficitPercent"
                  stroke={COLORS.govtOps}
                  strokeWidth={2}
                  name="Deficit %"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
