'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { SimulationResult, PolicyConfig } from '@/lib/types';

interface ChartsProps {
  result: SimulationResult;
  config: PolicyConfig;
}

const formatBillions = (value: number) => `$${value.toFixed(1)}B`;
const formatTrillions = (value: number) => `$${value.toFixed(2)}T`;

export default function Charts({ result }: ChartsProps) {
  const obligationsData = [
    { name: 'BEL', value: (result.obligations.ubiCost ?? 0) / 1e9 },
    { name: 'Retirement', value: (result.obligations.retirementProgramCost ?? 0) / 1e9 },
    { name: 'Healthcare (Federal)', value: (result.obligations.healthcareProgramCost ?? 0) / 1e9 },
  ].filter((item) => item.value > 0);

  const revenueData = [
    { name: 'Token Tax Revenue', value: (result.revenue.frictionTaxRevenue ?? 0) / 1e9 },
    { name: 'Income Revenue', value: (result.revenue.incomeTaxRevenue ?? 0) / 1e9 },
  ].filter((item) => item.value > 0);

  const overviewData = [
    { name: 'Revenue', value: result.revenue.totalRevenue / 1e12 },
    { name: 'Obligations', value: result.obligations.totalObligations / 1e12 },
    { name: 'Surplus/Deficit', value: result.balance.surplusDeficit / 1e12 },
  ];

  const obligationColors = ['#facc15', '#38bdf8', '#22d3ee'];
  const revenueColors = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 glow-border-red">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Obligations Breakdown (BEL vs Retirement vs Healthcare)
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={obligationsData.length > 0 ? obligationsData : [{ name: 'BEL', value: 0 }]}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatBillions(value)}`}
              >
                {(obligationsData.length > 0 ? obligationsData : [{ name: 'BEL', value: 0 }]).map((_, index) => (
                  <Cell key={`obligation-cell-${index}`} fill={obligationColors[index % obligationColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatBillions(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 glow-border-green">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Revenue Breakdown (Token Tax vs Income)
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={revenueData.length > 0 ? revenueData : [{ name: 'Token Tax Revenue', value: 0 }]}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatBillions(value)}`}
              >
                {(revenueData.length > 0 ? revenueData : [{ name: 'Token Tax Revenue', value: 0 }]).map((_, index) => (
                  <Cell key={`revenue-cell-${index}`} fill={revenueColors[index % revenueColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatBillions(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-blue">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Surplus/Deficit Overview (Current Scenario)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={overviewData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${Number(value).toFixed(1)}T`} />
            <Tooltip formatter={(value: any) => formatTrillions(Number(value))} />
            <Bar dataKey="value" isAnimationActive={false}>
              {overviewData.map((entry) => {
                const fill =
                  entry.name === 'Revenue'
                    ? '#10b981'
                    : entry.name === 'Obligations'
                      ? '#ef4444'
                      : entry.value >= 0
                        ? '#22c55e'
                        : '#f97316';
                return <Cell key={`overview-cell-${entry.name}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
