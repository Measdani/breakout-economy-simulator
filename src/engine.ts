/**
 * Policy Flight Simulator - Math Engine
 * v0.1 - Core simulation logic
 */

import {
  PolicyConfig,
  SimulationResult,
  PersonaOutcome,
  PERSONAS
} from './types';

/**
 * Calculate token tax revenue
 * Formula: flowBaseAnnual * tokenTaxRate
 */
export function calculateTokenTaxRevenue(
  flowBaseAnnual: number,
  tokenTaxRate: number
): number {
  return flowBaseAnnual * tokenTaxRate;
}

/**
 * Calculate income tax for a single earned income
 * Tiered structure:
 * - 0 to tier1Start: 0% (untaxed)
 * - tier1Start to tier2Start: tier1Rate
 * - tier2Start+: tier2Rate
 */
export function calculateIncomeTax(
  earnedIncome: number,
  config: PolicyConfig
): number {
  if (earnedIncome <= config.tier1Start) {
    return 0;
  }

  let tax = 0;

  // Tier 1
  if (earnedIncome > config.tier1Start && earnedIncome <= config.tier2Start) {
    const taxableInTier1 = earnedIncome - config.tier1Start;
    tax += taxableInTier1 * config.tier1Rate;
  } else if (earnedIncome > config.tier2Start) {
    // Full tier 1
    const taxableInTier1 = config.tier2Start - config.tier1Start;
    tax += taxableInTier1 * config.tier1Rate;

    // Tier 2
    const taxableInTier2 = earnedIncome - config.tier2Start;
    tax += taxableInTier2 * config.tier2Rate;
  }

  return tax;
}

/**
 * Calculate aggregate income tax revenue across all adults
 * Uses persona distribution (configurable or equal weights)
 */
export function calculateAggregateIncomeTax(
  config: PolicyConfig
): number {
  // Get persona weights (default: equal 25% distribution)
  const weights = config.personaWeights || [0.25, 0.25, 0.25, 0.25];

  // Calculate weighted average tax across personas
  const weightedIncomeTax = PERSONAS.reduce((sum, persona, index) => {
    const tax = calculateIncomeTax(persona.earnedIncome, config);
    return sum + tax * weights[index];
  }, 0);

  return weightedIncomeTax * config.adultPopulation;
}

/**
 * Calculate supplement at a given earned income level
 * Floor & Launchpad model:
 * - Base UBI for everyone
 * - Bonus/supplement peaks at apex income
 * - Tapers linearly to reach exactly $0 at breakout point
 * - Never creates cliffs, never reduces net income
 */
export function calculateSupplement(
  earnedIncome: number,
  config: PolicyConfig
): number {
  const { supplementApexIncome, supplementApexBonus, breakoutPoint } = config;

  // Before apex: linearly increase from 0 to apex bonus
  if (earnedIncome < supplementApexIncome) {
    const ratio = earnedIncome / supplementApexIncome;
    return supplementApexBonus * ratio;
  }

  // At/after apex: taper down to reach exactly 0 at breakout point
  if (earnedIncome >= supplementApexIncome && earnedIncome <= breakoutPoint) {
    const incomeRange = breakoutPoint - supplementApexIncome;
    const incomeAboveApex = earnedIncome - supplementApexIncome;

    // Calculate slope that reaches exactly 0 at breakout point
    const slope = -supplementApexBonus / incomeRange;
    const supplement = supplementApexBonus + slope * incomeAboveApex;

    return Math.max(0, supplement); // Never negative
  }

  // Beyond breakout point: no supplement
  return 0;
}

/**
 * Calculate persona outcome for a single earned income
 */
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
    netIncome
  };
}

/**
 * Generate supplement function summary in human-readable format
 */
export function generateSupplementSummary(config: PolicyConfig): string {
  const { supplementApexIncome, supplementApexBonus, breakoutPoint } = config;

  // Calculate the actual slope
  const incomeRange = breakoutPoint - supplementApexIncome;
  const slope = supplementApexBonus / incomeRange;
  const slope_pct = (slope * 100).toFixed(1);

  return (
    `Supplement peaks at $${supplementApexIncome.toLocaleString()} earned income ` +
    `(+$${supplementApexBonus.toLocaleString()} bonus), ` +
    `then tapers at ${slope_pct}¢ per $1 earned until reaching $0 at $${breakoutPoint.toLocaleString()} breakout point.`
  );
}

/**
 * Main simulation engine
 * Takes policy config, returns complete simulation result
 */
export function runSimulation(config: PolicyConfig): SimulationResult {
  // Revenue calculations
  const tokenTaxRevenue = calculateTokenTaxRevenue(config.flowBaseAnnual, config.tokenTaxRate);
  const incomeTaxRevenue = calculateAggregateIncomeTax(config);
  const welfareSavingsCredit = config.welfareSavingsCredit;
  const totalRevenue = tokenTaxRevenue + incomeTaxRevenue + welfareSavingsCredit;

  // Obligation calculations
  const ubiCost = config.ubiAnnualPerAdult * config.adultPopulation;
  const govtOperatingRequirement = config.govtOperatingRequirement;
  const totalObligations = ubiCost + govtOperatingRequirement;

  // Balance
  const surplusDeficit = totalRevenue - totalObligations;
  const isSolvent = surplusDeficit >= 0;

  // Persona outcomes
  const personaOutcomes = PERSONAS.map(persona =>
    calculatePersonaOutcome(persona.label, persona.earnedIncome, config)
  );

  // Diagnostics & warnings
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
      totalRevenue
    },
    obligations: {
      ubiCost,
      govtOperatingRequirement,
      totalObligations
    },
    balance: {
      surplusDeficit,
      isSolvent
    },
    citizenModel: {
      supplementFunctionSummary: generateSupplementSummary(config),
      personaOutcomes
    },
    diagnostics: {
      warnings
    }
  };
}
