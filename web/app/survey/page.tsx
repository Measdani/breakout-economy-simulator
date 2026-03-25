'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'
import { submitQuickSurvey } from '@/app/actions/survey'
import { HONEYPOT_FIELD_LABEL, HONEYPOT_FIELD_NAME } from '@/lib/honeypot'
import {
  QUICK_SURVEY_NAME,
  buildSurveyPolicyModel,
  formatBelMonthlyLabel,
  type AdditionalIncomeImpact,
  type AgeRange,
  type BaselineSupportLevel,
  type BenefitsCliffExperience,
  type DependentsCount,
  type DependentSupportPolicy,
  type EducationAlignment,
  type EducationLevel,
  type EmploymentSituation,
  type FinancialSecurity,
  type HealthcareSystemPreference,
  type InsecurityReason,
  type QuickSurveyAnswers,
  type RetirementSystemPreference,
  type WelfareEliminationConcern,
} from '@/lib/quickSurvey'
import styles from './survey.module.css'

type SurveyFormState = {
  financialSecurity: '' | FinancialSecurity
  insecurityReason: '' | InsecurityReason
  additionalIncomeImpact: '' | AdditionalIncomeImpact
  benefitsCliffExperience: '' | BenefitsCliffExperience
  welfareEliminationConcern: '' | WelfareEliminationConcern
  baselineSupportLevel: '' | BaselineSupportLevel
  dependentSupportPolicy: '' | DependentSupportPolicy
  retirementSystemPreference: '' | RetirementSystemPreference
  healthcareSystemPreference: '' | HealthcareSystemPreference
  ageRange: '' | AgeRange
  employmentSituation: '' | EmploymentSituation
  dependentsCount: '' | DependentsCount
  educationLevel: '' | EducationLevel
  educationAlignment: '' | EducationAlignment
  alias: string
  email: string
  country: string
}

type Option<T extends string> = {
  value: T
  label: string
}

const financialSecurityOptions: Option<FinancialSecurity>[] = [
  { value: 'very_secure', label: 'Very Secure' },
  { value: 'somewhat_secure', label: 'Somewhat Secure' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'somewhat_insecure', label: 'Somewhat Insecure' },
  { value: 'very_insecure', label: 'Very Insecure' },
]

const insecurityReasonOptions: Option<InsecurityReason>[] = [
  { value: 'not_enough_income', label: 'Not enough income' },
  { value: 'job_loss_risk', label: 'Prospect that my job might go away' },
  { value: 'tech_change_fear', label: "Afraid I can't keep up with changes in technology" },
  { value: 'uncertain_about_ai', label: "I don't understand AI well enough, so I feel uncertain" },
]

const additionalIncomeOptions: Option<AdditionalIncomeImpact>[] = [
  { value: 'pursue_more_work', label: 'I would pursue more work opportunities' },
  { value: 'start_expand_business', label: 'I would start or expand a business' },
  { value: 'education_training', label: 'I would pursue education or job training' },
  { value: 'no_change', label: 'It would not change my behavior' },
  { value: 'unsure', label: 'Unsure' },
]

const benefitsCliffOptions: Option<BenefitsCliffExperience>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const welfareConcernOptions: Option<WelfareEliminationConcern>[] = [
  { value: 'yes_income_not_high_enough', label: "Yes, because I don't think the income would be high enough" },
  { value: 'yes_health_insurance_unaffordable', label: "Yes, because I don't think I could afford my own health insurance" },
  { value: 'no_need_change_broken_system', label: 'No, because we need to do something about the broken welfare system' },
  { value: 'no_baseline_is_flexible', label: 'No, because baseline money can be spent any way I want' },
  { value: 'no_opinion', label: "I don't have an opinion on this question" },
]

const baselineSupportOptions: Option<BaselineSupportLevel>[] = [
  { value: 'none', label: 'No guaranteed support' },
  { value: '500', label: '$500 per month' },
  { value: '1000', label: '$1,000 per month' },
  { value: '1500', label: '$1,500 per month' },
  { value: '2000', label: '$2,000 per month' },
  { value: '3000', label: '$3,000 per month' },
]

const dependentSupportOptions: Option<DependentSupportPolicy>[] = [
  { value: 'none', label: 'No additional support for dependents' },
  { value: 'first_two_only', label: 'Support only for the first two dependents' },
  { value: 'tiered_up_to_three', label: 'Tiered support for up to three dependents' },
  { value: 'all_dependents', label: 'Support for all dependents' },
  { value: 'unsure', label: 'Unsure' },
]

