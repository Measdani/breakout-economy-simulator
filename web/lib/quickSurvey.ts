import type { PolicyConfig } from './types'

export const QUICK_SURVEY_NAME = 'NAiERM Economic Participation Survey'

export type FinancialSecurity =
  | 'very_secure'
  | 'somewhat_secure'
  | 'neutral'
  | 'somewhat_insecure'
  | 'very_insecure'

export type InsecurityReason =
  | 'not_enough_income'
  | 'job_loss_risk'
  | 'tech_change_fear'
  | 'uncertain_about_ai'

export type AdditionalIncomeImpact =
  | 'pursue_more_work'
  | 'start_expand_business'
  | 'education_training'
  | 'no_change'
  | 'unsure'

export type BenefitsCliffExperience =
  | 'yes'
  | 'no'
  | 'not_applicable'
  | 'prefer_not_to_say'

export type WelfareEliminationConcern =
  | 'yes_income_not_high_enough'
  | 'yes_health_insurance_unaffordable'
  | 'no_need_change_broken_system'
  | 'no_baseline_is_flexible'
  | 'no_opinion'

export type BaselineSupportLevel =
  | 'none'
  | '500'
  | '1000'
  | '1500'
  | '2000'
  | '3000'

export type DependentSupportPolicy =
  | 'none'
  | 'first_two_only'
  | 'tiered_up_to_three'
  | 'all_dependents'
  | 'unsure'

export type RetirementSystemPreference =
  | 'traditional_social_security'
  | 'gov_supported_individual_accounts'
  | 'hybrid'
  | 'personal_accounts_replace_ss'
  | 'unsure'

export type HealthcareSystemPreference =
  | 'improve_current'
  | 'baseline_with_private'
  | 'catastrophic_coverage'
  | 'national_healthcare'
  | 'unsure'

export type AgeRange =
  | '18_24'
  | '25_34'
  | '35_44'
  | '45_54'
  | '55_64'
  | '65_plus'

export type EmploymentSituation =
  | 'full_time'
  | 'part_time'
  | 'self_employed'
  | 'student'
  | 'between_jobs'
  | 'unable_to_work'
  | 'retired'

export type DependentsCount =
  | 'none'
  | '1'
  | '2'
  | '3'
  | '4_plus'
  | 'prefer_not_to_say'

export type EducationLevel =
  | 'no_high_school'
  | 'high_school'
  | 'trade_certification'
  | 'college_degree'
  | 'advanced_degree'

export type EducationAlignment =
  | 'yes'
  | 'underemployed_same_field'
  | 'not_in_my_field'

export interface QuickSurveyAnswers {
  financialSecurity: FinancialSecurity
  insecurityReason: InsecurityReason | null
  additionalIncomeImpact: AdditionalIncomeImpact
  benefitsCliffExperience: BenefitsCliffExperience
  welfareEliminationConcern: WelfareEliminationConcern
  baselineSupportLevel: BaselineSupportLevel
  dependentSupportPolicy: DependentSupportPolicy
  retirementSystemPreference: RetirementSystemPreference
  healthcareSystemPreference: HealthcareSystemPreference
  ageRange: AgeRange
  employmentSituation: EmploymentSituation
  dependentsCount: DependentsCount
  educationLevel: EducationLevel
  educationAlignment: EducationAlignment
  alias: string | null
  email: string | null
  country: string | null
}

export interface QuickSurveyPolicyModel {
  belMonthly: number
  dependentPolicyLabel: string
  retirementLabel: string
  healthcareLabel: string
}

export interface QuickSurveyDerivedModel {
  config: PolicyConfig
  policyModel: QuickSurveyPolicyModel
  configName: string
}

const BASE_CONFIG: PolicyConfig = {
  tokenTaxRate: 0.0035,
  flowBaseAnnual: 1e15,
  ubiAnnualPerAdult: 12000,
  adultPopulation: 265000000,
  welfareSavingsCredit: 630e9,
  govtOperatingRequirement: 2.74e12,
  breakoutPoint: 60000,
  tier1Rate: 0.19,
  tier1Start: 60000,
  tier2Rate: 0.29,
  tier2Start: 135000,
  supplementApexIncome: 24000,
  supplementApexBonus: 6000,
  personaWeights: [0.25, 0.25, 0.25, 0.25],
  ubiDependent1: 6000,
  ubiDependent2: 4000,
  ubiDependent3: 2000,
  numHouseholds: 130000000,
  pctHouseholds1Dep: 0.25,
  pctHouseholds2Dep: 0.15,
  pctHouseholds3Dep: 0.10,
  frictionTaxRate: 0.0035,
  baseTransactionVolume: 1e15,
  transactionVolumeGrowthRate: 0.05,
  capitalFlightRate: 0,
  marketMakerExempt: false,
  revenueArchitectureMode: 'hybrid',
  incomeTaxMultiplier: 1,
  retirementEnabled: false,
  retirementMode: 'replace_ss',
  retirementEligibilityAge: 67,
  replacementRate: 0.8,
  benefitAdjustmentFactor: 0.7,
  pensionableSalaryCap: 250000,
  payoutDurationYears: 25,
  salaryBasis: 'final_3yr',
  retireesCount: 54000000,
  avgFinal3yrSalary: 75000,
  ssBaseline: 1.3e12,
  healthcareEnabled: true,
  healthcareMode: 'baseline',
  medicareAnnualSpend: 1.05e12,
  medicaidAnnualSpend: 0.86e12,
  federalHealthcareSpendTotal: 1.91e12,
  aiDiagnosticsSavingsPct: 0,
  adminAutomationSavingsPct: 0,
  allPayerTransparencySavingsPct: 0,
}

