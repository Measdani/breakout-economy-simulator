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
      <div className="w-full h-screen flex items-center" style={{ maxWidth: '1000px' }}>
        {/* Onboarding Tour */}
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

        {/* Tablet Case/Bezel Frame */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-4 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Tablet Container */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col h-screen" style={{ maxHeight: '700px' }}>
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
          <div className="p-6 flex-1 bg-slate-50 overflow-hidden">
            {/* Controls Screen - Split Layout */}
            {activeScreen === 'controls' && (
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* LEFT: Configuration Sliders (40%) */}
                <div className="col-span-2 overflow-y-auto pr-2">
                  <PolicySliders
                    tokenTaxRate={tokenTaxRate}
                    onTokenTaxRateChange={setTokenTaxRate}
                    ubiAnnualPerAdult={ubiAnnualPerAdult}
                    onUbiChange={setUbiAnnualPerAdult}
                    breakoutPoint={breakoutPoint}
                    onBreakoutPointChange={setBreakoutPoint}
                  />
                </div>

                {/* RIGHT: Live Fiscal Status Panel (60%) */}
                <div className="col-span-3 bg-slate-900 rounded-lg p-8 text-white overflow-y-auto" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                  <div className="space-y-8">
                    {/* Status Indicator */}
                    <div>
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">System Status</p>
                      <div className="flex items-baseline gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${result.balance.surplusDeficit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <p className="text-3xl font-bold">{result.balance.surplusDeficit >= 0 ? 'SOLVENT' : 'DEFICIT'}</p>
                        </div>
                      </div>
                      <p className="text-4xl font-bold mt-3" style={{ color: result.balance.surplusDeficit >= 0 ? '#10B981' : '#EF4444' }}>
                        {result.balance.surplusDeficit >= 0 ? '+' : ''}{(result.balance.surplusDeficit / 1e9).toFixed(1)}B
                      </p>
                    </div>

                    {/* Revenue & Obligations */}
                    <div className="space-y-4 border-t border-slate-700 pt-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-slate-300">Revenue</p>
                          <p className="text-xl font-bold text-emerald-400">${(result.revenue.totalRevenue / 1e12).toFixed(2)}T</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-slate-300">Obligations</p>
                          <p className="text-xl font-bold text-orange-400">${(result.obligations.totalObligations / 1e12).toFixed(2)}T</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Impact Indicator */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Live Impact</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {result.balance.surplusDeficit >= 0 ? '+' : ''}{(result.balance.surplusDeficit / 1e9).toFixed(1)}B
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Change in fiscal balance</p>
                    </div>

                    {/* Key Metrics Summary */}
                    <div className="space-y-3 border-t border-slate-700 pt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">UBI Cost</span>
                        <span className="font-semibold">${(result.obligations.ubiCost / 1e12).toFixed(2)}T</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Token Tax Revenue</span>
                        <span className="font-semibold text-blue-400">${(result.revenue.tokenTaxRevenue / 1e12).toFixed(2)}T</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tax Rate</span>
                        <span className="font-semibold">{(tokenTaxRate * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
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
