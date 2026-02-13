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
    UBI: p.ubi / 1000,
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
          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-sm border border-slate-700">
            <p className="font-bold mb-2">{personaData.label}</p>
            <div className="space-y-1">
              <p>Earned: {formatCurrency(personaData.earnedIncome)}</p>
              <p className="text-green-400">UBI: {formatCurrency(personaData.ubi)}</p>
              <p className="text-purple-400">Supplement: {formatCurrency(personaData.supplement)}</p>
              <p className="text-red-400">Tax: {formatCurrency(personaData.incomeTax)}</p>
              <p className="border-t border-slate-600 pt-1 mt-1 font-bold">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 </span>
          {getChartInsight()}
        </p>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Persona Income Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Amount ($K)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Bar dataKey="Earned Income" stackId="a" fill="#3b82f6" />
            <Bar dataKey="UBI" stackId="a" fill="#22c55e" />
            <Bar dataKey="Supplement" stackId="a" fill="#a78bfa" />
            <Bar dataKey="Income Tax" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Persona View */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {personas.map((persona) => (
            <button
              key={persona.label}
              onClick={() => setSelectedPersona(persona)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedPersona.label === persona.label
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="font-semibold text-slate-900">{persona.label}</div>
              <div className="text-xs text-slate-500">{formatCurrency(persona.earnedIncome)}</div>
            </button>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Earned Income</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedPersona.earnedIncome)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Base UBI</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedPersona.ubi)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Supplement Bonus</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(selectedPersona.supplement)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Income Tax</p>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(selectedPersona.incomeTax)}
              </p>
            </div>
          </div>

          {/* Net Income Summary */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
            <p className="text-sm opacity-90 mb-2">NET INCOME (Take Home)</p>
            <p className="text-4xl font-bold">{formatCurrency(selectedPersona.netIncome)}</p>
            <p className="text-sm opacity-75 mt-2">
              +{((selectedPersona.netIncome / selectedPersona.earnedIncome) * 100).toFixed(0)}% of earned income
            </p>
          </div>

          {/* Incentive Analysis */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 mb-3">Work Incentive Analysis</p>
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
