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

  // Determine color based on incentive level
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Work Incentive Score</h3>
          <p className="text-sm text-slate-600 mb-4">
            Average income retention across all earning levels. Higher = better incentive to work.
          </p>
        </div>

        {/* Main Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {incentiveScore.toFixed(0)}%
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              incentiveScore >= 80 ? 'bg-green-100 text-green-800' :
              incentiveScore >= 60 ? 'bg-emerald-100 text-emerald-800' :
              incentiveScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {getStatusText(incentiveScore)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getColor(incentiveScore)} transition-all duration-700 ease-out shadow-md`}
              style={{ width: `${incentiveScore}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* What This Means */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-2">What This Means</p>
          <p className="text-sm text-slate-600">
            {incentiveScore >= 80
              ? '✓ Strong work incentives. People keep most additional income they earn.'
              : incentiveScore >= 60
              ? '✓ Good work incentives. People keep a solid portion of additional income.'
              : incentiveScore >= 40
              ? '⚠ Moderate incentives. Policy is workable but could encourage work more.'
              : '✗ Weak work incentives. People may be discouraged from earning more.'}
          </p>
        </div>

        {/* Persona Breakdown */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-3">Retention by Income Level</p>
          <div className="space-y-2">
            {personas.map((persona, idx) => {
              const nextPersona = personas[idx + 1];
              if (!nextPersona) return null;

              const incomeDiff = nextPersona.earnedIncome - persona.earnedIncome;
              const netDiff = nextPersona.netIncome - persona.netIncome;
              const retention = (netDiff / incomeDiff) * 100;

              return (
                <div key={persona.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {persona.label} → {nextPersona.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded"
                        style={{ width: `${Math.max(0, retention)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900 w-12 text-right">
                      {retention.toFixed(0)}%
                    </span>
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
