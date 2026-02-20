'use client';

import type { SimulationResult, PolicyConfig } from '../lib/types';

interface WarningsProps {
  result: SimulationResult;
  config: PolicyConfig;
}

export default function Warnings({ result, config }: WarningsProps) {
  const warnings = [];

  // Fiscal deficit warnings - multiple perspectives
  if (result.balance.surplusDeficit < 0) {
    warnings.push({
      type: 'fiscal-deficit',
      severity: 'warning',
      icon: '⚠️',
      title: 'Fiscal Risk Notice',
      message: 'This configuration produces a structural deficit. Sustained deficits typically require borrowing or monetary expansion, which may reduce purchasing power over time.',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#DC2626',
    });

    warnings.push({
      type: 'sustainability-alert',
      severity: 'warning',
      icon: '📈',
      title: 'Sustainability Alert',
      message: 'The current parameters generate a deficit. If financed through money creation, the expanded money supply could reduce the real value of the UBI through inflation.',
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      borderColor: '#FB923C',
    });

    warnings.push({
      type: 'macroeconomic-constraint',
      severity: 'warning',
      icon: '💹',
      title: 'Macroeconomic Constraint',
      message: 'This scenario requires deficit financing. Long-term monetary expansion without productivity growth may erode currency purchasing power, offsetting nominal income gains.',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: '#A78BFA',
    });
  }

  // Token tax rate warning
  if (config.tokenTaxRate > 0.008) {
    warnings.push({
      type: 'high-tax-rate',
      severity: 'warning',
      icon: '💰',
      title: 'High Tax Rate',
      message: 'Token tax rate exceeds 0.8%. Consider the impact on transaction volume and economic activity.',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#F59E0B',
    });
  }

  // High UBI warning
  if (config.ubiAnnualPerAdult > 18000) {
    warnings.push({
      type: 'high-ubi',
      severity: 'info',
      icon: '📊',
      title: 'High UBI Configuration',
      message: 'UBI exceeds $18,000. Verify this aligns with your policy objectives and revenue projections.',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3B82F6',
    });
  }

  if (warnings.length === 0) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid #10B981',
        borderRadius: '8px',
        marginTop: '16px',
      }}>
        <p style={{ fontSize: '13px', color: '#10B981', fontWeight: '600', margin: 0 }}>
          ✓ No warnings detected
        </p>
        <p style={{ fontSize: '12px', color: '#86EFAC', marginTop: '6px', margin: '6px 0 0 0' }}>
          This configuration is economically viable.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
      {warnings.map((warning, idx) => (
        <div
          key={idx}
          style={{
            padding: '16px',
            background: warning.bgColor,
            border: `1px solid ${warning.borderColor}`,
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '18px', marginTop: '2px', minWidth: '24px' }}>
              {warning.icon}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: warning.color,
                margin: '0 0 6px 0',
              }}>
                {warning.title}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: '1.5',
                margin: 0,
              }}>
                {warning.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
