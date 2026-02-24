/**
 * NAERM (National AI Economy Resiliency Model) - Type Definitions
 * Mirrored from ../src/types.ts for web client use
 */

export interface PolicyConfig {
  tokenTaxRate: number;
  flowBaseAnnual: number;
  ubiAnnualPerAdult: number;
  adultPopulation: number;
  welfareSavingsCredit: number;
  govtOperatingRequirement: number;
  breakoutPoint: number;
  tier1Rate: number;
  tier1Start: number;
  tier2Rate: number;
  tier2Start: number;
  supplementApexIncome: number;
  supplementApexBonus: number;
  personaWeights?: number[];
  // Dependent UBI tiers
  ubiDependent1?: number;
  ubiDependent2?: number;
  ubiDependent3?: number;
  // Household structure
  numHouseholds?: number;
  pctHouseholds1Dep?: number;
  pctHouseholds2Dep?: number;
  pctHouseholds3Dep?: number;
  // Friction Tax (new)
  frictionTaxRate?: number;
  baseTransactionVolume?: number;
  transactionVolumeGrowthRate?: number;
  capitalFlightRate?: number;
  marketMakerExempt?: boolean;
}

export interface Revenue {
  tokenTaxRevenue: number;
  frictionTaxRevenue?: number;
  incomeTaxRevenue: number;
  welfareSavingsCredit: number;
  totalRevenue: number;
}

export interface Obligations {
  ubiCost: number;
  adultUBICost?: number;
  dependentUBICost?: number;
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

export const PERSONAS = [
  { label: 'Starter', earnedIncome: 20000 },
  { label: 'Professional', earnedIncome: 50000 },
  { label: 'Manager', earnedIncome: 100000 },
  { label: 'Executive', earnedIncome: 200000 },
];
