'use client';

import type { SimulationResult } from '../lib/types';

interface FiscalSustainabilityIndicatorProps {
  result: SimulationResult;
}

type IndicatorTone = 'positive' | 'neutral' | 'caution' | 'negative';

interface IndicatorState {
  status: string;
  tone: IndicatorTone;
  selected?: boolean;
}

function getToneClasses(tone: IndicatorTone) {
  if (tone === 'positive') {
    return {
      card: 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.22)]',
      badge: 'border-emerald-300/80 bg-emerald-400/25 text-emerald-100',
      dot: 'bg-emerald-300',
    };
  }

  if (tone === 'neutral') {
    return {
      card: 'border-sky-400/45 bg-sky-500/8',
      badge: 'border-sky-300/70 bg-sky-400/20 text-sky-100',
      dot: 'bg-sky-300',
    };
  }

  if (tone === 'caution') {
    return {
      card: 'border-amber-400/55 bg-amber-500/10',
      badge: 'border-amber-300/80 bg-amber-400/22 text-amber-100',
      dot: 'bg-amber-300',
    };
  }

  return {
    card: 'border-rose-400/60 bg-rose-500/10',
    badge: 'border-rose-300/80 bg-rose-400/24 text-rose-100',
    dot: 'bg-rose-300',
  };
}

function IndicatorCard({ title, state }: { title: string; state: IndicatorState }) {
  const tone = getToneClasses(state.tone);
  const selectedCardClass = state.selected
    ? 'ring-2 ring-emerald-300/55 shadow-[0_0_26px_rgba(16,185,129,0.30)]'
    : '';
  const selectedBadgeClass = state.selected
    ? 'border-emerald-200/90 bg-emerald-400/35 text-white'
    : '';

  return (
    <div className={`rounded-lg p-4 border transition-colors ${tone.card} ${selectedCardClass}`}>
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${tone.dot}`} />
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold ${tone.badge} ${selectedBadgeClass}`}
        >
          {state.status}
        </span>
      </div>
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
    ? { status: '\u2713 Stable', tone: 'positive', selected: true }
    : { status: '\u2717 Deficit', tone: 'negative', selected: true };

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