const baselineSupportMonthlyMap: Record<BaselineSupportLevel, number> = {
  none: 0,
  '500': 500,
  '1000': 1000,
  '1500': 1500,
  '2000': 2000,
  '3000': 3000,
}

const dependentPolicyMap: Record<
  DependentSupportPolicy,
  { d1: number; d2: number; d3: number; label: string }
> = {
  none: { d1: 0, d2: 0, d3: 0, label: 'No dependent support' },
  first_two_only: { d1: 6000, d2: 4000, d3: 0, label: 'Support first two dependents' },
  tiered_up_to_three: { d1: 6000, d2: 4000, d3: 2000, label: 'Tiered support (up to three)' },
  all_dependents: { d1: 7000, d2: 5500, d3: 4000, label: 'Support all dependents' },
  unsure: { d1: 6000, d2: 4000, d3: 2000, label: 'Tiered support (default)' },
}

const retirementMap: Record<
  RetirementSystemPreference,
  {
    retirementEnabled: boolean
    retirementMode: 'replace_ss' | 'supplement' | 'baseline_only'
    replacementRate: number
    label: string
  }
> = {
  traditional_social_security: {
    retirementEnabled: false,
    retirementMode: 'baseline_only',
    replacementRate: 0.8,
    label: 'Traditional Social Security',
  },
  gov_supported_individual_accounts: {
    retirementEnabled: true,
    retirementMode: 'replace_ss',
    replacementRate: 0.65,
    label: 'Gov-supported individual accounts',
  },
  hybrid: {
    retirementEnabled: true,
    retirementMode: 'supplement',
    replacementRate: 0.8,
    label: 'Hybrid retirement system',
  },
  personal_accounts_replace_ss: {
    retirementEnabled: true,
    retirementMode: 'replace_ss',
    replacementRate: 0.55,
    label: 'Personal accounts replacing Social Security',
  },
  unsure: {
    retirementEnabled: false,
    retirementMode: 'baseline_only',
    replacementRate: 0.8,
    label: 'Traditional Social Security (default)',
  },
}

const healthcareMap: Record<
  HealthcareSystemPreference,
  {
    healthcareMode: 'baseline' | 'efficiency_reform' | 'structural_replacement'
    savings: { ai: number; admin: number; payer: number }
    label: string
  }
> = {
  improve_current: {
    healthcareMode: 'baseline',
    savings: { ai: 0, admin: 0, payer: 0 },
    label: 'Improve current system',
  },
  baseline_with_private: {
    healthcareMode: 'efficiency_reform',
    savings: { ai: 6, admin: 4, payer: 3 },
    label: 'Baseline + private options',
  },
  catastrophic_coverage: {
    healthcareMode: 'structural_replacement',
    savings: { ai: 0, admin: 0, payer: 0 },
    label: 'Catastrophic coverage model',
  },
  national_healthcare: {
    healthcareMode: 'structural_replacement',
    savings: { ai: 0, admin: 0, payer: 0 },
    label: 'National healthcare system',
  },
  unsure: {
    healthcareMode: 'baseline',
    savings: { ai: 0, admin: 0, payer: 0 },
    label: 'Improve current system (default)',
  },
}

const additionalIncomeImpactMap: Record<
  AdditionalIncomeImpact,
  { breakoutPoint: number; supplementApexBonus: number }
> = {
  pursue_more_work: { breakoutPoint: 70000, supplementApexBonus: 7000 },
  start_expand_business: { breakoutPoint: 80000, supplementApexBonus: 7500 },
  education_training: { breakoutPoint: 68000, supplementApexBonus: 6500 },
  no_change: { breakoutPoint: 55000, supplementApexBonus: 5000 },
  unsure: { breakoutPoint: 60000, supplementApexBonus: 6000 },
}

const financialSecurityWelfareCreditMap: Record<FinancialSecurity, number> = {
  very_secure: 700e9,
  somewhat_secure: 660e9,
  neutral: 630e9,
  somewhat_insecure: 570e9,
  very_insecure: 520e9,
}

const benefitsCliffIncomeTaxMultiplierMap: Record<BenefitsCliffExperience, number> = {
  yes: 0.9,
  no: 1,
  not_applicable: 1,
  prefer_not_to_say: 1,
}

