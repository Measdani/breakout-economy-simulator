'use client';

import type { PersonaOutcome } from '../lib/types';

interface PersonaTableProps {
  personas: PersonaOutcome[];
}

export default function PersonaTable({ personas }: PersonaTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-300">
            <th className="px-4 py-3 text-left font-semibold text-slate-900">Persona</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">
              Earned Income
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">BEL</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Supplement</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900">
              Income Tax
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-900 bg-blue-50">
              Net Income
            </th>
          </tr>
        </thead>
        <tbody>
          {personas.map((persona, idx) => (
            <tr
              key={idx}
              className={`border-b ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              } hover:bg-slate-100 transition`}
            >
              <td className="px-4 py-3 font-semibold text-slate-900">{persona.label}</td>
              <td className="px-4 py-3 text-right text-slate-700">
                {formatCurrency(persona.earnedIncome)}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">
                {formatCurrency(persona.ubi)}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">
                {formatCurrency(persona.supplement)}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">
                {formatCurrency(persona.incomeTax)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50">
                {formatCurrency(persona.netIncome)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 p-4 bg-slate-50 rounded text-sm text-slate-600">
        <p>
          <strong>Net Income</strong> = Earned Income + BEL + Supplement - Income Tax
        </p>
        <p className="mt-2">
          Note: Higher earned income always results in higher net income (no welfare cliffs).
        </p>
      </div>
    </div>
  );
}
