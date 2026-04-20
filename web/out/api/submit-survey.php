<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

require_method('POST');

if (is_honeypot_triggered($_POST['honeypot'] ?? null)) {
    header('Location: /survey/', true, 303);
    exit;
}

function require_allowed_option(mixed $value, array $allowed, string $fieldLabel): string
{
    $sanitized = sanitize_required_text($value, 120, $fieldLabel);
    if (!in_array($sanitized, $allowed, true)) {
        respond_error($fieldLabel . ' is invalid.');
    }

    return $sanitized;
}

function html_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function render_success_page(): never
{
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Survey Submitted</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #eef3fb;
      color: #10203a;
    }
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 72px 20px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #dbe6f5;
      border-radius: 24px;
      padding: 36px;
      box-shadow: 0 18px 42px rgba(16, 32, 58, 0.08);
    }
    h1 {
      margin: 0 0 12px;
      font-size: 2rem;
      line-height: 1.15;
    }
    p {
      margin: 0 0 16px;
      line-height: 1.7;
      color: #42536f;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
    }
    .primary {
      background: #2950c8;
      color: #ffffff;
    }
    .secondary {
      border: 1px solid #cad6ea;
      color: #1d335c;
      background: #f8fbff;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Survey Submitted</h1>
      <p>Your policy model and survey responses were saved successfully.</p>
      <p>You can review the public submissions page or continue exploring the simulator.</p>
      <div class="actions">
        <a class="primary" href="/leaderboard/">View Submissions</a>
        <a class="secondary" href="/model/">Launch the Simulator</a>
      </div>
    </div>
  </div>
</body>
</html>
<?php
    exit;
}

$financialSecurityAllowed = ['very_secure', 'somewhat_secure', 'neutral', 'somewhat_insecure', 'very_insecure'];
$insecurityReasonAllowed = ['not_enough_income', 'job_loss_risk', 'tech_change_fear', 'uncertain_about_ai'];
$additionalIncomeAllowed = ['pursue_more_work', 'start_expand_business', 'education_training', 'no_change', 'unsure'];
$benefitsCliffAllowed = ['yes', 'no', 'not_applicable', 'prefer_not_to_say'];
$welfareConcernAllowed = [
    'yes_income_not_high_enough',
    'yes_health_insurance_unaffordable',
    'no_need_change_broken_system',
    'no_baseline_is_flexible',
    'no_opinion',
];
$baselineSupportAllowed = ['none', '500', '1000', '1500', '2000', '3000'];
$dependentSupportAllowed = ['none', 'first_two_only', 'tiered_up_to_three', 'all_dependents', 'unsure'];
$retirementAllowed = [
    'traditional_social_security',
    'gov_supported_individual_accounts',
    'hybrid',
    'personal_accounts_replace_ss',
    'unsure',
];
$healthcareAllowed = ['improve_current', 'baseline_with_private', 'catastrophic_coverage', 'national_healthcare', 'unsure'];
$ageAllowed = ['18_24', '25_34', '35_44', '45_54', '55_64', '65_plus'];
$employmentAllowed = ['full_time', 'part_time', 'self_employed', 'student', 'between_jobs', 'unable_to_work', 'retired'];
$dependentsAllowed = ['none', '1', '2', '3', '4_plus', 'prefer_not_to_say'];
$educationAllowed = ['no_high_school', 'high_school', 'trade_certification', 'college_degree', 'advanced_degree'];
$educationAlignmentAllowed = ['yes', 'underemployed_same_field', 'not_in_my_field'];

