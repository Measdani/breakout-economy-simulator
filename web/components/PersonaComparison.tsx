'use client';

import { useState } from 'react';
import type { PersonaOutcome } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PersonaComparisonProps {
  personas: PersonaOutcome[];
}

export default function PersonaComparison({ personas }: PersonaComparisonProps) {
  const [selectedPersona, setSelectedPersona] = useState(personas[0]);

  const chartData = personas.map((p) => ({
    name: p.label,
    'Earned Income': p.earnedIncome / 1000,
    BEL: p.ubi / 1000,
    Supplement: p.supplement / 1000,
    'Income Tax': -p.incomeTax / 1000,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getIncentiveSlope = (persona: PersonaOutcome, nextPersona?: PersonaOutcome) => {
    if (!nextPersona) return 'N/A';
    const incomeDiff = nextPersona.earnedIncome - persona.earnedIncome;
    const netDiff = nextPersona.netIncome - persona.netIncome;
    const slope = ((netDiff / incomeDiff) * 100).toFixed(1);
    return `${slope}% retention`;
  };

  // Calculate key insight
  const getChartInsight = () => {
    const starter = personas[0];
    const executive = personas[personas.length - 1];
    const netIncomeIncrease = ((executive.netIncome / starter.netIncome) - 1) * 100;
    return `Net income increases ${netIncomeIncrease.toFixed(0)}% from lowest to highest earner`;
  };

  const customTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      const personaData = personas.find(p => p.label === data.name);
      if (personaData) {
        return (
          <div style={{ background: '#1e293b', color: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', border: '1px solid #334155' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{personaData.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p>Earned: {formatCurrency(personaData.earnedIncome)}</p>
              <p style={{ color: '#4ade80' }}>BEL: {formatCurrency(personaData.ubi)}</p>
              <p style={{ color: '#c084fc' }}>Supplement: {formatCurrency(personaData.supplement)}</p>
              <p style={{ color: '#f87171' }}>Tax: {formatCurrency(personaData.incomeTax)}</p>
              <p style={{ borderTop: '1px solid #475569', paddingTop: '4px', marginTop: '4px', fontWeight: 'bold' }}>
                Net: {formatCurrency(personaData.netIncome)}
              </p>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 glow-border-blue">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 </span>
          {getChartInsight()}
        </p>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-blue">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Persona Income Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Amount ($K)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Bar dataKey="Earned Income" stackId="a" fill="#3b82f6" />
            <Bar dataKey="BEL" stackId="a" fill="#22c55e" />
            <Bar dataKey="Supplement" stackId="a" fill="#a78bfa" />
            <Bar dataKey="Income Tax" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Persona View */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-blue">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Detailed Breakdown</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {personas.map((persona, idx) => {
            const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'];
            const isSelected = selectedPersona.label === persona.label;
            return (
              <button
                key={persona.label}
                onClick={() => setSelectedPersona(persona)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? colors[idx] : '#334155',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${colors[idx]}`
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{persona.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{formatCurrency(persona.earnedIncome)}</div>
              </button>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">💼 Earned Income</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedPersona.earnedIncome)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">🎁 Base BEL</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedPersona.ubi)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">💝 Supplement Bonus</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(selectedPersona.supplement)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">💸 Income Tax</p>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(selectedPersona.incomeTax)}
              </p>
            </div>
          </div>

          {/* Net Income Summary */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
            <p className="text-sm opacity-90 mb-2">💰 NET INCOME (Take Home)</p>
            <p className="text-4xl font-bold">{formatCurrency(selectedPersona.netIncome)}</p>
            <p className="text-sm opacity-75 mt-2">
              +{((selectedPersona.netIncome / selectedPersona.earnedIncome) * 100).toFixed(0)}% of earned income
            </p>
          </div>

          {/* Incentive Analysis */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 mb-3">⚡ Work Incentive Analysis</p>
            <div className="space-y-2 text-sm">
              {personas.map((persona, idx) => {
                const nextPersona = personas[idx + 1];
                return (
                  <div key={persona.label} className="flex justify-between items-center">
                    <span className="text-slate-700">
                      {persona.label} → {nextPersona?.label || 'End'}
                    </span>
                    <span className="font-semibold text-green-600">
                      {getIncentiveSlope(persona, nextPersona)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-3 italic">
              💡 Higher = Better work incentive. No cliff = income never decreases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