const welfareTransitionMap: Record<
  WelfareEliminationConcern,
  { revenueArchitectureMode: 'hybrid' | 'friction_dominant' | 'friction_only'; tokenTaxRate: number }
> = {
  yes_income_not_high_enough: { revenueArchitectureMode: 'hybrid', tokenTaxRate: 0.0035 },
  yes_health_insurance_unaffordable: { revenueArchitectureMode: 'hybrid', tokenTaxRate: 0.0035 },
  no_need_change_broken_system: { revenueArchitectureMode: 'friction_dominant', tokenTaxRate: 0.004 },
  no_baseline_is_flexible: { revenueArchitectureMode: 'friction_dominant', tokenTaxRate: 0.004 },
  no_opinion: { revenueArchitectureMode: 'hybrid', tokenTaxRate: 0.0035 },
}

export function formatBelMonthlyLabel(value: number): string {
  return `$${value.toLocaleString('en-US')}`
}

export function buildSurveyPolicyModel(answers: QuickSurveyAnswers): QuickSurveyPolicyModel {
  const belMonthly = baselineSupportMonthlyMap[answers.baselineSupportLevel]
  const dependent = dependentPolicyMap[answers.dependentSupportPolicy]
  const retirement = retirementMap[answers.retirementSystemPreference]
  const healthcare = healthcareMap[answers.healthcareSystemPreference]

  return {
    belMonthly,
    dependentPolicyLabel: dependent.label,
    retirementLabel: retirement.label,
    healthcareLabel: healthcare.label,
  }
}

export function buildSurveyPolicyConfig(answers: QuickSurveyAnswers): QuickSurveyDerivedModel {
  const belMonthly = baselineSupportMonthlyMap[answers.baselineSupportLevel]
  const belAnnual = belMonthly * 12
  const dependent = dependentPolicyMap[answers.dependentSupportPolicy]
  const retirement = retirementMap[answers.retirementSystemPreference]
  const healthcare = healthcareMap[answers.healthcareSystemPreference]
  const impact = additionalIncomeImpactMap[answers.additionalIncomeImpact]
  const welfareTransition = welfareTransitionMap[answers.welfareEliminationConcern]

  const config: PolicyConfig = {
    ...BASE_CONFIG,
    ubiAnnualPerAdult: belAnnual,
    ubiDependent1: dependent.d1,
    ubiDependent2: dependent.d2,
    ubiDependent3: dependent.d3,
    breakoutPoint: impact.breakoutPoint,
    supplementApexBonus: belAnnual === 0 ? 3000 : impact.supplementApexBonus,
    welfareSavingsCredit: financialSecurityWelfareCreditMap[answers.financialSecurity],
    incomeTaxMultiplier: benefitsCliffIncomeTaxMultiplierMap[answers.benefitsCliffExperience],
    revenueArchitectureMode: welfareTransition.revenueArchitectureMode,
    tokenTaxRate: welfareTransition.tokenTaxRate,
    frictionTaxRate: welfareTransition.tokenTaxRate,
    retirementEnabled: retirement.retirementEnabled,
    retirementMode: retirement.retirementMode,
    replacementRate: retirement.replacementRate,
    healthcareMode: healthcare.healthcareMode,
    aiDiagnosticsSavingsPct: healthcare.savings.ai,
    adminAutomationSavingsPct: healthcare.savings.admin,
    allPayerTransparencySavingsPct: healthcare.savings.payer,
  }

  const policyModel: QuickSurveyPolicyModel = {
    belMonthly,
    dependentPolicyLabel: dependent.label,
    retirementLabel: retirement.label,
    healthcareLabel: healthcare.label,
  }

  const configName = [
    `Survey BEL ${formatBelMonthlyLabel(policyModel.belMonthly)}`,
    `Dependents: ${policyModel.dependentPolicyLabel}`,
    `Retirement: ${policyModel.retirementLabel}`,
    `Healthcare: ${policyModel.healthcareLabel}`,
  ].join(' | ')

  return {
    config,
    policyModel,
    configName,
  }
}

export function toSurveyResponseRecord(answers: QuickSurveyAnswers): Record<string, string | null> {
  return {
    financialSecurity: answers.financialSecurity,
    insecurityReason: answers.insecurityReason,
    additionalIncomeImpact: answers.additionalIncomeImpact,
    benefitsCliffExperience: answers.benefitsCliffExperience,
    welfareEliminationConcern: answers.welfareEliminationConcern,
    baselineSupportLevel: answers.baselineSupportLevel,
    dependentSupportPolicy: answers.dependentSupportPolicy,
    retirementSystemPreference: answers.retirementSystemPreference,
    healthcareSystemPreference: answers.healthcareSystemPreference,
    ageRange: answers.ageRange,
    employmentSituation: answers.employmentSituation,
    dependentsCount: answers.dependentsCount,
    educationLevel: answers.educationLevel,
    educationAlignment: answers.educationAlignment,
    alias: answers.alias,
    country: answers.country,
  }
}
