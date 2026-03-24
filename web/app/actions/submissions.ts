'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { PolicyConfig, SimulationResult } from '@/lib/types'
import type { SubmissionPayload } from '@/lib/submissionPayload'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function submitSimulation(
  config: PolicyConfig,
  result: SimulationResult,
  submissionPayload: SubmissionPayload,
  name?: string,
  email?: string,
  configName?: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      name: name || null,
      email: email || null,
      config,
      result,
      surplus_deficit: result.balance.surplusDeficit,
      ubi_annual: config.ubiAnnualPerAdult,
      token_tax_rate: config.tokenTaxRate,
      breakout_point: config.breakoutPoint,
      is_solvent: result.balance.isSolvent,
      config_name: configName || 'Default',
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
