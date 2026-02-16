'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import type { SubmissionRow } from '@/lib/supabase/types'

interface Props {
  submissions: SubmissionRow[]
}

export default function AdminTable({ submissions }: Props) {
  const [search, setSearch] = useState('')

  const filtered = submissions.filter(
    (sub) =>
      (sub.name?.toLowerCase().includes(search.toLowerCase()) || sub.name === null) ||
      (sub.email?.toLowerCase().includes(search.toLowerCase()) || sub.email === null)
  )

  const exportCSV = () => {
    const csv = Papa.unparse(
      filtered.map((sub) => ({
        id: sub.id,
        created_at: sub.created_at,
        name: sub.name || 'Anonymous',
        email: sub.email || '',
        surplus_deficit: sub.surplus_deficit,
        surplus_deficit_billions: (sub.surplus_deficit / 1e9).toFixed(2),
        ubi_annual: sub.ubi_annual,
        token_tax_rate: (sub.token_tax_rate * 100).toFixed(3),
        breakout_point: sub.breakout_point,
        is_solvent: sub.is_solvent ? 'Yes' : 'No'
      }))
    )

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `submissions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-dark-slate rounded-lg border border-border-slate">
      <div className="p-4 border-b border-border-slate flex gap-4 flex-col sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-darker-navy border border-border-slate rounded text-bright focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={exportCSV}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-semibold transition whitespace-nowrap"
        >
          📥 Export CSV ({filtered.length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-darker-slate sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Email</th>
              <th className="px-4 py-3 text-right font-semibold text-muted">Balance</th>
              <th className="px-4 py-3 text-right font-semibold text-muted">UBI</th>
              <th className="px-4 py-3 text-right font-semibold text-muted">Tax Rate</th>
              <th className="px-4 py-3 text-right font-semibold text-muted">Solvent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No submissions found
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="border-t border-border-slate hover:bg-darker-navy transition">
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {new Date(sub.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-bright">{sub.name || 'Anonymous'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{sub.email || '-'}</td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      sub.is_solvent ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {sub.is_solvent ? '+' : ''}${(sub.surplus_deficit / 1e9).toFixed(1)}B
                  </td>
                  <td className="px-4 py-3 text-right text-muted">${(sub.ubi_annual / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {(sub.token_tax_rate * 100).toFixed(3)}%
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {sub.is_solvent ? '✓' : '✗'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