$financialSecurity = require_allowed_option($_POST['financialSecurity'] ?? null, $financialSecurityAllowed, 'Financial security');
$insecurityReason = null;
if ($financialSecurity === 'somewhat_insecure' || $financialSecurity === 'very_insecure') {
    $insecurityReason = require_allowed_option($_POST['insecurityReason'] ?? null, $insecurityReasonAllowed, 'Insecurity reason');
}
$additionalIncomeImpact = require_allowed_option($_POST['additionalIncomeImpact'] ?? null, $additionalIncomeAllowed, 'Additional income impact');
$benefitsCliffExperience = require_allowed_option($_POST['benefitsCliffExperience'] ?? null, $benefitsCliffAllowed, 'Benefits cliff experience');
$welfareEliminationConcern = require_allowed_option($_POST['welfareEliminationConcern'] ?? null, $welfareConcernAllowed, 'Welfare transition concern');
$baselineSupportLevel = require_allowed_option($_POST['baselineSupportLevel'] ?? null, $baselineSupportAllowed, 'Baseline support level');
$dependentSupportPolicy = require_allowed_option($_POST['dependentSupportPolicy'] ?? null, $dependentSupportAllowed, 'Dependent support policy');
$retirementSystemPreference = require_allowed_option($_POST['retirementSystemPreference'] ?? null, $retirementAllowed, 'Retirement system preference');
$healthcareSystemPreference = require_allowed_option($_POST['healthcareSystemPreference'] ?? null, $healthcareAllowed, 'Healthcare system preference');
$ageRange = require_allowed_option($_POST['ageRange'] ?? null, $ageAllowed, 'Age range');
$employmentSituation = require_allowed_option($_POST['employmentSituation'] ?? null, $employmentAllowed, 'Employment situation');
$dependentsCount = require_allowed_option($_POST['dependentsCount'] ?? null, $dependentsAllowed, 'Dependents count');
$educationLevel = require_allowed_option($_POST['educationLevel'] ?? null, $educationAllowed, 'Education level');
$educationAlignment = require_allowed_option($_POST['educationAlignment'] ?? null, $educationAlignmentAllowed, 'Education alignment');

$alias = sanitize_optional_text($_POST['alias'] ?? null, 50);
$email = sanitize_optional_email($_POST['email'] ?? null);
$country = sanitize_optional_text($_POST['country'] ?? null, 80);

$baseConfig = [
    'tokenTaxRate' => 0.0035,
    'flowBaseAnnual' => 1e15,
    'ubiAnnualPerAdult' => 12000,
    'adultPopulation' => 265000000,
    'welfareSavingsCredit' => 630e9,
    'govtOperatingRequirement' => 2.74e12,
    'breakoutPoint' => 60000,
    'tier1Rate' => 0.19,
    'tier1Start' => 60000,
    'tier2Rate' => 0.29,
    'tier2Start' => 135000,
    'supplementApexIncome' => 24000,
    'supplementApexBonus' => 6000,
    'personaWeights' => [0.25, 0.25, 0.25, 0.25],
    'ubiDependent1' => 6000,
    'ubiDependent2' => 4000,
    'ubiDependent3' => 2000,
    'numHouseholds' => 130000000,
    'pctHouseholds1Dep' => 0.25,
    'pctHouseholds2Dep' => 0.15,
    'pctHouseholds3Dep' => 0.10,
    'frictionTaxRate' => 0.0035,
    'baseTransactionVolume' => 1e15,
    'transactionVolumeGrowthRate' => 0.05,
    'capitalFlightRate' => 0,
    'marketMakerExempt' => false,
    'revenueArchitectureMode' => 'hybrid',
    'incomeTaxMultiplier' => 1,
    'retirementEnabled' => false,
    'retirementMode' => 'replace_ss',
    'retirementEligibilityAge' => 67,
    'replacementRate' => 0.8,
    'benefitAdjustmentFactor' => 0.7,
    'pensionableSalaryCap' => 250000,
    'payoutDurationYears' => 25,
    'salaryBasis' => 'final_3yr',
    'retireesCount' => 54000000,
    'avgFinal3yrSalary' => 75000,
    'ssBaseline' => 1.3e12,
    'healthcareEnabled' => true,
    'healthcareMode' => 'baseline',
    'medicareAnnualSpend' => 1.05e12,
    'medicaidAnnualSpend' => 0.86e12,
    'federalHealthcareSpendTotal' => 1.91e12,
    'aiDiagnosticsSavingsPct' => 0,
    'adminAutomationSavingsPct' => 0,
    'allPayerTransparencySavingsPct' => 0,
];

$baselineSupportMonthlyMap = [
    'none' => 0,
    '500' => 500,
    '1000' => 1000,
    '1500' => 1500,
    '2000' => 2000,
    '3000' => 3000,
];

