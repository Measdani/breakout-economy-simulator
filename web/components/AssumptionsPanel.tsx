'use client';

import type { PolicyConfig } from '../lib/types';

interface AssumptionsPanelProps {
  config: PolicyConfig;
  onClose: () => void;
}

export default function AssumptionsPanel({ config, onClose }: AssumptionsPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const AssumptionRow = ({
    label,
    value,
    description,
  }: {
    label: string;
    value: string | number;
    description?: string;
  }) => (
    <div className="border-b border-border-slate pb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-semibold text-bright">{label}</p>
        <p className="text-sm font-bold text-blue-400">{value}</p>
      </div>
      {description && <p className="text-xs text-dimmed">{description}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-slate rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-slate">
        {/* Header */}
        <div className="sticky top-0 bg-darker-slate p-6 border-b border-border-slate flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-bright">Model Assumptions</h2>
            <p className="text-sm text-dimmed mt-1">
              Complete documentation of all parameters and methodology
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: '28px', color: '#cbd5e1', background: 'none', border: 'none', padding: '0', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Demographic Baseline */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              📊 Demographic Baseline
            </h3>
            <div className="space-y-4 ml-4">
              <AssumptionRow
                label="Adult Population"
                value={config.adultPopulation.toLocaleString()}
                description="Primary eligible population for UBI. Based on US adult population (18+)."
              />
              <AssumptionRow
                label="Total Households (Estimated)"
                value={Math.round(config.adultPopulation / 2.5).toLocaleString()}
                description="Derived from adult population assuming average household size of 2.5."
              />
            </div>
          </div>

          {/* Fiscal Parameters */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              💰 Fiscal Parameters
            </h3>
            <div className="space-y-4 ml-4">
              <AssumptionRow
                label="Assumed US GDP"
                value="$28 Trillion"
                description="Used for policy metric calculations (e.g., UBI as % of GDP). Based on recent US economic data."
              />
              <AssumptionRow
                label="Government Operating Requirement"
                value={formatCurrency(config.govtOperatingRequirement)}
                description="Annual government operations budget (non-UBI, non-welfare). Includes defense, infrastructure, education, healthcare administration."
              />
              <AssumptionRow
                label="Welfare Savings Credit"
                value={formatCurrency(config.welfareSavingsCredit)}
                description="Annual offset from consolidating existing welfare programs into UBI. Reflects administrative simplification and program consolidation."
              />
              <AssumptionRow
                label="Annual Digital Flow Base"
                value={formatCurrency(config.flowBaseAnnual)}
                description="Estimated annual volume of digital capital transactions subject to token tax."
              />
            </div>
          </div>

          {/* Revenue Methodology */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              📈 Revenue Generation Method
            </h3>
            <div className="space-y-4 ml-4">
              <AssumptionRow
                label="Token Tax Rate (Variable)"
                value={`${(config.tokenTaxRate * 100).toFixed(3)}%`}
                description="Proportional tax on digital capital transactions (e.g., crypto, digital payments, platform fees). Scales revenue linearly with rate."
              />
              <AssumptionRow
                label="Income Tax Methodology"
                value="Progressive (3-tier)"
                description={`Tier 1: Standard rate up to $${config.tier1Start.toLocaleString()}. Tier 2: ${(config.tier2Rate * 100).toFixed(0)}% from $${config.tier1Start.toLocaleString()} to $${config.tier2Start.toLocaleString()}. Tier 3: ${(config.tier2Rate * 100).toFixed(0)}% above $${config.tier2Start.toLocaleString()}.`}
              />
              <div className="bg-darker-slate rounded p-3 border border-border-slate">
                <p className="text-xs text-dimmed">
                  <strong>Total Revenue = Token Tax + Income Tax + Welfare Savings</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Obligation Methodology */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              🎯 Obligation Calculation
            </h3>
            <div className="space-y-4 ml-4">
              <AssumptionRow
                label="UBI Structure"
                value="Multi-tier"
                description="Adults receive base UBI. Dependents receive tier-based supplements (1st: $6k, 2nd: $4k, 3rd: $2k). Designed to support child-rearing without cliff effects."
              />
              <AssumptionRow
                label="Breakout Point"
                value={formatCurrency(config.breakoutPoint)}
                description="Income threshold where supplemental support fully phases out. Above this income, citizens receive UBI only."
              />
              <AssumptionRow
                label="Supplement Bonus (Peak)"
                value={formatCurrency(config.supplementApexBonus)}
                description="Maximum supplement bonus, paid at apex income. Gradually phases to zero by breakout point."
              />
              <div className="bg-darker-slate rounded p-3 border border-border-slate">
                <p className="text-xs text-dimmed">
                  <strong>Total Obligations = UBI Cost + Dependent UBI + Gov Operations</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Deficit Modeling */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              ⚖️ Fiscal Balance Methodology
            </h3>
            <div className="space-y-4 ml-4">
              <AssumptionRow
                label="Calculation Method"
                value="Revenue - Obligations"
                description="Simple linear balance. Positive = surplus, Negative = deficit. No inflation adjustment or growth assumptions applied."
              />
              <AssumptionRow
                label="Deficit Coverage Assumption"
                value="Monetization (Central Bank)"
                description="Deficits are assumed to be covered by central bank operations (e.g., quantitative easing). Not assumed to be funded by bonds or deficit spending that increases national debt."
              />
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded p-3">
                <p className="text-xs text-yellow-400">
                  <strong>⚠ Monetization Impact:</strong> If the model runs a deficit and assumes central bank financing, inflation risk depends on the magnitude of deficit relative to GDP growth and monetary velocity.
                </p>
              </div>
            </div>
          </div>

          {/* Model Limitations */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              🔬 Scope & Limitations
            </h3>
            <div className="space-y-2 ml-4 text-sm text-dimmed">
              <p>✓ Model captures direct fiscal impact of UBI + supplemental policy</p>
              <p>✓ Work incentive effects modeled via supplement/breakout curve</p>
              <p>✗ Does not model behavioral economic effects (labor supply elasticity)</p>
              <p>✗ Does not include macroeconomic feedback loops (inflation, growth)</p>
              <p>✗ Does not account for transition costs or phase-in period</p>
              <p>✗ Fixed baseline - does not model counterfactual welfare outcomes</p>
            </div>
          </div>

          {/* Data Privacy */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded p-4">
            <p className="text-xs text-blue-400">
              <strong>ℹ Data Privacy:</strong> Your configurations and any submitted demographics are anonymized and used only for aggregate policy research. No personal information is retained or disclosed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
