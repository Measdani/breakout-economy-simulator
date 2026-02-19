'use client';

import Tooltip from './Tooltip';

interface PolicySlidersProps {
  tokenTaxRate: number;
  onTokenTaxRateChange: (value: number) => void;
  ubiAnnualPerAdult: number;
  onUbiChange: (value: number) => void;
  breakoutPoint: number;
  onBreakoutPointChange: (value: number) => void;
  viewMode: 'revenue' | 'social' | 'incentives';
  onViewModeChange: (mode: 'revenue' | 'social' | 'incentives') => void;
  onReset: () => void;
}

export default function PolicySliders({
  tokenTaxRate,
  onTokenTaxRateChange,
  ubiAnnualPerAdult,
  onUbiChange,
  breakoutPoint,
  onBreakoutPointChange,
  viewMode,
  onViewModeChange,
  onReset,
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
  const tokenTaxPosition = ((tokenTaxRate - 0.001) / (0.01 - 0.001)) * 100;
  const ubiPosition = (ubiAnnualPerAdult / 20000) * 100;
  const breakoutPosition = ((breakoutPoint - 30000) / (100000 - 30000)) * 100;

  // Calculate estimated values for context
  const estimatedTokenTaxRevenue = tokenTaxRate * 1e15;
  const estimatedUBICost = ubiAnnualPerAdult * 265000000;

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
      label: 'Total UBI Cost',
      value: `$${cost.toFixed(2)}T`
    };
  };

  const getBreakoutContext = () => {
    return {
      label: 'Supplement fully phases out at',
      value: formatCurrency(breakoutPoint)
    };
  };

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
        <div
          className="absolute -top-6 transform -translate-x-1/2 bg-darker-slate border border-border-slate px-2.5 py-1 rounded text-xs font-semibold text-bright whitespace-nowrap pointer-events-none"
          style={{
            left: `${position}%`,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
          }}
        >
          {formattedValue}
        </div>
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
      {/* Policy Controls Section */}
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

      {/* Mode Toggle Cards - Compact 3-column */}
      <div className="pb-8 mt-12 pt-8">
        {/* Reset Link */}
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '12px',
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
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => onViewModeChange('revenue')}
            className="text-center p-4 rounded-lg border transition-all duration-300"
            style={{
              background: viewMode === 'revenue' ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#1a2332',
              border: viewMode === 'revenue' ? '2px solid #60A5FA' : '2px solid #334155',
              color: 'white',
              cursor: 'pointer',
              opacity: viewMode === 'revenue' ? 1 : 0.6,
              boxShadow: viewMode === 'revenue' ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
            }}
          >
            <div className="text-3xl mb-3">💰</div>
            <p className="text-sm font-semibold">Revenue</p>
          </button>
          <button
            onClick={() => onViewModeChange('social')}
            className="text-center p-4 rounded-lg border transition-all duration-300"
            style={{
              background: viewMode === 'social' ? 'linear-gradient(135deg, #10B981, #059669)' : '#1a2332',
              border: viewMode === 'social' ? '2px solid #34D399' : '2px solid #334155',
              color: 'white',
              cursor: 'pointer',
              opacity: viewMode === 'social' ? 1 : 0.6,
              boxShadow: viewMode === 'social' ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none',
            }}
          >
            <div className="text-3xl mb-3">📊</div>
            <p className="text-sm font-semibold">Social Floor</p>
          </button>
          <button
            onClick={() => onViewModeChange('incentives')}
            className="text-center p-4 rounded-lg border transition-all duration-300"
            style={{
              background: viewMode === 'incentives' ? 'linear-gradient(135deg, #A855F7, #9333EA)' : '#1a2332',
              border: viewMode === 'incentives' ? '2px solid #C084FC' : '2px solid #334155',
              color: 'white',
              cursor: 'pointer',
              opacity: viewMode === 'incentives' ? 1 : 0.6,
              boxShadow: viewMode === 'incentives' ? '0 0 20px rgba(168, 85, 247, 0.6)' : 'none',
            }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <p className="text-sm font-semibold">Incentives</p>
          </button>
        </div>
      </div>
    </div>
  );
}
