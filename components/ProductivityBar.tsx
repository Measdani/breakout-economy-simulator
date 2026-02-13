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

  const getInsights = (score: number) => {
    if (score >= 80) {
      return [
        'Strong work incentives across all earning levels',
        'High income retention for wage earners',
        'No significant marginal penalty spikes'
      ];
    } else if (score >= 60) {
      return [
        'Good work incentives overall',
        'Solid income retention for most workers',
        'Minor disincentives at higher income levels'
      ];
    } else if (score >= 40) {
      return [
        'Moderate work incentives',
        'Policy is functional but could improve',
        'Consider adjusting tax rates for better retention'
      ];
    } else {
      return [
        'Weak work incentives',
        'Significant marginal rate concerns',
        'Workers may be discouraged from earning more'
      ];
    }
  };

  const insights = getInsights(incentiveScore);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {/* Header with Large Score */}
        <div className="text-center space-y-3">
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
            lineHeight: '1',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {incentiveScore.toFixed(0)}%
          </div>
          <p className={`text-lg font-bold px-4 py-2 rounded-full inline-block ${
            incentiveScore >= 80 ? 'bg-green-100 text-green-800' :
            incentiveScore >= 60 ? 'bg-cyan-100 text-cyan-800' :
            incentiveScore >= 40 ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {getStatusText(incentiveScore)}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Higher = stronger incentive to work
          </p>
        </div>

        {/* Visual Meter */}
        <div className="space-y-2">
          <div className="relative w-full bg-slate-100 rounded-full h-6 overflow-hidden shadow-sm">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getColor(incentiveScore)} transition-all duration-700 ease-out`}
              style={{ width: `${incentiveScore}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-3">
              {incentiveScore > 15 && (
                <span className="text-xs font-bold text-white drop-shadow">
                  {incentiveScore.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-3 border-t border-slate-200 pt-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Key Insights
          </p>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg">
                <span className="text-xl font-bold flex-shrink-0" style={{ color: '#10b981' }}>✓</span>
                <span className="text-sm font-medium text-slate-800">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retention by Income Transition */}
        <div className="space-y-3 border-t border-slate-200 pt-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Retention by Income Transition
          </p>
          <div className="space-y-4">
            {personas.map((persona, idx) => {
              const nextPersona = personas[idx + 1];
              if (!nextPersona) return null;

              const incomeDiff = nextPersona.earnedIncome - persona.earnedIncome;
              const netDiff = nextPersona.netIncome - persona.netIncome;
              const retention = (netDiff / incomeDiff) * 100;

              return (
                <div key={persona.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-800">
                      {persona.label} → {nextPersona.label}
                    </span>
                    <span className="text-xl font-bold" style={{ color: '#10b981' }}>
                      {retention.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-sm">
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
    </div>
  );
}
