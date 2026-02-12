'use client';

interface PolicySlidersProps {
  tokenTaxRate: number;
  onTokenTaxRateChange: (value: number) => void;
  ubiAnnualPerAdult: number;
  onUbiChange: (value: number) => void;
  breakoutPoint: number;
  onBreakoutPointChange: (value: number) => void;
}

export default function PolicySliders({
  tokenTaxRate,
  onTokenTaxRateChange,
  ubiAnnualPerAdult,
  onUbiChange,
  breakoutPoint,
  onBreakoutPointChange,
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
    formattedValue
  }: any) => (
    <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Section Category */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{icon} {title}</p>
      </div>

      {/* Control Label & Value */}
      <div className="mb-4">
        {subtitle && <p className="text-xs text-slate-600 mb-1.5">{subtitle}</p>}
        <p className="text-4xl font-bold text-slate-900">{formattedValue}</p>
      </div>

      {/* Slider Container */}
      <div className="relative mb-6 pt-2">
        <div
          className="absolute -top-6 transform -translate-x-1/2 bg-slate-100 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 whitespace-nowrap pointer-events-none"
          style={{ left: `${position}%` }}
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
              color === 'blue' ? '#2563EB' : color === 'green' ? '#059669' : '#7C3AED'
            } 0%, ${
              color === 'blue' ? '#2563EB' : color === 'green' ? '#059669' : '#7C3AED'
            } ${position}%, #E5E7EB ${position}%, #E5E7EB 100%)`
          }}
        />
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        <span>Min {minLabel}</span>
        <span>Max {maxLabel}</span>
      </div>

      {/* Context - Two-line metric format */}
      <div className="p-3 bg-slate-50 rounded border border-slate-100">
        <p className="text-xs text-slate-500 mb-1.5">{context.label}</p>
        <p className="text-base font-bold text-slate-900">{context.value}</p>
      </div>
    </div>
  );

  return (
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
      />

      {/* Summary Cards - Compact 3-column */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-xs font-semibold text-slate-900 mb-1">Revenue</p>
            <p className="text-xs text-slate-600">Funds UBI & ops</p>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs font-semibold text-slate-900 mb-1">Social Floor</p>
            <p className="text-xs text-slate-600">Minimum income</p>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs font-semibold text-slate-900 mb-1">Incentives</p>
            <p className="text-xs text-slate-600">Work always pays</p>
          </div>
        </div>
      </div>
    </div>
  );
}
