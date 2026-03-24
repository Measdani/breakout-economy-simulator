import type { PolicyConfig } from './types'
import { DEFAULT_POLICY_CONFIG } from './defaultPolicyConfig'

const REVENUE_MODES = ['hybrid', 'friction_dominant', 'friction_only'] as const
const RETIREMENT_MODES = ['replace_ss', 'supplement', 'baseline_only'] as const
const SALARY_BASES = ['final_3yr', 'final_5yr', 'career_avg'] as const
const HEALTHCARE_MODES = ['baseline', 'efficiency_reform', 'structural_replacement'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readNumber(
  source: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const value = source[key]
  if (value === undefined) {
    return fallback
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${key} must be a finite number`)
  }

  return value
}

function readBoolean(
  source: Record<string, unknown>,
  key: string,
  fallback: boolean
): boolean {
  const value = source[key]
  if (value === undefined) {
    return fallback
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${key} must be a boolean`)
  }

  return value
}

function readEnum<T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  fallback: T
): T {
  const value = source[key]
  if (value === undefined) {
    return fallback
  }

  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new Error(`${key} must be one of: ${allowedValues.join(', ')}`)
  }

  return value as T
}

function readPersonaWeights(source: Record<string, unknown>): number[] {
  const value = source.personaWeights
  if (value === undefined) {
    return DEFAULT_POLICY_CONFIG.personaWeights ?? [0.25, 0.25, 0.25, 0.25]
  }

  if (!Array.isArray(value) || value.length !== 4) {
    throw new Error('personaWeights must be an array of four numbers')
  }

  const weights = value.map((entry) => {
    if (typeof entry !== 'number' || !Number.isFinite(entry)) {
      throw new Error('personaWeights must contain only finite numbers')
    }
    return entry
  })

  const totalWeight = weights.reduce((sum, entry) => sum + entry, 0)
  if (weights.some((entry) => entry < 0) || totalWeight <= 0) {
    throw new Error('personaWeights must be non-negative and sum to more than zero')
  }

  return weights
}

function assertRange(value: number, min: number, max: number, key: string) {
  if (value < min || value > max) {
    throw new Error(`${key} must be between ${min} and ${max}`)
  }
}

