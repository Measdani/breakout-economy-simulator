'use client';

import type { SimulationResult } from '../lib/types';

interface ResultsDisplayProps {
  result: SimulationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const { revenue, obligations, balance } = result;
  const isSolvent = balance.isSolvent;

  return (
    <div className="space-y-6">
      {/* Solvency Indicator */}
      <div
        className={`rounded-lg shadow-lg p-8 text-white text-center ${
          isSolvent ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        <p className="text-sm font-semibold mb-2 opacity-90">FISCAL STATUS</p>
        <h3 className="text-4xl font-bold mb-3">
          {isSolvent ? '✓ SOLVENT' : '✗ DEFICIT'}
        </h3>
        <p className="text-lg font-semibold">
          {isSolvent ? '+' : ''}
          {formatCurrency(balance.surplusDeficit)}
        </p>
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-green">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-slate-700">Token Tax</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(revenue.tokenTaxRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-slate-700">Income Tax</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(revenue.incomeTaxRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-slate-700">Welfare Savings</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(revenue.welfareSavingsCredit)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-slate-900">Total Revenue</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(revenue.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Obligations Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-red">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Obligations</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-slate-700">UBI Cost (Total)</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(obligations.ubiCost)}
            </span>
          </div>
          {(obligations.adultUBICost !== undefined || obligations.dependentUBICost !== undefined) && (
            <>
              <div className="flex justify-between items-center pb-2 pl-4 text-sm bg-gray-50 py-2 rounded">
                <span className="text-slate-600">└─ Adult UBI</span>
                <span className="font-semibold text-slate-700">
                  {obligations.adultUBICost ? formatCurrency(obligations.adultUBICost) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b pl-4 text-sm bg-gray-50 py-2 rounded">
                <span className="text-slate-600">└─ Dependent UBI</span>
                <span className="font-semibold text-slate-700">
                  {obligations.dependentUBICost ? formatCurrency(obligations.dependentUBICost) : '$0'}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-slate-700">Government Operations</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(obligations.govtOperatingRequirement)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-slate-900">Total Obligations</span>
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(obligations.totalObligations)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
