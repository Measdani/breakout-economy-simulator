/**
 * NAiERM (National AI Economy Resiliency Model) - Math Engine (Browser Version)
 * Mirrored from ../src/engine.ts for client-side use
 */

import {
  PolicyConfig,
  SimulationResult,
  PersonaOutcome,
  PERSONAS,
} from './types';

export function calculateTokenTaxRevenue(
  flowBaseAnnual: number,
  tokenTaxRate: number
): number {
  return flowBaseAnnual * tokenTaxRate;
}

export function calculateFrictionTaxRevenue(
  baseTransactionVolume: number,
  frictionTaxRate: number,
  capitalFlightRate: number
): number {
  const adjustedVolume = baseTransactionVolume * (1 - capitalFlightRate);
  return adjustedVolume * frictionTaxRate;
}

export function calculate10YearFrictionProjection(
  baseTransactionVolume: number,
  frictionTaxRate: number,
  capitalFlightRate: number,
  growthRate: number
): number {
  let totalProjection = 0;
  for (let year = 0; year < 10; year++) {
    const projectedVolume = baseTransactionVolume * Math.pow(1 + growthRate, year);
    const annualRevenue = calculateFrictionTaxRevenue(
      projectedVolume,
      frictionTaxRate,
      capitalFlightRate
    );
    totalProjection += annualRevenue;
  }
  return totalProjection;
}

export function calculateFrictionTaxSensitivity(
  baseTransactionVolume: number,
  frictionTaxRate: number,
  capitalFlightRate: number,
  rateChange: number
): { deltaRevenue: number; deltaPercent: number } {
  const baseRevenue = calculateFrictionTaxRevenue(
    baseTransactionVolume,
    frictionTaxRate,
    capitalFlightRate
  );
  const newRevenue = calculateFrictionTaxRevenue(
    baseTransactionVolume,
    frictionTaxRate + rateChange,
    capitalFlightRate
  );
  const deltaRevenue = newRevenue - baseRevenue;
  const deltaPercent = (deltaRevenue / baseRevenue) * 100;
  return { deltaRevenue, deltaPercent };
}

export function calculateIncomeTax(
  earnedIncome: number,
  config: PolicyConfig
): number {
  if (earnedIncome <= config.tier1Start) {
    return 0;
  }

  let tax = 0;

  if (earnedIncome >= config.tier1Start && earnedIncome < config.tier2Start) {
    const taxableInTier1 = earnedIncome - config.tier1Start;
    tax += taxableInTier1 * config.tier1Rate;
  } else if (earnedIncome >= config.tier2Start) {
    const taxableInTier1 = config.tier2Start - config.tier1Start;
    tax += taxableInTier1 * config.tier1Rate;

    const taxableInTier2 = earnedIncome - config.tier2Start;
    tax += taxableInTier2 * config.tier2Rate;
  }

  return tax;
}

export function calculateAggregateIncomeTax(
  config: PolicyConfig
): number {
  const weights = config.personaWeights || [0.25, 0.25, 0.25, 0.25];

  const weightedIncomeTax = PERSONAS.reduce((sum, persona, index) => {
    const tax = calculateIncomeTax(persona.earnedIncome, config);
    return sum + tax * weights[index];
  }, 0);

  return weightedIncomeTax * config.adultPopulation;
}

export function calculateSupplement(
  earnedIncome: number,
  config: PolicyConfig
): number {
  const { supplementApexIncome, supplementApexBonus, breakoutPoint } = config;

  if (earnedIncome < supplementApexIncome) {
    const ratio = earnedIncome / supplementApexIncome;
    return supplementApexBonus * ratio;
  }

  if (earnedIncome >= supplementApexIncome && earnedIncome <= breakoutPoint) {
    const incomeRange = breakoutPoint - supplementApexIncome;
    const incomeAboveApex = earnedIncome - supplementApexIncome;

    const slope = -supplementApexBonus / incomeRange;
    const supplement = supplementApexBonus + slope * incomeAboveApex;

    return Math.max(0, supplement);
  }

  return 0;
}

export function calculatePersonaOutcome(
  label: string,
  earnedIncome: number,
  config: PolicyConfig
): PersonaOutcome {
  const ubi = config.ubiAnnualPerAdult;
  const supplement = calculateSupplement(earnedIncome, config);
  const incomeTax = calculateIncomeTax(earnedIncome, config);
  const netIncome = earnedIncome + ubi + supplement - incomeTax;

  return {
    label,
    earnedIncome,
    ubi,
    supplement,
    incomeTax,
    netIncome,
  };
}