$dependentPolicyMap = [
    'none' => ['d1' => 0, 'd2' => 0, 'd3' => 0, 'label' => 'No dependent support'],
    'first_two_only' => ['d1' => 6000, 'd2' => 4000, 'd3' => 0, 'label' => 'Support first two dependents'],
    'tiered_up_to_three' => ['d1' => 6000, 'd2' => 4000, 'd3' => 2000, 'label' => 'Tiered support (up to three)'],
    'all_dependents' => ['d1' => 7000, 'd2' => 5500, 'd3' => 4000, 'label' => 'Support all dependents'],
    'unsure' => ['d1' => 6000, 'd2' => 4000, 'd3' => 2000, 'label' => 'Tiered support (default)'],
];

$retirementMap = [
    'traditional_social_security' => [
        'retirementEnabled' => false,
        'retirementMode' => 'baseline_only',
        'replacementRate' => 0.8,
        'label' => 'Traditional Social Security',
    ],
    'gov_supported_individual_accounts' => [
        'retirementEnabled' => true,
        'retirementMode' => 'replace_ss',
        'replacementRate' => 0.65,
        'label' => 'Gov-supported individual accounts',
    ],
    'hybrid' => [
        'retirementEnabled' => true,
        'retirementMode' => 'supplement',
        'replacementRate' => 0.8,
        'label' => 'Hybrid retirement system',
    ],
    'personal_accounts_replace_ss' => [
        'retirementEnabled' => true,
        'retirementMode' => 'replace_ss',
        'replacementRate' => 0.55,
        'label' => 'Personal accounts replacing Social Security',
    ],
    'unsure' => [
        'retirementEnabled' => false,
        'retirementMode' => 'baseline_only',
        'replacementRate' => 0.8,
        'label' => 'Traditional Social Security (default)',
    ],
];

$healthcareMap = [
    'improve_current' => [
        'healthcareMode' => 'baseline',
        'savings' => ['ai' => 0, 'admin' => 0, 'payer' => 0],
        'label' => 'Improve current system',
    ],
    'baseline_with_private' => [
        'healthcareMode' => 'efficiency_reform',
        'savings' => ['ai' => 6, 'admin' => 4, 'payer' => 3],
        'label' => 'Baseline + private options',
    ],
    'catastrophic_coverage' => [
        'healthcareMode' => 'structural_replacement',
        'savings' => ['ai' => 0, 'admin' => 0, 'payer' => 0],
        'label' => 'Catastrophic coverage model',
    ],
    'national_healthcare' => [
        'healthcareMode' => 'structural_replacement',
        'savings' => ['ai' => 0, 'admin' => 0, 'payer' => 0],
        'label' => 'National healthcare system',
    ],
    'unsure' => [
        'healthcareMode' => 'baseline',
        'savings' => ['ai' => 0, 'admin' => 0, 'payer' => 0],
        'label' => 'Improve current system (default)',
    ],
];

$additionalIncomeMap = [
    'pursue_more_work' => ['breakoutPoint' => 70000, 'supplementApexBonus' => 7000],
    'start_expand_business' => ['breakoutPoint' => 80000, 'supplementApexBonus' => 7500],
    'education_training' => ['breakoutPoint' => 68000, 'supplementApexBonus' => 6500],
    'no_change' => ['breakoutPoint' => 55000, 'supplementApexBonus' => 5000],
    'unsure' => ['breakoutPoint' => 60000, 'supplementApexBonus' => 6000],
];

$financialSecurityMap = [
    'very_secure' => 700e9,
    'somewhat_secure' => 660e9,
    'neutral' => 630e9,
    'somewhat_insecure' => 570e9,
    'very_insecure' => 520e9,
];

$benefitsCliffMap = [
    'yes' => 0.9,
    'no' => 1.0,
    'not_applicable' => 1.0,
    'prefer_not_to_say' => 1.0,
];

$welfareTransitionMap = [
    'yes_income_not_high_enough' => ['revenueArchitectureMode' => 'hybrid', 'tokenTaxRate' => 0.0035],
    'yes_health_insurance_unaffordable' => ['revenueArchitectureMode' => 'hybrid', 'tokenTaxRate' => 0.0035],
    'no_need_change_broken_system' => ['revenueArchitectureMode' => 'friction_dominant', 'tokenTaxRate' => 0.004],
    'no_baseline_is_flexible' => ['revenueArchitectureMode' => 'friction_dominant', 'tokenTaxRate' => 0.004],
    'no_opinion' => ['revenueArchitectureMode' => 'hybrid', 'tokenTaxRate' => 0.0035],
];

