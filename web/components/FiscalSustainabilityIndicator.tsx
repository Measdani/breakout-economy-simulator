'use client';

import type { SimulationResult } from '../lib/types';

interface FiscalSustainabilityIndicatorProps {
  result: SimulationResult;
}

type IndicatorTone = 'positive' | 'neutral' | 'caution' | 'negative';

interface IndicatorState {
  status: string;
  tone: IndicatorTone;
}

function getToneClasses(tone: IndicatorTone) {
  if (tone === 'positive') {
    return {
      card: 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.22)]',
    };
  }

  if (tone === 'neutral') {
    return {
      card: 'border-sky-400/45 bg-sky-500/8',
    };
  }

  if (tone === 'caution') {
    return {
      card: 'border-amber-400/55 bg-amber-500/10',
    };
  }

  return {
    card: 'border-rose-400/60 bg-rose-500/10',
  };
}

function IndicatorCard({ title, state }: { title: string; state: IndicatorState }) {
  const tone = getToneClasses(state.tone);

  return (
    <div className={`rounded-lg p-4 border transition-colors ${tone.card}`}>
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{title}</p>
      <p className={`text-2xl font-semibold leading-none text-[#00D9FF] drop-shadow-[0_0_8px_rgba(0,217,255,0.7)]`}>
        {state.status}
      </p>
    </div>
  );
}

export default function FiscalSustainabilityIndicator({
  result,
}: FiscalSustainabilityIndicatorProps) {
  const { balance, revenue } = result;
  const surplusDeficit = balance.surplusDeficit;
  const isSolvent = balance.isSolvent;
  const totalRevenue = revenue.totalRevenue;

  const deficitPercentage = Math.abs(surplusDeficit) / totalRevenue;

  const structuralBalance: IndicatorState = isSolvent
    ? { status: 'Stable', tone: 'positive' }
    : { status: 'X Deficit', tone: 'negative' };

  const debtTrajectory: IndicatorState =
    isSolvent && surplusDeficit > totalRevenue * 0.05
      ? { status: 'Improving', tone: 'positive' }
      : isSolvent && surplusDeficit > 0
      ? { status: 'Neutral', tone: 'neutral' }
      : !isSolvent && deficitPercentage < 0.03
      ? { status: 'Cautionary', tone: 'caution' }
      : { status: 'Deteriorating', tone: 'negative' };

  const inflationRisk: IndicatorState = isSolvent
    ? { status: 'Minimal', tone: 'positive' }
    : deficitPercentage < 0.015
    ? { status: 'Low', tone: 'neutral' }
    : deficitPercentage < 0.05
    ? { status: 'Moderate', tone: 'caution' }
    : { status: 'High', tone: 'negative' };

  return (
    <div className="bg-dark-slate rounded-lg p-6 border border-border-slate">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Fiscal Sustainability Indicators
      </p>
      <div className="grid grid-cols-3 gap-4">
        <IndicatorCard title="Structural Balance" state={structuralBalance} />
        <IndicatorCard title="Debt Trajectory" state={debtTrajectory} />
        <IndicatorCard title="Inflation Risk" state={inflationRisk} />
      </div>
    </div>
  );
}
