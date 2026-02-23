'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { runSimulation } from '../lib/engine';
import { useAnimatedNumber, numberFormatters } from '../lib/hooks/useAnimatedNumber';
import type { PolicyConfig, SimulationResult } from '../lib/types';
import PolicySliders from './PolicySliders';
import ResultsDisplay from './ResultsDisplay';
import PersonaTable from './PersonaTable';
import Charts from './Charts';
import PersonaComparison from './PersonaComparison';
import ProductivityBar from './ProductivityBar';
import OnboardingTour from './OnboardingTour';
import Warnings from './Warnings';
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
  const [activeScreen, setActiveScreen] = useState<'engine' | 'households' | 'incentives' | 'results' | 'charts' | 'alerts' | 'submit'>('engine');
  const [currentConfig, setCurrentConfig] = useState<string>('Default');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  const screens: Array<typeof activeScreen> = ['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'];
  const stepLabels: Record<string, string> = {
    engine: 'Fiscal Engine',
    households: 'Household Structure',
    incentives: 'Work Incentives',
    results: 'Fiscal Results',
    charts: 'Charts & Scenarios',
    alerts: 'Stability & Risk',
    submit: 'Submit Model',
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
    setCurrentConfig('Default');
    setActiveScreen('engine');
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tokenTaxRate > ubiAnnualPerAdult / 1000000 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                    <span className="text-xs text-muted">Configuration:</span>
                    <span className="text-xs font-medium text-bright bg-darker-slate px-2.5 py-1 rounded-full border border-border-slate">{currentConfig}</span>
                  </div>
                  <p className="text-xs text-muted">Step {screens.indexOf(activeScreen) + 1} of 6 — {stepLabels[activeScreen]}</p>
                </div>
                <NavButtons />
              </div>
            </div>
          </div>

          {/* Screen Content - With Background */}
          <div className="p-6 flex-1 bg-darker-navy overflow-y-auto">
            {/* Step 1: Fiscal Engine Screen - Split Layout */}
            {activeScreen === 'engine' && (
              <div className="grid grid-cols-6 gap-6 h-full">
                {/* LEFT: Configuration Sliders */}
                <div className="col-span-3 overflow-y-auto pr-2">
                  <PolicySliders
                    tokenTaxRate={tokenTaxRate}
                    onTokenTaxRateChange={setTokenTaxRate}
                    ubiAnnualPerAdult={ubiAnnualPerAdult}
                    onUbiChange={setUbiAnnualPerAdult}
                    breakoutPoint={breakoutPoint}
                    onBreakoutPointChange={setBreakoutPoint}
                    onReset={handleReset}
                  />
                </div>

                {/* RIGHT: Fiscal Status Panel */}
                <div
                  className={`col-span-3 rounded-lg p-8 text-white overflow-y-auto view-transition ${
                    result.balance.surplusDeficit >= 0
                      ? 'bg-dark-slate glow-border-green pulse-glow-green'
                      : 'bg-dark-slate glow-border-red pulse-glow-red'
                  }`}
                >
                  {/* FISCAL ENGINE VIEW */}
                  {(
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
                </div>
              </div>
            )}

            {/* Step 2: Household Structure Screen - Split Layout */}
            {activeScreen === 'households' && (
              <div className="grid grid-cols-6 gap-6 h-full">
                {/* LEFT: Household Inputs */}
                <div className="col-span-2 overflow-y-auto pr-2 space-y-6">
                  {/* Dependent UBI Rates */}
                  <div className="bg-dark-slate rounded-lg p-5 glow-border-slate" style={{ transition: 'all 0.3s ease' }}>
                    <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
                      💰 Tiered Dependent Support
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">1st Dependent</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">$</span>
                          <input
                            type="number"
                            value={ubiDependent1}
                            onChange={(e) => setUbiDependent1(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">2nd Dependent</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">$</span>
                          <input
                            type="number"
                            value={ubiDependent2}
                            onChange={(e) => setUbiDependent2(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">3rd+ Dependents</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">$</span>
                          <input
                            type="number"
                            value={ubiDependent3}
                            onChange={(e) => setUbiDependent3(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Household Distribution */}
                  <div className="bg-dark-slate rounded-lg p-5 glow-border-slate" style={{ transition: 'all 0.3s ease' }}>
                    <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
                      📊 Household Distribution
                    </p>
                    <div className="space-y-3">
                      {/* 0 Dependents - Auto Calculated */}
                      <div className="bg-darker-navy rounded-lg p-3 border border-border-slate opacity-75">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted">0 Dependents</label>
                          <div className="flex items-center gap-2">
                            <span className="w-12 text-right font-semibold text-emerald-400 text-sm">
                              {Math.round((1 - (pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep)) * 100)}%
                            </span>
                            <span className="text-dimmed text-xs">(Auto)</span>
                          </div>
                        </div>
                      </div>

                      {/* User Input Fields */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-dimmed">1 Dependent</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={Math.round(pctHouseholds1Dep * 100)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setPctHouseholds1Dep(val / 100);
                              }}
                              className="w-16 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                            />
                            <span className="text-dimmed text-sm">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-dimmed">2 Dependents</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={Math.round(pctHouseholds2Dep * 100)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setPctHouseholds2Dep(val / 100);
                              }}
                              className="w-16 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                            />
                            <span className="text-dimmed text-sm">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-dimmed">3+ Dependents</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={Math.round(pctHouseholds3Dep * 100)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setPctHouseholds3Dep(val / 100);
                              }}
                              className="w-16 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                            />
                            <span className="text-dimmed text-sm">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Validation Message */}
                      {(pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep) > 1 && (
                        <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded px-3 py-2">
                          <p className="text-xs text-red-400 font-semibold">⚠ Total exceeds 100%. Please adjust.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MIDDLE: UBI Program Cost Display */}
                <div className="col-span-2 rounded-lg p-8 bg-dark-slate glow-border-blue overflow-y-auto">
                  <div className="space-y-6">
                    {/* UBI Program Cost Hero */}
                    <div>
                      <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">UBI Program Cost</p>
                      <p
                        className="font-bold leading-none"
                        style={{
                          fontSize: '48px',
                          color: '#60A5FA',
                          textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
                        }}
                      >
                        ${(result.obligations.ubiCost / 1e12).toFixed(2)}T
                      </p>
                    </div>

                    {/* Breakdown */}
                    <div className="border-t border-border-slate pt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">Adult UBI</span>
                        <span className="font-semibold text-green-400">
                          ${(result.obligations.adultUBICost ? result.obligations.adultUBICost / 1e12 : 0).toFixed(2)}T
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">Dependent UBI</span>
                        <span className="font-semibold text-purple-400">
                          ${(result.obligations.dependentUBICost ? result.obligations.dependentUBICost / 1e12 : 0).toFixed(2)}T
                        </span>
                      </div>
                    </div>

                    {/* Dependent Percentage Bar */}
                    <div className="border-t border-border-slate pt-6">
                      <p className="text-xs text-muted mb-3 uppercase tracking-wide">Dependent % of UBI</p>
                      <div className="w-full h-4 bg-darker-slate rounded-full overflow-hidden border border-border-slate">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{
                            width: result.obligations.ubiCost > 0
                              ? `${((result.obligations.dependentUBICost || 0) / result.obligations.ubiCost * 100).toFixed(1)}%`
                              : '0%'
                          }}
                        />
                      </div>
                      <p className="text-xs text-dimmed mt-2">
                        {((result.obligations.dependentUBICost || 0) / result.obligations.ubiCost * 100).toFixed(1)}% dependent
                      </p>
                    </div>

                    {/* Solvency Badge */}
                    <div className="border-t border-border-slate pt-6">
                      <div
                        className={`rounded-lg p-4 text-center ${
                          result.balance.isSolvent ? 'bg-green-900 bg-opacity-30 border border-green-600' : 'bg-red-900 bg-opacity-30 border border-red-600'
                        }`}
                      >
                        <p className="text-xs text-muted mb-1 uppercase tracking-wide">Fiscal Status</p>
                        <p className={`text-sm font-bold ${result.balance.isSolvent ? 'text-green-400' : 'text-red-400'}`}>
                          {result.balance.isSolvent ? '✓ Solvent' : '✗ Deficit'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Summary Cards */}
                <div className="col-span-2 overflow-y-auto space-y-4 pr-2">
                  {/* Calculate metrics */}
                  {(() => {
                    const numHH = 130000000;
                    const tier1Count = numHH * (pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep);
                    const tier2Count = numHH * (pctHouseholds2Dep + pctHouseholds3Dep);
                    const tier3Count = numHH * pctHouseholds3Dep;
                    const dependentCost = tier1Count * ubiDependent1 + tier2Count * ubiDependent2 + tier3Count * ubiDependent3;
                    const totalDependents = tier1Count + tier2Count + tier3Count;
                    const hhWithDeps = pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep;

                    return (
                      <>
                        {/* Card 1: Dependent UBI Cost */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-emerald-500 glow-border-slate">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Dependent UBI Cost</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            ${(dependentCost / 1e12).toFixed(2)}T
                          </p>
                        </div>

                        {/* Card 2: % of UBI Budget */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-blue-500 glow-border-slate">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">% of UBI Budget</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {result.obligations.ubiCost > 0 ? ((dependentCost / result.obligations.ubiCost) * 100).toFixed(1) : '0'}%
                          </p>
                        </div>

                        {/* Card 3: Total Dependents */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-purple-500 glow-border-slate">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Total Dependents</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {(totalDependents / 1e6).toFixed(1)}M
                          </p>
                        </div>

                        {/* Card 4: HH with Dependents */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-orange-500 glow-border-slate">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">HH with Dependents</p>
                          <p className="text-2xl font-bold text-orange-400">
                            {(hhWithDeps * 100).toFixed(1)}%
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Step 3: Work Incentives Screen */}
            {activeScreen === 'incentives' && (
              <div className="space-y-6">
                <ProductivityBar personas={result.citizenModel.personaOutcomes} />
                <PersonaComparison personas={result.citizenModel.personaOutcomes} />
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

            {/* Step 6: Stability & Risk Screen */}
            {activeScreen === 'alerts' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Stability & Risk</p>
                  <p className="text-sm text-dimmed">Structural deficit detection and macro-economic financing assumptions.</p>
                </div>
                <Warnings result={result} config={config} />
              </div>
            )}

            {/* Step 7: Submit Model Screen */}
            {activeScreen === 'submit' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-dark-slate rounded-lg p-6 border border-border-slate">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Current Configuration</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Token Tax Rate</span>
                      <span className="text-bright font-semibold">{(tokenTaxRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Adult UBI</span>
                      <span className="text-bright font-semibold">${ubiAnnualPerAdult.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Breakout Point</span>
                      <span className="text-bright font-semibold">${breakoutPoint.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Fiscal Status</span>
                      <span className={`font-semibold ${result.balance.isSolvent ? 'text-green-400' : 'text-red-400'}`}>
                        {result.balance.isSolvent ? '✓ Solvent' : '✗ Deficit'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-8 py-4 rounded-lg font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', fontSize: '16px' }}
                  >
                    Submit This Configuration
                  </button>
                  <p className="text-xs text-dimmed">Contribute your configuration to the research dataset.</p>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="text-xs text-muted"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Give feedback on this model
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation - Enhanced */}
          <div className="px-5 py-5 border-t border-border-slate bg-bg-dark-slate flex justify-between items-center gap-4" style={{ background: '#1E293B' }}>
            {(() => {
              const screensArray: Array<typeof activeScreen> = ['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'];
              const current = screensArray.indexOf(activeScreen);
              return current > 0 ? (
                <button
                  onClick={() => {
                    if (current > 0) setActiveScreen(screensArray[current - 1]);
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
                {['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'].map((screen, idx) => {
                  const isActive = activeScreen === screen || ['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'].indexOf(activeScreen) > idx;
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
                Step {['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'].indexOf(activeScreen) + 1} of 7 — {stepLabels[activeScreen]}
              </span>
            </div>
            {activeScreen !== 'submit' && (
              <button
                onClick={() => {
                  const screens = ['engine', 'households', 'incentives', 'results', 'charts', 'alerts', 'submit'] as const;
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
            {activeScreen === 'submit' && <div style={{ width: '90px' }} />}
          </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {activeScreen === 'submit' && (
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
