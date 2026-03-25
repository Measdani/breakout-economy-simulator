'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { PolicyConfig } from '@/lib/types'
import { normalizePublicPolicyConfig } from '@/lib/publicPolicyConfig'
import { storeFeedbackContact } from '@/lib/privateContacts'
import { isHoneypotTriggered } from '@/lib/honeypot'
import {
  sanitizeOptionalEmail,
  sanitizeOptionalText,
  sanitizeRequiredText,
} from '@/lib/inputSanitizers'
import {
  PUBLIC_RATE_LIMITS,
  checkPublicRateLimit,
  getRequestFingerprint,
} from '@/lib/security/publicRateLimit'
import { headers } from 'next/headers'

interface FeedbackPayload {
  name?: string
  email?: string
  category: string
  message: string
  config?: PolicyConfig
  surplusDeficit?: number
  configName?: string
  honeypot?: string
}

const VALID_CATEGORIES = ['bug', 'suggestion', 'question', 'general']

export async function submitFeedback(feedback: FeedbackPayload) {
  if (isHoneypotTriggered(feedback.honeypot)) {
    return { blocked: true }
  }

  const requestHeaders = await headers()
  const rateLimit = await checkPublicRateLimit(
    'feedback',
    getRequestFingerprint(requestHeaders),
    PUBLIC_RATE_LIMITS.feedback
  )

  if (!rateLimit.allowed) {
    throw new Error(
      `Too many feedback submissions from this connection. Try again in about ${rateLimit.retryAfterSeconds} seconds.`
    )
  }

  if (!feedback.category || !VALID_CATEGORIES.includes(feedback.category)) {
    throw new Error('Invalid feedback category')
  }

  const sanitizedName = sanitizeOptionalText(feedback.name, 50)
  const sanitizedEmail = sanitizeOptionalEmail(feedback.email)
  const sanitizedMessage = sanitizeRequiredText(feedback.message, 500, 'Message')
  const sanitizedConfigName = sanitizeOptionalText(feedback.configName, 160)
  const configSnapshot = feedback.config
    ? normalizePublicPolicyConfig(feedback.config)
    : null

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('feedback')
    .insert({
      name: sanitizedName,
      email: null,
      category: feedback.category,
      message: sanitizedMessage,
      config_snapshot: configSnapshot,
      surplus_deficit: feedback.surplusDeficit ?? null,
      config_name: sanitizedConfigName,
    })
    .select()
    .single()

  if (error) {
    console.error('Feedback submission error:', error)
    throw new Error('Failed to submit feedback')
  }

  if (sanitizedEmail) {
    try {
      await storeFeedbackContact(supabase, String(data.id), sanitizedEmail)
    } catch (contactError) {
      console.error('Feedback contact storage error:', contactError)
      await supabase.from('feedback').delete().eq('id', data.id)
      throw new Error('Failed to store contact details')
    }
  }

  return data
}
