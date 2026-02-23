'use client';

import { useState, useEffect } from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('seenOnboardingTour');
    if (hasSeenTour) {
      setIsVisible(false);
    }
  }, []);

  const steps = [
    {
      title: '🚀 Welcome to NAERM (The National AI Economy Resiliency Model)',
      description:
        'This interactive tool lets you explore how a UBI + Token Tax system could build economic resilience in the AI era. Adjust the sliders and see the impact in real-time!',
      highlight: null,
    },
    {
      title: '⚙️ Step 1: Adjust Policy Parameters',
      description:
        'Use the three sliders to change: Token Tax Rate (tax on electronic transactions), UBI Floor (annual income), and Breakout Point (where benefits end).',
      highlight: 'policy-sliders',
    },
    {
      title: '📊 Step 2: Check Fiscal Health',
      description:
        'Watch the big green or red indicator — green means the budget is solvent (revenues exceed obligations). Red means deficit.',
      highlight: 'solvency-indicator',
    },
    {
      title: '👥 Step 3: Explore Persona Outcomes',
      description:
        'See how four different income levels (Starter, Professional, Manager, Executive) are affected by your policy choices. Net income always increases with work.',
      highlight: 'persona-table',
    },
    {
      title: '📈 Step 4: View Charts',
      description:
        'Scroll down to see where revenue comes from, where money goes, and how the supplement curve works. Visual understanding!',
      highlight: null,
    },
    {
      title: '💡 Pro Tips',
      description:
        'Try preset scenarios for inspiration. Click the ? button for a glossary. Look for tooltips (hover over terms). No pressure — explore freely!',
      highlight: null,
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('seenOnboardingTour', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 cursor-pointer pointer-events-auto" onClick={handleComplete} />

      {/* Tutorial Card */}
      <div className="relative z-50 w-11/12 md:w-96 mx-4 pointer-events-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8 pointer-events-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-600">
                Step {step + 1} of {steps.length}
              </p>
              <button
                onClick={handleComplete}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{currentStep.title}</h2>
          <p className="text-slate-700 mb-6 leading-relaxed">{currentStep.description}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {step === steps.length - 1 ? 'Done! ✓' : 'Next →'}
            </button>
          </div>

          {/* Skip Option */}
          <button
            onClick={handleComplete}
            className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
