'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { runSimulation } from '../lib/engine';
import { useAnimatedNumber, numberFormatters } from '../lib/hooks/useAnimatedNumber';
import type { PolicyConfig, SimulationResult } from '../lib/types';
import PolicySliders from './PolicySliders';
import ResultsDisplay from './ResultsDisplay';
import PersonaTable from './PersonaTable';
import PresetScenarios from './PresetScenarios';
import Charts from './Charts';
import PersonaComparison from './PersonaComparison';
import ProductivityBar from './ProductivityBar';
import Glossary from './Glossary';
import OnboardingTour from './OnboardingTour';
import SubmitModal from './SubmitModal';

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
  const [viewMode, setViewMode] = useState<'revenue' | 'social' | 'incentives'>('revenue');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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

  // Animated number displays for hero panel
  const animatedBalance = useAnimatedNumber(
    result.balance.surplusDeficit,
    800,
    numberFormatters.billions
  );
  const animatedRevenue = useAnimatedNumber(
    result.revenue.totalRevenue,
    800,
    numberFormatters.trillions
  );
  const animatedObligations = useAnimatedNumber(
    result.obligations.totalObligations,
    800,
    numberFormatters.trillions
  );
  const animatedUbiCost = useAnimatedNumber(
    result.obligations.ubiCost,
    800,
    numberFormatters.trillions
  );
  const animatedTokenTax = useAnimatedNumber(
    result.revenue.tokenTaxRevenue,
    800,
    numberFormatters.trillions
  );

  const handlePresetSelect = (presetConfig: Partial<PolicyConfig>) => {
    if (presetConfig.tokenTaxRate) setTokenTaxRate(presetConfig.tokenTaxRate);
    if (presetConfig.ubiAnnualPerAdult) setUbiAnnualPerAdult(presetConfig.ubiAnnualPerAdult);
    if (presetConfig.breakoutPoint) setBreakoutPoint(presetConfig.breakoutPoint);
  };

  const handleReset = () => {
    setTokenTaxRate(DEFAULT_CONFIG.tokenTaxRate);
    setUbiAnnualPerAdult(DEFAULT_CONFIG.ubiAnnualPerAdult);
    setBreakoutPoint(DEFAULT_CONFIG.breakoutPoint);
    setViewMode('revenue');
    setCurrentConfig('Default');
    setActiveScreen('controls');
  };

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8 flex items-center justify-center">
      <div className="w-full h-screen flex items-center" style={{ maxWidth: '1000px' }}>
        {/* Onboarding Tour */}
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

        {/* Tablet Case/Bezel Frame */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-4 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Tablet Container */}
          <div className="bg-dark-slate rounded-2xl overflow-hidden shadow-lg flex flex-col h-screen glow-border-slate" style={{ maxHeight: '700px' }}>
          {/* Header - Polished */}
          <div className="bg-darker-slate px-5 py-6 border-b border-border-slate">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-bright">Policy Flight Simulator</h1>
              <p className="text-xs text-muted mt-0.5">Breakout Economy Model v0.2</p>
            </div>

            <div className="border-t border-border-slate pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tokenTaxRate > ubiAnnualPerAdult / 1000000 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-muted">Configuration:</span>
                  <span className="text-xs font-medium text-bright bg-darker-slate px-2.5 py-1 rounded-full border border-border-slate">{currentConfig}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/leaderboard" className="px-3 py-1.5 text-xs font-semibold text-bright bg-purple-600 hover:bg-purple-500 rounded transition">
                    🏆 Leaderboard
                  </Link>
                  <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold text-bright bg-slate-600 hover:bg-slate-500 rounded transition">
                    ⚙️ Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Tab Navigation */}
          <div className="flex border-b border-border-slate px-2 bg-darker-slate">
            <button
              onClick={() => setActiveScreen('controls')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'controls'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white hover:text-white'
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={() => setActiveScreen('scenarios')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'scenarios'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-white hover:text-white'
              }`}
            >
              ⚡
            </button>
            <button
              onClick={() => setActiveScreen('results')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'results'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-white hover:text-white'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setActiveScreen('charts')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'charts'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-white hover:text-white'
              }`}
            >
              📈
            </button>
            <button
              onClick={() => setActiveScreen('personas')}
              className={`py-3 px-4 text-lg transition border-b-2 ${
                activeScreen === 'personas'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-white hover:text-white'
              }`}
            >
              👥
            </button>
          </div>

          {/* Screen Content - With Background */}
          <div className="p-6 flex-1 bg-darker-navy overflow-y-auto">
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
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onReset={handleReset}
                  />
                </div>

                {/* RIGHT: Mode-Specific Fiscal Status Panel (60%) */}
                <div
                  className={`col-span-3 rounded-lg p-8 text-white overflow-y-auto view-transition ${
                    result.balance.surplusDeficit >= 0
                      ? 'bg-dark-slate glow-border-green pulse-glow-green'
                      : 'bg-dark-slate glow-border-red pulse-glow-red'
                  }`}
                  key={viewMode}
                >
                  {/* REVENUE MODE VIEW */}
                  {viewMode === 'revenue' && (
                    <div className="space-y-8">
                      {/* Status Indicator - HERO DISPLAY */}
                      <div>
                        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                          System Status
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-5 h-5 rounded-full pulse-dot ${
                              result.balance.surplusDeficit >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <p className="text-4xl font-bold text-bright">
                            {result.balance.surplusDeficit >= 0 ? 'SOLVENT' : 'DEFICIT'}
                          </p>
                        </div>
                        <p
                          className="font-bold leading-none"
                          style={{
                            fontSize: '60px',
                            color: result.balance.surplusDeficit >= 0 ? '#10B981' : '#EF4444',
                            textShadow: result.balance.surplusDeficit >= 0
                              ? '0 0 20px rgba(16, 185, 129, 0.5)'
                              : '0 0 20px rgba(239, 68, 68, 0.5)'
                          }}
                        >
                          {result.balance.surplusDeficit >= 0 ? '+' : ''}{animatedBalance}
                        </p>
                        <p className="text-xs text-dimmed mt-2 uppercase tracking-wide">
                          Fiscal Balance
                        </p>
                      </div>

                      {/* Revenue Breakdown */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">💰 Revenue Sources</p>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Token Tax</span>
                            <span className="font-semibold text-blue-400">
                              ${animatedTokenTax}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Income Tax</span>
                            <span className="font-semibold text-green-400">
                              ${((result.revenue.incomeTaxRevenue) / 1e9).toFixed(1)}B
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Welfare Savings</span>
                            <span className="font-semibold text-purple-400">
                              ${((result.revenue.welfareSavingsCredit) / 1e9).toFixed(1)}B
                            </span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-border-slate">
                            <span className="text-sm font-bold text-bright">Total Revenue</span>
                            <span className="text-xl font-bold text-emerald-400">
                              ${animatedRevenue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm text-muted uppercase tracking-wide">Revenue</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            ${animatedRevenue}
                          </p>
                        </div>
                        <div className="relative w-full bg-darker-navy rounded-full h-3 overflow-hidden border border-emerald-900">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full slider-track-glow-green transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (result.revenue.totalRevenue / (result.revenue.totalRevenue + result.obligations.totalObligations)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Obligations Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm text-muted uppercase tracking-wide">Obligations</p>
                          <p className="text-2xl font-bold text-orange-400">
                            ${animatedObligations}
                          </p>
                        </div>
                        <div className="relative w-full bg-darker-navy rounded-full h-3 overflow-hidden border border-orange-900">
                          <div
                            className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (result.obligations.totalObligations / (result.revenue.totalRevenue + result.obligations.totalObligations)) * 100)}%`,
                              boxShadow: '0 2px 12px rgba(251, 146, 60, 0.4)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SOCIAL FLOOR MODE VIEW */}
                  {viewMode === 'social' && (
                    <div className="space-y-8">
                      {/* Income Floor Hero */}
                      <div>
                        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                          Guaranteed Income Floor
                        </p>
                        <p
                          className="font-bold leading-none"
                          style={{
                            fontSize: '60px',
                            color: '#10B981',
                            textShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                          }}
                        >
                          ${((result.citizenModel.personaOutcomes[0].ubi + result.citizenModel.personaOutcomes[0].supplement) / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-dimmed mt-2 uppercase tracking-wide">
                          Minimum annual income (UBI + Supplement at $0 earned)
                        </p>
                      </div>

                      {/* UBI Cost and Details */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">📊 Social Floor Details</p>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Base UBI (per adult)</span>
                            <span className="font-semibold text-green-400">
                              ${(ubiAnnualPerAdult / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Max Supplement Bonus</span>
                            <span className="font-semibold text-purple-400">
                              ${(result.citizenModel.personaOutcomes[0].supplement / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Total UBI Cost</span>
                            <span className="font-semibold text-orange-400">
                              ${animatedUbiCost}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Impact on Lowest Earners */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">💝 Impact on Lowest Earners</p>
                        <div className="bg-darker-navy rounded-lg p-5 border border-green-900">
                          <p className="text-xs text-muted mb-2">Net Income Increase for Gig Worker</p>
                          <p className="text-4xl font-bold text-green-400">
                            +{(((result.citizenModel.personaOutcomes[0].netIncome / result.citizenModel.personaOutcomes[0].earnedIncome) - 1) * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-dimmed mt-2">
                            From ${(result.citizenModel.personaOutcomes[0].earnedIncome / 1000).toFixed(0)}K earned
                            to ${(result.citizenModel.personaOutcomes[0].netIncome / 1000).toFixed(0)}K take-home
                          </p>
                        </div>
                      </div>

                      {/* Visual Income Floor Bar */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-3">Income Floor Visualization</p>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-muted">Earned Income</span>
                              <span className="text-xs text-bright">${(result.citizenModel.personaOutcomes[0].earnedIncome / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="relative w-full bg-darker-navy rounded-full h-3 overflow-hidden border border-blue-900">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
                                style={{ width: '40%' }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-muted">Net Income (with UBI+Supplement)</span>
                              <span className="text-xs text-bright">${(result.citizenModel.personaOutcomes[0].netIncome / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="relative w-full bg-darker-navy rounded-full h-3 overflow-hidden border border-green-900">
                              <div
                                className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full slider-track-glow-green"
                                style={{
                                  width: `${Math.min(100, (result.citizenModel.personaOutcomes[0].netIncome / result.citizenModel.personaOutcomes[0].earnedIncome) * 40)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INCENTIVES MODE VIEW */}
                  {viewMode === 'incentives' && (
                    <div className="space-y-8">
                      {/* Work Incentive Score Hero */}
                      <div>
                        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                          Work Incentive Score
                        </p>
                        <p
                          className="font-bold leading-none"
                          style={{
                            fontSize: '60px',
                            color: (() => {
                              const personas = result.citizenModel.personaOutcomes;
                              let totalRetention = 0;
                              let count = 0;
                              for (let i = 0; i < personas.length - 1; i++) {
                                const incomeDiff = personas[i + 1].earnedIncome - personas[i].earnedIncome;
                                const netDiff = personas[i + 1].netIncome - personas[i].netIncome;
                                if (incomeDiff > 0) {
                                  totalRetention += (netDiff / incomeDiff) * 100;
                                  count++;
                                }
                              }
                              const score = count > 0 ? totalRetention / count : 0;
                              return score >= 80 ? '#10b981' : score >= 60 ? '#06b6d4' : score >= 40 ? '#f59e0b' : '#ef4444';
                            })(),
                            textShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                          }}
                        >
                          {(() => {
                            const personas = result.citizenModel.personaOutcomes;
                            let totalRetention = 0;
                            let count = 0;
                            for (let i = 0; i < personas.length - 1; i++) {
                              const incomeDiff = personas[i + 1].earnedIncome - personas[i].earnedIncome;
                              const netDiff = personas[i + 1].netIncome - personas[i].netIncome;
                              if (incomeDiff > 0) {
                                totalRetention += (netDiff / incomeDiff) * 100;
                                count++;
                              }
                            }
                            const score = count > 0 ? totalRetention / count : 0;
                            return score.toFixed(0);
                          })()}%
                        </p>
                        <p className="text-xs text-dimmed mt-2 uppercase tracking-wide">
                          Average income retention across career transitions
                        </p>
                      </div>

                      {/* Retention by Transition */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">📈 Retention by Transition</p>
                        <div className="space-y-3">
                          {result.citizenModel.personaOutcomes.map((persona, idx) => {
                            const nextPersona = result.citizenModel.personaOutcomes[idx + 1];
                            if (!nextPersona) return null;
                            const incomeDiff = nextPersona.earnedIncome - persona.earnedIncome;
                            const netDiff = nextPersona.netIncome - persona.netIncome;
                            const retention = (netDiff / incomeDiff) * 100;
                            return (
                              <div key={persona.label} className="bg-darker-navy rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-bright">
                                    {persona.label} → {nextPersona.label}
                                  </span>
                                  <span className="text-sm font-bold text-blue-400">
                                    {retention.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
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

                      {/* Breakout Point Explanation */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">🎯 Breakout Point Impact</p>
                        <div className="bg-darker-navy rounded-lg p-5 border border-purple-900">
                          <p className="text-xs text-muted mb-2">Supplement phases out at</p>
                          <p className="text-3xl font-bold text-purple-400">
                            ${(breakoutPoint / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-dimmed mt-2">
                            earned income, ensuring smooth transition to self-sufficiency
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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

            {/* Personas Screen */}
            {activeScreen === 'personas' && (
              <div className="space-y-6">
                <ProductivityBar personas={result.citizenModel.personaOutcomes} />
                <PersonaComparison personas={result.citizenModel.personaOutcomes} />
              </div>
            )}
          </div>

          {/* Footer Navigation - Enhanced */}
          <div className="px-5 py-5 border-t border-border-slate bg-bg-dark-slate flex justify-between items-center gap-4" style={{ background: '#1E293B' }}>
            {(() => {
              const screens: Array<typeof activeScreen> = ['controls', 'scenarios', 'results', 'charts', 'personas'];
              const current = screens.indexOf(activeScreen);
              return current > 0 ? (
                <button
                  onClick={() => {
                    if (current > 0) setActiveScreen(screens[current - 1]);
                  }}
                  className="px-5 py-3 rounded transition"
                  style={{
                    background: '#0F172A',
                    color: '#00D9FF',
                    border: '2px solid #00D9FF',
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    textShadow: '0 0 8px rgba(0, 217, 255, 0.6)'
                  }}
                >
                  ← Back
                </button>
              ) : null;
            })()}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-3 rounded transition"
              style={{
                background: '#0F172A',
                color: '#00D9FF',
                border: '2px solid #00D9FF',
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                textShadow: '0 0 8px rgba(0, 217, 255, 0.6)'
              }}
            >
              📤 Submit
            </button>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 items-center">
                {['controls', 'scenarios', 'results', 'charts', 'personas'].map((screen, idx) => {
                  const isActive = activeScreen === screen || ['controls', 'scenarios', 'results', 'charts', 'personas'].indexOf(activeScreen) > idx;
                  return (
                    <span
                      key={screen}
                      className="text-xl font-bold"
                      style={{ color: isActive ? '#00D9FF' : '#555555', textShadow: isActive ? '0 0 8px #00D9FF' : 'none' }}
                    >
                      {isActive ? '●' : '○'}
                    </span>
                  );
                })}
              </div>
              <span className="text-sm text-white font-bold">
                Step {['controls', 'scenarios', 'results', 'charts', 'personas'].indexOf(activeScreen) + 1} — {
                  activeScreen === 'controls' ? 'Configure' :
                  activeScreen === 'scenarios' ? 'Quick Scenarios' :
                  activeScreen === 'results' ? 'Results' :
                  activeScreen === 'charts' ? 'Visualize' :
                  'Compare Personas'
                }
              </span>
            </div>
            <button
              onClick={() => {
                const screens: Array<typeof activeScreen> = ['controls', 'scenarios', 'results', 'charts', 'personas'];
                const current = screens.indexOf(activeScreen);
                if (current < screens.length - 1) setActiveScreen(screens[current + 1]);
              }}
              className="px-5 py-3 rounded transition"
              style={{
                background: '#0F172A',
                color: '#00D9FF',
                border: '2px solid #00D9FF',
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                textShadow: '0 0 8px rgba(0, 217, 255, 0.6)'
              }}
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

      {/* Submit Modal */}
      <SubmitModal
        config={config}
        result={result}
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
