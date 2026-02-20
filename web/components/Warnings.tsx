'use client';

import { useState } from 'react';
import type { SimulationResult, PolicyConfig } from '../lib/types';

interface WarningsProps {
  result: SimulationResult;
  config: PolicyConfig;
}

export default function Warnings({ result, config }: WarningsProps) {
  const [expandedNote, setExpandedNote] = useState(false);
  const [financingMode, setFinancingMode] = useState<'bond' | 'mixed' | 'monetized'>('bond');

  // Calculate deficit pressure ratio
  const deficitPressureRatio = Math.abs(result.balance.surplusDeficit) / result.obligations.totalObligations;

  // Determine severity level
  let severityLevel: 'none' | 'yellow' | 'orange' | 'red' = 'none';
  let severityColor = '#10B981';
  let severityBg = 'rgba(16, 185, 129, 0.1)';
  let severityBorder = '#10B981';

  if (result.balance.surplusDeficit < 0) {
    if (deficitPressureRatio < 0.02) {
      severityLevel = 'yellow';
      severityColor = '#EAB308';
      severityBg = 'rgba(234, 179, 8, 0.1)';
      severityBorder = '#FACC15';
    } else if (deficitPressureRatio < 0.05) {
      severityLevel = 'orange';
      severityColor = '#F97316';
      severityBg = 'rgba(249, 115, 22, 0.1)';
      severityBorder = '#FB923C';
    } else {
      severityLevel = 'red';
      severityColor = '#EF4444';
      severityBg = 'rgba(239, 68, 68, 0.1)';
      severityBorder = '#DC2626';
    }
  }

  // No deficit case
  if (severityLevel === 'none') {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid #10B981',
        borderRadius: '8px',
      }}>
        <p style={{ fontSize: '13px', color: '#10B981', fontWeight: '600', margin: 0 }}>
          ✓ Fiscally Solvent
        </p>
        <p style={{ fontSize: '12px', color: '#86EFAC', marginTop: '6px', margin: '6px 0 0 0' }}>
          This configuration maintains budget equilibrium.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main Policy Alert Panel - Dynamic Severity */}
      <div style={{
        padding: '16px',
        background: severityBg,
        border: `2px solid ${severityBorder}`,
        borderRadius: '8px',
      }}>
        {/* Primary Alert */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '700',
            color: severityColor,
            margin: '0 0 6px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            ⚠ Structural Deficit Detected
          </p>
          <p style={{
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: '1.5',
            margin: 0,
          }}>
            This configuration generates a sustained fiscal deficit. Long-term financing may require borrowing or monetary expansion.
          </p>
        </div>

        {/* Secondary Line */}
        <div style={{
          paddingTop: '12px',
          borderTop: `1px solid ${severityBorder}`,
          marginTop: '12px',
        }}>
          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            margin: '0 0 6px 0',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            Real Income Sensitivity (Full Monetization Assumption)
          </p>
          <p style={{
            fontSize: '12px',
            color: severityColor,
            margin: 0,
            fontWeight: '600',
          }}>
            ~{(deficitPressureRatio * 100).toFixed(1)}% estimated adjustment
          </p>
        </div>

        {/* Expandable Technical Note */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${severityBorder}` }}>
          <button
            onClick={() => setExpandedNote(!expandedNote)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '0',
              textDecoration: 'underline',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            {expandedNote ? '▼' : '▶'} How this is modeled
          </button>

          {expandedNote && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '10px',
              borderRadius: '4px',
            }}>
              <p style={{ margin: '0 0 6px 0' }}>
                <strong>Deficit Pressure Ratio:</strong> {(deficitPressureRatio * 100).toFixed(2)}% = Deficit ÷ Total Obligations
              </p>
              <p style={{ margin: '0 0 6px 0' }}>
                <strong>Severity Threshold:</strong>
                <br />
                • &lt; 2% = Yellow (Low pressure)
                <br />
                • 2–5% = Orange (Moderate pressure)
                <br />
                • &gt; 5% = Red (High pressure)
              </p>
              <p style={{ margin: 0 }}>
                <strong>Note:</strong> Purchasing power sensitivity is estimated directionally and is not a CPI forecast.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Financing Assumption Selector */}
      <div style={{
        padding: '12px',
        background: 'rgba(71, 85, 105, 0.3)',
        borderRadius: '8px',
        border: '1px solid #475569',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#cbd5e1',
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Financing Assumption
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'bond' as const, label: 'Bond-financed (Debt)', note: 'Low inflation impact' },
            { value: 'mixed' as const, label: '50% Monetized', note: 'Moderate inflation' },
            { value: 'monetized' as const, label: 'Fully Monetized', note: 'High inflation risk' },
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                background: financingMode === option.value ? 'rgba(71, 85, 105, 0.6)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <input
                type="radio"
                name="financing"
                value={option.value}
                checked={financingMode === option.value}
                onChange={(e) => setFinancingMode(e.target.value as typeof financingMode)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
                  {option.label}
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}>
                  {option.note}
                </span>
              </div>
            </label>
          ))}
        </div>
        <p style={{
          fontSize: '10px',
          color: '#64748b',
          margin: '10px 0 0 0',
          fontStyle: 'italic',
          borderTop: '1px solid #475569',
          paddingTop: '10px',
        }}>
          Model assumes deficit financing method impacts currency purchasing power proportionally.
        </p>
      </div>
    </div>
  );
}
