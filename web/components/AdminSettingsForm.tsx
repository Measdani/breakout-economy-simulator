'use client'

import { useState, useMemo } from 'react'
import { runSimulation } from '@/lib/engine'
import { updateGlobalConfig } from '@/app/actions/config'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import type { GlobalConfigRow } from '@/lib/supabase/types'

interface Props {
  currentConfig: PolicyConfig
  history: GlobalConfigRow[]
}

type TabType = 'settings' | 'history'

export default function AdminSettingsForm({ currentConfig, history }: Props) {
  const [tab, setTab] = useState<TabType>('settings')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [note, setNote] = useState('')

  // Form state - start with current config
  const [ubiAnnualPerAdult, setUbiAnnualPerAdult] = useState(currentConfig.ubiAnnualPerAdult)
  const [tokenTaxRate, setTokenTaxRate] = useState(currentConfig.tokenTaxRate)
  const [breakoutPoint, setBreakoutPoint] = useState(currentConfig.breakoutPoint)
  const [tier1Rate, setTier1Rate] = useState(currentConfig.tier1Rate)
  const [tier2Rate, setTier2Rate] = useState(currentConfig.tier2Rate)
  const [adultPopulation, setAdultPopulation] = useState(currentConfig.adultPopulation)
  const [govtOperatingRequirement, setGovtOperatingRequirement] = useState(currentConfig.govtOperatingRequirement)
  const [welfareSavingsCredit, setWelfareSavingsCredit] = useState(currentConfig.welfareSavingsCredit)
  // Retirement Program baseline
  const [retireesCount, setRetireesCount] = useState(currentConfig.retireesCount ?? 60000000)
  const [avgFinal3yrSalary, setAvgFinal3yrSalary] = useState(currentConfig.avgFinal3yrSalary ?? 60000)
  const [ssBaseline, setSsBaseline] = useState(currentConfig.ssBaseline ?? 1.4e12)
  const [benefitAdjustmentFactor, setBenefitAdjustmentFactor] = useState((currentConfig.benefitAdjustmentFactor ?? 0.70) * 100)

  // Preview state
  const [showPreview, setShowPreview] = useState(false)
  const proposedConfig: PolicyConfig = {
    tokenTaxRate,
    flowBaseAnnual: currentConfig.flowBaseAnnual,
    ubiAnnualPerAdult,
    adultPopulation,
    welfareSavingsCredit,
    govtOperatingRequirement,
    breakoutPoint,
    tier1Rate,
    tier1Start: currentConfig.tier1Start,
    tier2Rate,
    tier2Start: currentConfig.tier2Start,
    supplementApexIncome: currentConfig.supplementApexIncome,
    supplementApexBonus: currentConfig.supplementApexBonus,
    personaWeights: currentConfig.personaWeights,
    retireesCount,
    avgFinal3yrSalary,
    ssBaseline,
    benefitAdjustmentFactor: benefitAdjustmentFactor / 100,
  }

  const previewResult: SimulationResult | null = useMemo(() => {
    if (!showPreview) return null
    try {
      return runSimulation(proposedConfig)
    } catch (err) {
      console.error('Preview simulation error:', err)
      return null
    }
  }, [showPreview, proposedConfig])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await updateGlobalConfig(proposedConfig, note || 'Configuration update')
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setNote('')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevert = async (config: PolicyConfig, configId: string) => {
    if (!window.confirm('Revert to this configuration? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateGlobalConfig(config, `Reverted to configuration from ${new Date(history.find((h) => h.id === configId)?.created_at || '').toLocaleString()}`)
      setSuccess(true)
      // Refresh might be needed here - you can add window.location.reload() if desired
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid rgba(59, 130, 246, 0.2)' }}>
        <button
          onClick={() => setTab('settings')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: tab === 'settings' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
            border: 'none',
            color: tab === 'settings' ? '#00d9ff' : '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: tab === 'settings' ? '600' : '400',
            cursor: 'pointer',
            borderBottom: tab === 'settings' ? '2px solid #00d9ff' : 'none',
            transition: 'all 0.2s',
          }}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setTab('history')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: tab === 'history' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
            border: 'none',
            color: tab === 'history' ? '#00d9ff' : '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: tab === 'history' ? '600' : '400',
            cursor: 'pointer',
            borderBottom: tab === 'history' ? '2px solid #00d9ff' : 'none',
            transition: 'all 0.2s',
          }}
        >
          📜 History ({history.length})
        </button>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', borderRadius: '0.5rem', color: '#4ade80', marginBottom: '1rem' }}>
          ✓ Configuration saved successfully!
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '0.5rem', color: '#ef4444', marginBottom: '1rem' }}>
          ✗ {error}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* UBI Annual Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>UBI Annual Amount</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={ubiAnnualPerAdult}
                  onChange={(e) => setUbiAnnualPerAdult(Number(e.target.value))}
                  step="500"
                  min="0"
                  max="50000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(ubiAnnualPerAdult / 1000).toFixed(1)}K</span>
              </div>
            </div>

            {/* Token Tax Rate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Token Tax Rate</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={tokenTaxRate}
                  onChange={(e) => setTokenTaxRate(Number(e.target.value))}
                  step="0.0001"
                  min="0"
                  max="0.02"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{(tokenTaxRate * 100).toFixed(3)}%</span>
              </div>
            </div>

            {/* Breakout Point */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Breakout Point</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={breakoutPoint}
                  onChange={(e) => setBreakoutPoint(Number(e.target.value))}
                  step="5000"
                  min="20000"
                  max="200000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(breakoutPoint / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Income Tax Tier 1 Rate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Income Tax Tier 1 Rate</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={tier1Rate}
                  onChange={(e) => setTier1Rate(Number(e.target.value))}
                  step="0.01"
                  min="0"
                  max="0.5"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{(tier1Rate * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Income Tax Tier 2 Rate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Income Tax Tier 2 Rate</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={tier2Rate}
                  onChange={(e) => setTier2Rate(Number(e.target.value))}
                  step="0.01"
                  min="0"
                  max="0.6"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{(tier2Rate * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Adult Population */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Adult Population</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={adultPopulation}
                  onChange={(e) => setAdultPopulation(Number(e.target.value))}
                  step="1000000"
                  min="1000000"
                  max="500000000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{(adultPopulation / 1000000).toFixed(0)}M</span>
              </div>
            </div>

            {/* Govt Operating Cost */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Govt Operating Cost</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={govtOperatingRequirement}
                  onChange={(e) => setGovtOperatingRequirement(Number(e.target.value))}
                  step="100000000000"
                  min="500000000000"
                  max="10000000000000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(govtOperatingRequirement / 1e12).toFixed(2)}T</span>
              </div>
            </div>

            {/* Welfare Savings Credit */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Welfare Savings Credit</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={welfareSavingsCredit}
                  onChange={(e) => setWelfareSavingsCredit(Number(e.target.value))}
                  step="50000000000"
                  min="0"
                  max="2000000000000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(welfareSavingsCredit / 1e9).toFixed(0)}B</span>
              </div>
            </div>

            {/* Total Retirees */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>🏦 Total Retired Population</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={retireesCount}
                  onChange={(e) => setRetireesCount(Number(e.target.value))}
                  step="1000000"
                  min="1000000"
                  max="200000000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{(retireesCount / 1000000).toFixed(0)}M</span>
              </div>
            </div>

            {/* Average Final 3-Year Salary */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Avg Final 3-Year Salary</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={avgFinal3yrSalary}
                  onChange={(e) => setAvgFinal3yrSalary(Number(e.target.value))}
                  step="1000"
                  min="20000"
                  max="200000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(avgFinal3yrSalary / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Current Social Security Baseline */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Annual SS Expenditure (Baseline)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={ssBaseline}
                  onChange={(e) => setSsBaseline(Number(e.target.value))}
                  step="100000000000"
                  min="500000000000"
                  max="5000000000000"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>${(ssBaseline / 1e12).toFixed(2)}T</span>
              </div>
            </div>

            {/* Benefit Adjustment Factor */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Benefit Adjustment Factor</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={benefitAdjustmentFactor}
                  onChange={(e) => setBenefitAdjustmentFactor(Math.max(0, Math.min(100, Number(e.target.value))))}
                  step="1"
                  min="0"
                  max="100"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.25rem',
                    color: '#e0e7ff',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: '60px' }}>{benefitAdjustmentFactor.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Change note */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#e0e7ff', marginBottom: '0.5rem', fontWeight: '600' }}>Change Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe why you're making these changes..."
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.25rem',
                color: '#e0e7ff',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              maxLength={500}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{note.length}/500</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #2563eb, #16a34a)')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #3b82f6, #22c55e)')}
            >
              {isSubmitting ? 'Saving...' : '💾 Save Configuration'}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: showPreview ? 'rgba(59, 130, 246, 0.3)' : '#2a3f52',
                color: '#ffffff',
                border: '1px solid rgba(0, 217, 255, 0.4)',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '3a5268')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = showPreview ? 'rgba(59, 130, 246, 0.3)' : '#2a3f52')}
            >
              {showPreview ? '✓ Preview' : '👁️ Preview'}
            </button>
          </div>

          {/* Preview section */}
          {showPreview && previewResult && (
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
              <h3 style={{ color: '#00d9ff', marginBottom: '1rem' }}>📊 Preview Results</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Fiscal Balance</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: previewResult.balance.isSolvent ? '#4ade80' : '#ef4444' }}>
                    {previewResult.balance.isSolvent ? '+' : ''}${(previewResult.balance.surplusDeficit / 1e9).toFixed(1)}B
                  </p>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Revenue</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>${(previewResult.revenue.totalRevenue / 1e9).toFixed(1)}B</p>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Obligations</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>${(previewResult.obligations.totalObligations / 1e9).toFixed(1)}B</p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No configuration history</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((config, idx) => (
                <div key={config.id} style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: config.is_active ? '2px solid #00d9ff' : '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ color: '#e0e7ff', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {config.is_active && '● '} Version {history.length - idx} {config.is_active && '(Current)'}
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        {new Date(config.created_at).toLocaleString()}
                      </p>
                      {config.note && <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>{config.note}</p>}
                    </div>
                    {!config.is_active && (
                      <button
                        onClick={() => handleRevert(config.config, config.id)}
                        disabled={isSubmitting}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#dc2626')}
                        onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#ef4444')}
                      >
                        Revert
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <div>UBI: ${(config.config.ubiAnnualPerAdult / 1000).toFixed(1)}K</div>
                    <div>Tax: {(config.config.tokenTaxRate * 100).toFixed(3)}%</div>
                    <div>Breakout: ${(config.config.breakoutPoint / 1000).toFixed(0)}K</div>
                    <div>Pop: {(config.config.adultPopulation / 1000000).toFixed(0)}M</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
