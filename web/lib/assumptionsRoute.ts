import { DEFAULT_POLICY_CONFIG } from './defaultPolicyConfig'
import type { PolicyConfig } from './types'

type SearchParamValue = string | string[] | undefined

export type AssumptionsSearchParams = Record<string, SearchParamValue>

const numericFields = [
  'tokenTaxRate',
  'flowBaseAnnual',
  'ubiAnnualPerAdult',
  'adultPopulation',
  'welfareSavingsCredit',
  'govtOperatingRequirement',
  'breakoutPoint',
  'tier1Rate',
  'tier1Start',
  'tier2Rate',
  'tier2Start',
  'supplementApexIncome',
  'supplementApexBonus',
  'ubiDependent1',
  'ubiDependent2',
  'ubiDependent3',
  'pctHouseholds1Dep',
  'pctHouseholds2Dep',
  'pctHouseholds3Dep',
  'frictionTaxRate',
  'baseTransactionVolume',
  'transactionVolumeGrowthRate',
  'capitalFlightRate',
  'incomeTaxMultiplier',
  'retirementEligibilityAge',
  'replacementRate',
  'benefitAdjustmentFactor',
  'pensionableSalaryCap',
  'payoutDurationYears',
  'retireesCount',
  'avgFinal3yrSalary',
  'ssBaseline',
  'medicareAnnualSpend',
  'medicaidAnnualSpend',
  'federalHealthcareSpendTotal',
  'aiDiagnosticsSavingsPct',
  'adminAutomationSavingsPct',
  'allPayerTransparencySavingsPct',
] as const satisfies readonly (keyof PolicyConfig)[]

const booleanFields = [
  'marketMakerExempt',
  'retirementEnabled',
  'healthcareEnabled',
] as const satisfies readonly (keyof PolicyConfig)[]

const stringFields = [
  'revenueArchitectureMode',
  'retirementMode',
  'salaryBasis',
  'healthcareMode',
] as const satisfies readonly (keyof PolicyConfig)[]

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function buildAssumptionsHref(config: PolicyConfig): string {
  const params = new URLSearchParams()

  for (const field of numericFields) {
    const value = config[field]
    if (typeof value === 'number' && Number.isFinite(value)) {
      params.set(field, String(value))
    }
  }

  for (const field of booleanFields) {
    const value = config[field]
    if (typeof value === 'boolean') {
      params.set(field, value ? 'true' : 'false')
    }
  }

  for (const field of stringFields) {
    const value = config[field]
    if (typeof value === 'string' && value.length > 0) {
      params.set(field, value)
    }
  }

  const query = params.toString()
  return query ? `/assumptions?${query}` : '/assumptions'
}

export function parseAssumptionsSearchParams(searchParams: AssumptionsSearchParams): PolicyConfig {
  const next: PolicyConfig = { ...DEFAULT_POLICY_CONFIG }

  for (const field of numericFields) {
    const raw = firstValue(searchParams[field])
    if (!raw) continue

    const parsed = Number(raw)
    if (Number.isFinite(parsed)) {
      ;(next as unknown as Record<string, unknown>)[field] = parsed
    }
  }

  for (const field of booleanFields) {
    const raw = firstValue(searchParams[field])
    if (raw === 'true' || raw === 'false') {
      ;(next as unknown as Record<string, unknown>)[field] = raw === 'true'
    }
  }

  for (const field of stringFields) {
    const raw = firstValue(searchParams[field])
    if (raw) {
      ;(next as unknown as Record<string, unknown>)[field] = raw
    }
  }

  return next
}

export function hasAssumptionsSearchParams(searchParams: AssumptionsSearchParams): boolean {
  return Object.keys(searchParams).length > 0
}
