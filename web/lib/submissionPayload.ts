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
    modelVersion: string
    terminologyVersion: string
    revenueArchitectureMode: 'hybrid' | 'friction_dominant' | 'friction_only'
    retirementMode: 'replace_ss' | 'supplement' | 'baseline_only'
    healthcareMode: 'baseline' | 'efficiency_reform' | 'structural_replacement'
  }
  scenario_inputs: {
    selected_policy_variables: {
      token_tax_rate: number
      flow_base_annual: number
      ubi_annual_per_adult: number
      adult_population: number
      welfare_savings_credit: number
      govt_operating_requirement: number
      breakout_point: number
      tier1_rate: number
      tier1_start: number
      tier2_rate: number
      tier2_start: number
      supplement_apex_income: number
      supplement_apex_bonus: number
      persona_weights: number[]
      ubi_dependent_1: number
      ubi_dependent_2: number
      ubi_dependent_3: number
      num_households: number
      pct_households_1_dep: number
      pct_households_2_dep: number
      pct_households_3_dep: number
      friction_tax_rate: number
      base_transaction_volume: number
      transaction_volume_growth_rate: number
      capital_flight_rate: number
      market_maker_exempt: boolean
      revenue_architecture_mode: 'hybrid' | 'friction_dominant' | 'friction_only'
      income_tax_multiplier: number
      retirement_enabled: boolean
      retirement_mode: 'replace_ss' | 'supplement' | 'baseline_only'
      retirement_eligibility_age: number
      replacement_rate_pct: number
      benefit_adjustment_factor_pct: number
      pensionable_salary_cap: number
      payout_duration_years: number
      salary_basis: 'final_3yr' | 'final_5yr' | 'career_avg'
      retirees_count: number
      avg_final_3yr_salary: number
      ss_baseline: number
      healthcare_enabled: boolean
      healthcare_mode: 'baseline' | 'efficiency_reform' | 'structural_replacement'
      medicare_annual_spend: number
      medicaid_annual_spend: number
      federal_healthcare_spend_total: number
      national_healthcare_spend_total: number
      healthcare_employer_share_pct: number
      healthcare_household_share_pct: number
      ai_diagnostics_savings_pct: number
      admin_automation_savings_pct: number
      all_payer_transparency_savings_pct: number
    }
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
    allocation_priority_rule: 'bel_first'
    total_revenue: number
    total_obligations: number
    surplus_deficit: number
    inflation_warning_rate: number | null
    bel_total_cost: number
    retirement_annual_cost: number
    retirement_25yr_total: number
    healthcare_annual_cost: number
    healthcare_baseline_federal_cost: number
    healthcare_net_federal_savings: number
    remaining_fiscal_space_after_bel: number
    fiscal_space_after_programs: number
    retirement_allocated_revenue: number
    retirement_funding_ratio: number | null
    bel_share_of_revenue: number
    retirement_share_of_revenue: number
    healthcare_share_of_revenue: number
    pct_bel_of_obligations: number
    pct_retirement_of_obligations: number
    pct_healthcare_of_obligations: number
    percent_bel_of_obligations: number
    percent_retirement_of_obligations: number
    percent_healthcare_of_obligations: number
  }
  user_feedback: {
    user_feedback_text: string | null
    why_choice_text: string | null
  }
  survey_response?: {
    survey_name: string
    survey_version: string
    responses: Record<string, string | null>
    policy_model: {
      bel_monthly: number
      dependent_policy: string
      retirement: string
      healthcare: string
    }
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
  const healthcareAnnualCost = result.obligations.healthcareProgramCost ?? 0
  const healthcareBaselineCost = result.obligations.healthcareBaselineFederalCost ?? 0
  const healthcareNetFederalSavings = result.obligations.healthcareNetFederalSavings ?? 0
  const remainingFiscalSpaceAfterBEL = result.obligations.remainingFiscalSpaceAfterBEL
    ?? (result.revenue.totalRevenue - belTotalCost)
  const fiscalSpaceAfterPrograms = result.obligations.fiscalSpaceAfterPrograms
    ?? (remainingFiscalSpaceAfterBEL - retirementAnnualCost - healthcareAnnualCost)
  const retirementAllocatedRevenue = result.obligations.retirementAllocatedRevenue
    ?? (retirementAnnualCost > 0
      ? Math.max(0, Math.min(Math.max(remainingFiscalSpaceAfterBEL, 0), retirementAnnualCost))
      : 0)
  const retirementFundingRatio = result.obligations.retirementFundingRatio
    ?? (retirementAnnualCost > 0 ? retirementAllocatedRevenue / retirementAnnualCost : null)
  const belShareOfRevenue = result.obligations.belShareOfRevenue
    ?? (result.revenue.totalRevenue > 0 ? (belTotalCost / result.revenue.totalRevenue) * 100 : 0)
  const retirementShareOfRevenue = result.obligations.retirementShareOfRevenue
    ?? (result.revenue.totalRevenue > 0 ? (retirementAnnualCost / result.revenue.totalRevenue) * 100 : 0)
  const healthcareShareOfRevenue = result.obligations.healthcareShareOfRevenue
    ?? (result.revenue.totalRevenue > 0 ? (healthcareAnnualCost / result.revenue.totalRevenue) * 100 : 0)
  const baselineMedicare = config.medicareAnnualSpend ?? 0
  const baselineMedicaid = config.medicaidAnnualSpend ?? 0
  const baselineFederalHealthcareTotal = config.federalHealthcareSpendTotal ?? (baselineMedicare + baselineMedicaid)
  const flowBaseAnnual = config.flowBaseAnnual
  const ubiAnnualPerAdult = config.ubiAnnualPerAdult
  const welfareSavingsCredit = config.welfareSavingsCredit
  const govtOperatingRequirement = config.govtOperatingRequirement
  const breakoutPoint = config.breakoutPoint
  const tier1Rate = config.tier1Rate
  const tier1Start = config.tier1Start
  const tier2Rate = config.tier2Rate
  const tier2Start = config.tier2Start
  const supplementApexIncome = config.supplementApexIncome
  const supplementApexBonus = config.supplementApexBonus
  const personaWeights = config.personaWeights ?? [0.25, 0.25, 0.25, 0.25]
  const ubiDependent1 = config.ubiDependent1 ?? 6000
  const ubiDependent2 = config.ubiDependent2 ?? 4000
  const ubiDependent3 = config.ubiDependent3 ?? 2000
  const numHouseholds = config.numHouseholds ?? 130000000
  const pctHouseholds1Dep = config.pctHouseholds1Dep ?? 0.25
  const pctHouseholds2Dep = config.pctHouseholds2Dep ?? 0.15
  const pctHouseholds3Dep = config.pctHouseholds3Dep ?? 0.10
  const frictionTaxRate = config.frictionTaxRate ?? 0.0035
  const baseTransactionVolume = config.baseTransactionVolume ?? 1e15
  const transactionVolumeGrowthRate = config.transactionVolumeGrowthRate ?? 0.05
  const capitalFlightRate = config.capitalFlightRate ?? 0
  const marketMakerExempt = config.marketMakerExempt ?? false
  const revenueArchitectureMode = config.revenueArchitectureMode ?? 'hybrid'
  const retirementMode = config.retirementMode ?? 'replace_ss'
  const healthcareMode = config.healthcareMode ?? 'baseline'
  const incomeTaxMultiplier = config.incomeTaxMultiplier ?? 1
  const retirementEnabled = config.retirementEnabled ?? false
  const retirementEligibilityAge = config.retirementEligibilityAge ?? 67
  const replacementRatePct = (config.replacementRate ?? 0.8) * 100
  const benefitAdjustmentFactorPct = (config.benefitAdjustmentFactor ?? 0.7) * 100
  const pensionableSalaryCap = config.pensionableSalaryCap ?? 250000
  const payoutDurationYears = config.payoutDurationYears ?? 25
  const salaryBasis = config.salaryBasis ?? 'final_3yr'
  const retireesCount = config.retireesCount ?? 54000000
  const avgFinal3yrSalary = config.avgFinal3yrSalary ?? 75000
  const ssBaseline = config.ssBaseline ?? 1.3e12
  const healthcareEnabled = config.healthcareEnabled ?? true
  const nationalHealthcareSpendTotal = config.nationalHealthcareSpendTotal ?? 0
  const healthcareEmployerSharePct = config.healthcareEmployerSharePct ?? 0
  const healthcareHouseholdSharePct = config.healthcareHouseholdSharePct ?? 0
  const aiDiagnosticsSavingsPct = config.aiDiagnosticsSavingsPct ?? 0
  const adminAutomationSavingsPct = config.adminAutomationSavingsPct ?? 0
  const allPayerTransparencySavingsPct = config.allPayerTransparencySavingsPct ?? 0
  const advancedModeEnabled = metadataOverrides?.advancedModeEnabled ?? (
    revenueArchitectureMode !== 'hybrid' ||
    incomeTaxMultiplier !== 1 ||
    marketMakerExempt
  )

  return {
    model_metadata: {
      submission_id: metadataOverrides?.submissionId ?? createSubmissionId(),
      timestamp: metadataOverrides?.timestamp ?? new Date().toISOString(),
      model_version: 'NAIERM v2.1',
      terminology_version: 'bel-sbi-v1',
      advanced_mode_enabled: advancedModeEnabled,
      modelVersion: 'NAIERM v2.1',
      terminologyVersion: 'bel-sbi-v1',
      revenueArchitectureMode,
      retirementMode,
      healthcareMode,
    },
    scenario_inputs: {
      selected_policy_variables: {
        token_tax_rate: config.tokenTaxRate,
        flow_base_annual: flowBaseAnnual,
        ubi_annual_per_adult: ubiAnnualPerAdult,
        adult_population: config.adultPopulation,
        welfare_savings_credit: welfareSavingsCredit,
        govt_operating_requirement: govtOperatingRequirement,
        breakout_point: breakoutPoint,
        tier1_rate: tier1Rate,
        tier1_start: tier1Start,
        tier2_rate: tier2Rate,
        tier2_start: tier2Start,
        supplement_apex_income: supplementApexIncome,
        supplement_apex_bonus: supplementApexBonus,
        persona_weights: personaWeights,
        ubi_dependent_1: ubiDependent1,
        ubi_dependent_2: ubiDependent2,
        ubi_dependent_3: ubiDependent3,
        num_households: numHouseholds,
        pct_households_1_dep: pctHouseholds1Dep,
        pct_households_2_dep: pctHouseholds2Dep,
        pct_households_3_dep: pctHouseholds3Dep,
        friction_tax_rate: frictionTaxRate,
        base_transaction_volume: baseTransactionVolume,
        transaction_volume_growth_rate: transactionVolumeGrowthRate,
        capital_flight_rate: capitalFlightRate,
        market_maker_exempt: marketMakerExempt,
        revenue_architecture_mode: revenueArchitectureMode,
        income_tax_multiplier: incomeTaxMultiplier,
        retirement_enabled: retirementEnabled,
        retirement_mode: retirementMode,
        retirement_eligibility_age: retirementEligibilityAge,
        replacement_rate_pct: replacementRatePct,
        benefit_adjustment_factor_pct: benefitAdjustmentFactorPct,
        pensionable_salary_cap: pensionableSalaryCap,
        payout_duration_years: payoutDurationYears,
        salary_basis: salaryBasis,
        retirees_count: retireesCount,
        avg_final_3yr_salary: avgFinal3yrSalary,
        ss_baseline: ssBaseline,
        healthcare_enabled: healthcareEnabled,
        healthcare_mode: healthcareMode,
        medicare_annual_spend: baselineMedicare,
        medicaid_annual_spend: baselineMedicaid,
        federal_healthcare_spend_total: baselineFederalHealthcareTotal,
        national_healthcare_spend_total: nationalHealthcareSpendTotal,
        healthcare_employer_share_pct: healthcareEmployerSharePct,
        healthcare_household_share_pct: healthcareHouseholdSharePct,
        ai_diagnostics_savings_pct: aiDiagnosticsSavingsPct,
        admin_automation_savings_pct: adminAutomationSavingsPct,
        all_payer_transparency_savings_pct: allPayerTransparencySavingsPct,
      },
      revenue: {
        revenue_mode: revenueArchitectureMode,
        friction_tax_rate: frictionTaxRate,
        income_tax_multiplier: incomeTaxMultiplier,
        token_tax_rate: config.tokenTaxRate,
        base_transaction_volume: baseTransactionVolume,
        transaction_volume_growth_rate: transactionVolumeGrowthRate,
        capital_flight_rate: capitalFlightRate,
        market_maker_exempt: marketMakerExempt,
      },
      demographics: {
        adult_population: config.adultPopulation,
        num_households: numHouseholds,
        pct_households_1_dep: pctHouseholds1Dep,
        pct_households_2_dep: pctHouseholds2Dep,
        pct_households_3_dep: pctHouseholds3Dep,
        bel_dependent_tier_1: ubiDependent1,
        bel_dependent_tier_2: ubiDependent2,
        bel_dependent_tier_3: ubiDependent3,
        user_age_range: demographics?.ageRange || null,
        user_income_level: demographics?.incomeLevel || null,
        user_region: demographics?.region || null,
        user_affiliation: demographics?.affiliation || null,
      },
      retirement: {
        retirement_enabled: retirementEnabled,
        retirement_mode: retirementMode,
        retirement_age: retirementEligibilityAge,
        // Store these as percentages to match what users selected in UI.
        replacement_rate: replacementRatePct,
        salary_cap: pensionableSalaryCap,
        payout_years: payoutDurationYears,
        actuarial_adjustment: benefitAdjustmentFactorPct,
      },
      baseline_assumptions: {
        baseline_ss_cost: ssBaseline,
        baseline_retirees: retireesCount,
        baseline_avg_retiree_salary: avgFinal3yrSalary,
        baseline_medicare_annual_spend: baselineMedicare,
        baseline_medicaid_annual_spend: baselineMedicaid,
        baseline_federal_healthcare_spend_total: baselineFederalHealthcareTotal,
        baseline_national_healthcare_spend_total: nationalHealthcareSpendTotal,
        baseline_healthcare_employer_share_pct: healthcareEmployerSharePct,
        baseline_healthcare_household_share_pct: healthcareHouseholdSharePct,
        baseline_ai_diagnostics_savings_pct: aiDiagnosticsSavingsPct,
        baseline_admin_automation_savings_pct: adminAutomationSavingsPct,
        baseline_all_payer_transparency_savings_pct: allPayerTransparencySavingsPct,
      },
    },
    computed_outputs: {
      allocation_priority_rule: 'bel_first',
      total_revenue: result.revenue.totalRevenue,
      total_obligations: totalObligations,
      surplus_deficit: result.balance.surplusDeficit,
      inflation_warning_rate: null,
      bel_total_cost: belTotalCost,
      retirement_annual_cost: retirementAnnualCost,
      retirement_25yr_total: retirement25yrTotal,
      healthcare_annual_cost: healthcareAnnualCost,
      healthcare_baseline_federal_cost: healthcareBaselineCost,
      healthcare_net_federal_savings: healthcareNetFederalSavings,
      remaining_fiscal_space_after_bel: remainingFiscalSpaceAfterBEL,
      fiscal_space_after_programs: fiscalSpaceAfterPrograms,
      retirement_allocated_revenue: retirementAllocatedRevenue,
      retirement_funding_ratio: retirementFundingRatio,
      bel_share_of_revenue: belShareOfRevenue,
      retirement_share_of_revenue: retirementShareOfRevenue,
      healthcare_share_of_revenue: healthcareShareOfRevenue,
      pct_bel_of_obligations: totalObligations > 0 ? (belTotalCost / totalObligations) * 100 : 0,
      pct_retirement_of_obligations: totalObligations > 0 ? (retirementAnnualCost / totalObligations) * 100 : 0,
      pct_healthcare_of_obligations: totalObligations > 0 ? (healthcareAnnualCost / totalObligations) * 100 : 0,
      percent_bel_of_obligations: totalObligations > 0 ? (belTotalCost / totalObligations) * 100 : 0,
      percent_retirement_of_obligations: totalObligations > 0 ? (retirementAnnualCost / totalObligations) * 100 : 0,
      percent_healthcare_of_obligations: totalObligations > 0 ? (healthcareAnnualCost / totalObligations) * 100 : 0,
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
