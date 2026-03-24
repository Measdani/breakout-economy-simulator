'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { runSimulation } from '@/lib/engine'
import { buildSubmissionPayload } from '@/lib/submissionPayload'
import { cookies } from 'next/headers'
import { sendSurveyResultsEmail } from '@/lib/email/sendSurveyResultsEmail'
import {
  QUICK_SURVEY_NAME,
  buildSurveyPolicyConfig,
  toSurveyResponseRecord,
  type QuickSurveyAnswers,
} from '@/lib/quickSurvey'

function sanitizeOptionalText(value: string | null | undefined, maxLen: number): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed.slice(0, maxLen)
}

function sanitizeOptionalEmail(value: string | null | undefined): string | null {
  const email = sanitizeOptionalText(value, 254)
  if (!email) {
    return null
  }

  const normalized = email.toLowerCase()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(normalized)) {
    throw new Error('Please enter a valid email address or leave it blank.')
  }

  return normalized
}

export async function submitQuickSurvey(answers: QuickSurveyAnswers) {
  const supabase = createServiceClient()

  const alias = sanitizeOptionalText(answers.alias, 50)
  const email = sanitizeOptionalEmail(answers.email)
  const country = sanitizeOptionalText(answers.country, 80)

  const normalizedAnswers: QuickSurveyAnswers = {
    ...answers,
    alias,
    email,
    country,
  }

  const { config, policyModel, configName } = buildSurveyPolicyConfig(normalizedAnswers)
  const result = runSimulation(config)

  const payload = buildSubmissionPayload({
    config,
    result,
    userFeedbackText: `${QUICK_SURVEY_NAME} submission`,
    whyChoiceText: normalizedAnswers.insecurityReason
      ? `insecurity_reason=${normalizedAnswers.insecurityReason}`
      : null,
    demographics: {
      ageRange: normalizedAnswers.ageRange,
      incomeLevel: normalizedAnswers.educationLevel,
      region: normalizedAnswers.country ?? undefined,
      affiliation: normalizedAnswers.employmentSituation,
    },
  })

  const payloadWithSurvey = {
    ...payload,
    survey_response: {
      survey_name: QUICK_SURVEY_NAME,
      survey_version: 'v1',
      responses: toSurveyResponseRecord(normalizedAnswers),
      policy_model: {
        bel_monthly: policyModel.belMonthly,
        dependent_policy: policyModel.dependentPolicyLabel,
        retirement: policyModel.retirementLabel,
        healthcare: policyModel.healthcareLabel,
      },
    },
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      name: alias || null,
      email,
      config,
      result,
      surplus_deficit: result.balance.surplusDeficit,
      ubi_annual: config.ubiAnnualPerAdult,
      token_tax_rate: config.tokenTaxRate,
      breakout_point: config.breakoutPoint,
      is_solvent: result.balance.isSolvent,
      config_name: configName,
      submission_payload_json: payloadWithSurvey,
    })
    .select()
    .single()

  if (error) {
    console.error('Quick survey submission error:', error)
    throw new Error('Failed to submit quick survey response')
  }

  revalidatePath('/leaderboard')
  revalidatePath('/admin')

  const cookieStore = await cookies()
  cookieStore.set('last_submission_id', String(data.id), {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  })

  const resultsEmail = await sendSurveyResultsEmail({
    to: email,
    alias,
    submissionId: String(data.id),
    submittedAt: String(data.created_at ?? new Date().toISOString()),
    configName,
    belMonthly: policyModel.belMonthly,
    dependentPolicy: policyModel.dependentPolicyLabel,
    retirement: policyModel.retirementLabel,
    healthcare: policyModel.healthcareLabel,
    isSolvent: result.balance.isSolvent,
    surplusDeficit: result.balance.surplusDeficit,
  })

  return {
    id: data.id,
    isSolvent: result.balance.isSolvent,
    surplusDeficit: result.balance.surplusDeficit,
    resultsEmailStatus: resultsEmail.status,
  }
}