$belMonthly = $baselineSupportMonthlyMap[$baselineSupportLevel];
$belAnnual = $belMonthly * 12;
$dependentPolicy = $dependentPolicyMap[$dependentSupportPolicy];
$retirementPolicy = $retirementMap[$retirementSystemPreference];
$healthcarePolicy = $healthcareMap[$healthcareSystemPreference];
$additionalIncomePolicy = $additionalIncomeMap[$additionalIncomeImpact];
$welfareTransition = $welfareTransitionMap[$welfareEliminationConcern];

$config = $baseConfig;
$config['ubiAnnualPerAdult'] = $belAnnual;
$config['ubiDependent1'] = $dependentPolicy['d1'];
$config['ubiDependent2'] = $dependentPolicy['d2'];
$config['ubiDependent3'] = $dependentPolicy['d3'];
$config['breakoutPoint'] = $additionalIncomePolicy['breakoutPoint'];
$config['supplementApexBonus'] = $belAnnual === 0 ? 3000 : $additionalIncomePolicy['supplementApexBonus'];
$config['welfareSavingsCredit'] = $financialSecurityMap[$financialSecurity];
$config['incomeTaxMultiplier'] = $benefitsCliffMap[$benefitsCliffExperience];
$config['revenueArchitectureMode'] = $welfareTransition['revenueArchitectureMode'];
$config['tokenTaxRate'] = $welfareTransition['tokenTaxRate'];
$config['frictionTaxRate'] = $welfareTransition['tokenTaxRate'];
$config['retirementEnabled'] = $retirementPolicy['retirementEnabled'];
$config['retirementMode'] = $retirementPolicy['retirementMode'];
$config['replacementRate'] = $retirementPolicy['replacementRate'];
$config['healthcareMode'] = $healthcarePolicy['healthcareMode'];
$config['aiDiagnosticsSavingsPct'] = $healthcarePolicy['savings']['ai'];
$config['adminAutomationSavingsPct'] = $healthcarePolicy['savings']['admin'];
$config['allPayerTransparencySavingsPct'] = $healthcarePolicy['savings']['payer'];

$personas = [
    ['label' => 'Starter', 'earnedIncome' => 20000],
    ['label' => 'Professional', 'earnedIncome' => 50000],
    ['label' => 'Manager', 'earnedIncome' => 100000],
    ['label' => 'Executive', 'earnedIncome' => 200000],
];

function calculate_income_tax(float $earnedIncome, array $config): float
{
    if ($earnedIncome <= $config['tier1Start']) {
        return 0.0;
    }

    $tax = 0.0;
    if ($earnedIncome >= $config['tier1Start'] && $earnedIncome < $config['tier2Start']) {
        $tax += ($earnedIncome - $config['tier1Start']) * $config['tier1Rate'];
    } elseif ($earnedIncome >= $config['tier2Start']) {
        $tax += ($config['tier2Start'] - $config['tier1Start']) * $config['tier1Rate'];
        $tax += ($earnedIncome - $config['tier2Start']) * $config['tier2Rate'];
    }

    return $tax;
}

function calculate_supplement(float $earnedIncome, array $config): float
{
    $apexIncome = $config['supplementApexIncome'];
    $apexBonus = $config['supplementApexBonus'];
    $breakoutPoint = $config['breakoutPoint'];

    if ($earnedIncome < $apexIncome) {
        return $apexBonus * ($earnedIncome / $apexIncome);
    }

    if ($earnedIncome >= $apexIncome && $earnedIncome <= $breakoutPoint) {
        $incomeRange = $breakoutPoint - $apexIncome;
        if ($incomeRange <= 0) {
            return 0.0;
        }

        $supplement = $apexBonus + ((-$apexBonus / $incomeRange) * ($earnedIncome - $apexIncome));
        return max(0.0, $supplement);
    }

    return 0.0;
}

