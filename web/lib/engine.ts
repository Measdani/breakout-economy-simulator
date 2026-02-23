/**
 * Policy Flight Simulator - Math Engine (Browser Version)
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
  const incomeTaxRevenue = calculateAggregateIncomeTax(config);
  const welfareSavingsCredit = config.welfareSavingsCredit;
  const totalRevenue = tokenTaxRevenue + incomeTaxRevenue + welfareSavingsCredit;

  // Calculate UBI cost: adults + tiered dependents
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
  const totalObligations = ubiCost + govtOperatingRequirement;

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
    warnings.push('UBI floor exceeds $18k—verify affordability across income distribution.');
  }

  if (!isSolvent) {
    const deficitPct = ((Math.abs(surplusDeficit) / totalRevenue) * 100).toFixed(1);
    warnings.push(
      `Budget is in deficit by $${Math.abs(surplusDeficit).toLocaleString()} ` +
      `(${deficitPct}% of revenue). Adjust policy parameters to achieve solvency.`
    );
  }

  return {
    revenue: {
      tokenTaxRevenue,
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
