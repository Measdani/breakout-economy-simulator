'use client'

import { useMemo } from 'react'

export interface QuickSurveySnapshot {
  id: string
  createdAt: string
  alias: string
  email: string
  country: string
  financialSecurity: string
  policyBelMonthly: string
  policyDependent: string
  policyRetirement: string
  policyHealthcare: string
  responses: Record<string, unknown>
}

interface Props {
  snapshots: QuickSurveySnapshot[]
}

function prettySurveyValue(value: unknown): string {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized.length === 0 ? '-' : normalized.replace(/_/g, ' ')
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (value === null || value === undefined) {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.map((item) => prettySurveyValue(item)).join(', ')
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toExcelXml(headers: string[], rows: string[][]): string {
  const headerRow = `<Row>${headers
    .map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`)
    .join('')}</Row>`

  const dataRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
          .join('')}</Row>`
    )
    .join('')

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Quick Survey">
    <Table>
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`
}

export default function QuickSurveyTable({ snapshots }: Props) {
  const responseKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const snapshot of snapshots) {
      for (const key of Object.keys(snapshot.responses)) {
        keys.add(key)
      }
    }
    return Array.from(keys).sort()
  }, [snapshots])

  const exportExcel = () => {
    if (snapshots.length === 0) {
      return
    }

    const headers = [
      'Date',
      'Alias',
      'Email',
      'Country',
      'Financial Security',
      'BEL / Month',
      'Dependent Policy',
      'Retirement',
      'Healthcare',
      ...responseKeys,
    ]

    const rows = snapshots.map((snapshot) => [
      new Date(snapshot.createdAt).toLocaleString(),
      snapshot.alias,
      snapshot.email,
      snapshot.country,
      snapshot.financialSecurity,
      snapshot.policyBelMonthly,
      snapshot.policyDependent,
      snapshot.policyRetirement,
      snapshot.policyHealthcare,
      ...responseKeys.map((key) => prettySurveyValue(snapshot.responses[key])),
    ])

    const excelXml = toExcelXml(headers, rows)
    const blob = new Blob(['\uFEFF', excelXml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `quick-survey-${new Date().toISOString().split('T')[0]}.xls`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-dark-slate rounded-lg border border-border-slate overflow-x-auto">
      <div className="p-4 border-b border-border-slate flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-muted">
          Download all quick survey rows in Excel format.
        </p>
        <button
          type="button"
          onClick={exportExcel}
          disabled={snapshots.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded font-semibold whitespace-nowrap transition px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              'linear-gradient(135deg, #16a34a 0%, #22c55e 45%, #15803d 100%)',
            color: '#f8fafc',
            border: '1px solid #4ade80',
            boxShadow:
              '0 8px 20px rgba(22, 163, 74, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
            minWidth: '190px',
            lineHeight: 1,
            cursor: snapshots.length === 0 ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (snapshots.length === 0) return
            e.currentTarget.style.filter = 'brightness(1.08)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'none'
            e.currentTarget.style.transform = 'none'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v11m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Export Excel ({snapshots.length})</span>
        </button>
      </div>

      {snapshots.length === 0 ? (
        <p className="p-4 text-muted text-sm">No quick survey submissions yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-darker-slate">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Alias</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Country</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Financial Security</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">BEL / Month</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Dependent Policy</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Retirement</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Healthcare</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Survey Details</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((snapshot) => (
              <tr key={snapshot.id} className="border-t border-border-slate hover:bg-darker-navy transition">
                <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                  {new Date(snapshot.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-bright">{snapshot.alias}</td>
                <td className="px-4 py-3 text-muted">{snapshot.email}</td>
                <td className="px-4 py-3 text-muted">{snapshot.country}</td>
                <td className="px-4 py-3 text-muted">{snapshot.financialSecurity}</td>
                <td className="px-4 py-3 text-muted">{snapshot.policyBelMonthly}</td>
                <td className="px-4 py-3 text-muted">{snapshot.policyDependent}</td>
                <td className="px-4 py-3 text-muted">{snapshot.policyRetirement}</td>
                <td className="px-4 py-3 text-muted">{snapshot.policyHealthcare}</td>
                <td className="px-4 py-3 align-top">
                  <details>
                    <summary className="cursor-pointer text-xs text-blue-300">View</summary>
                    <div className="mt-2 max-h-56 overflow-y-auto rounded border border-border-slate bg-darker-navy p-2 min-w-[340px]">
                      {Object.entries(snapshot.responses).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-3 text-[11px] leading-5">
                          <span className="text-dimmed">{key}</span>
                          <span className="text-bright text-right break-all">
                            {prettySurveyValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