const retirementSystemOptions: Option<RetirementSystemPreference>[] = [
  { value: 'traditional_social_security', label: 'Traditional Social Security' },
  { value: 'gov_supported_individual_accounts', label: 'Government-supported individual retirement accounts' },
  { value: 'hybrid', label: 'Hybrid system (Social Security + personal accounts)' },
  { value: 'personal_accounts_replace_ss', label: 'Personal retirement accounts replacing Social Security' },
  { value: 'unsure', label: 'Unsure' },
]

const healthcareSystemOptions: Option<HealthcareSystemPreference>[] = [
  { value: 'improve_current', label: 'Improve the current system' },
  { value: 'baseline_with_private', label: 'Government baseline healthcare with private options' },
  { value: 'catastrophic_coverage', label: 'Catastrophic coverage model' },
  { value: 'national_healthcare', label: 'National healthcare system' },
  { value: 'unsure', label: 'Unsure' },
]

const ageOptions: Option<AgeRange>[] = [
  { value: '18_24', label: '18-24' },
  { value: '25_34', label: '25-34' },
  { value: '35_44', label: '35-44' },
  { value: '45_54', label: '45-54' },
  { value: '55_64', label: '55-64' },
  { value: '65_plus', label: '65+' },
]

const employmentOptions: Option<EmploymentSituation>[] = [
  { value: 'full_time', label: 'Full-time employed' },
  { value: 'part_time', label: 'Part-time employed' },
  { value: 'self_employed', label: 'Self-employed / business owner' },
  { value: 'student', label: 'Student' },
  { value: 'between_jobs', label: 'Between jobs' },
  { value: 'unable_to_work', label: 'Unable to work' },
  { value: 'retired', label: 'Retired' },
]

const dependentsOptions: Option<DependentsCount>[] = [
  { value: 'none', label: 'None' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4_plus', label: '4+' },
  { value: 'prefer_not_to_say', label: "Don't wish to say" },
]

const educationOptions: Option<EducationLevel>[] = [
  { value: 'no_high_school', label: 'No high school diploma' },
  { value: 'high_school', label: 'High school' },
  { value: 'trade_certification', label: 'Trade certification' },
  { value: 'college_degree', label: 'College degree' },
  { value: 'advanced_degree', label: 'Advanced degree' },
]

const educationAlignmentOptions: Option<EducationAlignment>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'underemployed_same_field', label: 'No, below my achievement level but in the same field' },
  { value: 'not_in_my_field', label: 'No, not in the field of my educational achievement' },
]

const INITIAL_FORM: SurveyFormState = {
  financialSecurity: '',
  insecurityReason: '',
  additionalIncomeImpact: '',
  benefitsCliffExperience: '',
  welfareEliminationConcern: '',
  baselineSupportLevel: '',
  dependentSupportPolicy: '',
  retirementSystemPreference: '',
  healthcareSystemPreference: '',
  ageRange: '',
  employmentSituation: '',
  dependentsCount: '',
  educationLevel: '',
  educationAlignment: '',
  alias: '',
  email: '',
  country: '',
}

