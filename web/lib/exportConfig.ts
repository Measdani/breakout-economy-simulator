import type { PolicyConfig, SimulationResult } from './types';

export function exportConfigAsCSV(
  config: PolicyConfig,
  result: SimulationResult,
  configName: string = 'Configuration'
): void {
  const timestamp = new Date().toISOString();

  // Prepare CSV rows
  const rows: string[] = [];

  // Header
  rows.push(`NAERM (National AI Economy Resiliency Model) - Configuration Export`);
  rows.push(`Exported: ${timestamp}`);
  rows.push(`Configuration: ${configName}`);
  rows.push('');

  // Policy Parameters Section
  rows.push('=== POLICY PARAMETERS ===');
  rows.push(`Token Tax Rate (%),${(config.tokenTaxRate * 100).toFixed(4)}`);
  rows.push(`Annual Digital Flow Base ($),${config.flowBaseAnnual.toLocaleString()}`);
  rows.push(`UBI Annual Per Adult ($),${config.ubiAnnualPerAdult.toLocaleString()}`);
  rows.push(`UBI Dependent Tier 1 ($),${config.ubiDependent1?.toLocaleString() || 'N/A'}`);
  rows.push(`UBI Dependent Tier 2 ($),${config.ubiDependent2?.toLocaleString() || 'N/A'}`);
  rows.push(`UBI Dependent Tier 3 ($),${config.ubiDependent3?.toLocaleString() || 'N/A'}`);
  rows.push(`Breakout Point ($),${config.breakoutPoint.toLocaleString()}`);
  rows.push(`Supplement Apex Income ($),${config.supplementApexIncome.toLocaleString()}`);
  rows.push(`Supplement Apex Bonus ($),${config.supplementApexBonus.toLocaleString()}`);
  rows.push('');

  // Household Structure Section
  rows.push('=== HOUSEHOLD STRUCTURE ===');
  rows.push(`Percentage Households with 1 Dependent (%),${((config.pctHouseholds1Dep ?? 0) * 100).toFixed(1)}`);
  rows.push(`Percentage Households with 2 Dependents (%),${((config.pctHouseholds2Dep ?? 0) * 100).toFixed(1)}`);
  rows.push(`Percentage Households with 3+ Dependents (%),${((config.pctHouseholds3Dep ?? 0) * 100).toFixed(1)}`);
  rows.push('');

  // Tax Structure Section
  rows.push('=== INCOME TAX STRUCTURE ===');
  rows.push(`Tier 1 Rate (%),${(config.tier1Rate * 100).toFixed(2)}`);
  rows.push(`Tier 1 Start ($),${config.tier1Start.toLocaleString()}`);
  rows.push(`Tier 2 Rate (%),${(config.tier2Rate * 100).toFixed(2)}`);
  rows.push(`Tier 2 Start ($),${config.tier2Start.toLocaleString()}`);
  rows.push('');

  // Demographic Baseline Section
  rows.push('=== DEMOGRAPHIC BASELINE ===');
  rows.push(`Adult Population,${config.adultPopulation.toLocaleString()}`);
  rows.push(`Estimated Total Households,${Math.round(config.adultPopulation / 2.5).toLocaleString()}`);
  rows.push('');

  // Fiscal Parameters Section
  rows.push('=== FISCAL PARAMETERS ===');
  rows.push(`Government Operating Requirement ($),${config.govtOperatingRequirement.toLocaleString()}`);
  rows.push(`Welfare Savings Credit ($),${config.welfareSavingsCredit.toLocaleString()}`);
  rows.push('');

  // Simulation Results Section
  rows.push('=== SIMULATION RESULTS ===');
  rows.push('Revenue Breakdown:');
  rows.push(`  Token Tax Revenue ($),${result.revenue.tokenTaxRevenue.toLocaleString()}`);
  rows.push(`  Income Tax Revenue ($),${result.revenue.incomeTaxRevenue.toLocaleString()}`);
  rows.push(`  Welfare Savings Credit ($),${result.revenue.welfareSavingsCredit.toLocaleString()}`);
  rows.push(`  Total Revenue ($),${result.revenue.totalRevenue.toLocaleString()}`);
  rows.push('');

  rows.push('Obligations Breakdown:');
  rows.push(`  Adult UBI Cost ($),${result.obligations.adultUBICost?.toLocaleString() || 'N/A'}`);
  rows.push(`  Dependent UBI Cost ($),${result.obligations.dependentUBICost?.toLocaleString() || 'N/A'}`);
  rows.push(`  Total UBI Cost ($),${result.obligations.ubiCost.toLocaleString()}`);
  rows.push(`  Government Operations ($),${result.obligations.govtOperatingRequirement.toLocaleString()}`);
  rows.push(`  Total Obligations ($),${result.obligations.totalObligations.toLocaleString()}`);
  rows.push('');

  rows.push('Fiscal Balance:');
  rows.push(`  Surplus/Deficit ($),${result.balance.surplusDeficit.toLocaleString()}`);
  rows.push(`  Status,${result.balance.isSolvent ? 'SOLVENT' : 'DEFICIT'}`);
  rows.push('');

  // Policy Metrics Section
  const assumedGDP = 28e12;
  const ubiPercentageGDP = (result.obligations.ubiCost / assumedGDP) * 100;
  rows.push('=== POLICY METRICS ===');
  rows.push(`UBI Cost as % of GDP,${ubiPercentageGDP.toFixed(2)}`);
  rows.push(`Token Tax Revenue as % of Total Revenue,${((result.revenue.tokenTaxRevenue / result.revenue.totalRevenue) * 100).toFixed(2)}`);
  rows.push(`UBI Cost as % of Total Obligations,${((result.obligations.ubiCost / result.obligations.totalObligations) * 100).toFixed(2)}`);
  rows.push('');

  // Convert to CSV string
  const csvContent = rows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const sanitizedConfigName = configName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `policy-simulator-${sanitizedConfigName}-${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
