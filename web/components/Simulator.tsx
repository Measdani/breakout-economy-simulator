'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { runSimulation, calculateFrictionTaxSensitivity } from '../lib/engine';
import { useAnimatedNumber, numberFormatters } from '../lib/hooks/useAnimatedNumber';
import { TERMINOLOGY, getRetirementModeBadge } from '../lib/terminology';
import type { PolicyConfig, SimulationResult } from '../lib/types';
import { buildAssumptionsHref } from '../lib/assumptionsRoute';
import PolicySliders from './PolicySliders';
import ResultsDisplay from './ResultsDisplay';
import FiscalSustainabilityIndicator from './FiscalSustainabilityIndicator';
import PersonaTable from './PersonaTable';
import Charts from './Charts';
import OnboardingTour from './OnboardingTour';
import Warnings from './Warnings';
import GlossaryPanel from './GlossaryPanel';
import SubmitModal from './SubmitModal';
import FeedbackModal from './FeedbackModal';
import Tooltip from './Tooltip';
import ProgramModuleTemplate from './ProgramModuleTemplate';

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
  // Friction Tax defaults
  frictionTaxRate: 0.0035,
  baseTransactionVolume: 1e15,
  transactionVolumeGrowthRate: 0.05,
  capitalFlightRate: 0,
  marketMakerExempt: false,
  // Healthcare defaults
  healthcareEnabled: true,
  healthcareMode: 'baseline',
  medicareAnnualSpend: 1.05e12,
  medicaidAnnualSpend: 0.86e12,
  federalHealthcareSpendTotal: 1.91e12,
  aiDiagnosticsSavingsPct: 0,
  adminAutomationSavingsPct: 0,
  allPayerTransparencySavingsPct: 0,
};

const YEAR5_BASE_SCENARIO: Partial<PolicyConfig> = {
  tokenTaxRate: 0.0066,
  frictionTaxRate: 0.0066,
  ubiAnnualPerAdult: 12000,
  supplementApexBonus: 6000,
  breakoutPoint: 60000,
};

interface SimulatorProps {
  initialConfig?: Partial<PolicyConfig>
}

function getHealthcareModeBadge(mode: 'baseline' | 'efficiency_reform' | 'structural_replacement'): string {
  switch (mode) {
    case 'baseline':
      return 'Baseline Cost';
    case 'efficiency_reform':
      return 'Phase 1 Efficiency';
    case 'structural_replacement':
      return 'Locked';
    default:
      return '';
  }
}

