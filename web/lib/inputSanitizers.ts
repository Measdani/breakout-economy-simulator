export function sanitizeOptionalText(
  value: string | null | undefined,
  maxLen: number
): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.replace(/\u0000/g, '').trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed.slice(0, maxLen)
}

export function sanitizeRequiredText(
  value: string | null | undefined,
  maxLen: number,
  fieldLabel: string
): string {
  const sanitized = sanitizeOptionalText(value, maxLen)
  if (!sanitized) {
    throw new Error(`${fieldLabel} is required`)
  }

  return sanitized
}

export function sanitizeOptionalEmail(value: string | null | undefined): string | null {
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