function run_survey_simulation(array $config, array $personas): array
{
    $tokenTaxRevenue = $config['flowBaseAnnual'] * $config['tokenTaxRate'];
    $adjustedVolume = $config['baseTransactionVolume'] * (1 - $config['capitalFlightRate']);
    $frictionTaxRevenue = $adjustedVolume * $config['frictionTaxRate'];

    $weightedIncomeTax = 0.0;
    foreach ($personas as $index => $persona) {
        $weightedIncomeTax += calculate_income_tax((float) $persona['earnedIncome'], $config) * $config['personaWeights'][$index];
    }
    $incomeTaxRevenue = $weightedIncomeTax * $config['adultPopulation'] * $config['incomeTaxMultiplier'];
    $totalRevenue = $tokenTaxRevenue + $frictionTaxRevenue + $incomeTaxRevenue + $config['welfareSavingsCredit'];

    $tier1Count = $config['numHouseholds'] * ($config['pctHouseholds1Dep'] + $config['pctHouseholds2Dep'] + $config['pctHouseholds3Dep']);
    $tier2Count = $config['numHouseholds'] * ($config['pctHouseholds2Dep'] + $config['pctHouseholds3Dep']);
    $tier3Count = $config['numHouseholds'] * $config['pctHouseholds3Dep'];
    $dependentCost = ($tier1Count * $config['ubiDependent1']) + ($tier2Count * $config['ubiDependent2']) + ($tier3Count * $config['ubiDependent3']);
    $ubiCost = ($config['ubiAnnualPerAdult'] * $config['adultPopulation']) + $dependentCost;

    $avgPensionableSalary = min($config['avgFinal3yrSalary'], $config['pensionableSalaryCap']);
    $avgAnnualBenefit = $avgPensionableSalary * $config['replacementRate'] * $config['benefitAdjustmentFactor'];
    $annualRetirementCost = $config['retirementEnabled'] ? $config['retireesCount'] * $avgAnnualBenefit : 0.0;
    $retirement25yrTotal = $annualRetirementCost * $config['payoutDurationYears'];
    $netChangeVsSS = $config['retirementEnabled'] && in_array($config['retirementMode'], ['replace_ss', 'supplement'], true)
        ? $annualRetirementCost - $config['ssBaseline']
        : null;

    $aiSavings = max(0.0, min(1.0, $config['aiDiagnosticsSavingsPct'] / 100));
    $adminSavings = max(0.0, min(1.0, $config['adminAutomationSavingsPct'] / 100));
    $payerSavings = max(0.0, min(1.0, $config['allPayerTransparencySavingsPct'] / 100));
    $healthcareSavingsRate = $config['healthcareEnabled'] && $config['healthcareMode'] === 'efficiency_reform'
        ? 1 - ((1 - $aiSavings) * (1 - $adminSavings) * (1 - $payerSavings))
        : 0.0;
    $modeledFederalHealthcareCost = $config['healthcareEnabled']
        ? $config['federalHealthcareSpendTotal'] * (1 - $healthcareSavingsRate)
        : 0.0;
    $healthcareNetFederalSavings = $config['healthcareEnabled']
        ? $config['federalHealthcareSpendTotal'] - $modeledFederalHealthcareCost
        : 0.0;

    $remainingFiscalSpaceAfterBEL = $totalRevenue - $ubiCost;
    $fiscalSpaceAfterPrograms = $remainingFiscalSpaceAfterBEL - $annualRetirementCost - $modeledFederalHealthcareCost;
    $retirementAllocatedRevenue = $annualRetirementCost > 0
        ? max(0.0, min(max($remainingFiscalSpaceAfterBEL, 0.0), $annualRetirementCost))
        : 0.0;
    $retirementFundingRatio = $annualRetirementCost > 0
        ? $retirementAllocatedRevenue / $annualRetirementCost
        : null;
    $belShareOfRevenue = $totalRevenue > 0 ? ($ubiCost / $totalRevenue) * 100 : 0.0;
    $retirementShareOfRevenue = $totalRevenue > 0 ? ($annualRetirementCost / $totalRevenue) * 100 : 0.0;
    $healthcareShareOfRevenue = $totalRevenue > 0 ? ($modeledFederalHealthcareCost / $totalRevenue) * 100 : 0.0;
    $totalObligations = $ubiCost + $config['govtOperatingRequirement'] + $annualRetirementCost + $modeledFederalHealthcareCost;
    $surplusDeficit = $totalRevenue - $totalObligations;
    $isSolvent = $surplusDeficit >= 0;

    $personaOutcomes = [];
    foreach ($personas as $persona) {
        $earnedIncome = (float) $persona['earnedIncome'];
        $supplement = calculate_supplement($earnedIncome, $config);
        $incomeTax = calculate_income_tax($earnedIncome, $config);
        $personaOutcomes[] = [
            'label' => $persona['label'],
            'earnedIncome' => $earnedIncome,
            'ubi' => $config['ubiAnnualPerAdult'],
            'supplement' => $supplement,
            'incomeTax' => $incomeTax,
            'netIncome' => $earnedIncome + $config['ubiAnnualPerAdult'] + $supplement - $incomeTax,
        ];
    }

    $warnings = [];
    if ($config['tokenTaxRate'] > 0.008) {
        $warnings[] = 'Token tax rate unusually high (>0.8%) and may imply capital flight risk or market distortion.';
    }
    if ($config['ubiAnnualPerAdult'] > 18000) {
        $warnings[] = 'UBI floor exceeds $18k and should be checked for affordability.';
    }
    if (!$isSolvent) {
        $warnings[] = 'Budget is in deficit. Adjust policy parameters to achieve solvency.';
    }
    if ($config['healthcareEnabled'] && $config['healthcareMode'] === 'structural_replacement') {
        $warnings[] = 'Healthcare structural replacement mode is modeled with baseline federal costs in this phase.';
    }
    if ($fiscalSpaceAfterPrograms < 0) {
        $warnings[] = 'Retirement and healthcare exceed the remaining fiscal space after BEL.';
    }

    $slope = ($config['breakoutPoint'] - $config['supplementApexIncome']) > 0
        ? ($config['supplementApexBonus'] / ($config['breakoutPoint'] - $config['supplementApexIncome'])) * 100
        : 0.0;

    return [
        'revenue' => [
            'tokenTaxRevenue' => $tokenTaxRevenue,
            'frictionTaxRevenue' => $frictionTaxRevenue,
            'incomeTaxRevenue' => $incomeTaxRevenue,
            'welfareSavingsCredit' => $config['welfareSavingsCredit'],
            'totalRevenue' => $totalRevenue,
        ],
        'obligations' => [
            'ubiCost' => $ubiCost,
            'adultUBICost' => $config['ubiAnnualPerAdult'] * $config['adultPopulation'],
            'dependentUBICost' => $dependentCost,
            'govtOperatingRequirement' => $config['govtOperatingRequirement'],
            'totalObligations' => $totalObligations,
            'remainingFiscalSpaceAfterBEL' => $remainingFiscalSpaceAfterBEL,
            'fiscalSpaceAfterPrograms' => $fiscalSpaceAfterPrograms,
            'belShareOfRevenue' => $belShareOfRevenue,
            'retirementShareOfRevenue' => $retirementShareOfRevenue,
            'healthcareShareOfRevenue' => $healthcareShareOfRevenue,
            'retirementAllocatedRevenue' => $retirementAllocatedRevenue,
            'retirementFundingRatio' => $retirementFundingRatio,
            'retirementProgramCost' => $annualRetirementCost,
            'retirementAnnualBenefit' => $avgAnnualBenefit,
            'retirement25yrTotal' => $retirement25yrTotal,
            'netChangeVsSS' => $netChangeVsSS,
            'healthcareProgramCost' => $modeledFederalHealthcareCost,
            'healthcareBaselineFederalCost' => $config['federalHealthcareSpendTotal'],
            'healthcareNetFederalSavings' => $healthcareNetFederalSavings,
        ],
        'balance' => [
            'surplusDeficit' => $surplusDeficit,
            'isSolvent' => $isSolvent,
        ],
        'citizenModel' => [
            'supplementFunctionSummary' => sprintf(
                'Supplement peaks at $%s earned income (+$%s bonus), then tapers at %.1f cents per $1 earned until reaching $0 at $%s breakout point.',
                number_format((float) $config['supplementApexIncome'], 0),
                number_format((float) $config['supplementApexBonus'], 0),
                $slope,
                number_format((float) $config['breakoutPoint'], 0)
            ),
            'personaOutcomes' => $personaOutcomes,
        ],
        'diagnostics' => [
            'warnings' => $warnings,
        ],
    ];
}

