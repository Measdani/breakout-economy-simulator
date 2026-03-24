const DANGEROUS_SPREADSHEET_PREFIX = /^[\s]*[=+\-@]/

export function sanitizeSpreadsheetCell(
  value: string | number | boolean | null | undefined
): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== 'string') {
    return value
  }

  return DANGEROUS_SPREADSHEET_PREFIX.test(value) ? `'${value}` : value
}
