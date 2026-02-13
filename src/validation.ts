/**
 * Policy Flight Simulator - Configuration Validation
 * v0.1 - Input validation and constraint checking
 */

import { PolicyConfig, ConfigValidationResult } from './types';

/**
 * Validate policy configuration and return errors/warnings
 */
export function validateConfig(config: PolicyConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Token tax rate validation
  if (config.tokenTaxRate < 0) {
    errors.push('tokenTaxRate must be non-negative');
  }
  if (config.tokenTaxRate < 0.001) {
    warnings.push('tokenTaxRate is very low (<0.1%); may not generate sufficient revenue');
  }
  if (config.tokenTaxRate > 0.01) {
    warnings.push('tokenTaxRate is high (>1%); may trigger capital flight or market disruption');
  }

  // Flow base validation
  if (config.flowBaseAnnual <= 0) {
    errors.push('flowBaseAnnual must be positive');
  }

  // UBI validation
  if (config.ubiAnnualPerAdult < 0) {
    errors.push('ubiAnnualPerAdult must be non-negative');
  }
  if (config.ubiAnnualPerAdult > 20000) {
    errors.push('ubiAnnualPerAdult exceeds $20k; verify affordability across income distribution');
  }

  // Population validation
  if (config.adultPopulation <= 0) {
    errors.push('adultPopulation must be positive');
  }

  // Welfare savings validation
  if (config.welfareSavingsCredit < 0) {
    errors.push('welfareSavingsCredit cannot be negative');
  }

  // Government cost validation
  if (config.govtOperatingRequirement <= 0) {
    errors.push('govtOperatingRequirement must be positive');
  }

  // Breakout point validation
  if (config.breakoutPoint < 20000) {
    errors.push('breakoutPoint is unusually low (<$20k); may invert incentives');
  }
  if (config.breakoutPoint > 100000) {
    errors.push('breakoutPoint is unusually high (>$100k); most people will still receive supplement');
  }
  if (config.breakoutPoint < config.tier1Start) {
    errors.push('breakoutPoint should be >= tier1Start');
  }

  // Tax bracket validation
  if (config.tier1Rate < 0 || config.tier1Rate > 1) {
    errors.push('tier1Rate must be between 0 and 1 (0–100%)');
  }
  if (config.tier2Rate < 0 || config.tier2Rate > 1) {
    errors.push('tier2Rate must be between 0 and 1 (0–100%)');
  }
  if (config.tier2Rate < config.tier1Rate) {
    warnings.push('tier2Rate is lower than tier1Rate; typically, higher earners pay higher rates');
  }
  if (config.tier1Start < 0) {
    errors.push('tier1Start cannot be negative');
  }
  if (config.tier2Start < 0) {
    errors.push('tier2Start cannot be negative');
  }
  if (config.tier2Start <= config.tier1Start) {
    errors.push('tier2Start must be greater than tier1Start');
  }

  // Supplement curve validation
  if (config.supplementApexIncome < 0) {
    errors.push('supplementApexIncome cannot be negative');
  }
  if (config.supplementApexBonus < 0) {
    errors.push('supplementApexBonus cannot be negative');
  }
  if (config.supplementApexIncome >= config.breakoutPoint) {
    errors.push('supplementApexIncome must be less than breakoutPoint');
  }
  if (config.supplementApexBonus > config.ubiAnnualPerAdult * 2) {
    warnings.push('supplementApexBonus is very large relative to UBI; verify intended policy');
  }

  // Persona weights validation
  if (config.personaWeights) {
    if (config.personaWeights.length !== 4) {
      errors.push('personaWeights must have exactly 4 elements (one per persona)');
    } else {
      const sum = config.personaWeights.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.0001) {
        errors.push(`personaWeights must sum to 1.0 (currently sum to ${sum})`);
      }
      if (config.personaWeights.some(w => w < 0)) {
        errors.push('personaWeights cannot contain negative values');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Throw error if config is invalid
 */
export function assertValidConfig(config: PolicyConfig): void {
  const validation = validateConfig(config);
  if (!validation.isValid) {
    throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`);
  }
}

/**
 * Get validation result as human-readable string
 */
export function getValidationMessage(result: ConfigValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'Configuration is valid ✓';
  }

  let message = '';
  if (!result.isValid) {
    message += `ERRORS (${result.errors.length}):\n`;
    message += result.errors.map(e => `  ✗ ${e}`).join('\n');
  }
  if (result.warnings.length > 0) {
    if (message) message += '\n\n';
    message += `WARNINGS (${result.warnings.length}):\n`;
    message += result.warnings.map(w => `  ⚠ ${w}`).join('\n');
  }
  return message;
}
