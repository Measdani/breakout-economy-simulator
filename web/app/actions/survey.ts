'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { runSimulation } from '@/lib/engine'
import { buildSubmissionPayload } from '@/lib/submissionPayload'
import { cookies, headers } from 'next/headers'
import { sanitizeOptionalEmail, sanitizeOptionalText } from '@/lib/inputSanitizers'
import { isHoneypotTriggered } from '@/lib/honeypot'
import { storeSubmissionContact } from '@/lib/privateContacts'
import {
  PUBLIC_RATE_LIMITS,
  checkPublicRateLimit,
  getRequestFingerprint,
} from '@/lib/security/publicRateLimit'
import {
  QUICK_SURVEY_NAME,
  buildSurveyPolicyConfig,
  toSurveyResponseRecord,
  type QuickSurveyAnswers,
} from '@/lib/quickSurvey'

export async function submitQuickSurvey(answers: QuickSurveyAnswers, honeypot?: string) {
  if (isHoneypotTriggered(honeypot)) {
    return {
      blocked: true,
      isSolvent: false,
      surplusDeficit: 0,
    }
  }

  const requestHeaders = await headers()
  const rateLimit = await checkPublicRateLimit(
    'survey',
    getRequestFingerprint(requestHeaders),
    PUBLIC_RATE_LIMITS.survey
  )

  if (!rateLimit.allowed) {
    throw new Error(
      `Too many survey submissions from this connection. Try again in about ${rateLimit.retryAfterSeconds} seconds.`
    )
  }

  const supabase = createServiceClient()

  const alias = sanitizeOptionalText(answers.alias, 50)
  const country = sanitizeOptionalText(answers.country, 80)
  const email = sanitizeOptionalEmail(answers.email)

  const normalizedAnswers: QuickSurveyAnswers = {
    ...answers,
    alias,
    country,
    email,
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

  if (email) {
    try {
      await storeSubmissionContact(supabase, String(data.id), email)
    } catch (contactError) {
      console.error('Quick survey contact storage error:', contactError)
      await supabase.from('submissions').delete().eq('id', data.id)
      throw new Error('Failed to store contact details')
    }
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

  return {
    id: data.id,
    isSolvent: result.balance.isSolvent,
    surplusDeficit: result.balance.surplusDeficit,
  }
}
