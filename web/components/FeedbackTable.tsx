'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import type { FeedbackRow } from '@/lib/supabase/types'

interface Props {
  feedback: FeedbackRow[]
}

export default function FeedbackTable({ feedback }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Client-side filtering
  const filtered = feedback.filter((item) => {
    const matchesSearch =
      !search ||
      (item.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (item.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      item.message.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(feedback.map((f) => f.category)))

  const exportCSV = () => {
    const csv = Papa.unparse(
      filtered.map((item) => ({
        id: item.id,
        created_at: new Date(item.created_at).toLocaleString(),
        name: item.name || 'Anonymous',
        email: item.email || '',
        category: item.category,
        message: item.message,
        config_name: item.config_name || 'N/A',
      }))
    )

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `feedback_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ backgroundColor: '#0f1629', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Header with search and filter */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 120px', gap: '1rem', alignItems: 'end' }}>
          {/* Search input */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.25rem',
                color: '#e0e7ff',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.25rem',
                color: '#e0e7ff',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={exportCSV}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              color: '#ffffff',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          No feedback found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Message</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Scenario</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  }}
                >
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>{item.name || 'Anonymous'}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{item.email || '-'}</td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor:
                          item.category === 'bug'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : item.category === 'suggestion'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : item.category === 'question'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        color:
                          item.category === 'bug'
                            ? '#ef4444'
                            : item.category === 'suggestion'
                              ? '#22c55e'
                              : item.category === 'question'
                                ? '#3b82f6'
                                : '#a78bfa',
                      }}
                    >
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#e0e7ff', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.message}>
                    {item.message.substring(0, 50)}
                    {item.message.length > 50 ? '...' : ''}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{item.config_name || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with count */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)', backgroundColor: '#0f1419', fontSize: '0.75rem', color: '#94a3b8' }}>
        Showing {filtered.length} of {feedback.length} feedback items
      </div>
    </div>
  )
}
