import 'server-only'

type ServiceClient = {
  from: (table: string) => any
}

function asIdMap<T extends string>(
  rows: Array<{ id: string; email: string }> | null | undefined
): Map<string, string> {
  return new Map((rows ?? []).map((row) => [row.id, row.email]))
}

export async function storeSubmissionContact(
  supabase: ServiceClient,
  submissionId: string,
  email: string
) {
  const { error } = await supabase.from('submission_contacts').upsert(
    {
      submission_id: submissionId,
      email,
    },
    { onConflict: 'submission_id' }
  )

  if (error) {
    throw error
  }
}

export async function storeFeedbackContact(
  supabase: ServiceClient,
  feedbackId: string,
  email: string
) {
  const { error } = await supabase.from('feedback_contacts').upsert(
    {
      feedback_id: feedbackId,
      email,
    },
    { onConflict: 'feedback_id' }
  )

  if (error) {
    throw error
  }
}

export async function getSubmissionContactMap(
  supabase: ServiceClient,
  submissionIds: string[]
): Promise<Map<string, string>> {
  if (submissionIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('submission_contacts')
    .select('submission_id, email')
    .in('submission_id', submissionIds)

  if (error) {
    throw error
  }

  return asIdMap(
    ((data ?? []) as Array<{ submission_id: string; email: string }>).map((row) => ({
      id: row.submission_id,
      email: row.email,
    }))
  )
}

export async function getFeedbackContactMap(
  supabase: ServiceClient,
  feedbackIds: string[]
): Promise<Map<string, string>> {
  if (feedbackIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('feedback_contacts')
    .select('feedback_id, email')
    .in('feedback_id', feedbackIds)

  if (error) {
    throw error
  }

  return asIdMap(
    ((data ?? []) as Array<{ feedback_id: string; email: string }>).map((row) => ({
      id: row.feedback_id,
      email: row.email,
    }))
  )
}
