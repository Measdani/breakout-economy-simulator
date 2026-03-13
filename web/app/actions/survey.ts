'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/client'
import { runSimulation } from '@/lib/engine'
import { buildSubmissionPayload } from '@/lib/submissionPayload'
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

export async function submitQuickSurvey(answers: QuickSurveyAnswers) {
  const supabase = createClient()

  const alias = sanitizeOptionalText(answers.alias, 50)
  const country = sanitizeOptionalText(answers.country, 80)

  const normalizedAnswers: QuickSurveyAnswers = {
    ...answers,
    alias,
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
      email: null,
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

  return {
    id: data.id,
    isSolvent: result.balance.isSolvent,
    surplusDeficit: result.balance.surplusDeficit,
  }
}
