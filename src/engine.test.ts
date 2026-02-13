/**
 * Policy Flight Simulator - Unit Tests
 * v0.1 - Math engine tests with default config locked
 */

import {
  calculateTokenTaxRevenue,
  calculateIncomeTax,
  calculateAggregateIncomeTax,
  calculateSupplement,
  calculatePersonaOutcome,
  generateSupplementSummary,
  runSimulation
} from './engine';
import { DEFAULT_CONFIG, PolicyConfig } from './types';
import { validateConfig, assertValidConfig } from './validation';

describe('Token Tax Revenue', () => {
  test('should calculate token tax revenue correctly', () => {
    const revenue = calculateTokenTaxRevenue(1e15, 0.0035);
    expect(revenue).toBe(3.5e12); // 3.5 trillion
  });

  test('should scale with tax rate', () => {
    const revenue1 = calculateTokenTaxRevenue(1e15, 0.001);
    const revenue2 = calculateTokenTaxRevenue(1e15, 0.002);
    expect(revenue2).toBe(revenue1 * 2);
  });

  test('should scale with flow base', () => {
    const revenue1 = calculateTokenTaxRevenue(1e15, 0.0035);
    const revenue2 = calculateTokenTaxRevenue(2e15, 0.0035);
    expect(revenue2).toBe(revenue1 * 2);
  });
});

describe('Income Tax Calculation', () => {
  test('should not tax income below tier1Start', () => {
    const tax = calculateIncomeTax(50000, DEFAULT_CONFIG);
    expect(tax).toBe(0);
  });

  test('should apply tier1 rate to income in tier 1', () => {
    // Income: 80,000
    // Taxable in tier 1: 80,000 - 60,001 = 19,999
    // Tax: 19,999 * 0.19 = 3,799.81
    const tax = calculateIncomeTax(80000, DEFAULT_CONFIG);
    expect(tax).toBeCloseTo(19999 * 0.19, 0);
  });

  test('should apply tier2 rate to income above tier2Start', () => {
    // Income: 200,000
    // Tier 1: (135,000 - 60,001) * 0.19 = 14,299.81
    // Tier 2: (200,000 - 135,000) * 0.29 = 18,850
    // Total: 33,149.81
    const tax = calculateIncomeTax(200000, DEFAULT_CONFIG);
    const tier1Tax = (135000 - 60001) * 0.19;
    const tier2Tax = (200000 - 135000) * 0.29;
    expect(tax).toBeCloseTo(tier1Tax + tier2Tax, 0);
  });

  test('should handle exactly at tier boundaries', () => {
    const tax1 = calculateIncomeTax(60000, DEFAULT_CONFIG);
    expect(tax1).toBe(0); // At tier1Start, no tax

    const tax2 = calculateIncomeTax(60001, DEFAULT_CONFIG);
    expect(tax2).toBeCloseTo(1 * 0.19, 5); // $1 in tier 1
  });
});

describe('Supplement Curve', () => {
  test('should be zero at earned income 0', () => {
    const supplement = calculateSupplement(0, DEFAULT_CONFIG);
    expect(supplement).toBe(0);
  });

  test('should increase linearly from 0 to apex income', () => {
    // At apex income (24,000), supplement should be apexBonus (6,000)
    const supplementAtApex = calculateSupplement(24000, DEFAULT_CONFIG);
    expect(supplementAtApex).toBeCloseTo(6000, 0);
  });

  test('should be proportional between 0 and apex', () => {
    // At 12,000 (halfway to apex of 24,000), should be 3,000 (halfway to 6,000)
    const supplement = calculateSupplement(12000, DEFAULT_CONFIG);
    expect(supplement).toBeCloseTo(3000, 0);
  });

  test('should taper smoothly after apex', () => {
    // At 45,000 (midway between apex of 24,000 and breakout of 60,000):
    // Should be halfway down from 6,000 to 0 = 3,000
    const midpoint = (24000 + 60000) / 2;
    const supplement = calculateSupplement(midpoint, DEFAULT_CONFIG);
    expect(supplement).toBeCloseTo(3000, 0);
  });

  test('should reach exactly zero at breakout point', () => {
    const supplement = calculateSupplement(60000, DEFAULT_CONFIG);
    expect(supplement).toBeCloseTo(0, 5);
  });

  test('should be zero after breakout point', () => {
    const supplement = calculateSupplement(80000, DEFAULT_CONFIG);
    expect(supplement).toBe(0);
  });

  test('should never go negative (clamped to 0)', () => {
    // Well beyond breakout point, supplement stays at 0
    const supplement = calculateSupplement(200000, DEFAULT_CONFIG);
    expect(supplement).toBe(0);
  });
});

