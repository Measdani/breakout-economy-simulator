/**
 * NAIERM Terminology & Labels
 * Single source of truth for all user-facing language
 * Maintains institutional-grade terminology: BEL, SBI, Electronic Transaction Friction Tax, etc.
 */

export const TERMINOLOGY = {
  // === Model Identity ===
  MODEL_NAME: 'NAIERM',
  MODEL_FULL_NAME: 'National AI Economic Resilience Model',

  // === Revenue Architecture ===
  REVENUE_FRICTION_TAX: 'Electronic Transaction Friction Tax',
  REVENUE_FRICTION_RATE: 'Friction Tax Rate',
  REVENUE_BASE: 'National Digital Settlement Base',
  REVENUE_TOKEN_TAX: 'Token Tax',
  REVENUE_INCOME_TAX: 'Income Tax',
  REVENUE_WELFARE_SAVINGS: 'Welfare Savings',
  REVENUE_TOTAL: 'Total Revenue',

  // === Basic Economic Liquidity (BEL - formerly UBI) ===
  BEL_LONG: 'Basic Economic Liquidity',
  BEL_SHORT: 'BEL',
  BEL_ADULT: 'BEL – Adult Allocation',
  BEL_DEPENDENT: 'BEL – Dependent Allocation',
  BEL_TOTAL_COST: 'BEL Cost (Total)',
  BEL_ADULT_COST: 'Adult BEL',
  BEL_DEPENDENT_COST: 'Dependent BEL',
  BEL_WITH: 'With BEL',
  BEL_PERCENT_BUDGET: '% of BEL Budget',
  BEL_STRUCTURE: 'BEL Structure',

  // === Systemic Bonus Incentive (SBI - formerly Supplement) ===
  SBI_LONG: 'Systemic Bonus Incentive',
  SBI_SHORT: 'SBI',
  SBI_PHASES_OUT: 'SBI Phases Out At',
  SBI_BREAKOUT_THRESHOLD: 'Incentive Phase-Out Threshold',
  SBI_DESCRIPTION: 'Performance-aligned earnings incentive that tapers with income',

  // === Obligations ===
  OBLIGATIONS_GOVT_OPERATIONS: 'Government Operations',
  OBLIGATIONS_TOTAL: 'Total Obligations',

  // === Retirement Program ===
  RETIREMENT_PROGRAM: 'Retirement Program',
  RETIREMENT_ENABLED: 'Enabled',
  RETIREMENT_DISABLED: 'Disabled',
  RETIREMENT_MODE: 'Mode',
  RETIREMENT_ELIGIBILITY_AGE: 'Eligibility Age',
  RETIREMENT_REPLACEMENT_RATE: 'Replacement Rate',
  RETIREMENT_ACTUARIAL_ADJUSTMENT: 'Actuarial Fairness Adjustment',
  RETIREMENT_SALARY_CAP: 'Salary Cap',
  RETIREMENT_PAYOUT_DURATION: 'Payout Duration',
  RETIREMENT_SALARY_BASIS: 'Salary Basis',
  RETIREMENT_BASELINE_ASSUMPTIONS: 'Baseline Assumptions',
  RETIREMENT_RETIREES: 'Retirees',
  RETIREMENT_AVG_SALARY: 'Avg Final Salary',
  RETIREMENT_SS_BASELINE: 'Legacy Social Security Baseline',
  RETIREMENT_INDIVIDUAL_BENEFIT: 'Individual Benefit (Illustrative)',
  RETIREMENT_NATIONAL_COST: 'National Retirement Cost',
  RETIREMENT_FUNDING_RATIO: '📊 Retirement Funding Ratio',
  RETIREMENT_ANNUAL: 'Annual',
  RETIREMENT_OBLIGATION: 'Obligation',
  RETIREMENT_NET_IMPACT_VS_SS: 'Net Impact vs SS Baseline',
  RETIREMENT_FIXED_DURATION_NOTE: 'Fixed 25-Year Duration (Modeling Simplicity)',
  RETIREMENT_COST_OF_REVENUE: 'Program as % of total model revenue',

  // === Retirement Modes ===
  RETIREMENT_MODE_REPLACE_SS: 'Replace Social Security',
  RETIREMENT_MODE_SUPPLEMENT: 'Supplement SS',
  RETIREMENT_MODE_BASELINE: 'Baseline-Only (Reference)',

  // === Mode Badges ===
  RETIREMENT_BADGE_REPLACING: '🟢 Replacing SS',
  RETIREMENT_BADGE_SUPPLEMENTING: '🟡 Supplementing SS',
  RETIREMENT_BADGE_BASELINE: '⚪ Baseline Only',

  // === Healthcare Program ===
  HEALTHCARE_PROGRAM: 'Healthcare Program',
  HEALTHCARE_COMING_SOON: 'Coming Soon',
  HEALTHCARE_DESCRIPTION: 'Phase 2 — Model public healthcare cost as % of GDP or per-capita baseline. Will include Medicare & Medicaid baseline replacement modeling.',

  // === Assumptions Panel ===
  ASSUMPTIONS_SECTION_BEL: 'BEL Structure',
  ASSUMPTIONS_SECTION_LIQUIDITY: 'Liquidity Architecture',
  ASSUMPTIONS_SECTION_LEGACY_OFFSET: 'Legacy Program Consolidation Offset',

  // === Funding Ratio Status ===
  FUNDING_SUSTAINABLE: '🟢 Sustainable',
  FUNDING_TIGHT: '🟡 Tight',
  FUNDING_UNDERFUNDED: '🔴 Underfunded',

  // === Tooltips ===
  TOOLTIP_ACTUARIAL_ADJUSTMENT: 'Adjusts annual benefit to reflect longevity assumptions relative to fixed 25-year payout.',
};

/**
 * Utility function to get retirement mode display label with badge
 */
export function getRetirementModeBadge(mode: 'replace_ss' | 'supplement' | 'baseline_only'): string {
  switch (mode) {
    case 'replace_ss':
      return TERMINOLOGY.RETIREMENT_BADGE_REPLACING;
    case 'supplement':
      return TERMINOLOGY.RETIREMENT_BADGE_SUPPLEMENTING;
    case 'baseline_only':
      return TERMINOLOGY.RETIREMENT_BADGE_BASELINE;
    default:
      return '';
  }
}
