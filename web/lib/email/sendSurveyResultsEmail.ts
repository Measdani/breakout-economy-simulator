import 'server-only'

type DeliveryStatus =
  | 'sent'
  | 'disabled'
  | 'missing_config'
  | 'skipped_no_email'
  | 'failed'

interface SendSurveyResultsEmailInput {
  to: string | null
  alias: string | null
  submissionId: string
  submittedAt: string
  configName: string
  belMonthly: number
  dependentPolicy: string
  retirement: string
  healthcare: string
  isSolvent: boolean
  surplusDeficit: number
}

interface SendSurveyResultsEmailResult {
  status: DeliveryStatus
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatBillions(value: number): string {
  const billions = value / 1e9
  const sign = billions >= 0 ? '+' : ''
  return `${sign}$${billions.toFixed(1)}B`
}

export async function sendSurveyResultsEmail(
  input: SendSurveyResultsEmailInput
): Promise<SendSurveyResultsEmailResult> {
  if (!input.to) {
    return { status: 'skipped_no_email' }
  }

  const enabled = process.env.SURVEY_RESULTS_EMAIL_ENABLED === 'true'
  if (!enabled) {
    return { status: 'disabled' }
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.SURVEY_RESULTS_EMAIL_FROM
  const replyTo = process.env.SURVEY_RESULTS_EMAIL_REPLY_TO

  if (!apiKey || !from) {
    console.warn(
      'Survey results email skipped: missing RESEND_API_KEY or SURVEY_RESULTS_EMAIL_FROM.'
    )
    return { status: 'missing_config' }
  }

  const appBaseUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://your-domain.com'
  const submissionDate = new Date(input.submittedAt)
  const formattedDate = Number.isNaN(submissionDate.getTime())
    ? input.submittedAt
    : submissionDate.toLocaleString('en-US')
  const greetingName = input.alias || 'there'
  const subject = 'Your NAiERM Survey Results'
  const leaderboardUrl = `${appBaseUrl.replace(/\/$/, '')}/leaderboard`
  const modelUrl = `${appBaseUrl.replace(/\/$/, '')}/model`

  const textBody = [
    `Hi ${greetingName},`,
    '',
    'Thanks for submitting your NAiERM survey response. Here is your result copy:',
    '',
    `Submission ID: ${input.submissionId}`,
    `Submitted: ${formattedDate}`,
    `Model label: ${input.configName}`,
    '',
    `BEL: ${formatCurrency(input.belMonthly)} / month`,
    `Dependent policy: ${input.dependentPolicy}`,
    `Retirement: ${input.retirement}`,
    `Healthcare: ${input.healthcare}`,
    `Fiscal status: ${input.isSolvent ? 'Solvent' : 'Deficit'}`,
    `Balance: ${formatBillions(input.surplusDeficit)}`,
    '',
    `Submissions: ${leaderboardUrl}`,
    `Simulator: ${modelUrl}`,
  ].join('\n')

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <p>Hi ${greetingName},</p>
      <p>Thanks for submitting your NAiERM survey response. Here is your result copy:</p>
      <div style="border: 1px solid #dbe4f0; border-radius: 10px; padding: 14px; background: #f8fbff;">
        <p style="margin: 0 0 8px;"><strong>Submission ID:</strong> ${input.submissionId}</p>
        <p style="margin: 0 0 8px;"><strong>Submitted:</strong> ${formattedDate}</p>
        <p style="margin: 0 0 8px;"><strong>Model label:</strong> ${input.configName}</p>
        <p style="margin: 0 0 8px;"><strong>BEL:</strong> ${formatCurrency(input.belMonthly)} / month</p>
        <p style="margin: 0 0 8px;"><strong>Dependent policy:</strong> ${input.dependentPolicy}</p>
        <p style="margin: 0 0 8px;"><strong>Retirement:</strong> ${input.retirement}</p>
        <p style="margin: 0 0 8px;"><strong>Healthcare:</strong> ${input.healthcare}</p>
        <p style="margin: 0 0 8px;"><strong>Fiscal status:</strong> ${
          input.isSolvent ? 'Solvent' : 'Deficit'
        }</p>
        <p style="margin: 0;"><strong>Balance:</strong> ${formatBillions(input.surplusDeficit)}</p>
      </div>
      <p style="margin-top: 14px;">
        <a href="${leaderboardUrl}" style="color: #1d4ed8;">View Submissions</a>
        &nbsp;|&nbsp;
        <a href="${modelUrl}" style="color: #1d4ed8;">Open Simulator</a>
      </p>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        text: textBody,
        html: htmlBody,
        reply_to: replyTo || undefined,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('Survey results email send failed:', response.status, body)
      return { status: 'failed' }
    }

    return { status: 'sent' }
  } catch (error) {
    console.error('Survey results email send exception:', error)
    return { status: 'failed' }
  }
}