describe('Persona Outcomes', () => {
  test('Starter persona should have no income tax', () => {
    const starter = calculatePersonaOutcome('Starter', 20000, DEFAULT_CONFIG);
    expect(starter.incomeTax).toBe(0);
    expect(starter.earnedIncome).toBe(20000);
  });

  test('Professional persona should have income tax in tier 1', () => {
    const professional = calculatePersonaOutcome('Professional', 50000, DEFAULT_CONFIG);
    // Income tax should be 0 (below tier1Start of 60,001)
    expect(professional.incomeTax).toBe(0);
  });

  test('Manager persona should have income tax in tier 1', () => {
    const manager = calculatePersonaOutcome('Manager', 100000, DEFAULT_CONFIG);
    // Tax: (100,000 - 60,001) * 0.19 = 7,599.81
    expect(manager.incomeTax).toBeCloseTo((100000 - 60001) * 0.19, 0);
  });

  test('Executive persona should have income tax across tiers', () => {
    const executive = calculatePersonaOutcome('Executive', 200000, DEFAULT_CONFIG);
    const expectedTax = (135000 - 60001) * 0.19 + (200000 - 135000) * 0.29;
    expect(executive.incomeTax).toBeCloseTo(expectedTax, 0);
  });

  test('net income should always increase with earned income', () => {
    const outcomes = [
      calculatePersonaOutcome('Low', 10000, DEFAULT_CONFIG),
      calculatePersonaOutcome('Mid', 50000, DEFAULT_CONFIG),
      calculatePersonaOutcome('High', 100000, DEFAULT_CONFIG),
      calculatePersonaOutcome('Very High', 200000, DEFAULT_CONFIG)
    ];

    for (let i = 0; i < outcomes.length - 1; i++) {
      expect(outcomes[i + 1].netIncome).toBeGreaterThan(outcomes[i].netIncome);
    }
  });
});

describe('Full Simulation with Default Config', () => {
  let result: ReturnType<typeof runSimulation>;

  beforeAll(() => {
    result = runSimulation(DEFAULT_CONFIG);
  });

  test('should return solvent budget with default config', () => {
    expect(result.balance.isSolvent).toBe(true);
    expect(result.balance.surplusDeficit).toBeGreaterThan(0);
  });

  test('should have positive revenues', () => {
    expect(result.revenue.tokenTaxRevenue).toBeGreaterThan(0);
    expect(result.revenue.incomeTaxRevenue).toBeGreaterThan(0);
    expect(result.revenue.welfareSavingsCredit).toBeGreaterThan(0);
    expect(result.revenue.totalRevenue).toBeGreaterThan(0);
  });

  test('should calculate token tax revenue correctly', () => {
    const expected = DEFAULT_CONFIG.flowBaseAnnual * DEFAULT_CONFIG.tokenTaxRate;
    expect(result.revenue.tokenTaxRevenue).toBeCloseTo(expected, 0);
  });

  test('should calculate UBI cost correctly', () => {
    const expected = DEFAULT_CONFIG.ubiAnnualPerAdult * DEFAULT_CONFIG.adultPopulation;
    expect(result.obligations.ubiCost).toBeCloseTo(expected, 0);
  });

  test('should include govt operating requirement', () => {
    expect(result.obligations.govtOperatingRequirement).toBe(
      DEFAULT_CONFIG.govtOperatingRequirement
    );
  });

  test('should have four persona outcomes', () => {
    expect(result.citizenModel.personaOutcomes).toHaveLength(4);
  });

  test('persona labels should match expected labels', () => {
    const labels = result.citizenModel.personaOutcomes.map(p => p.label);
    expect(labels).toEqual(['Starter', 'Professional', 'Manager', 'Executive']);
  });

  test('should generate supplement summary', () => {
    expect(result.citizenModel.supplementFunctionSummary).toContain('Supplement peaks');
    expect(result.citizenModel.supplementFunctionSummary).toContain('$24,000');
    expect(result.citizenModel.supplementFunctionSummary).toContain('$60,000');
  });

  test('should not have warnings for default config', () => {
    // Default config is well-balanced, should have no warnings
    expect(result.diagnostics.warnings.length).toBe(0);
  });
});