export default function Simulator({ initialConfig }: SimulatorProps = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...initialConfig }
  const [tokenTaxRate, setTokenTaxRate] = useState(mergedConfig.tokenTaxRate);
  const [ubiAnnualPerAdult, setUbiAnnualPerAdult] = useState(
    mergedConfig.ubiAnnualPerAdult
  );
  const [breakoutPoint, setBreakoutPoint] = useState(mergedConfig.breakoutPoint);
  const [sbiMaximum, setSbiMaximum] = useState(
    mergedConfig.supplementApexBonus ?? DEFAULT_CONFIG.supplementApexBonus
  );
  const [ubiDependent1, setUbiDependent1] = useState(mergedConfig.ubiDependent1 ?? 6000);
  const [ubiDependent2, setUbiDependent2] = useState(mergedConfig.ubiDependent2 ?? 4000);
  const [ubiDependent3, setUbiDependent3] = useState(mergedConfig.ubiDependent3 ?? 2000);
  const [pctHouseholds1Dep, setPctHouseholds1Dep] = useState(mergedConfig.pctHouseholds1Dep ?? 0.25);
  const [pctHouseholds2Dep, setPctHouseholds2Dep] = useState(mergedConfig.pctHouseholds2Dep ?? 0.15);
  const [pctHouseholds3Dep, setPctHouseholds3Dep] = useState(mergedConfig.pctHouseholds3Dep ?? 0.10);
  // Token-tax (transaction layer) state
  const [frictionTaxRate, setFrictionTaxRate] = useState(
    mergedConfig.frictionTaxRate ?? mergedConfig.tokenTaxRate ?? 0.0035
  );
  const [baseTransactionVolume, setBaseTransactionVolume] = useState(mergedConfig.baseTransactionVolume ?? 1e15);
  const [transactionVolumeGrowthRate, setTransactionVolumeGrowthRate] = useState(mergedConfig.transactionVolumeGrowthRate ?? 0.05);
  const [capitalFlightRate, setCapitalFlightRate] = useState(mergedConfig.capitalFlightRate ?? 0);
  // Revenue Architecture state
  const [revenueArchitectureMode, setRevenueArchitectureMode] = useState<'hybrid' | 'friction_dominant' | 'friction_only'>('hybrid');
  const [incomeTaxMultiplier, setIncomeTaxMultiplier] = useState(1.0);
  const [toastVisible, setToastVisible] = useState(false);
  // Retirement Program state
  const [retirementEnabled, setRetirementEnabled] = useState(false);
  const [retirementMode, setRetirementMode] = useState<'replace_ss' | 'supplement' | 'baseline_only'>('replace_ss');
  const [retirementEligibilityAge, setRetirementEligibilityAge] = useState(67);
  const [replacementRate, setReplacementRate] = useState(80);        // displayed as %
  const [benefitAdjustmentFactor, setBenefitAdjustmentFactor] = useState(70);  // displayed as %
  const [pensionableSalaryCap, setPensionableSalaryCap] = useState(250000);
  const [payoutDurationYears, setPayoutDurationYears] = useState(25);
  const [salaryBasis, setSalaryBasis] = useState<'final_3yr' | 'final_5yr' | 'career_avg'>('final_3yr');
  const [retireesCount, setRetireesCount] = useState(54000000);
  const [avgFinal3yrSalary, setAvgFinal3yrSalary] = useState(75000);
  const [ssBaseline, setSsBaseline] = useState(1.3e12);
  // Healthcare Program state
  const [healthcareEnabled, setHealthcareEnabled] = useState(mergedConfig.healthcareEnabled ?? true);
  const [healthcareMode, setHealthcareMode] = useState<'baseline' | 'efficiency_reform' | 'structural_replacement'>(
    mergedConfig.healthcareMode ?? 'baseline'
  );
  const [aiDiagnosticsSavingsPct, setAiDiagnosticsSavingsPct] = useState(mergedConfig.aiDiagnosticsSavingsPct ?? 0);
  const [adminAutomationSavingsPct, setAdminAutomationSavingsPct] = useState(mergedConfig.adminAutomationSavingsPct ?? 0);
  const [allPayerTransparencySavingsPct, setAllPayerTransparencySavingsPct] = useState(
    mergedConfig.allPayerTransparencySavingsPct ?? 0
  );
  const medicareAnnualSpend = mergedConfig.medicareAnnualSpend ?? 1.05e12;
  const medicaidAnnualSpend = mergedConfig.medicaidAnnualSpend ?? 0.86e12;
  const federalHealthcareSpendTotal =
    mergedConfig.federalHealthcareSpendTotal ?? (medicareAnnualSpend + medicaidAnnualSpend);
  const [showTour, setShowTour] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'engine' | 'households' | 'programs' | 'results' | 'charts' | 'alerts' | 'submit'>('engine');
  const [currentConfig, setCurrentConfig] = useState<string>('Default');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [demographics, setDemographics] = useState({ ageRange: '', incomeLevel: '', region: '', affiliation: '' });

  const handlePresetSelectWithName = (presetName: string, presetConfig: Partial<PolicyConfig>) => {
    setCurrentConfig(presetName);
    handlePresetSelect(presetConfig);
  };

  // Derive the effective multiplier based on mode
  const effectiveIncomeTaxMultiplier =
    revenueArchitectureMode === 'friction_only'
      ? 0
      : revenueArchitectureMode === 'friction_dominant'
      ? 0.5
      : incomeTaxMultiplier;

  const handleRevenueArchitectureModeChange = (mode: 'hybrid' | 'friction_dominant' | 'friction_only') => {
    setRevenueArchitectureMode(mode);
    if (mode === 'friction_dominant') setIncomeTaxMultiplier(0.5);
    else if (mode === 'friction_only') setIncomeTaxMultiplier(0);
    else setIncomeTaxMultiplier(1.0);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleTokenTaxRateChange = (value: number) => {
    setTokenTaxRate(value);
    setFrictionTaxRate(value);
  };

  const formatTokenMilsPerThousand = (rate: number) =>
    `${(rate * 100).toFixed(2)} mils / 1,000 tokens total compute`;

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const formatTrillions = (value: number) => `$${(value / 1e12).toFixed(2)}T`;

  const config: PolicyConfig = {
    ...DEFAULT_CONFIG,
    tokenTaxRate,
    ubiAnnualPerAdult,
    breakoutPoint,
    supplementApexBonus: sbiMaximum,
    // Keep tax-free threshold aligned with the breakout slider.
    tier1Start: breakoutPoint,
    ubiDependent1,
    ubiDependent2,
    ubiDependent3,
    pctHouseholds1Dep,
    pctHouseholds2Dep,
    pctHouseholds3Dep,
    frictionTaxRate,
    baseTransactionVolume,
    transactionVolumeGrowthRate,
    capitalFlightRate,
    revenueArchitectureMode,
    incomeTaxMultiplier: effectiveIncomeTaxMultiplier,
    retirementEnabled,
    retirementMode,
    retirementEligibilityAge,
    replacementRate: replacementRate / 100,  // % → decimal for engine
    benefitAdjustmentFactor: benefitAdjustmentFactor / 100,  // % → decimal for engine
    pensionableSalaryCap,
    payoutDurationYears,
    salaryBasis,
    retireesCount,
    avgFinal3yrSalary,
    ssBaseline,
    healthcareEnabled,
    healthcareMode,
    medicareAnnualSpend,
    medicaidAnnualSpend,
    federalHealthcareSpendTotal,
    aiDiagnosticsSavingsPct,
    adminAutomationSavingsPct,
    allPayerTransparencySavingsPct,
  };

  const result: SimulationResult = useMemo(() => runSimulation(config), [config]);
  const assumptionsHref = buildAssumptionsHref(config);

  // Friction Tax Sensitivity Analysis
  const frictionTaxSensitivityUp = useMemo(() =>
    calculateFrictionTaxSensitivity(baseTransactionVolume, frictionTaxRate, capitalFlightRate, 0.001),
    [baseTransactionVolume, frictionTaxRate, capitalFlightRate]
  );
  const frictionTaxSensitivityDown = useMemo(() =>
    calculateFrictionTaxSensitivity(baseTransactionVolume, frictionTaxRate, capitalFlightRate, -0.001),
    [baseTransactionVolume, frictionTaxRate, capitalFlightRate]
  );

  const retirementAnnualCost = result.obligations.retirementProgramCost ?? 0;
  const retirement25YearTotal = result.obligations.retirement25yrTotal ?? 0;
  const retirementShareOfObligations = result.obligations.totalObligations > 0
    ? (retirementAnnualCost / result.obligations.totalObligations) * 100
    : 0;
  const retirementNetChangeVsSS = result.obligations.netChangeVsSS ?? null;
  const showRetirementBaselineComparison = retirementMode === 'replace_ss' || retirementMode === 'supplement';
  const healthcareBaselineFederalCost = result.obligations.healthcareBaselineFederalCost ?? federalHealthcareSpendTotal;
  const healthcareModeledFederalCost = result.obligations.healthcareProgramCost ?? 0;
  const healthcareNetFederalSavings = result.obligations.healthcareNetFederalSavings ?? 0;
  const healthcareObligationsImpact = result.obligations.totalObligations > 0
    ? (healthcareNetFederalSavings / result.obligations.totalObligations) * 100
    : 0;
  const totalRevenueAnnual = result.revenue.totalRevenue;
  const belAnnualCost = result.obligations.ubiCost;
  const remainingFiscalSpaceAfterBEL = result.obligations.remainingFiscalSpaceAfterBEL
    ?? (totalRevenueAnnual - belAnnualCost);
  const fiscalSpaceAfterPrograms = result.obligations.fiscalSpaceAfterPrograms
    ?? (remainingFiscalSpaceAfterBEL - retirementAnnualCost - healthcareModeledFederalCost);
  const belShareOfRevenue = result.obligations.belShareOfRevenue
    ?? (totalRevenueAnnual > 0 ? (belAnnualCost / totalRevenueAnnual) * 100 : 0);
  const retirementShareOfRevenue = result.obligations.retirementShareOfRevenue
    ?? (totalRevenueAnnual > 0 ? (retirementAnnualCost / totalRevenueAnnual) * 100 : 0);
  const healthcareShareOfRevenue = result.obligations.healthcareShareOfRevenue
    ?? (totalRevenueAnnual > 0 ? (healthcareModeledFederalCost / totalRevenueAnnual) * 100 : 0);
  const retirementAllocatedRevenue = result.obligations.retirementAllocatedRevenue
    ?? (retirementAnnualCost > 0
      ? Math.max(0, Math.min(Math.max(remainingFiscalSpaceAfterBEL, 0), retirementAnnualCost))
      : 0);
  const remainingAfterRetirement = remainingFiscalSpaceAfterBEL - retirementAnnualCost;
  const healthcareAllocatedRevenue = healthcareModeledFederalCost > 0
    ? Math.max(0, Math.min(Math.max(remainingAfterRetirement, 0), healthcareModeledFederalCost))
    : 0;
  const retirementFundingRatio = result.obligations.retirementFundingRatio
    ?? (retirementAnnualCost > 0 ? retirementAllocatedRevenue / retirementAnnualCost : null);
  const retirementFundingStatus = retirementFundingRatio === null
    ? null
    : retirementFundingRatio > 1
      ? { label: 'Sustainable', color: 'text-green-400', dot: 'bg-green-500' }
      : retirementFundingRatio >= 0.9
        ? { label: 'Tight', color: 'text-yellow-300', dot: 'bg-yellow-400' }
        : { label: 'Unsustainable', color: 'text-red-400', dot: 'bg-red-500' };
  const retirementDeficitContribution = Math.max(0, retirementAnnualCost - retirementAllocatedRevenue);
  const healthcareDeficitContribution = Math.max(0, healthcareModeledFederalCost - healthcareAllocatedRevenue);
  const programsIncreaseDeficit = fiscalSpaceAfterPrograms < 0;
  const postBelBalance = remainingFiscalSpaceAfterBEL;
  const postRetirementBalance = remainingAfterRetirement;
  const postHealthcareBalance = fiscalSpaceAfterPrograms;
  const waterfallBelWidth = Math.max(0, Math.min(100, belShareOfRevenue));
  const waterfallRetirementWidth = Math.max(
    0,
    Math.min(100 - waterfallBelWidth, retirementShareOfRevenue)
  );
  const waterfallHealthcareWidth = Math.max(
    0,
    Math.min(100 - waterfallBelWidth - waterfallRetirementWidth, healthcareShareOfRevenue)
  );
  const waterfallRemainingWidth = Math.max(
    0,
    100 - waterfallBelWidth - waterfallRetirementWidth - waterfallHealthcareWidth
  );

  // Objective-function proxies (Phase 1): Y_t = min(Ycap, AD)
  const personaWeights = config.personaWeights ?? [0.25, 0.25, 0.25, 0.25];
  const weightedEarnedIncome = result.citizenModel.personaOutcomes.reduce(
    (sum, persona, index) => sum + persona.earnedIncome * (personaWeights[index] ?? 0),
    0
  );
  const weightedNetIncome = result.citizenModel.personaOutcomes.reduce(
    (sum, persona, index) => sum + persona.netIncome * (personaWeights[index] ?? 0),
    0
  );
  const humanProductiveCapacity = weightedEarnedIncome * config.adultPopulation;
  const machineProductiveCapacity =
    (baseTransactionVolume / 1e15) *
    Math.pow(1 + transactionVolumeGrowthRate, 5) *
    (1 - capitalFlightRate) *
    19.6e12;
  const productiveCapacity = humanProductiveCapacity + machineProductiveCapacity;
  const aggregateDemand =
    (weightedNetIncome * config.adultPopulation * 1.82) +
    (config.govtOperatingRequirement * 1.2);
  const realEconomicOutput = Math.min(productiveCapacity, aggregateDemand);
  const debtRetirementRate = result.revenue.totalRevenue > 0 && result.balance.surplusDeficit > 0
    ? (result.balance.surplusDeficit / result.revenue.totalRevenue) * 100
    : 0;
  const aiInvestmentIncentive = clamp(
    100 - (frictionTaxRate * 9000) - (capitalFlightRate * 1200) + (transactionVolumeGrowthRate * 200) + (result.balance.isSolvent ? 6 : -8),
    0,
    100
  );
  const demandGapRatio = productiveCapacity > 0 ? ((aggregateDemand - productiveCapacity) / productiveCapacity) : 0;
  const deficitRatio = result.revenue.totalRevenue > 0
    ? Math.max(0, -result.balance.surplusDeficit) / result.revenue.totalRevenue
    : 0;
  const stabilityStatus = (() => {
    if (deficitRatio >= 0.08 || aiInvestmentIncentive < 30 || capitalFlightRate >= 0.035) {
      return { icon: '🔴', label: 'Investment Collapse', color: 'text-red-300', dot: 'bg-red-500' };
    }
    if (!result.balance.isSolvent || demandGapRatio < -0.05) {
      return { icon: '🟡', label: 'Demand Shortfall', color: 'text-yellow-300', dot: 'bg-yellow-400' };
    }
    if (demandGapRatio > 0.05) {
      return { icon: '🔵', label: 'Inflationary Risk', color: 'text-blue-300', dot: 'bg-blue-500' };
    }
    return { icon: '🟢', label: 'Balanced Economy', color: 'text-green-300', dot: 'bg-green-500' };
  })();

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
    if (presetConfig.tokenTaxRate !== undefined) handleTokenTaxRateChange(presetConfig.tokenTaxRate);
    if (presetConfig.frictionTaxRate !== undefined) handleTokenTaxRateChange(presetConfig.frictionTaxRate);
    if (presetConfig.ubiAnnualPerAdult !== undefined) setUbiAnnualPerAdult(presetConfig.ubiAnnualPerAdult);
    if (presetConfig.breakoutPoint !== undefined) setBreakoutPoint(presetConfig.breakoutPoint);
    if (presetConfig.supplementApexBonus !== undefined) setSbiMaximum(presetConfig.supplementApexBonus);
  };

  const screens: Array<typeof activeScreen> = ['engine', 'households', 'programs', 'results', 'charts', 'alerts', 'submit'];
  const stepLabels: Record<string, string> = {
    engine: 'Revenue & Funding Model',
    households: 'Demographics',
    programs: 'National Social Programs',
    results: 'Budget Outcome Summary',
    charts: 'Fiscal Composition & Scenario Analysis',
    alerts: 'Stability & Risk',
    submit: 'Research Contribution',
  };

  const handleReset = () => {
    handleTokenTaxRateChange(DEFAULT_CONFIG.tokenTaxRate);
    setUbiAnnualPerAdult(DEFAULT_CONFIG.ubiAnnualPerAdult);
    setBreakoutPoint(DEFAULT_CONFIG.breakoutPoint);
    setSbiMaximum(DEFAULT_CONFIG.supplementApexBonus);
    setUbiDependent1(6000);
    setUbiDependent2(4000);
    setUbiDependent3(2000);
    setPctHouseholds1Dep(0.25);
    setPctHouseholds2Dep(0.15);
    setPctHouseholds3Dep(0.10);
    setFrictionTaxRate(DEFAULT_CONFIG.frictionTaxRate ?? DEFAULT_CONFIG.tokenTaxRate ?? 0.0035);
    setBaseTransactionVolume(DEFAULT_CONFIG.baseTransactionVolume ?? 1e15);
    setTransactionVolumeGrowthRate(DEFAULT_CONFIG.transactionVolumeGrowthRate ?? 0.05);
    setCapitalFlightRate(DEFAULT_CONFIG.capitalFlightRate ?? 0);
    setRevenueArchitectureMode('hybrid');
    setIncomeTaxMultiplier(1.0);
    setRetirementEnabled(false);
    setRetirementMode('replace_ss');
    setRetirementEligibilityAge(67);
    setReplacementRate(80);
    setBenefitAdjustmentFactor(70);
    setPensionableSalaryCap(250000);
    setPayoutDurationYears(25);
    setSalaryBasis('final_3yr');
    setRetireesCount(54000000);
    setAvgFinal3yrSalary(75000);
    setSsBaseline(1.3e12);
    setHealthcareEnabled(DEFAULT_CONFIG.healthcareEnabled ?? true);
    setHealthcareMode(DEFAULT_CONFIG.healthcareMode ?? 'baseline');
    setAiDiagnosticsSavingsPct(DEFAULT_CONFIG.aiDiagnosticsSavingsPct ?? 0);
    setAdminAutomationSavingsPct(DEFAULT_CONFIG.adminAutomationSavingsPct ?? 0);
    setAllPayerTransparencySavingsPct(DEFAULT_CONFIG.allPayerTransparencySavingsPct ?? 0);
    setCurrentConfig('Default');
    setActiveScreen('engine');
  };

  const runYear5BaseScenario = () => {
    handlePresetSelectWithName('Year 5 Base Case', YEAR5_BASE_SCENARIO);
    setActiveScreen('engine');
  };

  const householdDistributionSum = pctHouseholds1Dep + pctHouseholds2Dep + pctHouseholds3Dep;
  const pctHouseholds0Dep = Math.max(0, 1 - householdDistributionSum);
  const householdDistribution = [
    { label: '0 dependents', pct: pctHouseholds0Dep, color: '#475569' },
    { label: '1 dependent', pct: pctHouseholds1Dep, color: '#38bdf8' },
    { label: '2 dependents', pct: pctHouseholds2Dep, color: '#22c55e' },
    { label: '3+ dependents', pct: pctHouseholds3Dep, color: '#f59e0b' },
  ];
  const householdDistributionScale = Math.max(
    1,
    householdDistribution.reduce((sum, item) => sum + item.pct, 0)
  );

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8 flex items-center justify-center">
      {/* Toast Notification */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 41, 59, 0.97)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 20px',
            color: '#e2e8f0',
            fontSize: '13px',
            zIndex: 9999,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          Architecture updated — results recalculated.
        </div>
      )}

      <div className="w-full h-screen flex items-center justify-center" style={{ maxWidth: '1000px' }}>
        {/* Onboarding Tour */}
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

        {/* Tablet Case/Bezel Frame */}
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-4 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Tablet Container */}
          <div className="bg-dark-slate rounded-2xl overflow-hidden shadow-lg flex flex-col h-screen glow-border-blue" style={{ maxHeight: '700px' }}>
          {/* Header - Polished */}
          <div className="bg-darker-slate px-5 py-6 border-b border-border-slate">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-bright">The National AI Economy Resiliency Model</h1>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-xs text-muted">NAiERM v2.1</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tokenTaxRate > ubiAnnualPerAdult / 1000000 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-muted">Configuration:</span>
                  <span className="text-xs font-medium text-bright bg-darker-slate px-2.5 py-1 rounded-full border border-border-slate">{currentConfig}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border-slate pt-5">
              <div className="flex items-center">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted">Step {screens.indexOf(activeScreen) + 1} of {screens.length} — {stepLabels[activeScreen]}</p>
                </div>
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
                  <div className="space-y-6">
                    <div className="bg-darker-slate rounded-lg p-4 border border-border-slate">
                      <button
                        type="button"
                        onClick={runYear5BaseScenario}
                        className="w-full px-4 py-3 rounded font-semibold text-white transition"
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                          boxShadow: '0 0 16px rgba(14, 165, 233, 0.35)',
                        }}
                      >
                        Load Research Baseline (Year-5 Scenario)
                      </button>
                      <p className="text-xs text-dimmed mt-2">
                        See <Link href="/methodology#objective" className="text-cyan-300 underline">Methodology</Link> for objective function and baseline assumptions.
                      </p>
                    </div>

                    <PolicySliders
                      tokenTaxRate={tokenTaxRate}
                      onTokenTaxRateChange={handleTokenTaxRateChange}
                      ubiAnnualPerAdult={ubiAnnualPerAdult}
                      onUbiChange={setUbiAnnualPerAdult}
                      breakoutPoint={breakoutPoint}
                      onBreakoutPointChange={setBreakoutPoint}
                      sbiMaximum={sbiMaximum}
                      onSbiMaximumChange={setSbiMaximum}
                      frictionTaxRate={frictionTaxRate}
                      onFrictionTaxRateChange={handleTokenTaxRateChange}
                      transactionVolumeGrowthRate={transactionVolumeGrowthRate}
                      onTransactionVolumeGrowthRateChange={setTransactionVolumeGrowthRate}
                      capitalFlightRate={capitalFlightRate}
                      onCapitalFlightRateChange={setCapitalFlightRate}
                      onReset={handleReset}
                      showGlossary={showGlossary}
                      onGlossaryToggle={setShowGlossary}
                      revenueArchitectureMode={revenueArchitectureMode}
                      onRevenueArchitectureModeChange={handleRevenueArchitectureModeChange}
                      incomeTaxMultiplier={incomeTaxMultiplier}
                      onIncomeTaxMultiplierChange={setIncomeTaxMultiplier}
                    />
                  </div>
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
                        {revenueArchitectureMode === 'friction_only' && (
                          <p className="text-xs text-amber-400 mt-3 flex items-start gap-2">
                            <span>⚠</span>
                            <span>Structural transition scenario — significant institutional reform required.</span>
                          </p>
                        )}
                      </div>

                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">Model Outcomes</p>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">Real Economic Output</span>
                            <span className="text-sm font-semibold text-emerald-300">{formatTrillions(realEconomicOutput)}</span>
                          </div>
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">Aggregate Demand</span>
                            <span className="text-sm font-semibold text-sky-300">{formatTrillions(aggregateDemand)}</span>
                          </div>
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">Federal Revenue</span>
                            <span className="text-sm font-semibold text-cyan-300">{formatTrillions(result.revenue.totalRevenue)}</span>
                          </div>
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">Federal Outlays</span>
                            <span className="text-sm font-semibold text-orange-300">{formatTrillions(result.obligations.totalObligations)}</span>
                          </div>
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">Debt Retirement Rate</span>
                            <span className="text-sm font-semibold text-purple-300">{debtRetirementRate.toFixed(1)}%</span>
                          </div>
                          <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                            <span className="text-sm text-dimmed">AI Investment Incentive</span>
                            <span className="text-sm font-semibold text-yellow-200">{aiInvestmentIncentive.toFixed(1)} / 100</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-3">System Stability</p>
                        <div className="bg-darker-navy rounded border border-border-slate p-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-sm text-dimmed">
                            <span className={`w-2.5 h-2.5 rounded-full ${stabilityStatus.dot}`} />
                            Health Check
                          </span>
                          <span className={`text-sm font-semibold ${stabilityStatus.color}`}>
                            {stabilityStatus.icon} {stabilityStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Revenue Breakdown */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-4">💰 Revenue Sources</p>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Token Tax (Flow Base)</span>
                            <span className="font-semibold text-blue-400">
                              ${((result.revenue.tokenTaxRevenue) / 1e12).toFixed(2)}T
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Token Tax (Total Compute)</span>
                            <span className="font-semibold text-cyan-400">
                              ${((result.revenue.frictionTaxRevenue ?? 0) / 1e12).toFixed(2)}T
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

                      {/* Token Tax Sensitivity Analysis */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-3">📊 Rate Sensitivity</p>
                        <p className="text-xs text-dimmed mb-3">(Static volume assumption)</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted">+0.10 mils rate</span>
                            <span className="text-green-400">
                              +${(frictionTaxSensitivityUp.deltaRevenue / 1e9).toFixed(1)}B ({frictionTaxSensitivityUp.deltaPercent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">-0.10 mils rate</span>
                            <span className="text-red-400">
                              -${(Math.abs(frictionTaxSensitivityDown.deltaRevenue) / 1e9).toFixed(1)}B ({frictionTaxSensitivityDown.deltaPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Composition */}
                      <div className="border-t border-border-slate pt-6">
                        <p className="text-sm text-muted uppercase tracking-wide mb-3">📈 Revenue Composition</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted">Total Token Tax Share</span>
                            <span className="font-semibold text-blue-400">
                              {(((((result.revenue.tokenTaxRevenue + (result.revenue.frictionTaxRevenue ?? 0)) / result.revenue.totalRevenue) * 100) || 0)).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">of Model Revenue</span>
                            <span className="text-xs text-dimmed">(flow + compute)</span>
                          </div>
                        </div>
                      </div>

                      {/* Model Assumptions */}
                      <div className="border-t border-border-slate pt-6">
                        <Link
                          href={assumptionsHref}
                          className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition bg-darker-slate rounded px-3 py-2 border border-border-slate"
                        >
                          <p className="text-sm text-bright uppercase tracking-wide font-semibold">Model Assumptions</p>
                          <span className="text-xs text-blue-300 font-semibold">Open</span>
                        </Link>

                        <p className="text-xs text-dimmed mt-2">
                          Fiscal baselines, tax architecture, BEL structure, and module settings now live
                          on a separate page so the reference material is readable.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Revenue Architecture Summary (visible when not using defaults) */}
                  {revenueArchitectureMode !== 'hybrid' || incomeTaxMultiplier !== 1.0 ? (
                    <div className="border-t border-border-slate pt-6">
                      <p className="text-sm text-muted uppercase tracking-wide mb-3">
                        ⚙ Revenue Architecture
                      </p>
                      <div className="space-y-2 text-xs bg-darker-navy rounded p-3 border border-border-slate">
                        <div className="flex justify-between">
                          <span className="text-dimmed">Mode:</span>
                          <span className="text-bright font-semibold">
                            {revenueArchitectureMode === 'hybrid'
                              ? 'Hybrid'
                              : revenueArchitectureMode === 'friction_dominant'
                              ? 'Token-Dominant'
                              : 'Token-Only'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dimmed">Income Tax Multiplier:</span>
                          <span className="text-bright font-semibold">
                            {Math.round(effectiveIncomeTaxMultiplier * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dimmed">Primary Funding Source:</span>
                          <span className="text-blue-400 font-semibold">
                            {revenueArchitectureMode === 'friction_only'
                              ? 'Token Tax'
                              : revenueArchitectureMode === 'friction_dominant'
                              ? 'Token Tax (dominant)'
                              : 'Hybrid (Token + Income)'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border-slate">
                          <p className="text-dimmed leading-relaxed">
                            {revenueArchitectureMode === 'friction_only'
                              ? 'Higher sensitivity to transaction volume and migration assumptions.'
                              : revenueArchitectureMode === 'friction_dominant'
                              ? 'Intermediate stability; income tax provides partial backstop during volume fluctuations.'
                              : 'Most stable under current revenue conditions.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Glossary Section - Conditional */}
                  {showGlossary && (
                    <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '16px' }}>
                      <GlossaryPanel />
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
                  <div className="bg-dark-slate rounded-lg p-5 glow-border-blue" style={{ transition: 'all 0.3s ease' }}>
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
                            min={0}
                            step={100}
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
                            min={0}
                            step={100}
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
                            min={0}
                            step={100}
                            className="w-24 px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Household Distribution */}
                  <div className="bg-dark-slate rounded-lg p-5 glow-border-blue" style={{ transition: 'all 0.3s ease' }}>
                    <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
                      📊 Household Distribution
                    </p>
                    <div className="space-y-3">
                      <p className="text-xs text-dimmed leading-5">
                        Enter the share of households that have 1, 2, or 3+ dependents. Any
                        percentage left over is automatically treated as households with 0
                        dependents.
                      </p>

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

                      {/* Auto remainder helper */}
                      <div className="flex justify-end">
                        <p className="text-xs text-dimmed">
                          Auto-assigned to 0 dependents: {Math.round(pctHouseholds0Dep * 100)}%
                        </p>
                      </div>

                      <div className="rounded-lg border border-border-slate bg-darker-navy p-3 space-y-3">
                        <div className="flex h-3 overflow-hidden rounded-full bg-slate-900">
                          {householdDistribution.map((item) => (
                            <div
                              key={item.label}
                              style={{
                                width: `${(item.pct / householdDistributionScale) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {householdDistribution.map((item) => (
                            <div
                              key={item.label}
                              className="rounded-md border border-border-slate bg-dark-slate px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-dimmed">{item.label}</span>
                              </div>
                              <p className="mt-1 text-sm font-semibold text-bright">
                                {Math.max(0, Math.round(item.pct * 100))}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Validation Message */}
                      {householdDistributionSum > 1 && (
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
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-emerald-500 glow-border-blue">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Dependent UBI Cost</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            ${(dependentCost / 1e12).toFixed(2)}T
                          </p>
                        </div>

                        {/* Card 2: % of UBI Budget */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-blue-500 glow-border-blue">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">% of UBI Budget</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {result.obligations.ubiCost > 0 ? ((dependentCost / result.obligations.ubiCost) * 100).toFixed(1) : '0'}%
                          </p>
                        </div>

                        {/* Card 3: Total Dependents */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-purple-500 glow-border-blue">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Total Dependents</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {(totalDependents / 1e6).toFixed(1)}M
                          </p>
                        </div>

                        {/* Card 4: HH with Dependents */}
                        <div className="bg-dark-slate rounded-lg p-5 border-l-4 border-orange-500 glow-border-blue">
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

            {/* Step 3: National Social Programs Screen */}
            {activeScreen === 'programs' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-9 space-y-6">
                  <div className="bg-dark-slate rounded-lg p-6 border border-border-slate glow-border-blue">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">BEL-First Funding Waterfall</p>
                    <p className="text-xs text-dimmed mb-4">
                      Revenue is allocated in sequence: BEL first, then Retirement, then Healthcare.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-darker-slate rounded border border-emerald-800 p-3">
                        <p className="text-xs text-muted mb-1">Start: Total Revenue</p>
                        <p className="text-sm font-semibold text-emerald-400">${(totalRevenueAnnual / 1e12).toFixed(2)}T</p>
                      </div>
                      <div className="bg-darker-slate rounded border border-sky-900 p-3">
                        <p className="text-xs text-muted mb-1">After BEL</p>
                        <p className="text-xs text-sky-300 mb-1">-${(belAnnualCost / 1e12).toFixed(2)}T</p>
                        <p className={`text-sm font-semibold ${postBelBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {postBelBalance >= 0 ? '+' : '-'}${Math.abs(postBelBalance / 1e12).toFixed(2)}T
                        </p>
                      </div>
                      <div className="bg-darker-slate rounded border border-violet-900 p-3">
                        <p className="text-xs text-muted mb-1">After Retirement</p>
                        <p className="text-xs text-violet-300 mb-1">-${(retirementAnnualCost / 1e12).toFixed(2)}T</p>
                        <p className={`text-sm font-semibold ${postRetirementBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {postRetirementBalance >= 0 ? '+' : '-'}${Math.abs(postRetirementBalance / 1e12).toFixed(2)}T
                        </p>
                      </div>
                      <div className="bg-darker-slate rounded border border-orange-900 p-3">
                        <p className="text-xs text-muted mb-1">After Healthcare</p>
                        <p className="text-xs text-orange-300 mb-1">-${(healthcareModeledFederalCost / 1e12).toFixed(2)}T</p>
                        <p className={`text-sm font-semibold ${postHealthcareBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {postHealthcareBalance >= 0 ? '+' : '-'}${Math.abs(postHealthcareBalance / 1e12).toFixed(2)}T
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="w-full h-3 rounded-full overflow-hidden bg-darker-navy border border-border-slate flex">
                        <div className="bg-sky-500" style={{ width: `${waterfallBelWidth}%` }} />
                        <div className="bg-violet-500" style={{ width: `${waterfallRetirementWidth}%` }} />
                        <div className="bg-orange-500" style={{ width: `${waterfallHealthcareWidth}%` }} />
                        <div className="bg-emerald-500" style={{ width: `${waterfallRemainingWidth}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-dimmed">
                        <span>BEL {belShareOfRevenue.toFixed(1)}%</span>
                        <span>Retirement {retirementShareOfRevenue.toFixed(1)}%</span>
                        <span>Healthcare {healthcareShareOfRevenue.toFixed(1)}%</span>
                        <span>Remaining {Math.max(0, (100 - (belShareOfRevenue + retirementShareOfRevenue + healthcareShareOfRevenue))).toFixed(1)}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-dimmed">
                      Crowd-out check: {programsIncreaseDeficit
                        ? `Retirement + Healthcare exceed remaining fiscal space and increase deficit by $${Math.abs(fiscalSpaceAfterPrograms / 1e9).toFixed(1)}B.`
                        : 'Retirement + Healthcare fit within remaining fiscal space after BEL.'}
                    </p>
                  </div>

                  <ProgramModuleTemplate
                  programName={TERMINOLOGY.RETIREMENT_PROGRAM}
                  enabled={retirementEnabled}
                  onToggleEnabled={() => setRetirementEnabled(!retirementEnabled)}
                  enabledLabel={TERMINOLOGY.RETIREMENT_ENABLED}
                  disabledLabel={TERMINOLOGY.RETIREMENT_DISABLED}
                  modeControl={
                    <select
                      value={retirementMode}
                      onChange={(e) => setRetirementMode(e.target.value as 'replace_ss' | 'supplement' | 'baseline_only')}
                      className="w-44 px-3 py-1.5 bg-darker-slate border border-border-slate rounded text-xs text-bright"
                    >
                      <option value="replace_ss">{TERMINOLOGY.RETIREMENT_MODE_REPLACE_SS}</option>
                      <option value="supplement">{TERMINOLOGY.RETIREMENT_MODE_SUPPLEMENT}</option>
                      <option value="baseline_only">{TERMINOLOGY.RETIREMENT_MODE_BASELINE}</option>
                    </select>
                  }
                  modeBadge={
                    <span className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-darker-slate border border-border-slate text-bright">
                      {getRetirementModeBadge(retirementMode)}
                    </span>
                  }
                  inputs={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">{TERMINOLOGY.RETIREMENT_ELIGIBILITY_AGE}</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={retirementEligibilityAge}
                            onChange={(e) => setRetirementEligibilityAge(Math.max(55, parseInt(e.target.value) || 67))}
                            className="w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                          <span className="text-xs text-muted">yrs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">{TERMINOLOGY.RETIREMENT_REPLACEMENT_RATE}</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={replacementRate}
                            onChange={(e) => setReplacementRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 80)))}
                            className="w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">{TERMINOLOGY.RETIREMENT_SALARY_CAP}</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted">$</span>
                          <input
                            type="number"
                            value={pensionableSalaryCap / 1000}
                            onChange={(e) => setPensionableSalaryCap(Math.max(0, parseInt(e.target.value) || 250) * 1000)}
                            className="w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                          <span className="text-xs text-muted">k</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm text-dimmed block">{TERMINOLOGY.RETIREMENT_PAYOUT_DURATION}</label>
                          <p className="text-xs text-muted mt-0.5">{TERMINOLOGY.RETIREMENT_FIXED_DURATION_NOTE}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={payoutDurationYears}
                            onChange={(e) => setPayoutDurationYears(Math.max(1, parseInt(e.target.value) || 25))}
                            className="w-16 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                          <span className="text-xs text-muted">yrs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <label className="text-sm text-dimmed">{TERMINOLOGY.RETIREMENT_ACTUARIAL_ADJUSTMENT}</label>
                          <Tooltip text={TERMINOLOGY.TOOLTIP_ACTUARIAL_ADJUSTMENT}>
                            <span className="text-xs text-muted underline decoration-dotted">info</span>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={benefitAdjustmentFactor}
                            onChange={(e) => setBenefitAdjustmentFactor(Math.max(0, Math.min(100, parseInt(e.target.value) || 70)))}
                            className="w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right"
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      </div>
                    </div>
                  }
                  outputs={
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">{TERMINOLOGY.RETIREMENT_ANNUAL}</span>
                        <span className="font-semibold text-sky-400">${(retirementAnnualCost / 1e12).toFixed(2)}T/yr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">25-Year Total</span>
                        <span className="font-semibold text-sky-400">${(retirement25YearTotal / 1e12).toFixed(2)}T</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">% Obligations</span>
                        <span className="font-semibold text-bright">{retirementShareOfObligations.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">% Revenue</span>
                        <span className="font-semibold text-bright">{retirementShareOfRevenue.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">{TERMINOLOGY.RETIREMENT_NET_IMPACT_VS_SS}</span>
                        <span className={`font-semibold ${
                          retirementEnabled && showRetirementBaselineComparison && retirementNetChangeVsSS !== null
                            ? (retirementNetChangeVsSS >= 0 ? 'text-red-400' : 'text-green-400')
                            : 'text-muted'
                        }`}>
                          {!retirementEnabled
                            ? 'Program Disabled'
                            : showRetirementBaselineComparison && retirementNetChangeVsSS !== null
                            ? `${retirementNetChangeVsSS >= 0 ? '+' : ''}$${(retirementNetChangeVsSS / 1e12).toFixed(2)}T/yr`
                            : 'Baseline-Only Mode'}
                        </span>
                      </div>

                      {retirementEnabled && (
                        <div className="pt-3 border-t border-border-slate space-y-2">
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Retirement Funding Ratio</p>
                          {retirementFundingRatio === null ? (
                            <p className="text-xs text-muted">n/a</p>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-dimmed">Allocated Revenue</span>
                                <span className="font-semibold text-bright">${(retirementAllocatedRevenue / 1e12).toFixed(2)}T</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-dimmed">Retirement Cost</span>
                                <span className="font-semibold text-bright">${(retirementAnnualCost / 1e12).toFixed(2)}T</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-dimmed">Funding Ratio</span>
                                <span className={`font-semibold ${retirementFundingStatus ? retirementFundingStatus.color : 'text-muted'}`}>
                                  {(retirementFundingRatio * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-dimmed">Status</span>
                                <span className={`inline-flex items-center gap-2 font-semibold ${retirementFundingStatus ? retirementFundingStatus.color : 'text-muted'}`}>
                                  <span className={`w-2 h-2 rounded-full ${retirementFundingStatus ? retirementFundingStatus.dot : 'bg-slate-400'}`} />
                                  {retirementFundingStatus?.label ?? 'n/a'}
                                </span>
                              </div>
                              <p className="text-xs text-dimmed">
                                Thresholds: {`>100% Sustainable | 90-100% Tight | <90% Unsustainable`}
                              </p>
                              {retirementDeficitContribution > 0 && (
                                <p className="text-xs text-red-300">
                                  Retirement increases deficit pressure by ${ (retirementDeficitContribution / 1e9).toFixed(1)}B after BEL allocation.
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  }
                  baselineComparison={(
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">{TERMINOLOGY.RETIREMENT_SS_BASELINE}</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted">$</span>
                          <input
                            type="number"
                            value={ssBaseline / 1e12}
                            onChange={(e) => setSsBaseline(Math.max(0, parseFloat(e.target.value) || 1.3) * 1e12)}
                            step="0.1"
                            className="w-16 px-2 py-1 bg-darker-slate border border-border-slate rounded text-xs text-bright text-right"
                          />
                          <span className="text-xs text-muted">T</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-dark-slate rounded border border-border-slate p-3">
                          <p className="text-xs text-muted uppercase tracking-wide mb-1">{TERMINOLOGY.RETIREMENT_NATIONAL_COST}</p>
                          <p className="text-sm font-semibold text-bright">${(retirementAnnualCost / 1e12).toFixed(2)}T/yr</p>
                        </div>
                        <div className="bg-dark-slate rounded border border-border-slate p-3">
                          <p className="text-xs text-muted uppercase tracking-wide mb-1">{TERMINOLOGY.RETIREMENT_NET_IMPACT_VS_SS}</p>
                          <p className={`text-sm font-semibold ${
                            retirementNetChangeVsSS === null
                              ? 'text-muted'
                              : retirementNetChangeVsSS >= 0
                                ? 'text-red-400'
                                : 'text-green-400'
                          }`}>
                            {retirementNetChangeVsSS !== null
                              ? `${retirementNetChangeVsSS >= 0 ? '+' : ''}$${(retirementNetChangeVsSS / 1e12).toFixed(2)}T/yr`
                              : retirementMode === 'baseline_only'
                                ? 'Baseline-Only Mode'
                                : 'Program Disabled'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-dimmed">{TERMINOLOGY.RETIREMENT_RETIREES}</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={retireesCount / 1e6}
                              onChange={(e) => setRetireesCount(Math.max(0, parseFloat(e.target.value) || 54) * 1e6)}
                              className="w-16 px-2 py-1 bg-darker-slate border border-border-slate rounded text-xs text-bright text-right"
                            />
                            <span className="text-xs text-muted">M</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-dimmed">{TERMINOLOGY.RETIREMENT_AVG_SALARY}</label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted">$</span>
                            <input
                              type="number"
                              value={avgFinal3yrSalary / 1000}
                              onChange={(e) => setAvgFinal3yrSalary(Math.max(0, parseInt(e.target.value) || 75) * 1000)}
                              className="w-16 px-2 py-1 bg-darker-slate border border-border-slate rounded text-xs text-bright text-right"
                            />
                            <span className="text-xs text-muted">k</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  baselineTitle="Current Baseline Comparison"
                  notes={
                    <div className="space-y-1 text-xs text-dimmed leading-relaxed">
                      <p>{TERMINOLOGY.RETIREMENT_FIXED_DURATION_NOTE}</p>
                      <p>{TERMINOLOGY.TOOLTIP_ACTUARIAL_ADJUSTMENT}</p>
                      <p>Replacement mechanics (current model scope):</p>
                      <p>- Payroll tax and trust-fund flows are not separately modeled yet.</p>
                      <p>- Existing retirees are represented via the retirees baseline input.</p>
                      <p>- Generational firewall cutoff age is not modeled yet.</p>
                    </div>
                  }
                  disabledMessage={
                    <p className="text-xs italic text-bright">
                      Enable the Retirement Program to configure parameters and see projected costs.
                    </p>
                  }
                />

                <ProgramModuleTemplate
                  programName={TERMINOLOGY.HEALTHCARE_PROGRAM}
                  enabled={healthcareEnabled}
                  onToggleEnabled={() => setHealthcareEnabled(!healthcareEnabled)}
                  enabledLabel="Enabled"
                  disabledLabel="Disabled"
                  modeControl={
                    <select
                      value={healthcareMode}
                      onChange={(e) => setHealthcareMode(e.target.value as 'baseline' | 'efficiency_reform' | 'structural_replacement')}
                      className="w-56 px-3 py-1.5 bg-darker-slate border border-border-slate rounded text-xs text-bright"
                    >
                      <option value="baseline">Baseline</option>
                      <option value="efficiency_reform">Efficiency Reform (Phase 1)</option>
                      <option value="structural_replacement" disabled>Structural Replacement (Locked)</option>
                    </select>
                  }
                  modeBadge={
                    <span className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-darker-slate border border-border-slate text-bright">
                      {getHealthcareModeBadge(healthcareMode)}
                    </span>
                  }
                  inputs={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">AI Diagnostics Savings</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={aiDiagnosticsSavingsPct}
                            onChange={(e) => setAiDiagnosticsSavingsPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            disabled={healthcareMode !== 'efficiency_reform'}
                            className={`w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right ${
                              healthcareMode !== 'efficiency_reform' ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">Admin Automation Savings</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={adminAutomationSavingsPct}
                            onChange={(e) => setAdminAutomationSavingsPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            disabled={healthcareMode !== 'efficiency_reform'}
                            className={`w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right ${
                              healthcareMode !== 'efficiency_reform' ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-dimmed">All-Payer Transparency Savings</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={allPayerTransparencySavingsPct}
                            onChange={(e) => setAllPayerTransparencySavingsPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            disabled={healthcareMode !== 'efficiency_reform'}
                            className={`w-20 px-2 py-1.5 bg-darker-slate border border-border-slate rounded text-sm text-bright text-right ${
                              healthcareMode !== 'efficiency_reform' ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className="text-xs text-muted">%</span>
                        </div>
                      </div>
                      {healthcareMode !== 'efficiency_reform' && (
                        <p className="text-xs text-muted italic">
                          Savings levers activate only in Efficiency Reform (Phase 1) mode.
                        </p>
                      )}
                    </div>
                  }
                  outputs={
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">Baseline Federal Cost</span>
                        <span className="font-semibold text-orange-300">${(healthcareBaselineFederalCost / 1e12).toFixed(2)}T/yr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">Modeled Federal Cost</span>
                        <span className="font-semibold text-sky-400">${(healthcareModeledFederalCost / 1e12).toFixed(2)}T/yr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">Net Federal Savings</span>
                        <span className={`font-semibold ${healthcareNetFederalSavings > 0 ? 'text-green-400' : 'text-muted'}`}>
                          {healthcareNetFederalSavings > 0
                            ? `$${(healthcareNetFederalSavings / 1e9).toFixed(1)}B/yr`
                            : '$0.0B/yr'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">% Revenue</span>
                        <span className="font-semibold text-bright">{healthcareShareOfRevenue.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dimmed">% Obligations Impact</span>
                        <span className="font-semibold text-bright">
                          {healthcareNetFederalSavings > 0 ? `-${healthcareObligationsImpact.toFixed(1)}%` : '0.0%'}
                        </span>
                      </div>
                      {healthcareDeficitContribution > 0 && (
                        <p className="text-xs text-red-300">
                          Healthcare increases deficit pressure by ${ (healthcareDeficitContribution / 1e9).toFixed(1)}B after BEL/Retirement allocation.
                        </p>
                      )}
                    </div>
                  }
                  baselineComparison={(
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-dark-slate rounded border border-border-slate p-3">
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">Medicare Baseline</p>
                        <p className="text-sm font-semibold text-bright">${(medicareAnnualSpend / 1e12).toFixed(2)}T/yr</p>
                      </div>
                      <div className="bg-dark-slate rounded border border-border-slate p-3">
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">Medicaid Baseline</p>
                        <p className="text-sm font-semibold text-bright">${(medicaidAnnualSpend / 1e12).toFixed(2)}T/yr</p>
                      </div>
                      <div className="bg-dark-slate rounded border border-border-slate p-3">
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">Federal Total Baseline</p>
                        <p className="text-sm font-semibold text-orange-300">${(healthcareBaselineFederalCost / 1e12).toFixed(2)}T/yr</p>
                      </div>
                    </div>
                  )}
                  baselineTitle="Current Medicare + Medicaid Baseline"
                  notesTitle="Model Notes"
                  notes={
                    <div className="space-y-1 text-xs text-dimmed leading-relaxed">
                      <p>Phase 1 is federal-only and benchmarks Medicare + Medicaid baseline spending.</p>
                      <p>Efficiency savings are combined multiplicatively for conservative modeling.</p>
                    </div>
                  }
                  disabledMessage={
                    <p className="text-xs italic text-bright">
                      Enable the Healthcare Program to include federal healthcare obligations in fiscal results.
                    </p>
                  }
                />
                </div>

                <aside className="xl:col-span-3">
                  <div className="xl:sticky xl:top-4 space-y-4">
                    <div className="bg-dark-slate rounded-lg p-4 border border-border-slate glow-border-blue">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Impact Rail</p>
                      <div className="space-y-3 text-sm">
                        <div className="bg-darker-slate rounded border border-border-slate p-3">
                          <p className="text-xs text-muted mb-1">Post-Program Balance</p>
                          <p className={`font-semibold ${fiscalSpaceAfterPrograms >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {fiscalSpaceAfterPrograms >= 0 ? '+' : '-'}${Math.abs(fiscalSpaceAfterPrograms / 1e12).toFixed(2)}T
                          </p>
                        </div>
                        <div className="bg-darker-slate rounded border border-border-slate p-3">
                          <p className="text-xs text-muted mb-1">Retirement Funding Ratio</p>
                          <p className={`font-semibold ${retirementFundingStatus ? retirementFundingStatus.color : 'text-muted'}`}>
                            {retirementFundingRatio === null ? 'n/a' : `${(retirementFundingRatio * 100).toFixed(1)}%`}
                          </p>
                          <p className="text-xs text-dimmed mt-1">{retirementFundingStatus?.label ?? 'Program off'}</p>
                        </div>
                        <div className="bg-darker-slate rounded border border-border-slate p-3">
                          <p className="text-xs text-muted mb-1">Healthcare Net Federal Savings</p>
                          <p className={`font-semibold ${healthcareNetFederalSavings > 0 ? 'text-green-400' : 'text-muted'}`}>
                            {healthcareNetFederalSavings > 0
                              ? `$${(healthcareNetFederalSavings / 1e9).toFixed(1)}B/yr`
                              : '$0.0B/yr'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-darker-navy rounded-lg p-4 border border-border-slate">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Allocation Rule</p>
                      <p className="text-xs text-dimmed leading-relaxed">
                        BEL is funded first. Retirement and healthcare are then funded from the remaining fiscal space.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* Step 4: Results Screen */}
            {activeScreen === 'results' && (
              <div className="space-y-6">
                <FiscalSustainabilityIndicator result={result} />
                <ResultsDisplay result={result} />
              </div>
            )}

            {/* Step 5: Charts Screen */}
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
                      <span className="text-bright font-semibold">{formatTokenMilsPerThousand(tokenTaxRate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">BEL (Annual)</span>
                      <span className="text-bright font-semibold">${ubiAnnualPerAdult.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Breakout Point</span>
                      <span className="text-bright font-semibold">${breakoutPoint.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">SBI Maximum</span>
                      <span className="text-bright font-semibold">${sbiMaximum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dimmed">Fiscal Status</span>
                      <span className={`font-semibold ${result.balance.isSolvent ? 'text-green-400' : 'text-red-400'}`}>
                        {result.balance.isSolvent ? '✓ Solvent' : '✗ Deficit'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Anonymization & Privacy Notice */}
                <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-4">
                  <p className="text-xs text-blue-300 mb-2">
                    <span className="font-semibold">🔒 Data Privacy</span>
                  </p>
                  <p className="text-xs text-dimmed leading-relaxed">
                    Public submissions display policy scenario data only. If you choose to add optional contact details in the submission form, those fields are kept private and are not shown in the public dataset.
                  </p>
                </div>

                {/* Optional Demographics */}
                <div className="bg-dark-slate rounded-lg p-5 border border-border-slate">
                  <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Optional: Demographic Context</p>
                  <p className="text-xs text-dimmed mb-4">Optional demographic context helps researchers understand how policy preferences vary across populations. Those fields are stored as aggregate research context and are not shown on the public submissions page.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-dimmed mb-1 block">Age Range</label>
                      <select
                        value={demographics.ageRange}
                        onChange={(e) => setDemographics({ ...demographics, ageRange: e.target.value })}
                        className="w-full px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright"
                      >
                        <option value="">Select (optional)</option>
                        <option value="18-25">18-25</option>
                        <option value="26-40">26-40</option>
                        <option value="41-60">41-60</option>
                        <option value="61+">61+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-dimmed mb-1 block">Income Level</label>
                      <select
                        value={demographics.incomeLevel}
                        onChange={(e) => setDemographics({ ...demographics, incomeLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright"
                      >
                        <option value="">Select (optional)</option>
                        <option value="<25k">&lt;$25k</option>
                        <option value="25k-50k">$25k-$50k</option>
                        <option value="50k-100k">$50k-$100k</option>
                        <option value="100k-250k">$100k-$250k</option>
                        <option value=">250k">&gt;$250k</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-dimmed mb-1 block">Region</label>
                      <select
                        value={demographics.region}
                        onChange={(e) => setDemographics({ ...demographics, region: e.target.value })}
                        className="w-full px-3 py-2 bg-darker-slate border border-border-slate rounded text-sm text-bright"
                      >
                        <option value="">Select (optional)</option>
                        <option value="Northeast">Northeast</option>
                        <option value="Midwest">Midwest</option>
                        <option value="South">South</option>
                        <option value="West">West</option>
                        <option value="International">International</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-8 py-4 rounded-lg font-bold text-white transition hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #A855F7, #D946EF)',
                      fontSize: '16px',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(217, 70, 239, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.4)';
                    }}
                  >
                    📤 Submit This Configuration
                  </button>
                  <p className="text-xs text-dimmed">Contribute your configuration to the research dataset.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation - Enhanced */}
          <div className="px-5 py-5 border-t border-border-slate bg-bg-dark-slate flex justify-between items-center gap-4" style={{ background: '#1E293B' }}>
            {(() => {
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
                {screens.map((screen, idx) => {
                  const isActive = activeScreen === screen || screens.indexOf(activeScreen) > idx;
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
                Step {screens.indexOf(activeScreen) + 1} of {screens.length} — {stepLabels[activeScreen]}
              </span>
            </div>
            {activeScreen !== 'submit' && (
              <button
                onClick={() => {
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
            )}
            {activeScreen === 'submit' && <div style={{ width: '90px' }} />}
          </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link
                href={assumptionsHref}
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
                Assumptions
              </Link>
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
        demographics={demographics}
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
