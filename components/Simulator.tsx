'use client';

import { useState, useMemo } from 'react';
import { runSimulation } from '../lib/engine';
import type { PolicyConfig, SimulationResult } from '../lib/types';
import PolicySliders from './PolicySliders';
import ResultsDisplay from './ResultsDisplay';
import PersonaTable from './PersonaTable';
import PresetScenarios from './PresetScenarios';
import Charts from './Charts';
import PersonaComparison from './PersonaComparison';
import Glossary from './Glossary';
import OnboardingTour from './OnboardingTour';

const DEFAULT_CONFIG: PolicyConfig = {
  tokenTaxRate: 0.0035,
  flowBaseAnnual: 1e15,
  ubiAnnualPerAdult: 12000,
  adultPopulation: 265000000,
  welfareSavingsCredit: 630e9,
  govtOperatingRequirement: 2.74e12,
  breakoutPoint: 60000,
  tier1Rate: 0.19,
  tier1Start: 60000,
  tier2Rate: 0.29,
  tier2Start: 135000,
  supplementApexIncome: 24000,
  supplementApexBonus: 6000,
  personaWeights: [0.25, 0.25, 0.25, 0.25],
};

export default function Simulator() {
  const [tokenTaxRate, setTokenTaxRate] = useState(DEFAULT_CONFIG.tokenTaxRate);
  const [ubiAnnualPerAdult, setUbiAnnualPerAdult] = useState(
    DEFAULT_CONFIG.ubiAnnualPerAdult
  );
  const [breakoutPoint, setBreakoutPoint] = useState(DEFAULT_CONFIG.breakoutPoint);
  const [showTour, setShowTour] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'controls' | 'scenarios' | 'results' | 'charts' | 'personas' | 'income' | 'warnings'>('controls');
  const [currentConfig, setCurrentConfig] = useState<string>('Default');

  const handlePresetSelectWithName = (presetName: string, presetConfig: Partial<PolicyConfig>) => {
    setCurrentConfig(presetName);
    handlePresetSelect(presetConfig);
  };

  const config: PolicyConfig = {
    ...DEFAULT_CONFIG,
    tokenTaxRate,
    ubiAnnualPerAdult,
    breakoutPoint,
  };

  const result: SimulationResult = useMemo(() => runSimulation(config), [config]);

  const handlePresetSelect = (presetConfig: Partial<PolicyConfig>) => {
    if (presetConfig.tokenTaxRate) setTokenTaxRate(presetConfig.tokenTaxRate);
    if (presetConfig.ubiAnnualPerAdult) setUbiAnnualPerAdult(presetConfig.ubiAnnualPerAdult);
    if (presetConfig.breakoutPoint) setBreakoutPoint(presetConfig.breakoutPoint);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-purple-300 px-4 py-8 flex items-center justify-center">
      <div className="w-full" style={{ maxWidth: '500px' }}>
        {/* Onboarding Tour */}
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

        {/* Tablet Case/Bezel Frame */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-4 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Tablet Container */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Header - Polished */}
          <div className="bg-white px-5 py-6">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-slate-900">Policy Flight Simulator</h1>
              <p className="text-xs text-slate-400 mt-0.5">Breakout Economy Model v0.2</p>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tokenTaxRate > ubiAnnualPerAdult / 1000000 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="text-xs text-slate-500">Configuration:</span>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{currentConfig}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Tab Navigation */}
          <div className="flex border-b border-purple-100 px-2">
            <button
              onClick={() => setActiveScreen('controls')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'controls'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={() => setActiveScreen('scenarios')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'scenarios'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚡
            </button>
            <button
              onClick={() => setActiveScreen('results')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'results'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setActiveScreen('charts')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'charts'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📈
            </button>
          </div>

          {/* Screen Content - With Background */}
          <div className="p-6 min-h-80 bg-slate-50">
            {/* Controls Screen */}
            {activeScreen === 'controls' && (
              <div className="space-y-8">
                <PolicySliders
                  tokenTaxRate={tokenTaxRate}
                  onTokenTaxRateChange={setTokenTaxRate}
                  ubiAnnualPerAdult={ubiAnnualPerAdult}
                  onUbiChange={setUbiAnnualPerAdult}
                  breakoutPoint={breakoutPoint}
                  onBreakoutPointChange={setBreakoutPoint}
                />
              </div>
            )}

            {/* Scenarios Screen */}
            {activeScreen === 'scenarios' && (
              <div className="space-y-6">
                <PresetScenarios onSelectPreset={(config, presetName) => {
                  if (presetName) setCurrentConfig(presetName);
                  handlePresetSelect(config);
                }} />
              </div>
            )}

            {/* Results Screen */}
            {activeScreen === 'results' && (
              <div className="space-y-6">
                <ResultsDisplay result={result} />
              </div>
            )}

            {/* Charts Screen */}
            {activeScreen === 'charts' && (
              <div>
                <Charts result={result} config={config} />
              </div>
            )}
          </div>

          {/* Footer Navigation - Enhanced */}
          <div className="px-5 py-4 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={() => {
                const screens: Array<typeof activeScreen> = ['controls', 'scenarios', 'results', 'charts'];
                const current = screens.indexOf(activeScreen);
                if (current > 0) setActiveScreen(screens[current - 1]);
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition"
            >
              ← Back
            </button>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-1 items-center">
                {['controls', 'scenarios', 'results', 'charts'].map((screen, idx) => (
                  <span key={screen} className={`text-sm ${activeScreen === screen || ['controls', 'scenarios', 'results', 'charts'].indexOf(activeScreen) > idx ? 'text-slate-700' : 'text-slate-300'}`}>
                    {activeScreen === screen || ['controls', 'scenarios', 'results', 'charts'].indexOf(activeScreen) > idx ? '●' : '○'}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Step {['controls', 'scenarios', 'results', 'charts'].indexOf(activeScreen) + 1} — {
                  activeScreen === 'controls' ? 'Configure' :
                  activeScreen === 'scenarios' ? 'Quick Scenarios' :
                  activeScreen === 'results' ? 'Results' :
                  'Visualize'
                }
              </span>
            </div>
            <button
              onClick={() => {
                const screens: Array<typeof activeScreen> = ['controls', 'scenarios', 'results', 'charts'];
                const current = screens.indexOf(activeScreen);
                if (current < screens.length - 1) setActiveScreen(screens[current + 1]);
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Glossary Button */}
        <Glossary />
        </div>
        {/* Close Tablet Case */}




      </div>
    </div>
  );
}