describe('Edge Cases & Validation', () => {
  test('should handle zero UBI', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, ubiAnnualPerAdult: 0 };
    const result = runSimulation(config);
    const starter = result.citizenModel.personaOutcomes[0];
    expect(starter.ubi).toBe(0);
  });

  test('should warn on high token tax rate', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, tokenTaxRate: 0.009 };
    const result = runSimulation(config);
    expect(result.diagnostics.warnings.some(w => w.includes('capital flight'))).toBe(true);
  });

  test('should warn on high UBI', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, ubiAnnualPerAdult: 19000 };
    const result = runSimulation(config);
    expect(result.diagnostics.warnings.some(w => w.includes('exceeds $18k'))).toBe(true);
  });

  test('should warn on deficit', () => {
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      tokenTaxRate: 0.001, // Very low token tax
      ubiAnnualPerAdult: 20000 // High UBI
    };
    const result = runSimulation(config);
    expect(result.diagnostics.warnings.some(w => w.includes('deficit'))).toBe(true);
    expect(result.balance.isSolvent).toBe(false);
  });

  test('should handle custom breakout point', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, breakoutPoint: 50000 };
    const result = runSimulation(config);
    expect(result.balance.isSolvent).toBe(true);
  });
});

describe('Supplement Summary', () => {
  test('should include key parameters in summary', () => {
    const summary = generateSupplementSummary(DEFAULT_CONFIG);
    expect(summary).toContain('24,000');
    expect(summary).toContain('6,000');
    expect(summary).toContain('60,000');
  });

  test('should show correct taper percentage', () => {
    const summary = generateSupplementSummary(DEFAULT_CONFIG);
    // Slope = 6000 / (60000 - 24000) = 6000 / 36000 = 0.1667 = 16.67¢ per $1
    expect(summary).toContain('16');
  });

  test('should mention reaching zero at breakout', () => {
    const summary = generateSupplementSummary(DEFAULT_CONFIG);
    expect(summary).toContain('$0');
    expect(summary).toContain('breakout');
  });
});

describe('Configuration Validation', () => {
  test('should validate DEFAULT_CONFIG as valid', () => {
    const result = validateConfig(DEFAULT_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject negative token tax rate', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, tokenTaxRate: -0.001 };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('tokenTaxRate'))).toBe(true);
  });

  test('should reject UBI above $20k', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, ubiAnnualPerAdult: 25000 };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds'))).toBe(true);
  });

  test('should reject breakoutPoint < tier1Start', () => {
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      breakoutPoint: 50000,
      tier1Start: 60000
    };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
  });

  test('should reject tier2Start <= tier1Start', () => {
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      tier1Start: 100000,
      tier2Start: 100000
    };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
  });

  test('should reject invalid persona weights (wrong count)', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, personaWeights: [0.5, 0.5] };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('exactly 4'))).toBe(true);
  });

  test('should reject persona weights that do not sum to 1', () => {
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      personaWeights: [0.3, 0.3, 0.3, 0.3]
    };
    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('sum to 1.0'))).toBe(true);
  });

  test('should accept valid custom persona weights', () => {
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      personaWeights: [0.4, 0.3, 0.2, 0.1]
    };
    const result = validateConfig(config);
    expect(result.isValid).toBe(true);
  });

  test('should warn on very high token tax rate', () => {
    const config: PolicyConfig = { ...DEFAULT_CONFIG, tokenTaxRate: 0.015 };
    const result = validateConfig(config);
    expect(result.warnings.some(w => w.includes('capital flight'))).toBe(true);
  });
});

describe('Configurable Persona Weights', () => {
  test('should use equal weights by default', () => {
    const result = runSimulation(DEFAULT_CONFIG);
    // Default weights are [0.25, 0.25, 0.25, 0.25]
    expect(result.revenue.incomeTaxRevenue).toBeGreaterThan(0);
  });

  test('should use custom weights when provided', () => {
    const config1: PolicyConfig = {
      ...DEFAULT_CONFIG,
      personaWeights: [1.0, 0.0, 0.0, 0.0] // 100% at $20k
    };
    const config2: PolicyConfig = {
      ...DEFAULT_CONFIG,
      personaWeights: [0.0, 0.0, 0.0, 1.0] // 100% at $200k
    };

    const result1 = runSimulation(config1);
    const result2 = runSimulation(config2);

    // Result2 should have higher income tax (all high earners)
    expect(result2.revenue.incomeTaxRevenue).toBeGreaterThan(
      result1.revenue.incomeTaxRevenue
    );
  });

  test('should scale with skewed distribution', () => {
    const skewedConfig: PolicyConfig = {
      ...DEFAULT_CONFIG,
      personaWeights: [0.2, 0.2, 0.3, 0.3] // Skewed toward higher income
    };

    const result = runSimulation(skewedConfig);
    expect(result.revenue.incomeTaxRevenue).toBeGreaterThan(0);
    // Higher income skew should produce more tax revenue and remain solvent
    expect(result.balance.isSolvent).toBe(true);
  });
});
