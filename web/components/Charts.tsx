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
  ComposedChart,
} from 'recharts';
import type { SimulationResult, PolicyConfig } from '@/lib/types';
import { calculateSupplement } from '@/lib/engine';
import { TERMINOLOGY } from '@/lib/terminology';

interface ChartsProps {
  result: SimulationResult;
  config: PolicyConfig;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function Charts({ result, config }: ChartsProps) {
  // Revenue Chart Data
  const revenueData = [
    {
      name: TERMINOLOGY.REVENUE_TOKEN_TAX,
      value: result.revenue.tokenTaxRevenue / 1e9,
    },
    {
      name: TERMINOLOGY.REVENUE_INCOME_TAX,
      value: result.revenue.incomeTaxRevenue / 1e9,
    },
    {
      name: TERMINOLOGY.REVENUE_WELFARE_SAVINGS,
      value: result.revenue.welfareSavingsCredit / 1e9,
    },
  ];

  // Obligations Chart Data
  const obligationsData = [
    ...(result.obligations.adultUBICost ? [{
      name: TERMINOLOGY.BEL_ADULT_COST,
      value: result.obligations.adultUBICost / 1e9,
    }] : [{
      name: TERMINOLOGY.BEL_TOTAL_COST,
      value: result.obligations.ubiCost / 1e9,
    }]),
    ...(result.obligations.dependentUBICost && result.obligations.dependentUBICost > 0 ? [{
      name: TERMINOLOGY.BEL_DEPENDENT_COST,
      value: result.obligations.dependentUBICost / 1e9,
    }] : []),
    {
      name: TERMINOLOGY.OBLIGATIONS_GOVT_OPERATIONS,
      value: result.obligations.govtOperatingRequirement / 1e9,
    },
    ...(result.obligations.retirementProgramCost && result.obligations.retirementProgramCost > 0 ? [{
      name: TERMINOLOGY.RETIREMENT_PROGRAM,
      value: result.obligations.retirementProgramCost / 1e9,
    }] : []),
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

  // Revenue vs Obligations Stacked Bar Chart Data
  const revenueObligationsData = [
    {
      category: 'Budget',
      Revenue: result.revenue.totalRevenue / 1e12,
      Obligations: result.obligations.totalObligations / 1e12,
    },
  ];

  // UBI Cost as % of GDP (assuming GDP ~$28 trillion for US)
  const assumedGDP = 28e12;
  const ubiPercentageGDP = (result.obligations.ubiCost / assumedGDP) * 100;

  // Token Tax Revenue Sensitivity Curve (varying token tax rate from 0.001 to 0.01)
  const tokenTaxSensitivityData = [];
  for (let rate = 0.001; rate <= 0.01; rate += 0.0009) {
    // Revenue scales linearly with tax rate
    const scaledRevenue = result.revenue.tokenTaxRevenue * (rate / config.tokenTaxRate);
    tokenTaxSensitivityData.push({
      rate: Math.round(rate * 10000) / 100, // Convert to basis points (0.1% = 10 bps)
      revenue: scaledRevenue / 1e12,
    });
  }

  const COLORS_REVENUE = ['#3b82f6', '#10b981', '#8b5cf6'];
  const COLORS_OBLIGATIONS = ['#f59e0b', '#a78bfa', '#ef4444', '#38bdf8'];

  const revenueTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0];
      const colors: { [key: string]: string } = {
        [TERMINOLOGY.REVENUE_TOKEN_TAX]: '#60a5fa',
        [TERMINOLOGY.REVENUE_INCOME_TAX]: '#4ade80',
        [TERMINOLOGY.REVENUE_WELFARE_SAVINGS]: '#c084fc'
      };
      return (
        <div style={{ background: '#1e293b', color: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', border: '1px solid #334155' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{data.name}</p>
          <p style={{ color: colors[data.name] || 'white' }}>${data.value.toFixed(1)}B</p>
        </div>
      );
    }
    return null;
  };

  const obligationsTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0];
      const colors: { [key: string]: string } = {
        [TERMINOLOGY.BEL_TOTAL_COST]: '#facc15',
        [TERMINOLOGY.BEL_ADULT_COST]: '#facc15',
        [TERMINOLOGY.BEL_DEPENDENT_COST]: '#d8b4fe',
        [TERMINOLOGY.OBLIGATIONS_GOVT_OPERATIONS]: '#f87171',
        [TERMINOLOGY.RETIREMENT_PROGRAM]: '#38bdf8'
      };
      return (
        <div style={{ background: '#1e293b', color: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', border: '1px solid #334155' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{data.name}</p>
          <p style={{ color: colors[data.name] || 'white' }}>${data.value.toFixed(1)}B</p>
        </div>
      );
    }
    return null;
  };

  const supplementTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      return (
        <div style={{ background: '#1e293b', color: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', border: '1px solid #334155' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>${(props.label / 1000).toFixed(0)}k Income</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: '#4ade80' }}>{TERMINOLOGY.BEL_SHORT}: {formatCurrency(props.payload[0].value)}</p>
            <p style={{ color: '#c084fc' }}>{TERMINOLOGY.SBI_SHORT}: {formatCurrency(props.payload[1].value)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

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
            <Tooltip content={revenueTooltip} />
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
            <Tooltip content={obligationsTooltip} />
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
            <Tooltip content={supplementTooltip} />
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

      {/* Policy-Level Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Obligations Stacked Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 glow-border-purple">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue vs Obligations</h3>
          <p className="text-sm text-slate-600 mb-4">
            Comparison of total revenue and total obligations in trillions.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueObligationsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" />
              <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(2)}T` : ''} />
              <Legend />
              <Bar dataKey="Revenue" stackId="a" fill="#10b981" />
              <Bar dataKey="Obligations" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* UBI Cost as % of GDP */}
        <div className="bg-white rounded-lg shadow-lg p-6 glow-border-green">
          <h3 className="text-lg font-bold text-slate-900 mb-4">UBI Cost as % of GDP</h3>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Estimated based on ~$28 trillion US GDP benchmark.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(ubiPercentageGDP * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {ubiPercentageGDP.toFixed(2)}%
                </p>
                <p className="text-xs text-slate-600">of GDP</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Annual UBI Cost: {formatCurrency(result.obligations.ubiCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Token Tax Revenue Sensitivity Curve */}
      <div className="bg-white rounded-lg shadow-lg p-6 glow-border-blue">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Token Tax Revenue Sensitivity</h3>
        <p className="text-sm text-slate-600 mb-4">
          Shows how token tax revenue scales with different tax rates.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tokenTaxSensitivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rate"
              label={{ value: 'Token Tax Rate (%)', position: 'insideBottomRight', offset: -5 }}
              tickFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <YAxis
              label={{ value: 'Revenue ($T)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${value.toFixed(2)}T`}
            />
            <Tooltip
              formatter={(value: any) => [`$${value.toFixed(3)}T`, 'Revenue']}
              labelFormatter={(label) => `${label.toFixed(2)}% rate`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Token Tax Revenue"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