$result = run_survey_simulation($config, $personas);
$submissionId = generate_identifier();
$timestamp = gmdate('c');
$belLabel = '$' . number_format((float) $belMonthly, 0);
$configName = implode(' | ', [
    'Survey BEL ' . $belLabel,
    'Dependents: ' . $dependentPolicy['label'],
    'Retirement: ' . $retirementPolicy['label'],
    'Healthcare: ' . $healthcarePolicy['label'],
]);

$submissionPayload = [
    'model_metadata' => [
        'submission_id' => $submissionId,
        'timestamp' => $timestamp,
        'model_version' => 'NAiERM v2.1',
        'terminology_version' => 'bel-sbi-v1',
        'advanced_mode_enabled' => false,
        'modelVersion' => 'NAiERM v2.1',
        'terminologyVersion' => 'bel-sbi-v1',
        'revenueArchitectureMode' => $config['revenueArchitectureMode'],
        'retirementMode' => $config['retirementMode'],
        'healthcareMode' => $config['healthcareMode'],
    ],
    'scenario_inputs' => [
        'selected_policy_variables' => [
            'token_tax_rate' => $config['tokenTaxRate'],
            'flow_base_annual' => $config['flowBaseAnnual'],
            'ubi_annual_per_adult' => $config['ubiAnnualPerAdult'],
            'adult_population' => $config['adultPopulation'],
            'welfare_savings_credit' => $config['welfareSavingsCredit'],
            'govt_operating_requirement' => $config['govtOperatingRequirement'],
            'breakout_point' => $config['breakoutPoint'],
            'tier1_rate' => $config['tier1Rate'],
            'tier1_start' => $config['tier1Start'],
            'tier2_rate' => $config['tier2Rate'],
            'tier2_start' => $config['tier2Start'],
            'supplement_apex_income' => $config['supplementApexIncome'],
            'supplement_apex_bonus' => $config['supplementApexBonus'],
            'persona_weights' => $config['personaWeights'],
            'ubi_dependent_1' => $config['ubiDependent1'],
            'ubi_dependent_2' => $config['ubiDependent2'],
            'ubi_dependent_3' => $config['ubiDependent3'],
            'num_households' => $config['numHouseholds'],
            'pct_households_1_dep' => $config['pctHouseholds1Dep'],
            'pct_households_2_dep' => $config['pctHouseholds2Dep'],
            'pct_households_3_dep' => $config['pctHouseholds3Dep'],
            'friction_tax_rate' => $config['frictionTaxRate'],
            'base_transaction_volume' => $config['baseTransactionVolume'],
            'transaction_volume_growth_rate' => $config['transactionVolumeGrowthRate'],
            'capital_flight_rate' => $config['capitalFlightRate'],
            'market_maker_exempt' => $config['marketMakerExempt'],
            'revenue_architecture_mode' => $config['revenueArchitectureMode'],
            'income_tax_multiplier' => $config['incomeTaxMultiplier'],
            'retirement_enabled' => $config['retirementEnabled'],
            'retirement_mode' => $config['retirementMode'],
            'retirement_eligibility_age' => $config['retirementEligibilityAge'],
            'replacement_rate_pct' => $config['replacementRate'] * 100,
            'benefit_adjustment_factor_pct' => $config['benefitAdjustmentFactor'] * 100,
            'pensionable_salary_cap' => $config['pensionableSalaryCap'],
            'payout_duration_years' => $config['payoutDurationYears'],
            'salary_basis' => $config['salaryBasis'],
            'retirees_count' => $config['retireesCount'],
            'avg_final_3yr_salary' => $config['avgFinal3yrSalary'],
            'ss_baseline' => $config['ssBaseline'],
            'healthcare_enabled' => $config['healthcareEnabled'],
            'healthcare_mode' => $config['healthcareMode'],
            'medicare_annual_spend' => $config['medicareAnnualSpend'],
            'medicaid_annual_spend' => $config['medicaidAnnualSpend'],
            'federal_healthcare_spend_total' => $config['federalHealthcareSpendTotal'],
            'ai_diagnostics_savings_pct' => $config['aiDiagnosticsSavingsPct'],
            'admin_automation_savings_pct' => $config['adminAutomationSavingsPct'],
            'all_payer_transparency_savings_pct' => $config['allPayerTransparencySavingsPct'],
        ],
        'retirement' => [
            'replacement_rate' => $config['replacementRate'] * 100,
        ],
        'demographics' => [
            'adult_population' => $config['adultPopulation'],
            'num_households' => $config['numHouseholds'],
            'pct_households_1_dep' => $config['pctHouseholds1Dep'],
            'pct_households_2_dep' => $config['pctHouseholds2Dep'],
            'pct_households_3_dep' => $config['pctHouseholds3Dep'],
            'bel_dependent_tier_1' => $config['ubiDependent1'],
            'bel_dependent_tier_2' => $config['ubiDependent2'],
            'bel_dependent_tier_3' => $config['ubiDependent3'],
            'user_age_range' => $ageRange,
            'user_income_level' => $educationLevel,
            'user_region' => $country,
            'user_affiliation' => $employmentSituation,
        ],
    ],
    'user_feedback' => [
        'user_feedback_text' => 'NAiERM Economic Participation Survey submission',
        'why_choice_text' => $insecurityReason !== null ? 'insecurity_reason=' . $insecurityReason : null,
    ],
    'survey_response' => [
        'survey_name' => 'NAiERM Economic Participation Survey',
        'survey_version' => 'v1',
        'responses' => [
            'financialSecurity' => $financialSecurity,
            'insecurityReason' => $insecurityReason,
            'additionalIncomeImpact' => $additionalIncomeImpact,
            'benefitsCliffExperience' => $benefitsCliffExperience,
            'welfareEliminationConcern' => $welfareEliminationConcern,
            'baselineSupportLevel' => $baselineSupportLevel,
            'dependentSupportPolicy' => $dependentSupportPolicy,
            'retirementSystemPreference' => $retirementSystemPreference,
            'healthcareSystemPreference' => $healthcareSystemPreference,
            'ageRange' => $ageRange,
            'employmentSituation' => $employmentSituation,
            'dependentsCount' => $dependentsCount,
            'educationLevel' => $educationLevel,
            'educationAlignment' => $educationAlignment,
            'alias' => $alias,
            'country' => $country,
        ],
        'policy_model' => [
            'bel_monthly' => $belMonthly,
            'dependent_policy' => $dependentPolicy['label'],
            'retirement' => $retirementPolicy['label'],
            'healthcare' => $healthcarePolicy['label'],
        ],
    ],
];

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $insertSubmission = $pdo->prepare(
        'INSERT INTO submissions (
            id,
            name,
            config_name,
            config,
            result,
            surplus_deficit,
            ubi_annual,
            token_tax_rate,
            breakout_point,
            is_solvent,
            submission_payload_json
        ) VALUES (
            :id,
            :name,
            :config_name,
            :config,
            :result,
            :surplus_deficit,
            :ubi_annual,
            :token_tax_rate,
            :breakout_point,
            :is_solvent,
            :submission_payload_json
        )'
    );

    $insertSubmission->execute([
        ':id' => $submissionId,
        ':name' => $alias,
        ':config_name' => $configName,
        ':config' => json_stringify($config),
        ':result' => json_stringify($result),
        ':surplus_deficit' => (int) round((float) $result['balance']['surplusDeficit']),
        ':ubi_annual' => (int) round((float) $config['ubiAnnualPerAdult']),
        ':token_tax_rate' => $config['tokenTaxRate'],
        ':breakout_point' => (int) round((float) $config['breakoutPoint']),
        ':is_solvent' => !empty($result['balance']['isSolvent']) ? 1 : 0,
        ':submission_payload_json' => json_stringify($submissionPayload),
    ]);

    if ($email !== null) {
        $insertContact = $pdo->prepare(
            'INSERT INTO submission_contacts (submission_id, email)
             VALUES (:submission_id, :email)'
        );

        $insertContact->execute([
            ':submission_id' => $submissionId,
            ':email' => $email,
        ]);
    }

    $pdo->commit();
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond_error('Failed to store survey submission.', 500);
}

set_last_submission_cookie($submissionId);
render_success_page();
