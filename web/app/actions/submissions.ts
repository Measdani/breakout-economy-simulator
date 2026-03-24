'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { runSimulation } from '@/lib/engine'
import {
  buildSubmissionPayload,
  type SubmissionDemographics,
} from '@/lib/submissionPayload'
import { normalizePublicPolicyConfig } from '@/lib/publicPolicyConfig'
import { storeSubmissionContact } from '@/lib/privateContacts'
import {
  sanitizeOptionalEmail,
  sanitizeOptionalText,
} from '@/lib/inputSanitizers'
import {
  PUBLIC_RATE_LIMITS,
  checkPublicRateLimit,
  getRequestFingerprint,
} from '@/lib/security/publicRateLimit'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'

function sanitizeDemographics(
  demographics: SubmissionDemographics | null | undefined
): SubmissionDemographics | null {
  if (!demographics || typeof demographics !== 'object') {
    return null
  }

  const sanitized: SubmissionDemographics = {}
  const ageRange = sanitizeOptionalText(demographics.ageRange, 40)
  const incomeLevel = sanitizeOptionalText(demographics.incomeLevel, 60)
  const region = sanitizeOptionalText(demographics.region, 80)
  const affiliation = sanitizeOptionalText(demographics.affiliation, 80)

  if (ageRange) sanitized.ageRange = ageRange
  if (incomeLevel) sanitized.incomeLevel = incomeLevel
  if (region) sanitized.region = region
  if (affiliation) sanitized.affiliation = affiliation

  return Object.keys(sanitized).length > 0 ? sanitized : null
}

export async function submitSimulation(
  rawConfig: unknown,
  name?: string,
  email?: string,
  configName?: string,
  userFeedbackText?: string,
  demographics?: SubmissionDemographics | null
) {
  const requestHeaders = await headers()
  const rateLimit = await checkPublicRateLimit(
    'submission',
    getRequestFingerprint(requestHeaders),
    PUBLIC_RATE_LIMITS.submission
  )

  if (!rateLimit.allowed) {
    throw new Error(
      `Too many submissions from this connection. Try again in about ${rateLimit.retryAfterSeconds} seconds.`
    )
  }

  const config = normalizePublicPolicyConfig(rawConfig)
  const result = runSimulation(config)
  const submissionPayload = buildSubmissionPayload({
    config,
    result,
    userFeedbackText: sanitizeOptionalText(userFeedbackText, 500),
    demographics: sanitizeDemographics(demographics),
  })
  const sanitizedName = sanitizeOptionalText(name, 50)
  const sanitizedEmail = sanitizeOptionalEmail(email)
  const sanitizedConfigName = sanitizeOptionalText(configName, 160) ?? 'Default'
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      name: sanitizedName,
      email: null,
      config,
      result,
      surplus_deficit: result.balance.surplusDeficit,
      ubi_annual: config.ubiAnnualPerAdult,
      token_tax_rate: config.tokenTaxRate,
      breakout_point: config.breakoutPoint,
      is_solvent: result.balance.isSolvent,
      config_name: sanitizedConfigName,
      submission_payload_json: submissionPayload,
    })
    .select()
    .single()

  if (error) {
    console.error('Submission error:', error)
    if (String(error.message || '').includes('submission_payload_json')) {
      throw new Error('Missing DB column: submissions.submission_payload_json (json/jsonb)')
    }
    throw new Error('Failed to submit simulation')
  }

  if (sanitizedEmail) {
    try {
      await storeSubmissionContact(supabase, String(data.id), sanitizedEmail)
    } catch (contactError) {
      console.error('Submission contact storage error:', contactError)
      await supabase.from('submissions').delete().eq('id', data.id)
      throw new Error('Failed to store contact details')
    }
  }

  // Revalidate leaderboard
  revalidatePath('/leaderboard')

  const cookieStore = await cookies()
  cookieStore.set('last_submission_id', String(data.id), {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  })

  return data
}
