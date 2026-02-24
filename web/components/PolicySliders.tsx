'use client';

// Version marker: v1.1 - Household & viewMode removed - Build 2026-02-23
import { useState } from 'react';
import Tooltip from './Tooltip';

interface PolicySlidersProps {
  tokenTaxRate: number;
  onTokenTaxRateChange: (value: number) => void;
  ubiAnnualPerAdult: number;
  onUbiChange: (value: number) => void;
  breakoutPoint: number;
  onBreakoutPointChange: (value: number) => void;
  frictionTaxRate: number;
  onFrictionTaxRateChange: (value: number) => void;
  transactionVolumeGrowthRate: number;
  onTransactionVolumeGrowthRateChange: (value: number) => void;
  capitalFlightRate: number;
  onCapitalFlightRateChange: (value: number) => void;
  onReset: () => void;
  showGlossary?: boolean;
  onGlossaryToggle?: (show: boolean) => void;
  revenueArchitectureMode: 'hybrid' | 'friction_dominant' | 'friction_only';
  onRevenueArchitectureModeChange: (mode: 'hybrid' | 'friction_dominant' | 'friction_only') => void;
  incomeTaxMultiplier: number;
  onIncomeTaxMultiplierChange: (value: number) => void;
}

export default function PolicySliders({
  tokenTaxRate,
  onTokenTaxRateChange,
  ubiAnnualPerAdult,
  onUbiChange,
  breakoutPoint,
  onBreakoutPointChange,
  frictionTaxRate,
  onFrictionTaxRateChange,
  transactionVolumeGrowthRate,
  onTransactionVolumeGrowthRateChange,
  capitalFlightRate,
  onCapitalFlightRateChange,
  onReset,
  showGlossary = false,
  onGlossaryToggle = () => {},
  revenueArchitectureMode,
  onRevenueArchitectureModeChange,
  incomeTaxMultiplier,
  onIncomeTaxMultiplierChange,
}: PolicySlidersProps) {
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate thumb positions (0-100%)
  const frictionTaxPosition = ((frictionTaxRate - 0.001) / (0.01 - 0.001)) * 100;
  const growthRatePosition = (transactionVolumeGrowthRate / 0.15) * 100;
  const capitalFlightPosition = (capitalFlightRate / 0.05) * 100;
  const tokenTaxPosition = ((tokenTaxRate - 0.001) / (0.01 - 0.001)) * 100;
  const ubiPosition = (ubiAnnualPerAdult / 20000) * 100;
  const breakoutPosition = ((breakoutPoint - 30000) / (100000 - 30000)) * 100;

  // Calculate estimated values for context
  const estimatedFrictionTaxRevenue = frictionTaxRate * 1e15 * (1 - capitalFlightRate);
  const estimatedTokenTaxRevenue = tokenTaxRate * 1e15;
  const estimatedUBICost = ubiAnnualPerAdult * 265000000;

  const getFrictionTaxContext = () => {
    const revenue = estimatedFrictionTaxRevenue / 1e12;
    return {
      label: 'Estimated Annual Revenue',
      value: `$${revenue.toFixed(2)}T`
    };
  };

  const getGrowthRateContext = () => {
    const tenYearVolume = 1e15 * Math.pow(1 + transactionVolumeGrowthRate, 10);
    const projectedRevenue = tenYearVolume * 0.0035; // default rate for estimation
    return {
      label: '10-Year Transaction Volume Projection',
      value: `Year 10: $${(tenYearVolume / 1e15).toFixed(2)}Q | Est. Annual Revenue: $${(projectedRevenue / 1e12).toFixed(1)}T`
    };
  };

  const getCapitalFlightContext = () => {
    const volumeLoss = (capitalFlightRate * 100).toFixed(1);
    return {
      label: 'Transaction volume reduction',
      value: `${volumeLoss}%`
    };
  };

  const getTokenTaxContext = () => {
    const revenue = estimatedTokenTaxRevenue / 1e12;
    return {
      label: 'Estimated Annual Revenue',
      value: `$${revenue.toFixed(2)}T`
    };
  };

  const getUBIContext = () => {
    const cost = estimatedUBICost / 1e12;
    return {
      label: 'Adult UBI Cost',
      value: `$${cost.toFixed(2)}T`
    };
  };

  const getBreakoutContext = () => {
    return {
      label: 'Supplement fully phases out at',
      value: formatCurrency(breakoutPoint)
    };
  };

  const [showAdvancedRevenue, setShowAdvancedRevenue] = useState(false);

  const SliderSection = ({
    title,
    subtitle,
    icon,
    color,
    value,
    context,
    position,
    onChange,
    min,
    max,
    step,
    minLabel,
    maxLabel,
    formattedValue,
    tooltipText
  }: any) => (
    <div className="bg-dark-slate rounded-lg p-5 glow-border-slate card-hover-glow" style={{ transition: 'all 0.3s ease' }}>
      {/* Section Category */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-muted uppercase tracking-wide">
          {icon} {title}
          {tooltipText && (
            <Tooltip text={tooltipText}>
              <span style={{ marginLeft: 6, cursor: 'help', color: '#cbd5e1', fontSize: '11px',
                border: '1px solid #cbd5e1', borderRadius: '50%', padding: '2px 5px', display: 'inline-block' }}>?</span>
            </Tooltip>
          )}
        </p>
      </div>

      {/* Control Label & Value */}
      <div className="mb-5">
        {subtitle && <p className="text-sm text-dimmed mb-2">{subtitle}</p>}
        <p className="text-5xl font-bold text-bright">{formattedValue}</p>
      </div>

      {/* Slider Container */}
      <div className="relative mb-6 pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={`slider slider-${color} w-full h-2.5 rounded-full appearance-none cursor-pointer`}
          style={{
            background: `linear-gradient(to right, ${
              color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#A855F7'
            } 0%, ${
              color === 'blue' ? '#60A5FA' : color === 'green' ? '#34D399' : '#C084FC'
            } ${position}%, #334155 ${position}%, #1a2332 100%)`,
            boxShadow: `0 2px 12px ${
              color === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
              color === 'green' ? 'rgba(16, 185, 129, 0.4)' :
              'rgba(168, 85, 247, 0.4)'
            }, 0 0 20px ${
              color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
              color === 'green' ? 'rgba(16, 185, 129, 0.2)' :
              'rgba(168, 85, 247, 0.2)'
            }`
          }}
        />
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-xs text-dimmed mb-4">
        <span>Min {minLabel}</span>
        <span>Max {maxLabel}</span>
      </div>

      {/* Context - Two-line metric format */}
      <div className="p-4 bg-darker-slate rounded-lg border border-border-slate">
        <p className="text-xs text-muted mb-2 uppercase tracking-wide">{context.label}</p>
        <p className="text-lg font-bold text-bright">{context.value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section A: Friction Tax Engine */}
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">SECTION A: Friction Tax Engine</p>
        <div className="space-y-6">
          {/* Friction Tax Rate */}
          <SliderSection
            title="Friction Tax Rate"
            subtitle="Electronic Transaction Tax"
            icon="💳"
            color="blue"
            value={frictionTaxRate}
            onChange={(e: any) => onFrictionTaxRateChange(parseFloat(e.target.value))}
            min={0.001}
            max={0.01}
            step={0.0005}
            minLabel="0.1%"
            maxLabel="1.0%"
            formattedValue={formatPercent(frictionTaxRate)}
            position={frictionTaxPosition}
            context={getFrictionTaxContext()}
            tooltipText="Tax applied to annual electronic transaction volume, adjusted for capital flight."
          />

          {/* Transaction Volume Growth Rate */}
          <SliderSection
            title="Growth Rate"
            subtitle="Annual Transaction Volume Growth"
            icon="📈"
            color="green"
            value={transactionVolumeGrowthRate}
            onChange={(e: any) => onTransactionVolumeGrowthRateChange(parseFloat(e.target.value))}
            min={0}
            max={0.15}
            step={0.01}
            minLabel="0%"
            maxLabel="15%"
            formattedValue={`${(transactionVolumeGrowthRate * 100).toFixed(1)}%`}
            position={growthRatePosition}
            context={getGrowthRateContext()}
            tooltipText="Expected annual growth in electronic transaction volume (10-year projection basis)."
          />

          {/* Capital Flight Rate */}
          <SliderSection
            title="Transaction Volume Migration"
            subtitle="Offshore Migration Risk (%)"
            icon="⚠️"
            color="purple"
            value={capitalFlightRate}
            onChange={(e: any) => onCapitalFlightRateChange(parseFloat(e.target.value))}
            min={0}
            max={0.05}
            step={0.001}
            minLabel="0%"
            maxLabel="5%"
            formattedValue={`${(capitalFlightRate * 100).toFixed(2)}%`}
            position={capitalFlightPosition}
            context={getCapitalFlightContext()}
            tooltipText="% of transaction volume expected to migrate offshore in response to friction tax rate increase."
          />
        </div>
      </div>

      {/* Section B: Income Tax & Revenue Sources */}
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">SECTION B: Income Tax & Social Floor</p>
        <div className="space-y-6">
          {/* Token Tax Rate - Revenue Driver */}
          <SliderSection
        title="Revenue Driver"
        subtitle="Token Tax"
        icon="💰"
        color="blue"
        value={tokenTaxRate}
        onChange={(e: any) => onTokenTaxRateChange(parseFloat(e.target.value))}
        min={0.001}
        max={0.01}
        step={0.0005}
        minLabel="0.1%"
        maxLabel="1.0%"
        formattedValue={formatPercent(tokenTaxRate)}
        position={tokenTaxPosition}
        context={getTokenTaxContext()}
        tooltipText="Shifts part of the tax base from labor to digital capital activity."
      />

      {/* UBI Annual Per Adult - Social Floor */}
      <SliderSection
        title="Social Floor"
        subtitle="Annual UBI"
        icon="📊"
        color="green"
        value={ubiAnnualPerAdult}
        onChange={(e: any) => onUbiChange(parseFloat(e.target.value))}
        min={0}
        max={20000}
        step={500}
        minLabel="$0"
        maxLabel="$20,000"
        formattedValue={formatCurrency(ubiAnnualPerAdult)}
        position={ubiPosition}
        context={getUBIContext()}
        tooltipText="Designed to provide income stability while preserving work incentives."
      />

{/* Breakout Point - Incentive Structure */}
      <SliderSection
        title="Incentive Structure"
        subtitle="Breakout Point"
        icon="🎯"
        color="purple"
        value={breakoutPoint}
        onChange={(e: any) => onBreakoutPointChange(parseFloat(e.target.value))}
        min={30000}
        max={100000}
        step={1000}
        minLabel="$30,000"
        maxLabel="$100,000"
        formattedValue={formatCurrency(breakoutPoint)}
        position={breakoutPosition}
        context={getBreakoutContext()}
        tooltipText="Breakout Point = income level where supplemental support fully phases out."
      />
        </div>
      </div>

      {/* Advanced Revenue Options (Collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvancedRevenue(!showAdvancedRevenue)}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <span>⚙</span> Advanced Revenue Options
          <span style={{ fontSize: '10px' }}>{showAdvancedRevenue ? '▼' : '▶'}</span>
        </button>

        {showAdvancedRevenue && (
          <div className="bg-dark-slate rounded-lg p-5 glow-border-slate mt-3" style={{ transition: 'all 0.3s ease' }}>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">
              Revenue Architecture
            </p>
            <p className="text-xs text-dimmed mb-5">Compare funding structures and stress-test the model.</p>

            {/* Radio Group — Funding Structure */}
            <div className="space-y-3 mb-5">
              {[
                { value: 'hybrid' as const, label: 'Hybrid (Friction + Income Tax)', sub: 'Most realistic today' },
                { value: 'friction_dominant' as const, label: 'Friction-Dominant (Reduced Income Tax)', sub: 'Transition scenario' },
                { value: 'friction_only' as const, label: 'Friction-Only (No Income Tax)', sub: 'Full replacement scenario' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="revenueArchitectureMode"
                    value={option.value}
                    checked={revenueArchitectureMode === option.value}
                    onChange={() => onRevenueArchitectureModeChange(option.value)}
                    className="mt-0.5 accent-blue-400"
                  />
                  <div>
                    <p className="text-sm text-bright">{option.label}</p>
                    <p className="text-xs text-dimmed">{option.sub}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Conditional Income Tax Multiplier Slider — hidden for friction_only */}
            {revenueArchitectureMode !== 'friction_only' && (
              <div className="border-t border-border-slate pt-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted">Income Tax Multiplier</p>
                  <p className="text-sm font-bold text-bright">
                    {revenueArchitectureMode === 'friction_dominant'
                      ? '50%'
                      : `${Math.round(incomeTaxMultiplier * 100)}%`}
                  </p>
                </div>

                {revenueArchitectureMode === 'hybrid' && (
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={incomeTaxMultiplier}
                    onChange={(e) => onIncomeTaxMultiplierChange(parseFloat(e.target.value))}
                    className="slider slider-blue w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #60A5FA ${incomeTaxMultiplier * 100}%, #334155 ${incomeTaxMultiplier * 100}%, #1a2332 100%)`,
                    }}
                  />
                )}

                {revenueArchitectureMode === 'friction_dominant' && (
                  <p className="text-xs text-dimmed italic">Auto-set to 50% in transition scenario</p>
                )}
              </div>
            )}

            {/* Reset to Default link */}
            <div className="border-t border-border-slate pt-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  onRevenueArchitectureModeChange('hybrid');
                  onIncomeTaxMultiplierChange(1.0);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ↺ Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Link + Glossary Button */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', alignItems: 'center' }}>
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '0',
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
          }}
        >
          ↺ Reset to Default
        </button>
        <button
          onClick={() => onGlossaryToggle(!showGlossary)}
          style={{
            background: 'rgba(51, 65, 85, 0.6)',
            border: '1px solid #475569',
            color: '#cbd5e1',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(71, 85, 105, 0.8)';
            e.currentTarget.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(51, 65, 85, 0.6)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          ? Glossary
        </button>
      </div>
    </div>
  );
}
