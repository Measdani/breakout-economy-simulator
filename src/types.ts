/**
 * Policy Flight Simulator - Type Definitions
 * v0.1 - Core logic engine types
 */

export interface PolicyConfig {
  // Token Tax
  tokenTaxRate: number; // 0.001–0.01 (0.1%–1% range)
  flowBaseAnnual: number; // default 1e15 (1 Quadrillion)

  // UBI
  ubiAnnualPerAdult: number; // 0–20000

  // Population & base costs
  adultPopulation: number; // default 265,000,000
  welfareSavingsCredit: number; // default 630e9
  govtOperatingRequirement: number; // default 2.74e12

  // Income tax brackets
  breakoutPoint: number; // 30000–80000 (income threshold)
  tier1Rate: number; // marginal rate for tier 1
  tier1Start: number; // start of tier 1 (typically breakoutPoint)
  tier2Rate: number; // marginal rate for tier 2
  tier2Start: number; // start of tier 2 (e.g., 135000)

  // Supplement curve parameters
  supplementApexIncome: number; // earned income where supplement peaks (e.g., 24000)
  supplementApexBonus: number; // supplement bonus at apex (e.g., 6000)
  supplementGlideSlope?: number; // DEPRECATED: use calculated slope (kept for backwards compatibility)

  // Optional: Income distribution weights for personas
  personaWeights?: number[]; // Optional override for persona distribution (should sum to 1.0)
}

export interface Revenue {
  tokenTaxRevenue: number;
  incomeTaxRevenue: number;
  welfareSavingsCredit: number;
  totalRevenue: number;
}

export interface Obligations {
  ubiCost: number;
  govtOperatingRequirement: number;
  totalObligations: number;
}

export interface Balance {
  surplusDeficit: number;
  isSolvent: boolean;
}

export interface PersonaOutcome {
  label: string;
  earnedIncome: number;
  ubi: number;
  supplement: number;
  incomeTax: number;
  netIncome: number;
}

export interface SimulationResult {
  revenue: Revenue;
  obligations: Obligations;
  balance: Balance;
  citizenModel: {
    supplementFunctionSummary: string;
    personaOutcomes: PersonaOutcome[];
  };
  diagnostics: {
    warnings: string[];
  };
}

// Validation result type
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Default configuration
export const DEFAULT_CONFIG: PolicyConfig = {
  tokenTaxRate: 0.0035, // 0.35%
  flowBaseAnnual: 1e15, // 1 Quadrillion
  ubiAnnualPerAdult: 12000,
  adultPopulation: 265000000,
  welfareSavingsCredit: 630e9,
  govtOperatingRequirement: 2.74e12,
  breakoutPoint: 60000,
  tier1Rate: 0.19,
  tier1Start: 60000, // Tier 1 covers income from 60,001 onward
  tier2Rate: 0.29,
  tier2Start: 135000, // Tier 2 covers income from 135,001 onward
  supplementApexIncome: 24000,
  supplementApexBonus: 6000,
  // Note: supplementGlideSlope is now calculated automatically to reach 0 at breakoutPoint
  personaWeights: [0.25, 0.25, 0.25, 0.25] // Equal distribution across personas
};

// Persona definitions (fixed earned incomes for comparison)
export const PERSONAS = [
  { label: 'Starter', earnedIncome: 20000 },
  { label: 'Professional', earnedIncome: 50000 },
  { label: 'Manager', earnedIncome: 100000 },
  { label: 'Executive', earnedIncome: 200000 }
];
