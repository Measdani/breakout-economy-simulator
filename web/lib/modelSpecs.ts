/**
 * NAIERM Model Specifications - Friction Tax Engine (v2.1)
 *
 * This file documents all input ranges, defaults, formulas, and outputs
 * for the Friction Tax Engine component of the simulator.
 *
 * Last Updated: 2026-02-24
 * Author: Claude Code
 */

export const FrictionTaxEngineSpecs = {
  // ============================================================================
  // SECTION A: FRICTION TAX ENGINE
  // ============================================================================

  frictionTaxRate: {
    label: 'Friction Tax Rate',
    description: 'Tax applied to annual electronic transaction volume',
    inputFormat: 'decimal (0.001 = 0.1%)',
    uiFormat: 'percentage',
    default: 0.0035, // 0.35%
    min: 0.001, // 0.1%
    max: 0.01, // 1.0%
    step: 0.0005, // 0.05% increments
    range: '0.1% — 1.0%',
    tooltip: 'Tax applied to annual electronic transaction volume, adjusted for capital flight.',
    rationale: 'Range reflects plausible policy space: 0.1% is minimal revenue; 1.0% is aggressive with high capital flight risk.',
  },

  baseTransactionVolume: {
    label: 'Base Annual Transaction Volume',
    description: 'Total annual US electronic transaction volume (USD)',
    inputFormat: 'currency (scientific notation acceptable)',
    uiFormat: 'currency (display as $X.XT)',
    default: 1e15, // $1 quadrillion
    min: 0.5e15, // $500 trillion
    max: 2e15, // $2 quadrillion
    step: 0.1e15, // $100 trillion increments
    range: '$500T — $2Q',
    tooltip: 'Estimated annual electronic transaction volume in the US economy.',
    rationale: 'Conservative estimate: 2023 US card transactions ~$9T; all electronic (ACH, wire, crypto, etc.) estimated 50-100x larger.',
    derivation: 'Fed data + industry estimates (2024-2026)',
    criticalNote: 'This is the BASE for all revenue calculations. Default: $1 Quadrillion. Formula: Revenue = Volume × TaxRate (adjusted for capital flight). Users should verify this assumption against their baseline data.',
  },

  transactionVolumeGrowthRate: {
    label: 'Annual Transaction Volume Growth Rate',
    description: 'Expected year-over-year growth in electronic transaction volume',
    inputFormat: 'decimal (0.05 = 5%)',
    uiFormat: 'percentage',
    default: 0.05, // 5%
    min: 0, // 0% (flat volume)
    max: 0.15, // 15% (aggressive growth)
    step: 0.01, // 1% increments
    range: '0% — 15%',
    tooltip: 'Expected annual growth in electronic transaction volume (10-year projection basis).',
    rationale: '5% is baseline (GDP+inflation); 10-15% reflects AI/automation acceleration.',
  },

  capitalFlightRate: {
    label: 'Capital Flight Sensitivity',
    description: 'Percentage of transaction volume that may migrate offshore if tax increases',
    inputFormat: 'decimal (0.01 = 1%)',
    uiFormat: 'percentage',
    default: 0, // 0% (no initial capital flight)
    min: 0, // 0%
    max: 0.05, // 5%
    step: 0.001, // 0.1% increments
    range: '0% — 5%',
    tooltip: 'Expected % of transaction volume that may migrate offshore if tax rate increases.',
    rationale: '0% is baseline (default assumption); 1-5% reflects regulatory arbitrage risk.',
    appliedAs: 'Adjusted Volume = Volume × (1 - CapitalFlightRate)',
  },

  marketMakerExempt: {
    label: 'Market Maker Exemption',
    description: 'Admin-only toggle: exempt market-making transactions from tax',
    inputFormat: 'boolean',
    uiFormat: 'toggle (admin only)',
    default: false,
    adminOnly: true,
    rationale: 'Optional policy lever: exempting market makers reduces systemic risk but lowers revenue.',
  },

  // ============================================================================
  // CORE FORMULAS
  // ============================================================================

  formulas: {
    adjustedVolume: {
      name: 'Adjusted Transaction Volume',
      formula: 'Volume × (1 - CapitalFlightRate)',
      example: '$1Q × (1 - 0%) = $1Q',
      purpose: 'Account for volume reduction due to capital flight',
    },

    annualFrictionTaxRevenue: {
      name: 'Annual Friction Tax Revenue',
      formula: 'Adjusted Volume × Tax Rate',
      example: '$1Q × 0.35% = $3.5T',
      purpose: 'Primary revenue source in Year 0',
    },

    projectedVolumeYearN: {
      name: 'Projected Transaction Volume (Year N)',
      formula: 'Base Volume × (1 + Growth Rate)^N',
      example: '$1Q × (1.05)^10 = $1.629Q',
      purpose: 'Account for transaction volume growth over 10 years',
    },

    projectedFrictionTaxRevenue10Yr: {
      name: '10-Year Friction Tax Revenue (Cumulative)',
      formula: 'Sum from Year 0 to 9: [AdjustedVolume_Y × (1 + GrowthRate)^Y × TaxRate]',
      example: '$39.5T (cumulative over 10 years)',
      purpose: 'Long-term revenue projection for fiscal sustainability',
    },

    frictionTaxSensitivity: {
      name: 'Sensitivity Analysis: Rate Change',
      formula: 'Δ Revenue = Adjusted Volume × Δ Tax Rate; Δ % = (Δ Revenue / Base Revenue) × 100',
      example: '+0.10% rate change → +$1.0T (+28.6% revenue increase)',
      purpose: 'Show impact of small policy adjustments',
    },

    frictionTaxShareOfModelRevenue: {
      name: '% of Total Model Revenue',
      formula: 'Friction Tax Revenue / Total Model Revenue',
      example: '$3.5T / $10T = 35.0%',
      purpose: 'Show composition of total system revenue (recommended default)',
    },

    frictionTaxShareOfFederalBaseline: {
      label: '% of Current Federal Revenue (Optional)',
      formula: 'Friction Tax Revenue / Federal Revenue Baseline',
      example: '$3.5T / $4.1T (2024 US federal revenue) = 85.4%',
      purpose: 'Optional metric for investor/policymaker comparison (admin toggle)',
      adminOnly: true,
    },
  },

  // ============================================================================
  // OUTPUTS (Right Panel Display)
  // ============================================================================

  outputs: {
    annualFrictionTaxRevenue: {
      label: 'Annual Friction Tax Revenue',
      format: 'currency ($X.XT)',
      calculation: 'From formulas.annualFrictionTaxRevenue',
      displayLocation: 'Revenue Breakdown (right panel)',
      color: 'text-blue-400',
    },

    projectedFrictionTax10Yr: {
      label: '10-Year Projected Revenue',
      format: 'currency ($X.XT)',
      calculation: 'From formulas.projectedFrictionTaxRevenue10Yr',
      displayLocation: 'Revenue Composition (right panel)',
      color: 'text-cyan-400',
    },

    frictionTaxShareModel: {
      label: 'Share of Model Revenue',
      format: 'percentage (X.X%)',
      calculation: 'From formulas.frictionTaxShareOfModelRevenue',
      displayLocation: 'Revenue Composition (right panel)',
      color: 'text-blue-400',
    },

    frictionTaxShareFederal: {
      label: 'Share of Federal Baseline (Optional)',
      format: 'percentage (X.X%)',
      calculation: 'From formulas.frictionTaxShareOfFederalBaseline',
      displayLocation: 'Revenue Composition (admin toggle)',
      adminOnly: true,
      color: 'text-slate-300',
    },

    sensitivityUp: {
      label: 'Sensitivity: +0.10% Rate',
      format: 'delta revenue ($X.XT) + % change (X.X%)',
      calculation: 'calculateFrictionTaxSensitivity(volume, rate, capital_flight, +0.001)',
      displayLocation: 'Friction Tax Sensitivity (right panel)',
      color: 'text-green-400',
    },

    sensitivityDown: {
      label: 'Sensitivity: -0.10% Rate',
      format: 'delta revenue ($X.XT) + % change (X.X%)',
      calculation: 'calculateFrictionTaxSensitivity(volume, rate, capital_flight, -0.001)',
      displayLocation: 'Friction Tax Sensitivity (right panel)',
      color: 'text-red-400',
    },
  },

  // ============================================================================
  // DATA STORAGE (PolicyConfig persistence)
  // ============================================================================

  persistenceFields: {
    frictionTaxRate: 'Decimal (0.0035)',
    baseTransactionVolume: 'Number (1e15)',
    transactionVolumeGrowthRate: 'Decimal (0.05)',
    capitalFlightRate: 'Decimal (0)',
    marketMakerExempt: 'Boolean (false)',
  },

  // ============================================================================
  // VALIDATION RULES
  // ============================================================================

  validation: {
    frictionTaxRate: {
      min: 0.001,
      max: 0.01,
      errorMsg: 'Tax rate must be between 0.1% and 1.0%',
    },
    baseTransactionVolume: {
      min: 0.5e15,
      max: 2e15,
      errorMsg: 'Transaction volume must be between $500T and $2Q',
    },
    transactionVolumeGrowthRate: {
      min: 0,
      max: 0.15,
      errorMsg: 'Growth rate must be between 0% and 15%',
    },
    capitalFlightRate: {
      min: 0,
      max: 0.05,
      errorMsg: 'Capital flight rate must be between 0% and 5%',
    },
  },

  // ============================================================================
  // DIAGNOSTICS & WARNINGS
  // ============================================================================

  diagnostics: {
    highCapitalFlightWarning: {
      condition: 'capitalFlightRate > 0.03',
      message: 'High capital flight risk (>3%)—revenue may be significantly impacted if tax exceeds market expectations.',
    },
    lowRevenueWarning: {
      condition: 'annualFrictionTaxRevenue < 2e12',
      message: 'Friction tax revenue is below $2T—verify policy feasibility.',
    },
    volatilityWarning: {
      condition: 'growthRate > 0.10 && capitalFlightRate > 0.02',
      message: 'High growth + capital flight combination creates revenue volatility risk.',
    },
  },

  // ============================================================================
  // DEFENSIBILITY NOTES (Investor/Researcher Guide)
  // ============================================================================

  defensibility: {
    baselineAssumption: {
      metric: '$1 quadrillion annual electronic transaction volume',
      source: 'Fed + industry analysis (2024-2026)',
      confidence: 'Medium (highly dependent on scope definition)',
      rationale: 'Conservative vs. total payment system volume; excludes high-frequency trading.',
    },

    growthRateAssumption: {
      metric: '5% baseline, 10-15% with AI acceleration',
      source: 'Historical GDP growth + AI productivity estimates',
      confidence: 'Medium',
      rationale: '5% = long-term economic trend; 10-15% reflects AI disruption scenarios.',
    },

    capitalFlightAssumption: {
      metric: '0% default, 0-5% range for sensitivity',
      source: 'European FTT studies + offshore banking literature',
      confidence: 'Low (highly jurisdiction-dependent)',
      rationale: 'Domestic transactions unlikely to migrate; cross-border flows more sensitive.',
    },

    revenueShareMetric: {
      primary: '% of Model Revenue (composition of new system)',
      secondary: '% of Federal Baseline (relative to current revenue)',
      rationale: 'Primary metric avoids circular comparison; secondary helps policymakers contextualize scale.',
    },
  },

  // ============================================================================
  // VERSION HISTORY
  // ============================================================================

  versionHistory: [
    {
      version: '1.0',
      date: '2026-02-24',
      author: 'Claude Code',
      changes: 'Initial Friction Tax Engine specification; implements formulas, ranges, validation, and sensitivity.',
    },
  ],
};

export default FrictionTaxEngineSpecs;
