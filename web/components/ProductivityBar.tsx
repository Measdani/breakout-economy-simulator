'use client';

import type { PersonaOutcome } from '@/lib/types';

interface ProductivityBarProps {
  personas: PersonaOutcome[];
}

export default function ProductivityBar({ personas }: ProductivityBarProps) {
  // Calculate average work incentive (retention rate) across all persona transitions
  const getAverageIncentive = () => {
    if (personas.length < 2) return 0;

    let totalRetention = 0;
    let count = 0;

    for (let i = 0; i < personas.length - 1; i++) {
      const current = personas[i];
      const next = personas[i + 1];
      const incomeDiff = next.earnedIncome - current.earnedIncome;
      const netDiff = next.netIncome - current.netIncome;

      if (incomeDiff > 0) {
        const retention = (netDiff / incomeDiff) * 100;
        totalRetention += retention;
        count++;
      }
    }

    return count > 0 ? totalRetention / count : 0;
  };

  const averageIncentive = getAverageIncentive();
  const incentiveScore = Math.min(100, Math.max(0, averageIncentive));

  // Calculate key metric: net income increase from lowest to highest earner
  const getNetIncomeIncrease = () => {
    const starter = personas[0];
    const executive = personas[personas.length - 1];
    return ((executive.netIncome / starter.netIncome) - 1) * 100;
  };

  const netIncomeIncrease = getNetIncomeIncrease();

  // Determine color and status based on incentive level
  const getColor = (score: number) => {
    if (score >= 80) return 'from-green-600 to-green-400';
    if (score >= 60) return 'from-emerald-600 to-emerald-400';
    if (score >= 40) return 'from-yellow-600 to-yellow-400';
    return 'from-orange-600 to-orange-400';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getShortInsights = (score: number) => {
    if (score >= 80) {
      return [
        'Strong incentives across all levels',
        'High income retention',
        'No penalty spikes'
      ];
    } else if (score >= 60) {
      return [
        'Good incentives overall',
        'Solid retention for most',
        'Minor upper-income disincentives'
      ];
    } else if (score >= 40) {
      return [
        'Moderate incentives',
        'Functional but improvable',
        'Review tax rates'
      ];
    } else {
      return [
        'Weak incentives',
        'Marginal rate concerns',
        'May discourage earning'
      ];
    }
  };

  const insights = getShortInsights(incentiveScore);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-5 glow-border-green">
      {/* Header with Large Score */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Work Incentive Score
        </p>
        <div style={{
          fontSize: '64px',
          fontWeight: '900',
          color: incentiveScore >= 80 ? '#10b981' :
                 incentiveScore >= 60 ? '#06b6d4' :
                 incentiveScore >= 40 ? '#f59e0b' :
                 '#ef4444',
          lineHeight: '1'
        }}>
          {incentiveScore.toFixed(0)}%
        </div>
        <p className={`text-sm font-bold px-3 py-1.5 rounded-full inline-block ${
          incentiveScore >= 80 ? 'bg-green-100 text-green-800' :
          incentiveScore >= 60 ? 'bg-cyan-100 text-cyan-800' :
          incentiveScore >= 40 ? 'bg-amber-100 text-amber-800' :
          'bg-red-100 text-red-800'
        }`}>
          {getStatusText(incentiveScore)}
        </p>
      </div>

      {/* Visual Meter */}
      <div className="space-y-2">
        <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getColor(incentiveScore)} transition-all duration-700 ease-out`}
            style={{ width: `${incentiveScore}%` }}
          />
        </div>
      </div>

      {/* Key Insights */}
      <div className="space-y-2 pt-4 bg-green-50 rounded-lg p-3" style={{ borderTop: '2px solid #10b981', boxShadow: 'inset 0 1px 0 rgba(16, 185, 129, 0.3)' }}>
        <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
          Key Insights
        </p>
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="font-bold flex-shrink-0 text-green-600 text-lg">✓</span>
              <span className="text-xs font-semibold text-slate-800">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metric: Net Income Increase */}
      <div className="bg-blue-600 rounded-lg p-4" style={{ border: '2px solid #0d47a1', borderTop: '3px solid #06b6d4', boxShadow: 'inset 0 1px 0 rgba(6, 182, 212, 0.5)' }}>
        <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">
          Net Income Impact
        </p>
        <p className="text-4xl font-bold text-white">{netIncomeIncrease.toFixed(0)}%</p>
        <p className="text-xs text-blue-100 mt-1">increase from lowest to highest earner</p>
      </div>

      {/* Retention by Income Transition */}
      <div className="space-y-3 pt-4" style={{ borderTop: '2px solid #3b82f6', boxShadow: 'inset 0 1px 0 rgba(59, 130, 246, 0.3)' }}>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
          Retention by Transition
        </p>
        <div className="space-y-3">
          {personas.map((persona, idx) => {
            const nextPersona = personas[idx + 1];
            if (!nextPersona) return null;

            const incomeDiff = nextPersona.earnedIncome - persona.earnedIncome;
            const netDiff = nextPersona.netIncome - persona.netIncome;
            const retention = (netDiff / incomeDiff) * 100;

            return (
              <div key={persona.label} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {persona.label} → {nextPersona.label}
                  </span>
                  <span className="text-base font-bold text-blue-600">
                    {retention.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2.5 overflow-hidden shadow-sm">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, retention)}%`,
                      background: 'linear-gradient(to right, #3b82f6, #10b981)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
