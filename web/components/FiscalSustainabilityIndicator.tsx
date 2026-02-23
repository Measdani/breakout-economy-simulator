'use client';

import type { SimulationResult } from '../lib/types';

interface FiscalSustainabilityIndicatorProps {
  result: SimulationResult;
}

export default function FiscalSustainabilityIndicator({
  result,
}: FiscalSustainabilityIndicatorProps) {
  const { balance, revenue, obligations } = result;
  const surplusDeficit = balance.surplusDeficit;
  const isSolvent = balance.isSolvent;
  const totalRevenue = revenue.totalRevenue;

  // Calculate deficit magnitude as % of revenue
  const deficitPercentage = Math.abs(surplusDeficit) / totalRevenue;

  // Determine Structural Balance status
  const getStructuralBalance = () => {
    if (isSolvent) {
      return {
        status: '✓ Stable',
        color: 'text-green-400',
        bgColor: 'bg-green-900 bg-opacity-20',
        borderColor: 'border-green-600',
      };
    } else {
      return {
        status: '✗ Deficit',
        color: 'text-red-400',
        bgColor: 'bg-red-900 bg-opacity-20',
        borderColor: 'border-red-600',
      };
    }
  };

  // Determine Debt Trajectory
  const getDebtTrajectory = () => {
    if (isSolvent && surplusDeficit > totalRevenue * 0.05) {
      return {
        status: 'Improving',
        color: 'text-green-400',
        bgColor: 'bg-green-900 bg-opacity-20',
        borderColor: 'border-green-600',
      };
    } else if (isSolvent && surplusDeficit > 0) {
      return {
        status: 'Neutral',
        color: 'text-blue-400',
        bgColor: 'bg-blue-900 bg-opacity-20',
        borderColor: 'border-blue-600',
      };
    } else if (!isSolvent && deficitPercentage < 0.03) {
      return {
        status: 'Cautionary',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900 bg-opacity-20',
        borderColor: 'border-yellow-600',
      };
    } else {
      return {
        status: 'Deteriorating',
        color: 'text-red-400',
        bgColor: 'bg-red-900 bg-opacity-20',
        borderColor: 'border-red-600',
      };
    }
  };

  // Determine Inflation Risk
  const getInflationRisk = () => {
    if (isSolvent) {
      return {
        status: 'Minimal',
        color: 'text-green-400',
        bgColor: 'bg-green-900 bg-opacity-20',
        borderColor: 'border-green-600',
      };
    } else if (deficitPercentage < 0.015) {
      return {
        status: 'Low',
        color: 'text-blue-400',
        bgColor: 'bg-blue-900 bg-opacity-20',
        borderColor: 'border-blue-600',
      };
    } else if (deficitPercentage < 0.05) {
      return {
        status: 'Moderate',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900 bg-opacity-20',
        borderColor: 'border-yellow-600',
      };
    } else {
      return {
        status: 'High',
        color: 'text-red-400',
        bgColor: 'bg-red-900 bg-opacity-20',
        borderColor: 'border-red-600',
      };
    }
  };

  const structuralBalance = getStructuralBalance();
  const debtTrajectory = getDebtTrajectory();
  const inflationRisk = getInflationRisk();

  const IndicatorCard = ({
    title,
    status,
    color,
    bgColor,
    borderColor,
  }: {
    title: string;
    status: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }) => (
    <div
      className={`rounded-lg p-4 border ${borderColor} ${bgColor}`}
    >
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className={`text-lg font-bold ${color}`}>
        {status}
      </p>
    </div>
  );

  return (
    <div className="bg-dark-slate rounded-lg p-6 border border-border-slate">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Fiscal Sustainability Indicators
      </p>
      <div className="grid grid-cols-3 gap-4">
        <IndicatorCard
          title="Structural Balance"
          status={structuralBalance.status}
          color={structuralBalance.color}
          bgColor={structuralBalance.bgColor}
          borderColor={structuralBalance.borderColor}
        />
        <IndicatorCard
          title="Debt Trajectory"
          status={debtTrajectory.status}
          color={debtTrajectory.color}
          bgColor={debtTrajectory.bgColor}
          borderColor={debtTrajectory.borderColor}
        />
        <IndicatorCard
          title="Inflation Risk"
          status={inflationRisk.status}
          color={inflationRisk.color}
          bgColor={inflationRisk.bgColor}
          borderColor={inflationRisk.borderColor}
        />
      </div>
    </div>
  );
}