export function normalizePublicPolicyConfig(input: unknown): PolicyConfig {
  if (!isRecord(input)) {
    throw new Error('Configuration must be an object')
  }

  const breakoutPoint = readNumber(input, 'breakoutPoint', DEFAULT_POLICY_CONFIG.breakoutPoint)

  const config: PolicyConfig = {
    tokenTaxRate: readNumber(input, 'tokenTaxRate', DEFAULT_POLICY_CONFIG.tokenTaxRate),
    flowBaseAnnual: readNumber(input, 'flowBaseAnnual', DEFAULT_POLICY_CONFIG.flowBaseAnnual),
    ubiAnnualPerAdult: readNumber(input, 'ubiAnnualPerAdult', DEFAULT_POLICY_CONFIG.ubiAnnualPerAdult),
    adultPopulation: readNumber(input, 'adultPopulation', DEFAULT_POLICY_CONFIG.adultPopulation),
    welfareSavingsCredit: readNumber(input, 'welfareSavingsCredit', DEFAULT_POLICY_CONFIG.welfareSavingsCredit),
    govtOperatingRequirement: readNumber(
      input,
      'govtOperatingRequirement',
      DEFAULT_POLICY_CONFIG.govtOperatingRequirement
    ),
    breakoutPoint,
    tier1Rate: readNumber(input, 'tier1Rate', DEFAULT_POLICY_CONFIG.tier1Rate),
    tier1Start:
      input.tier1Start === undefined
        ? breakoutPoint
        : readNumber(input, 'tier1Start', DEFAULT_POLICY_CONFIG.tier1Start),
    tier2Rate: readNumber(input, 'tier2Rate', DEFAULT_POLICY_CONFIG.tier2Rate),
    tier2Start: readNumber(input, 'tier2Start', DEFAULT_POLICY_CONFIG.tier2Start),
    supplementApexIncome: readNumber(
      input,
      'supplementApexIncome',
      DEFAULT_POLICY_CONFIG.supplementApexIncome
    ),
    supplementApexBonus: readNumber(
      input,
      'supplementApexBonus',
      DEFAULT_POLICY_CONFIG.supplementApexBonus
    ),
    personaWeights: readPersonaWeights(input),
    ubiDependent1: readNumber(input, 'ubiDependent1', DEFAULT_POLICY_CONFIG.ubiDependent1 ?? 6000),
    ubiDependent2: readNumber(input, 'ubiDependent2', DEFAULT_POLICY_CONFIG.ubiDependent2 ?? 4000),
    ubiDependent3: readNumber(input, 'ubiDependent3', DEFAULT_POLICY_CONFIG.ubiDependent3 ?? 2000),
    numHouseholds: readNumber(input, 'numHouseholds', DEFAULT_POLICY_CONFIG.numHouseholds ?? 130000000),
    pctHouseholds1Dep: readNumber(
      input,
      'pctHouseholds1Dep',
      DEFAULT_POLICY_CONFIG.pctHouseholds1Dep ?? 0.25
    ),
    pctHouseholds2Dep: readNumber(
      input,
      'pctHouseholds2Dep',
      DEFAULT_POLICY_CONFIG.pctHouseholds2Dep ?? 0.15
    ),
    pctHouseholds3Dep: readNumber(
      input,
      'pctHouseholds3Dep',
      DEFAULT_POLICY_CONFIG.pctHouseholds3Dep ?? 0.1
    ),
    frictionTaxRate: readNumber(
      input,
      'frictionTaxRate',
      DEFAULT_POLICY_CONFIG.frictionTaxRate ?? DEFAULT_POLICY_CONFIG.tokenTaxRate
    ),
    baseTransactionVolume: readNumber(
      input,
      'baseTransactionVolume',
      DEFAULT_POLICY_CONFIG.baseTransactionVolume ?? 1e15
    ),
    transactionVolumeGrowthRate: readNumber(
      input,
      'transactionVolumeGrowthRate',
      DEFAULT_POLICY_CONFIG.transactionVolumeGrowthRate ?? 0.05
    ),
    capitalFlightRate: readNumber(
      input,
      'capitalFlightRate',
      DEFAULT_POLICY_CONFIG.capitalFlightRate ?? 0
    ),
    marketMakerExempt: readBoolean(
      input,
      'marketMakerExempt',
      DEFAULT_POLICY_CONFIG.marketMakerExempt ?? false
    ),
    revenueArchitectureMode: readEnum(
      input,
      'revenueArchitectureMode',
      REVENUE_MODES,
      DEFAULT_POLICY_CONFIG.revenueArchitectureMode ?? 'hybrid'
    ),
    incomeTaxMultiplier: readNumber(
      input,
      'incomeTaxMultiplier',
      DEFAULT_POLICY_CONFIG.incomeTaxMultiplier ?? 1
    ),
    retirementEnabled: readBoolean(
      input,
      'retirementEnabled',
      DEFAULT_POLICY_CONFIG.retirementEnabled ?? false
    ),
    retirementMode: readEnum(
      input,
      'retirementMode',
      RETIREMENT_MODES,
      DEFAULT_POLICY_CONFIG.retirementMode ?? 'replace_ss'
    ),
    retirementEligibilityAge: readNumber(
      input,
      'retirementEligibilityAge',
      DEFAULT_POLICY_CONFIG.retirementEligibilityAge ?? 67
    ),
    replacementRate: readNumber(
      input,
      'replacementRate',
      DEFAULT_POLICY_CONFIG.replacementRate ?? 0.8
    ),
    benefitAdjustmentFactor: readNumber(
      input,
      'benefitAdjustmentFactor',
      DEFAULT_POLICY_CONFIG.benefitAdjustmentFactor ?? 0.7
    ),
    pensionableSalaryCap: readNumber(
      input,
      'pensionableSalaryCap',
      DEFAULT_POLICY_CONFIG.pensionableSalaryCap ?? 250000
    ),
    payoutDurationYears: readNumber(
      input,
      'payoutDurationYears',
      DEFAULT_POLICY_CONFIG.payoutDurationYears ?? 25
    ),
    salaryBasis: readEnum(
      input,
      'salaryBasis',
      SALARY_BASES,
      DEFAULT_POLICY_CONFIG.salaryBasis ?? 'final_3yr'
    ),
    retireesCount: readNumber(
      input,
      'retireesCount',
      DEFAULT_POLICY_CONFIG.retireesCount ?? 54000000
    ),
    avgFinal3yrSalary: readNumber(
      input,
      'avgFinal3yrSalary',
      DEFAULT_POLICY_CONFIG.avgFinal3yrSalary ?? 75000
    ),
    ssBaseline: readNumber(input, 'ssBaseline', DEFAULT_POLICY_CONFIG.ssBaseline ?? 1.3e12),
    healthcareEnabled: readBoolean(
      input,
      'healthcareEnabled',
      DEFAULT_POLICY_CONFIG.healthcareEnabled ?? true
    ),
    healthcareMode: readEnum(
      input,
      'healthcareMode',
      HEALTHCARE_MODES,
      DEFAULT_POLICY_CONFIG.healthcareMode ?? 'baseline'
    ),
    medicareAnnualSpend: readNumber(
      input,
      'medicareAnnualSpend',
      DEFAULT_POLICY_CONFIG.medicareAnnualSpend ?? 1.05e12
    ),
    medicaidAnnualSpend: readNumber(
      input,
      'medicaidAnnualSpend',
      DEFAULT_POLICY_CONFIG.medicaidAnnualSpend ?? 0.86e12
    ),
    federalHealthcareSpendTotal: readNumber(
      input,
      'federalHealthcareSpendTotal',
      DEFAULT_POLICY_CONFIG.federalHealthcareSpendTotal ?? 1.91e12
    ),
    nationalHealthcareSpendTotal: readNumber(
      input,
      'nationalHealthcareSpendTotal',
      DEFAULT_POLICY_CONFIG.nationalHealthcareSpendTotal ?? 0
    ),
    healthcareEmployerSharePct: readNumber(
      input,
      'healthcareEmployerSharePct',
      DEFAULT_POLICY_CONFIG.healthcareEmployerSharePct ?? 0
    ),
    healthcareHouseholdSharePct: readNumber(
      input,
      'healthcareHouseholdSharePct',
      DEFAULT_POLICY_CONFIG.healthcareHouseholdSharePct ?? 0
    ),
    aiDiagnosticsSavingsPct: readNumber(
      input,
      'aiDiagnosticsSavingsPct',
      DEFAULT_POLICY_CONFIG.aiDiagnosticsSavingsPct ?? 0
    ),
    adminAutomationSavingsPct: readNumber(
      input,
      'adminAutomationSavingsPct',
      DEFAULT_POLICY_CONFIG.adminAutomationSavingsPct ?? 0
    ),
    allPayerTransparencySavingsPct: readNumber(
      input,
      'allPayerTransparencySavingsPct',
      DEFAULT_POLICY_CONFIG.allPayerTransparencySavingsPct ?? 0
    ),
  }

  assertRange(config.tokenTaxRate, 0.001, 0.01, 'tokenTaxRate')
  assertRange(config.flowBaseAnnual, 1e14, 5e15, 'flowBaseAnnual')
  assertRange(config.ubiAnnualPerAdult, 0, 20000, 'ubiAnnualPerAdult')
  assertRange(config.adultPopulation, 1_000_000, 1_000_000_000, 'adultPopulation')
  assertRange(config.welfareSavingsCredit, 0, 5e12, 'welfareSavingsCredit')
  assertRange(config.govtOperatingRequirement, 0, 1e13, 'govtOperatingRequirement')
  assertRange(config.breakoutPoint, 30000, 100000, 'breakoutPoint')
  assertRange(config.tier1Rate, 0, 1, 'tier1Rate')
  assertRange(config.tier1Start, 0, 500000, 'tier1Start')
  assertRange(config.tier2Rate, 0, 1, 'tier2Rate')
  assertRange(config.tier2Start, 0, 2_000_000, 'tier2Start')
  assertRange(config.supplementApexIncome, 0, 500000, 'supplementApexIncome')
  assertRange(config.supplementApexBonus, 0, 50000, 'supplementApexBonus')
  assertRange(config.ubiDependent1 ?? 0, 0, 25000, 'ubiDependent1')
  assertRange(config.ubiDependent2 ?? 0, 0, 25000, 'ubiDependent2')
  assertRange(config.ubiDependent3 ?? 0, 0, 25000, 'ubiDependent3')
  assertRange(config.numHouseholds ?? 0, 1_000_000, 500_000_000, 'numHouseholds')
  assertRange(config.pctHouseholds1Dep ?? 0, 0, 1, 'pctHouseholds1Dep')
  assertRange(config.pctHouseholds2Dep ?? 0, 0, 1, 'pctHouseholds2Dep')
  assertRange(config.pctHouseholds3Dep ?? 0, 0, 1, 'pctHouseholds3Dep')
  assertRange(config.frictionTaxRate ?? 0, 0.001, 0.01, 'frictionTaxRate')
  assertRange(config.baseTransactionVolume ?? 0, 0.5e15, 2e15, 'baseTransactionVolume')
  assertRange(config.transactionVolumeGrowthRate ?? 0, 0, 0.15, 'transactionVolumeGrowthRate')
  assertRange(config.capitalFlightRate ?? 0, 0, 0.05, 'capitalFlightRate')
  assertRange(config.incomeTaxMultiplier ?? 0, 0, 1, 'incomeTaxMultiplier')
  assertRange(config.retirementEligibilityAge ?? 0, 55, 80, 'retirementEligibilityAge')
  assertRange(config.replacementRate ?? 0, 0, 1, 'replacementRate')
  assertRange(config.benefitAdjustmentFactor ?? 0, 0, 1, 'benefitAdjustmentFactor')
  assertRange(config.pensionableSalaryCap ?? 0, 0, 5_000_000, 'pensionableSalaryCap')
  assertRange(config.payoutDurationYears ?? 0, 1, 50, 'payoutDurationYears')
  assertRange(config.retireesCount ?? 0, 0, 150_000_000, 'retireesCount')
  assertRange(config.avgFinal3yrSalary ?? 0, 0, 1_000_000, 'avgFinal3yrSalary')
  assertRange(config.ssBaseline ?? 0, 0, 5e12, 'ssBaseline')
  assertRange(config.medicareAnnualSpend ?? 0, 0, 5e12, 'medicareAnnualSpend')
  assertRange(config.medicaidAnnualSpend ?? 0, 0, 5e12, 'medicaidAnnualSpend')
  assertRange(
    config.federalHealthcareSpendTotal ?? 0,
    0,
    1e13,
    'federalHealthcareSpendTotal'
  )
  assertRange(
    config.nationalHealthcareSpendTotal ?? 0,
    0,
    2e13,
    'nationalHealthcareSpendTotal'
  )
  assertRange(config.healthcareEmployerSharePct ?? 0, 0, 100, 'healthcareEmployerSharePct')
  assertRange(config.healthcareHouseholdSharePct ?? 0, 0, 100, 'healthcareHouseholdSharePct')
  assertRange(config.aiDiagnosticsSavingsPct ?? 0, 0, 100, 'aiDiagnosticsSavingsPct')
  assertRange(config.adminAutomationSavingsPct ?? 0, 0, 100, 'adminAutomationSavingsPct')
  assertRange(
    config.allPayerTransparencySavingsPct ?? 0,
    0,
    100,
    'allPayerTransparencySavingsPct'
  )

  return config
}