function RadioGroup<T extends string>({
  questionId,
  title,
  options,
  value,
  onChange,
}: {
  questionId: string
  title: string
  options: Option<T>[]
  value: '' | T
  onChange: (next: T) => void
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{title}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={questionId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function isInsecureSelection(value: '' | FinancialSecurity): boolean {
  return value === 'somewhat_insecure' || value === 'very_insecure'
}

export default function SurveyPage() {
  const [form, setForm] = useState<SurveyFormState>(INITIAL_FORM)
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const policyPreview = useMemo(() => {
    if (
      !form.baselineSupportLevel ||
      !form.dependentSupportPolicy ||
      !form.retirementSystemPreference ||
      !form.healthcareSystemPreference
    ) {
      return null
    }

    return buildSurveyPolicyModel({
      financialSecurity: 'neutral',
      insecurityReason: null,
      additionalIncomeImpact: 'unsure',
      benefitsCliffExperience: 'not_applicable',
      welfareEliminationConcern: 'no_opinion',
      baselineSupportLevel: form.baselineSupportLevel,
      dependentSupportPolicy: form.dependentSupportPolicy,
      retirementSystemPreference: form.retirementSystemPreference,
      healthcareSystemPreference: form.healthcareSystemPreference,
      ageRange: '25_34',
      employmentSituation: 'full_time',
      dependentsCount: 'none',
      educationLevel: 'high_school',
      educationAlignment: 'yes',
      alias: null,
      email: null,
      country: null,
    })
  }, [
    form.baselineSupportLevel,
    form.dependentSupportPolicy,
    form.retirementSystemPreference,
    form.healthcareSystemPreference,
  ])

  const validateForm = (): string | null => {
    if (!form.financialSecurity) return 'Question 1 is required.'
    if (isInsecureSelection(form.financialSecurity) && !form.insecurityReason) {
      return 'Please answer the insecurity follow-up.'
    }
    if (!form.additionalIncomeImpact) return 'Question 2 is required.'
    if (!form.benefitsCliffExperience) return 'Question 3 is required.'
    if (!form.welfareEliminationConcern) return 'Question 4 is required.'
    if (!form.baselineSupportLevel) return 'Question 5 is required.'
    if (!form.dependentSupportPolicy) return 'Question 6 is required.'
    if (!form.retirementSystemPreference) return 'Question 7 is required.'
    if (!form.healthcareSystemPreference) return 'Question 8 is required.'
    if (!form.ageRange) return 'Question 9 is required.'
    if (!form.employmentSituation) return 'Question 10 is required.'
    if (!form.dependentsCount) return 'Question 11 is required.'
    if (!form.educationLevel) return 'Question 12 is required.'
    if (!form.educationAlignment) return 'Question 13 is required.'
    return null
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload: QuickSurveyAnswers = {
      financialSecurity: form.financialSecurity as FinancialSecurity,
      insecurityReason: isInsecureSelection(form.financialSecurity)
        ? (form.insecurityReason as InsecurityReason)
        : null,
      additionalIncomeImpact: form.additionalIncomeImpact as AdditionalIncomeImpact,
      benefitsCliffExperience: form.benefitsCliffExperience as BenefitsCliffExperience,
      welfareEliminationConcern: form.welfareEliminationConcern as WelfareEliminationConcern,
      baselineSupportLevel: form.baselineSupportLevel as BaselineSupportLevel,
      dependentSupportPolicy: form.dependentSupportPolicy as DependentSupportPolicy,
      retirementSystemPreference: form.retirementSystemPreference as RetirementSystemPreference,
      healthcareSystemPreference: form.healthcareSystemPreference as HealthcareSystemPreference,
      ageRange: form.ageRange as AgeRange,
      employmentSituation: form.employmentSituation as EmploymentSituation,
      dependentsCount: form.dependentsCount as DependentsCount,
      educationLevel: form.educationLevel as EducationLevel,
      educationAlignment: form.educationAlignment as EducationAlignment,
      alias: form.alias.trim() || null,
      email: form.email.trim() || null,
      country: form.country.trim() || null,
    }

    setIsSubmitting(true)
    try {
      await submitQuickSurvey(payload, honeypot || undefined)
      setSubmitted(true)
    } catch (submitError) {
      console.error(submitError)
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit survey right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PublicSiteShell>
        <section className={styles.thankYou}>
          <h1>Thank You</h1>
          <p>
            Your responses help researchers understand how economic support systems influence
            productivity and participation in modern economies.
          </p>
          <div className={styles.thankYouActions}>
            <Link href="/leaderboard" className={styles.primaryAction}>
              View Submissions
            </Link>
            <Link href="/model" className={styles.secondaryAction}>
              Explore the NAiERM Simulator
            </Link>
          </div>
        </section>
      </PublicSiteShell>
    )
  }

  return (
    <PublicSiteShell contentClassName="max-w-[980px] mx-auto px-5 md:px-8 pt-10 pb-20">
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>Quick Survey</p>
          <h1>{QUICK_SURVEY_NAME}</h1>
          <p>
            Share your perspective and policy preferences. Your submission is converted into a
            policy model and added to the submissions dataset.
          </p>
        </header>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.honeypotField} aria-hidden="true">
            <label htmlFor="survey-website">{HONEYPOT_FIELD_LABEL}</label>
            <input
              id="survey-website"
              name={HONEYPOT_FIELD_NAME}
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <section className={styles.card}>
            <h2>1. Financial Security</h2>
            <RadioGroup
              questionId="financial-security"
              title="In this age of AI development, how financially secure do you currently feel?"
              options={financialSecurityOptions}
              value={form.financialSecurity}
              onChange={(next) => setForm((prev) => ({ ...prev, financialSecurity: next }))}
            />

            {isInsecureSelection(form.financialSecurity) && (
              <RadioGroup
                questionId="insecurity-reason"
                title="If you feel insecure, what drives that feeling most?"
                options={insecurityReasonOptions}
                value={form.insecurityReason}
                onChange={(next) => setForm((prev) => ({ ...prev, insecurityReason: next }))}
              />
            )}
          </section>

          <section className={styles.card}>
            <h2>2. Additional Income Impact</h2>
            <RadioGroup
              questionId="additional-income-impact"
              title="If you had an additional $12,000 per year, how would it affect your economic activity?"
              options={additionalIncomeOptions}
              value={form.additionalIncomeImpact}
              onChange={(next) => setForm((prev) => ({ ...prev, additionalIncomeImpact: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>3. Benefits Cliff</h2>
            <RadioGroup
              questionId="benefits-cliff"
              title="Have you ever avoided increasing your income because it might cause you to lose government benefits?"
              options={benefitsCliffOptions}
              value={form.benefitsCliffExperience}
              onChange={(next) => setForm((prev) => ({ ...prev, benefitsCliffExperience: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>4. Welfare System Transition</h2>
            <RadioGroup
              questionId="welfare-transition"
              title="If the government replaced welfare and Medicaid with baseline income, would that concern you?"
              options={welfareConcernOptions}
              value={form.welfareEliminationConcern}
              onChange={(next) => setForm((prev) => ({ ...prev, welfareEliminationConcern: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>5. Baseline Financial Support</h2>
            <RadioGroup
              questionId="baseline-support"
              title="What level of baseline financial support should every adult receive to maintain economic stability?"
              options={baselineSupportOptions}
              value={form.baselineSupportLevel}
              onChange={(next) => setForm((prev) => ({ ...prev, baselineSupportLevel: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>6. Dependent Support</h2>
            <RadioGroup
              questionId="dependent-support"
              title="Should households receive additional economic support for dependents?"
              options={dependentSupportOptions}
              value={form.dependentSupportPolicy}
              onChange={(next) => setForm((prev) => ({ ...prev, dependentSupportPolicy: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>7. Retirement System</h2>
            <RadioGroup
              questionId="retirement-system"
              title="Which retirement system would you prefer?"
              options={retirementSystemOptions}
              value={form.retirementSystemPreference}
              onChange={(next) => setForm((prev) => ({ ...prev, retirementSystemPreference: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>8. Healthcare System</h2>
            <RadioGroup
              questionId="healthcare-system"
              title="Which healthcare system structure would you support?"
              options={healthcareSystemOptions}
              value={form.healthcareSystemPreference}
              onChange={(next) => setForm((prev) => ({ ...prev, healthcareSystemPreference: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>9. Age Range</h2>
            <RadioGroup
              questionId="age-range"
              title="Age range"
              options={ageOptions}
              value={form.ageRange}
              onChange={(next) => setForm((prev) => ({ ...prev, ageRange: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>10. Current Situation</h2>
            <RadioGroup
              questionId="employment-situation"
              title="Which best describes your current situation?"
              options={employmentOptions}
              value={form.employmentSituation}
              onChange={(next) => setForm((prev) => ({ ...prev, employmentSituation: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>11. Dependents in Household</h2>
            <RadioGroup
              questionId="dependents-count"
              title="How many dependents currently live in your household?"
              options={dependentsOptions}
              value={form.dependentsCount}
              onChange={(next) => setForm((prev) => ({ ...prev, dependentsCount: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>12. Educational Level</h2>
            <RadioGroup
              questionId="education-level"
              title="Educational level"
              options={educationOptions}
              value={form.educationLevel}
              onChange={(next) => setForm((prev) => ({ ...prev, educationLevel: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>13. Education and Employment Alignment</h2>
            <RadioGroup
              questionId="education-alignment"
              title="Is your current employment in line with your educational achievements?"
              options={educationAlignmentOptions}
              value={form.educationAlignment}
              onChange={(next) => setForm((prev) => ({ ...prev, educationAlignment: next }))}
            />
          </section>

          <section className={styles.card}>
            <h2>Final Step - Submission Details</h2>
            <p className={styles.finalStepText}>
              Your Policy Model
            </p>
            {policyPreview ? (
              <div className={styles.policyPreview}>
                <p>
                  <span>BEL:</span> {formatBelMonthlyLabel(policyPreview.belMonthly)} / month
                </p>
                <p>
                  <span>Dependent Policy:</span> {policyPreview.dependentPolicyLabel}
                </p>
                <p>
                  <span>Retirement:</span> {policyPreview.retirementLabel}
                </p>
                <p>
                  <span>Healthcare:</span> {policyPreview.healthcareLabel}
                </p>
              </div>
            ) : (
              <p className={styles.previewPlaceholder}>
                Select answers for questions 5-8 to preview your policy model.
              </p>
            )}

            <div className={styles.finalFields}>
              <label>
                Name or Alias (optional)
                <input
                  type="text"
                  maxLength={50}
                  value={form.alias}
                  onChange={(event) => setForm((prev) => ({ ...prev, alias: event.target.value }))}
                  placeholder="Anonymous"
                />
              </label>
              <label>
                Email (optional)
                <input
                  type="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Country (optional)
                <input
                  type="text"
                  maxLength={80}
                  value={form.country}
                  onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                  placeholder="United States"
                />
              </label>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Your Model'}
            </button>
          </section>
        </form>
      </main>
    </PublicSiteShell>
  )
}
