'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { PolicyConfig, SimulationResult } from '@/lib/types'

interface FeedbackPayload {
  name?: string
  email?: string
  category: string
  message: string
  config?: PolicyConfig
  surplusDeficit?: number
  configName?: string
}

const VALID_CATEGORIES = ['bug', 'suggestion', 'question', 'general']

export async function submitFeedback(feedback: FeedbackPayload) {
  // Validate required fields
  if (!feedback.message || !feedback.message.trim()) {
    throw new Error('Message is required')
  }

  if (!feedback.category || !VALID_CATEGORIES.includes(feedback.category)) {
    throw new Error('Invalid feedback category')
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('feedback')
    .insert({
      name: feedback.name || null,
      email: feedback.email || null,
      category: feedback.category,
      message: feedback.message.trim(),
      config_snapshot: feedback.config || null,
      surplus_deficit: feedback.surplusDeficit || null,
      config_name: feedback.configName || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Feedback submission error:', error)
    throw new Error('Failed to submit feedback')
  }

  return data
}
