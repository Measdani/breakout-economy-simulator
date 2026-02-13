'use client';

import { useState, useMemo } from 'react';
import { runSimulation } from '@/lib/engine';
import type { PolicyConfig, SimulationResult } from '@/lib/types';

interface PresetScenariosProps {
  onSelectPreset: (config: Partial<PolicyConfig>, name?: string) => void;
}

const PRESETS = [
  {
    name: 'Balanced',
    icon: '⚖️',
    description: 'Default moderate policy',
    color: 'from-blue-400 to-blue-600',
    textColor: 'text-blue-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-blue-400',
    config: {
      tokenTaxRate: 0.0035,
      ubiAnnualPerAdult: 12000,
      breakoutPoint: 60000,
    },
  },
  {
    name: 'High Growth',
    icon: '📈',
    description: 'Lower taxes, higher UBI',
    color: 'from-green-400 to-green-600',
    textColor: 'text-green-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-green-400',
    config: {
      tokenTaxRate: 0.002,
      ubiAnnualPerAdult: 15000,
      breakoutPoint: 70000,
    },
  },
  {
    name: 'Safety Net',
    icon: '🛡️',
    description: 'Higher taxes, robust UBI',
    color: 'from-orange-400 to-orange-600',
    textColor: 'text-orange-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-orange-400',
    config: {
      tokenTaxRate: 0.005,
      ubiAnnualPerAdult: 16000,
      breakoutPoint: 55000,
    },
  },
  {
    name: 'Minimal State',
    icon: '⚡',
    description: 'Low taxes, lean support',
    color: 'from-purple-400 to-purple-600',
    textColor: 'text-purple-300',
    bgColor: '#1E3A5F',
    borderColor: 'border-purple-400',
    config: {
      tokenTaxRate: 0.0015,
      ubiAnnualPerAdult: 8000,
      breakoutPoint: 70000,
    },
  },
];

const DEFAULT_CONFIG: PolicyConfig = {
  tokenTaxRate: 0.0035,
  flowBaseAnnual: 1e15,
  ubiAnnualPerAdult: 12000,
  adultPopulation: 265000000,
  welfareSavingsCredit: 630e9,
  govtOperatingRequirement: 2.74e12,
  breakoutPoint: 60000,
  tier1Rate: 0.19,
  tier1Start: 60000,
  tier2Rate: 0.29,
  tier2Start: 135000,
  supplementApexIncome: 24000,
  supplementApexBonus: 6000,
};

export default function PresetScenarios({ onSelectPreset }: PresetScenariosProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa'];

  const handleSelectPreset = (presetName: string, config: Partial<PolicyConfig>) => {
    setSelectedPreset(presetName);
    onSelectPreset(config, presetName);
  };

  // Calculate preview for selected preset only (not on hover)
  const previewPreset = selectedPreset ? PRESETS.find(p => p.name === selectedPreset) : null;
  const previewConfig: PolicyConfig = previewPreset ? {
    ...DEFAULT_CONFIG,
    ...previewPreset.config,
  } : DEFAULT_CONFIG;
  const previewResult: SimulationResult = useMemo(() => runSimulation(previewConfig), [previewConfig]);

  // Calculate work incentive score
  const getIncentiveScore = (result: SimulationResult) => {
    const personas = result.citizenModel.personaOutcomes;
    if (personas.length < 2) return 0;
    let totalRetention = 0;
    let count = 0;
    for (let i = 0; i < personas.length - 1; i++) {
      const incomeDiff = personas[i + 1].earnedIncome - personas[i].earnedIncome;
      const netDiff = personas[i + 1].netIncome - personas[i].netIncome;
      if (incomeDiff > 0) {
        totalRetention += (netDiff / incomeDiff) * 100;
        count++;
      }
    }
    return count > 0 ? totalRetention / count : 0;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <h3 className="text-sm font-semibold text-white">Quick Scenarios</h3>

      <div className="inline-grid grid-cols-2 gap-2">
        {PRESETS.map((preset, idx) => {
          const isSelected = selectedPreset === preset.name;

          return (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset.name, preset.config)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: 'none',
                background: isSelected ? colors[idx] : '#334155',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: `4px solid ${colors[idx]}`
              }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{preset.icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.2' }}>
                    {preset.description}
                  </div>
                </div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {isSelected ? '✓ Selected' : 'Click to use'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview Section - Only visible when selected */}
      {selectedPreset && (
        <div style={{
          width: '100%',
          marginTop: '12px',
          padding: '16px',
          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
          borderRadius: '8px',
          border: '1px solid #334155',
          maxWidth: '400px'
        }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📊 {selectedPreset} Preview
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Fiscal Balance */}
            <div style={{
              padding: '12px',
              background: previewResult.balance.surplusDeficit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              border: `1px solid ${previewResult.balance.surplusDeficit >= 0 ? '#10b981' : '#ef4444'}`,
            }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Fiscal Balance</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                color: previewResult.balance.surplusDeficit >= 0 ? '#10b981' : '#ef4444'
              }}>
                {previewResult.balance.surplusDeficit >= 0 ? '+' : ''}{formatCurrency(previewResult.balance.surplusDeficit)}
              </p>
            </div>

            {/* Total Revenue */}
            <div style={{
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              border: '1px solid #3b82f6',
            }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Total Revenue</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>
                {formatCurrency(previewResult.revenue.totalRevenue)}
              </p>
            </div>

            {/* Total Obligations */}
            <div style={{
              padding: '12px',
              background: 'rgba(251, 146, 60, 0.1)',
              borderRadius: '6px',
              border: '1px solid #fb923c',
            }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Total Obligations</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#fdba74' }}>
                {formatCurrency(previewResult.obligations.totalObligations)}
              </p>
            </div>

            {/* Work Incentive Score */}
            <div style={{
              padding: '12px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '6px',
              border: '1px solid #a855f7',
            }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Work Incentive</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#d8b4fe' }}>
                {getIncentiveScore(previewResult).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
