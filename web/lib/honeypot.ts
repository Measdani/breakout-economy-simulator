export const HONEYPOT_FIELD_NAME = 'website'
export const HONEYPOT_FIELD_LABEL = 'Website'

export function isHoneypotTriggered(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.replace(/\u0000/g, '').trim().length > 0
}
