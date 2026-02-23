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
import OnboardingTour from './OnboardingTour';
import Warnings from './Warnings';
import GlossaryPanel from './GlossaryPanel';
import SubmitModal from './SubmitModal';
import FeedbackModal from './FeedbackModal';
import NavButtons from './NavButtons';

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

interface SimulatorProps {
  initialConfig?: Partial<PolicyConfig>
}

export default function Simulator({ initialConfig }: SimulatorProps = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...initialConfig }
  const [tokenTaxRate, setTokenTaxRate] = useState(mergedConfig.tokenTaxRate);
  const [ubiAnnualPerAdult, setUbiAnnualPerAdult] = useState(
    mergedConfig.ubiAnnualPerAdult
  );
  const [breakoutPoint, setBreakoutPoint] = useState(mergedConfig.breakoutPoint);
  const [ubiDependent1, setUbiDependent1] = useState(mergedConfig.ubiDependent1 ?? 6000);
  const [ubiDependent2, setUbiDependent2] = useState(mergedConfig.ubiDependent2 ?? 4000);
  const [ubiDependent3, setUbiDependent3] = useState(mergedConfig.ubiDependent3 ?? 2000);
  const [pctHouseholds1Dep, setPctHouseholds1Dep] = useState(mergedConfig.pctHouseholds1Dep ?? 0.25);
  const [pctHouseholds2Dep, setPctHouseholds2Dep] = useState(mergedConfig.pctHouseholds2Dep ?? 0.15);
  const [pctHouseholds3Dep, setPctHouseholds3Dep] = useState(mergedConfig.pctHouseholds3Dep ?? 0.10);
  const [showTour, setShowTour] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'controls' | 'scenarios' | 'results' | 'charts' | 'personas'>('controls');
  const [currentConfig, setCurrentConfig] = useState<string>('Default');
  const [viewMode, setViewMode] = useState<'revenue' | 'social' | 'incentives'>('revenue');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const handlePresetSelectWithName = (presetName: string, presetConfig: Partial<PolicyConfig>) => {
    setCurrentConfig(presetName);
    handlePresetSelect(presetConfig);
  };

  const config: PolicyConfig = {
    ...DEFAULT_CONFIG,
    tokenTaxRate,
    ubiAnnualPerAdult,
    breakoutPoint,
    ubiDependent1,
    ubiDependent2,
    ubiDependent3,
    pctHouseholds1Dep,
    pctHouseholds2Dep,
    pctHouseholds3Dep,
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
    setUbiDependent1(6000);
    setUbiDependent2(4000);
    setUbiDependent3(2000);
    setPctHouseholds1Dep(0.25);
    setPctHouseholds2Dep(0.15);
    setPctHouseholds3Dep(0.10);
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
              <p className="text-xs text-muted mt-0.5">Breakout Economy Model v1.1</p>
            </div>

            <div className="border-t border-border-slate pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tokenTaxRate > ubiAnnualPerAdult / 1000000 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-muted">Configuration:</span>
                  <span className="text-xs font-medium text-bright bg-darker-slate px-2.5 py-1 rounded-full border border-border-slate">{currentConfig}</span>
                </div>
                <NavButtons />
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
              <div className="grid grid-cols-6 gap-6 h-full">
                {/* LEFT: Configuration Sliders (33%) */}
                <div className="col-span-2 overflow-y-auto pr-2">
                  <PolicySliders
                    tokenTaxRate={tokenTaxRate}
                    onTokenTaxRateChange={setTokenTaxRate}
                    ubiAnnualPerAdult={ubiAnnualPerAdult}
                    onUbiChange={setUbiAnnualPerAdult}
                    breakoutPoint={breakoutPoint}
                    onBreakoutPointChange={setBreakoutPoint}
                    ubiDependent1={ubiDependent1}
                    onUbiDep1Change={setUbiDependent1}
                    ubiDependent2={ubiDependent2}
                    onUbiDep2Change={setUbiDependent2}
                    ubiDependent3={ubiDependent3}
                    onUbiDep3Change={setUbiDependent3}
                    pctHouseholds1Dep={pctHouseholds1Dep}
                    onPct1Change={setPctHouseholds1Dep}
                    pctHouseholds2Dep={pctHouseholds2Dep}
                    onPct2Change={setPctHouseholds2Dep}
                    pctHouseholds3Dep={pctHouseholds3Dep}
                    onPct3Change={setPctHouseholds3Dep}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onReset={handleReset}
                    showGlossary={showGlossary}
                    onGlossaryToggle={setShowGlossary}
                  />
                </div>

                {/* MIDDLE: Mode-Specific Fiscal Status Panel (50%) */}
                <div
                  className={`col-span-2 rounded-lg p-8 text-white overflow-y-auto view-transition ${
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

                        {/* Real Purchasing Power Hero Indicator */}
                        {result.balance.surplusDeficit < 0 && (
                          <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: 'rgba(249, 115, 22, 0.15)',
                            borderRadius: '8px',
                            border: '1px solid #FB923C'
                          }}>
                            <p style={{ fontSize: '10px', color: '#FB923C', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Real Purchasing Power (Adjusted)
                            </p>
                            <p style={{
                              fontSize: '28px',
                              fontWeight: '700',
                              color: '#FB923C',
                              margin: '0'
                            }}>
                              ${(((result.citizenModel.personaOutcomes[0].ubi + result.citizenModel.personaOutcomes[0].supplement) * (1 - Math.abs(result.balance.surplusDeficit) / result.obligations.totalObligations)) / 1000).toFixed(1)}K
                            </p>
                            <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                              if deficit sustained via money creation
                            </p>
                          </div>
                        )}
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

                          {/* Real Purchasing Power Indicator */}
                          {result.balance.surplusDeficit < 0 && (
                            <div style={{
                              padding: '12px',
                              background: 'rgba(249, 115, 22, 0.1)',
                              borderRadius: '6px',
                              border: '1px solid #FB923C',
                              marginTop: '8px'
                            }}>
                              <p style={{ fontSize: '11px', color: '#FB923C', fontWeight: '600', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Real Purchasing Power (Inflation-Adjusted)
                              </p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>If deficit sustained:</span>
                                <span style={{
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  color: '#FB923C'
                                }}>
                                  ${(ubiAnnualPerAdult * (1 - Math.abs(result.balance.surplusDeficit) / result.obligations.totalObligations) / 1000).toFixed(1)}K
                                </span>
                              </div>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                                Nominal value eroded by {(Math.abs(result.balance.surplusDeficit) / result.obligations.totalObligations * 100).toFixed(1)}% estimated inflation
                              </p>
                            </div>
                          )}

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

                {/* RIGHT: Warnings & Alerts Panel (17%) */}
                <div className="col-span-2 overflow-y-auto">
                  <div className="bg-darker-slate rounded-lg p-6 border border-border-slate" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Household Demographics Impact Section */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          👨‍👩‍👧‍👦 Household Impact
                        </h3>
                        {(() => {
                          // Calculate dependent metrics
                          const numHH = 130000000;
                          const tier1Count = numHH * (pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep);
                          const tier2Count = numHH * (pctHouseholds2Dep + pctHouseholds3Dep);
                          const tier3Count = numHH * pctHouseholds3Dep;
                          const dependentCost = tier1Count * ubiDependent1 + tier2Count * ubiDependent2 + tier3Count * ubiDependent3;
                          const totalDependentPopulation = numHH * (pctHouseholds1Dep + pctHouseholds2Dep * 2 + pctHouseholds3Dep * 3);
                          const adultUBICost = ubiAnnualPerAdult * 265000000;
                          const totalUBICost = adultUBICost + dependentCost;
                          const percentOfBudget = (dependentCost / totalUBICost) * 100;

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                              {/* Dependent UBI Cost */}
                              <div style={{
                                background: 'rgba(34, 197, 94, 0.08)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '8px',
                                padding: '12px'
                              }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                                  Dependent UBI Cost
                                </p>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', margin: '0' }}>
                                  ${(dependentCost / 1e12).toFixed(2)}T
                                </p>
                              </div>

                              {/* % of Total UBI Budget */}
                              <div style={{
                                background: 'rgba(59, 130, 246, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                padding: '12px'
                              }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                                  % of Total UBI Budget
                                </p>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6', margin: '0' }}>
                                  {percentOfBudget.toFixed(1)}%
                                </p>
                              </div>

                              {/* Total Dependent Population */}
                              <div style={{
                                background: 'rgba(168, 85, 247, 0.08)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '8px',
                                padding: '12px'
                              }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                                  Total Dependents
                                </p>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: '#a855f7', margin: '0' }}>
                                  {(totalDependentPopulation / 1e6).toFixed(1)}M
                                </p>
                              </div>

                              {/* Dependent Coverage Rate */}
                              <div style={{
                                background: 'rgba(251, 146, 60, 0.08)',
                                border: '1px solid rgba(251, 146, 60, 0.3)',
                                borderRadius: '8px',
                                padding: '12px'
                              }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                                  Households w/ Dependents
                                </p>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: '#fb923c', margin: '0' }}>
                                  {((pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Policy Alerts Section */}
                      <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ⚡ Policy Alerts
                        </h3>
                        <Warnings result={result} config={config} />
                      </div>

                      {/* Glossary Section - Conditional */}
                      {showGlossary && (
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
                          <GlossaryPanel />
                        </div>
                      )}
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
              ) : <div style={{ width: '90px' }} />;
            })()}
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
            {activeScreen !== 'personas' && (
              <button
                onClick={() => {
                  const screens = ['controls', 'scenarios', 'results', 'charts', 'personas'] as const;
                  const current = screens.indexOf(activeScreen as any);
                  if (current < screens.length - 1) setActiveScreen(screens[current + 1] as typeof activeScreen);
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
            )}
            {activeScreen === 'personas' && <div style={{ width: '90px' }} />}
          </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {activeScreen === 'personas' && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-3 rounded transition hover:shadow-lg"
                  style={{
                    background: '#0F172A',
                    color: '#00D9FF',
                    border: '2px solid #00D9FF',
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    textShadow: '0 0 8px rgba(0, 217, 255, 0.6)',
                    boxShadow: '0 0 12px rgba(0, 217, 255, 0.4), inset 0 0 12px rgba(0, 217, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6), inset 0 0 12px rgba(0, 217, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 217, 255, 0.4), inset 0 0 12px rgba(0, 217, 255, 0.1)';
                  }}
                >
                  📤 Submit
                </button>
              )}
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-5 py-3 rounded transition hover:shadow-lg"
                style={{
                  background: '#0F172A',
                  color: '#00D9FF',
                  border: '2px solid #00D9FF',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                  textShadow: '0 0 8px rgba(0, 217, 255, 0.6)',
                  boxShadow: '0 0 12px rgba(0, 217, 255, 0.4), inset 0 0 12px rgba(0, 217, 255, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6), inset 0 0 12px rgba(0, 217, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 217, 255, 0.4), inset 0 0 12px rgba(0, 217, 255, 0.1)';
                }}
              >
                📝 Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        config={config}
        result={result}
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        configName={currentConfig}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        config={config}
        result={result}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        configName={currentConfig}
      />
    </div>
  );
}
