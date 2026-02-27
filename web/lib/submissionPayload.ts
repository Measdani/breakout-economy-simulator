import type { PolicyConfig, SimulationResult } from './types'

export interface SubmissionDemographics {
  ageRange?: string
  incomeLevel?: string
  region?: string
  affiliation?: string
}

export interface SubmissionPayload {
  model_metadata: {
    submission_id: string
    timestamp: string
    model_version: string
    terminology_version: string
    advanced_mode_enabled: boolean
  }
  scenario_inputs: {
    revenue: {
      revenue_mode: 'hybrid' | 'friction_dominant' | 'friction_only'
      friction_tax_rate: number
      income_tax_multiplier: number
      token_tax_rate: number
      base_transaction_volume: number
      transaction_volume_growth_rate: number
      capital_flight_rate: number
      market_maker_exempt: boolean
    }
    demographics: {
      adult_population: number
      num_households: number
      pct_households_1_dep: number
      pct_households_2_dep: number
      pct_households_3_dep: number
      bel_dependent_tier_1: number
      bel_dependent_tier_2: number
      bel_dependent_tier_3: number
      user_age_range: string | null
      user_income_level: string | null
      user_region: string | null
      user_affiliation: string | null
    }
    retirement: {
      retirement_enabled: boolean
      retirement_mode: 'replace_ss' | 'supplement' | 'baseline_only'
      retirement_age: number
      replacement_rate: number
      salary_cap: number
      payout_years: number
      actuarial_adjustment: number
    }
    baseline_assumptions: {
      baseline_ss_cost: number
      baseline_retirees: number
      baseline_avg_retiree_salary: number
      baseline_medicare_annual_spend: number
      baseline_medicaid_annual_spend: number
      baseline_federal_healthcare_spend_total: number
      baseline_national_healthcare_spend_total: number
      baseline_healthcare_employer_share_pct: number
      baseline_healthcare_household_share_pct: number
      baseline_ai_diagnostics_savings_pct: number
      baseline_admin_automation_savings_pct: number
      baseline_all_payer_transparency_savings_pct: number
    }
  }
  computed_outputs: {
    total_revenue: number
    total_obligations: number
    surplus_deficit: number
    inflation_warning_rate: number | null
    bel_total_cost: number
    retirement_annual_cost: number
    retirement_25yr_total: number
    pct_bel_of_obligations: number
    pct_retirement_of_obligations: number
    percent_bel_of_obligations: number
    percent_retirement_of_obligations: number
  }
  user_feedback: {
    user_feedback_text: string | null
    why_choice_text: string | null
  }
}

interface BuildSubmissionPayloadParams {
  config: PolicyConfig
  result: SimulationResult
  userFeedbackText?: string | null
  whyChoiceText?: string | null
  demographics?: SubmissionDemographics | null
  metadataOverrides?: {
    submissionId?: string
    timestamp?: string
    advancedModeEnabled?: boolean
  }
}