export function generateSupplementSummary(config: PolicyConfig): string {
  const { supplementApexIncome, supplementApexBonus, breakoutPoint } = config;

  const incomeRange = breakoutPoint - supplementApexIncome;
  const slope = supplementApexBonus / incomeRange;
  const slope_pct = (slope * 100).toFixed(1);

  return (
    `Supplement peaks at $${supplementApexIncome.toLocaleString()} earned income ` +
    `(+$${supplementApexBonus.toLocaleString()} bonus), ` +
    `then tapers at ${slope_pct}¢ per $1 earned until reaching $0 at $${breakoutPoint.toLocaleString()} breakout point.`
  );
}

export function runSimulation(config: PolicyConfig): SimulationResult {
  const tokenTaxRevenue = calculateTokenTaxRevenue(
    config.flowBaseAnnual,
    config.tokenTaxRate
  );

  // Friction Tax (optional, defaults to 0 if not provided)
  const frictionTaxRate = config.frictionTaxRate ?? 0.0035;
  const baseTransactionVolume = config.baseTransactionVolume ?? 1e15;
  const capitalFlightRate = config.capitalFlightRate ?? 0;
  const frictionTaxRevenue = calculateFrictionTaxRevenue(
    baseTransactionVolume,
    frictionTaxRate,
    capitalFlightRate
  );

  const rawIncomeTaxRevenue = calculateAggregateIncomeTax(config);
  const incomeTaxMultiplier = config.incomeTaxMultiplier ?? 1.0;
  const incomeTaxRevenue = rawIncomeTaxRevenue * incomeTaxMultiplier;
  const welfareSavingsCredit = config.welfareSavingsCredit;
  const totalRevenue = tokenTaxRevenue + frictionTaxRevenue + incomeTaxRevenue + welfareSavingsCredit;

  // Calculate BEL cost: adults + tiered dependents
  const dep1Rate = config.ubiDependent1 ?? 6000;
  const dep2Rate = config.ubiDependent2 ?? 4000;
  const dep3Rate = config.ubiDependent3 ?? 2000;
  const numHH = config.numHouseholds ?? 130000000;
  const pct1 = config.pctHouseholds1Dep ?? 0.25;
  const pct2 = config.pctHouseholds2Dep ?? 0.15;
  const pct3 = config.pctHouseholds3Dep ?? 0.10;

  const tier1Count = numHH * (pct1 + pct2 + pct3);  // all HHs with ≥1 dep
  const tier2Count = numHH * (pct2 + pct3);          // all HHs with ≥2 deps
  const tier3Count = numHH * pct3;                    // all HHs with 3 deps

  const dependentCost = tier1Count * dep1Rate + tier2Count * dep2Rate + tier3Count * dep3Rate;
  const ubiCost = config.ubiAnnualPerAdult * config.adultPopulation + dependentCost;
  const govtOperatingRequirement = config.govtOperatingRequirement;

  // Retirement Program calculations
  const retirementEnabled   = config.retirementEnabled ?? false;
  const retireesCount        = config.retireesCount ?? 54_000_000;
  const avgFinal3yrSalary    = config.avgFinal3yrSalary ?? 75_000;
  const pensionableSalaryCap = config.pensionableSalaryCap ?? 250_000;
  const replacementRate      = config.replacementRate ?? 0.80;
  const payoutDurationYears  = config.payoutDurationYears ?? 25;
  const ssBaseline           = config.ssBaseline ?? 1.3e12;
  const retirementMode       = config.retirementMode ?? 'replace_ss';

  const benefitAdjustmentFactor = config.benefitAdjustmentFactor ?? 0.70;
  const avgPensionableSalary  = Math.min(avgFinal3yrSalary, pensionableSalaryCap);
  const avgAnnualBenefit      = avgPensionableSalary * replacementRate * benefitAdjustmentFactor;
  const annualRetirementCost  = retirementEnabled ? retireesCount * avgAnnualBenefit : 0;
  const retirement25yrTotal   = annualRetirementCost * payoutDurationYears;
  const netChangeVsSS         = retirementEnabled && (retirementMode === 'replace_ss' || retirementMode === 'supplement')
    ? annualRetirementCost - ssBaseline
    : null;

  // Healthcare Program (Phase 1, federal-only)
  const healthcareEnabled = config.healthcareEnabled ?? true;
  const healthcareMode = config.healthcareMode ?? 'baseline';
  const medicareAnnualSpend = config.medicareAnnualSpend ?? 1.05e12;
  const medicaidAnnualSpend = config.medicaidAnnualSpend ?? 0.86e12;
  const baselineFederalHealthcareCost =
    config.federalHealthcareSpendTotal ?? (medicareAnnualSpend + medicaidAnnualSpend);
  const aiDiagnosticsSavingsRate = Math.max(0, Math.min(1, (config.aiDiagnosticsSavingsPct ?? 0) / 100));
  const adminAutomationSavingsRate = Math.max(0, Math.min(1, (config.adminAutomationSavingsPct ?? 0) / 100));
  const allPayerTransparencySavingsRate = Math.max(0, Math.min(1, (config.allPayerTransparencySavingsPct ?? 0) / 100));
  const healthcareSavingsRate =
    healthcareEnabled && healthcareMode === 'efficiency_reform'
      ? 1 -
        (1 - aiDiagnosticsSavingsRate) *
          (1 - adminAutomationSavingsRate) *
          (1 - allPayerTransparencySavingsRate)
      : 0;
  const modeledFederalHealthcareCost = healthcareEnabled
    ? baselineFederalHealthcareCost * (1 - healthcareSavingsRate)
    : 0;
  const healthcareNetFederalSavings = healthcareEnabled
    ? baselineFederalHealthcareCost - modeledFederalHealthcareCost
    : 0;

  // Program funding allocation logic (formalized for Step 3)
  const remainingFiscalSpaceAfterBEL = totalRevenue - ubiCost;
  const fiscalSpaceAfterPrograms =
    remainingFiscalSpaceAfterBEL - annualRetirementCost - modeledFederalHealthcareCost;
  const retirementAllocatedRevenue = annualRetirementCost > 0
    ? Math.max(0, Math.min(Math.max(remainingFiscalSpaceAfterBEL, 0), annualRetirementCost))
    : 0;
  const retirementFundingRatio = annualRetirementCost > 0
    ? retirementAllocatedRevenue / annualRetirementCost
    : null;
  const belShareOfRevenue = totalRevenue > 0 ? (ubiCost / totalRevenue) * 100 : 0;
  const retirementShareOfRevenue = totalRevenue > 0 ? (annualRetirementCost / totalRevenue) * 100 : 0;
  const healthcareShareOfRevenue = totalRevenue > 0 ? (modeledFederalHealthcareCost / totalRevenue) * 100 : 0;

  const totalObligations =
    ubiCost + govtOperatingRequirement + annualRetirementCost + modeledFederalHealthcareCost;

  const surplusDeficit = totalRevenue - totalObligations;
  const isSolvent = surplusDeficit >= 0;

  const personaOutcomes = PERSONAS.map((persona) =>
    calculatePersonaOutcome(persona.label, persona.earnedIncome, config)
  );

  const warnings: string[] = [];

  if (config.tokenTaxRate > 0.008) {
    warnings.push(
      'Token tax rate unusually high (>0.8%)—may imply capital flight risk or market distortion.'
    );
  }

  if (config.ubiAnnualPerAdult > 18000) {
    warnings.push('BEL floor exceeds $18k—verify affordability across income distribution.');
  }

  if (!isSolvent) {
    const deficitPct = ((Math.abs(surplusDeficit) / totalRevenue) * 100).toFixed(1);
    warnings.push(
      `Budget is in deficit by $${Math.abs(surplusDeficit).toLocaleString()} ` +
      `(${deficitPct}% of revenue). Adjust policy parameters to achieve solvency.`
    );
  }

  if (healthcareEnabled && healthcareMode === 'structural_replacement') {
    warnings.push(
      'Healthcare structural replacement mode is locked in Phase 1. Baseline federal cost is used for modeling.'
    );
  }

  if (fiscalSpaceAfterPrograms < 0) {
    warnings.push(
      `Retirement + healthcare exceed remaining fiscal space after BEL by $${Math.abs(fiscalSpaceAfterPrograms).toLocaleString()}.`
    );
  }

  return {
    revenue: {
      tokenTaxRevenue,
      frictionTaxRevenue,
      incomeTaxRevenue,
      welfareSavingsCredit,
      totalRevenue,
    },
    obligations: {
      ubiCost,
      adultUBICost: config.ubiAnnualPerAdult * config.adultPopulation,
      dependentUBICost: dependentCost,
      govtOperatingRequirement,
      totalObligations,
      remainingFiscalSpaceAfterBEL,
      fiscalSpaceAfterPrograms,
      belShareOfRevenue,
      retirementShareOfRevenue,
      healthcareShareOfRevenue,
      retirementAllocatedRevenue,
      retirementFundingRatio,
      retirementProgramCost: annualRetirementCost,
      retirementAnnualBenefit: avgAnnualBenefit,
      retirement25yrTotal,
      netChangeVsSS,
      healthcareProgramCost: modeledFederalHealthcareCost,
      healthcareBaselineFederalCost: baselineFederalHealthcareCost,
      healthcareNetFederalSavings,
    },
    balance: {
      surplusDeficit,
      isSolvent,
    },
    citizenModel: {
      supplementFunctionSummary: generateSupplementSummary(config),
      personaOutcomes,
    },
    diagnostics: {
      warnings,
    },
  };
}

