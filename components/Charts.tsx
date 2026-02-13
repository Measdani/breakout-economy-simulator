'use client';

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { SimulationResult, PolicyConfig } from '@/lib/types';
import { calculateSupplement } from '@/lib/engine';

interface ChartsProps {
  result: SimulationResult;
  config: PolicyConfig;
}

export default function Charts({ result, config }: ChartsProps) {
  // Revenue Chart Data
  const revenueData = [
    {
      name: 'Token Tax',
      value: result.revenue.tokenTaxRevenue / 1e9,
    },
    {
      name: 'Income Tax',
      value: result.revenue.incomeTaxRevenue / 1e9,
    },
    {
      name: 'Welfare Savings',
      value: result.revenue.welfareSavingsCredit / 1e9,
    },
  ];

  // Obligations Chart Data
  const obligationsData = [
    {
      name: 'UBI Cost',
      value: result.obligations.ubiCost / 1e9,
    },
    {
      name: 'Govt Operations',
      value: result.obligations.govtOperatingRequirement / 1e9,
    },
  ];

  // Supplement Curve Data
  const supplementData = [];
  for (let income = 0; income <= config.breakoutPoint; income += config.breakoutPoint / 20) {
    supplementData.push({
      income: Math.round(income / 1000) * 1000,
      supplement: calculateSupplement(income, config),
      ubi: config.ubiAnnualPerAdult,
    });
  }

  const COLORS_REVENUE = ['#3b82f6', '#10b981', '#8b5cf6'];
  const COLORS_OBLIGATIONS = ['#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-green">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Sources (Billions)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={revenueData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toFixed(0)}B`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {revenueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_REVENUE[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${(value as number).toFixed(0)}B`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Obligations Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-red">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Budget Obligations (Billions)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={obligationsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toFixed(0)}B`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {obligationsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_OBLIGATIONS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${(value as number).toFixed(0)}B`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Supplement Curve */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-blue">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Supplement & UBI by Earned Income</h3>
        <p className="text-sm text-slate-600 mb-4">
          Shows how UBI + supplement varies with earned income. No welfare cliffs—net income always increases.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={supplementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="income"
              label={{ value: 'Earned Income ($)', position: 'insideBottomRight', offset: -5 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => `$${(value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              labelFormatter={(label) => `$${(label as number).toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ubi"
              stroke="#10b981"
              name="Base UBI"
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="supplement"
              stroke="#8b5cf6"
              name="Supplement Bonus"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