function fallbackId(): string {
  return `sub_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function createSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return fallbackId()
}

export function buildSubmissionPayload({
  config,
  result,
  userFeedbackText = null,
  whyChoiceText = null,
  demographics = null,
  metadataOverrides,
}: BuildSubmissionPayloadParams): SubmissionPayload {
  const totalObligations = result.obligations.totalObligations || 0
  const belTotalCost = result.obligations.ubiCost || 0
  const retirementAnnualCost = result.obligations.retirementProgramCost ?? 0
  const retirement25yrTotal = result.obligations.retirement25yrTotal ?? 0
  const baselineMedicare = config.medicareAnnualSpend ?? 0
  const baselineMedicaid = config.medicaidAnnualSpend ?? 0
  const baselineFederalHealthcareTotal = config.federalHealthcareSpendTotal ?? (baselineMedicare + baselineMedicaid)
  const advancedModeEnabled = metadataOverrides?.advancedModeEnabled ?? (
    (config.revenueArchitectureMode ?? 'hybrid') !== 'hybrid' ||
    (config.incomeTaxMultiplier ?? 1) !== 1 ||
    (config.marketMakerExempt ?? false)
  )

  return {
    model_metadata: {
      submission_id: metadataOverrides?.submissionId ?? createSubmissionId(),
      timestamp: metadataOverrides?.timestamp ?? new Date().toISOString(),
      model_version: 'NAERM v1.1',
      terminology_version: 'bel-sbi-v1',
      advanced_mode_enabled: advancedModeEnabled,
    },
    scenario_inputs: {
      revenue: {
        revenue_mode: config.revenueArchitectureMode ?? 'hybrid',
        friction_tax_rate: config.frictionTaxRate ?? 0.0035,
        income_tax_multiplier: config.incomeTaxMultiplier ?? 1,
        token_tax_rate: config.tokenTaxRate,
        base_transaction_volume: config.baseTransactionVolume ?? 1e15,
        transaction_volume_growth_rate: config.transactionVolumeGrowthRate ?? 0.05,
        capital_flight_rate: config.capitalFlightRate ?? 0,
        market_maker_exempt: config.marketMakerExempt ?? false,
      },
      demographics: {
        adult_population: config.adultPopulation,
        num_households: config.numHouseholds ?? 130000000,
        pct_households_1_dep: config.pctHouseholds1Dep ?? 0.25,
        pct_households_2_dep: config.pctHouseholds2Dep ?? 0.15,
        pct_households_3_dep: config.pctHouseholds3Dep ?? 0.10,
        bel_dependent_tier_1: config.ubiDependent1 ?? 6000,
        bel_dependent_tier_2: config.ubiDependent2 ?? 4000,
        bel_dependent_tier_3: config.ubiDependent3 ?? 2000,
        user_age_range: demographics?.ageRange || null,
        user_income_level: demographics?.incomeLevel || null,
        user_region: demographics?.region || null,
        user_affiliation: demographics?.affiliation || null,
      },
      retirement: {
        retirement_enabled: config.retirementEnabled ?? false,
        retirement_mode: config.retirementMode ?? 'replace_ss',
        retirement_age: config.retirementEligibilityAge ?? 67,
        // Store these as percentages to match what users selected in UI.
        replacement_rate: (config.replacementRate ?? 0.8) * 100,
        salary_cap: config.pensionableSalaryCap ?? 250000,
        payout_years: config.payoutDurationYears ?? 25,
        actuarial_adjustment: (config.benefitAdjustmentFactor ?? 0.7) * 100,
      },
      baseline_assumptions: {
        baseline_ss_cost: config.ssBaseline ?? 1.3e12,
        baseline_retirees: config.retireesCount ?? 54000000,
        baseline_avg_retiree_salary: config.avgFinal3yrSalary ?? 75000,
        baseline_medicare_annual_spend: baselineMedicare,
        baseline_medicaid_annual_spend: baselineMedicaid,
        baseline_federal_healthcare_spend_total: baselineFederalHealthcareTotal,
        baseline_national_healthcare_spend_total: config.nationalHealthcareSpendTotal ?? 0,
        baseline_healthcare_employer_share_pct: config.healthcareEmployerSharePct ?? 0,
        baseline_healthcare_household_share_pct: config.healthcareHouseholdSharePct ?? 0,
        baseline_ai_diagnostics_savings_pct: config.aiDiagnosticsSavingsPct ?? 0,
        baseline_admin_automation_savings_pct: config.adminAutomationSavingsPct ?? 0,
        baseline_all_payer_transparency_savings_pct: config.allPayerTransparencySavingsPct ?? 0,
      },
    },
    computed_outputs: {
      total_revenue: result.revenue.totalRevenue,
      total_obligations: totalObligations,
      surplus_deficit: result.balance.surplusDeficit,
      inflation_warning_rate: null,
      bel_total_cost: belTotalCost,
      retirement_annual_cost: retirementAnnualCost,
      retirement_25yr_total: retirement25yrTotal,
      pct_bel_of_obligations: totalObligations > 0 ? (belTotalCost / totalObligations) * 100 : 0,
      pct_retirement_of_obligations: totalObligations > 0 ? (retirementAnnualCost / totalObligations) * 100 : 0,
      percent_bel_of_obligations: totalObligations > 0 ? (belTotalCost / totalObligations) * 100 : 0,
      percent_retirement_of_obligations: totalObligations > 0 ? (retirementAnnualCost / totalObligations) * 100 : 0,
    },
    user_feedback: {
      user_feedback_text: userFeedbackText,
      why_choice_text: whyChoiceText,
    },
  }
}

type FlatValue = string | number | boolean | null

function flattenObject(value: unknown, prefix: string, out: Record<string, FlatValue>) {
  if (value === null) {
    out[prefix] = null
    return
  }

  if (Array.isArray(value)) {
    out[prefix] = JSON.stringify(value)
    return
  }

  if (typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      const nestedPrefix = prefix ? `${prefix}_${key}` : key
      flattenObject(nestedValue, nestedPrefix, out)
    }
    return
  }

  out[prefix] = value as FlatValue
}

export function flattenSubmissionPayload(payload: SubmissionPayload): Record<string, FlatValue> {
  const flattened: Record<string, FlatValue> = {}
  flattenObject(payload, '', flattened)
  return flattened
}
