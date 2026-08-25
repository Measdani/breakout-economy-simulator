import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'
import {
  hasAssumptionsSearchParams,
  parseAssumptionsSearchParams,
  type AssumptionsSearchParams,
} from '@/lib/assumptionsRoute'
import styles from './assumptions.module.css'

type PageProps = {
  searchParams?: Promise<AssumptionsSearchParams>
}

type AssumptionRow = {
  label: string
  value: string
  note: string
}

type AssumptionSection = {
  kicker: string
  title: string
  text: string
  rows: AssumptionRow[]
}

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

function formatCurrencyWhole(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value)

  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`

  return formatCurrencyWhole(value)
}

function formatTokenMilsPerThousand(rate: number): string {
  return `${(rate * 100).toFixed(2)} mils / 1,000 tokens`
}

function formatRevenueMode(mode: string | undefined): string {
  switch (mode) {
    case 'friction_dominant':
      return 'Friction-dominant'
    case 'friction_only':
      return 'Friction-only'
    default:
      return 'Hybrid'
  }
}

function formatRetirementMode(mode: string | undefined): string {
  switch (mode) {
    case 'supplement':
      return 'Supplemental retirement'
    case 'baseline_only':
      return 'Baseline benchmark only'
    default:
      return 'Social Security replacement'
  }
}

function formatHealthcareMode(mode: string | undefined): string {
  switch (mode) {
    case 'efficiency_reform':
      return 'Efficiency reform'
    case 'structural_replacement':
      return 'Structural replacement'
    default:
      return 'Baseline federal spend'
  }
}

function formatSalaryBasis(basis: string | undefined): string {
  switch (basis) {
    case 'final_5yr':
      return 'Final 5-year average'
    case 'career_avg':
      return 'Career average'
    default:
      return 'Final 3-year average'
  }
}

export default async function AssumptionsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const config = parseAssumptionsSearchParams(resolvedSearchParams)
  const isScenarioSnapshot = hasAssumptionsSearchParams(resolvedSearchParams)
  const estimatedHouseholds = Math.round(config.adultPopulation / 2.5)

  const summaryCards = [
    {
      label: 'Revenue Mode',
      value: formatRevenueMode(config.revenueArchitectureMode),
      note: 'The financing mix being used by this scenario.',
    },
    {
      label: 'Token Tax',
      value: formatTokenMilsPerThousand(config.tokenTaxRate),
      note: 'Headline friction-rate input shown in the workspace.',
    },
    {
      label: 'BEL',
      value: formatCurrencyCompact(config.ubiAnnualPerAdult),
      note: 'Annual per-adult baseline economic liquidity allocation.',
    },
    {
      label: 'Breakout',
      value: formatCurrencyCompact(config.breakoutPoint),
      note: 'Income level where supplemental support phases out.',
    },
  ]

  const sections: AssumptionSection[] = [
    {
      kicker: 'Population Baseline',
      title: 'Demographic Scope',
      text:
        'These values establish the national population base and household structure used for this scenario.',
      rows: [
        {
          label: 'Adult population',
          value: integerFormatter.format(config.adultPopulation),
          note: 'Primary federal-scale adult base used for BEL eligibility and fiscal aggregation.',
        },
        {
          label: 'Estimated households',
          value: integerFormatter.format(estimatedHouseholds),
          note: 'Derived from adult population using an average household size assumption of 2.5.',
        },
        {
          label: 'Dependent support mix',
          value: `${percentFormatter.format(config.pctHouseholds1Dep ?? 0)} / ${percentFormatter.format(config.pctHouseholds2Dep ?? 0)} / ${percentFormatter.format(config.pctHouseholds3Dep ?? 0)}`,
          note: 'Share of households modeled with one, two, and three dependents.',
        },
      ],
    },
    {
      kicker: 'Fiscal Baseline',
      title: 'Federal Anchors',
      text:
        'These figures define the non-program obligations and legacy offsets before new policy layers are evaluated.',
      rows: [
        {
          label: 'Government operations',
          value: formatCurrencyCompact(config.govtOperatingRequirement),
          note: 'Baseline annual operating requirement outside BEL and supplemental support.',
        },
        {
          label: 'Legacy program offset',
          value: formatCurrencyCompact(config.welfareSavingsCredit),
          note: 'Modeled annual savings from consolidating existing support programs into the new structure.',
        },
        {
          label: 'Settlement flow base',
          value: formatCurrencyCompact(config.flowBaseAnnual),
          note: 'Annual digital economic flow assumption feeding the token-tax side of the model.',
        },
      ],
    },
    {
      kicker: 'Revenue Logic',
      title: 'Tax Architecture',
      text:
        'Revenue is modeled through a token-tax layer plus the configured income-tax structure and any legacy savings credits.',
      rows: [
        {
          label: 'Revenue mode',
          value: formatRevenueMode(config.revenueArchitectureMode),
          note: `Income-tax contribution multiplier: ${config.incomeTaxMultiplier?.toFixed(2) ?? '1.00'}x.`,
        },
        {
          label: 'Token tax rate',
          value: formatTokenMilsPerThousand(config.tokenTaxRate),
          note: 'Displayed as mils per 1,000 tokens of total compute or settlement activity.',
        },
        {
          label: 'Friction tax base',
          value: formatCurrencyCompact(config.baseTransactionVolume ?? config.flowBaseAnnual),
          note: `Base transaction volume with ${percentFormatter.format(config.transactionVolumeGrowthRate ?? 0)} annual growth and ${percentFormatter.format(config.capitalFlightRate ?? 0)} capital flight.`,
        },
        {
          label: 'Income tax tiers',
          value: `${percentFormatter.format(config.tier1Rate)} up to ${formatCurrencyCompact(config.tier1Start)}, then ${percentFormatter.format(config.tier2Rate)} above ${formatCurrencyCompact(config.tier2Start)}`,
          note: 'The breakout threshold stays aligned with the first threshold in the simulator workspace.',
        },
      ],
    },
    {
      kicker: 'Benefit Structure',
      title: 'BEL and Supplemental Support',
      text:
        'This section captures the current consumer-liquidity design, including the adult BEL floor, child tiers, and breakout dynamics.',
      rows: [
        {
          label: 'BEL per adult',
          value: formatCurrencyCompact(config.ubiAnnualPerAdult),
          note: 'Annual baseline allocation for each modeled adult.',
        },
        {
          label: 'Dependent tiers',
          value: `${formatCurrencyCompact(config.ubiDependent1 ?? 0)} / ${formatCurrencyCompact(config.ubiDependent2 ?? 0)} / ${formatCurrencyCompact(config.ubiDependent3 ?? 0)}`,
          note: 'Tiered dependent support for first, second, and third dependents.',
        },
        {
          label: 'Supplement peak',
          value: formatCurrencyCompact(config.supplementApexBonus),
          note: `Maximum supplemental support centered around ${formatCurrencyCompact(config.supplementApexIncome)} before phasing out.`,
        },
        {
          label: 'Breakout threshold',
          value: formatCurrencyCompact(config.breakoutPoint),
          note: 'Above this income level, supplemental support phases to zero and BEL remains the standing floor.',
        },
      ],
    },
    {
      kicker: 'Program Modules',
      title: 'Retirement and Healthcare',
      text:
        'These modules can materially change fiscal balance, so they are documented separately from the BEL core.',
      rows: [
        {
          label: 'Retirement program',
          value: config.retirementEnabled ? 'Enabled' : 'Disabled',
          note: config.retirementEnabled
            ? `${formatRetirementMode(config.retirementMode)} at age ${config.retirementEligibilityAge}.`
            : 'The current scenario leaves retirement modeling off and benchmarks only against baseline expectations.',
        },
        {
          label: 'Retirement payout basis',
          value: formatSalaryBasis(config.salaryBasis),
          note: `${percentFormatter.format(config.replacementRate ?? 0)} replacement rate, ${percentFormatter.format(config.benefitAdjustmentFactor ?? 0)} actuarial adjustment, salary cap ${formatCurrencyCompact(config.pensionableSalaryCap ?? 0)}.`,
        },
        {
          label: 'Healthcare module',
          value: config.healthcareEnabled ? formatHealthcareMode(config.healthcareMode) : 'Disabled',
          note: `Federal healthcare baseline: ${formatCurrencyCompact(config.federalHealthcareSpendTotal ?? 0)}. Efficiency levers are currently set to ${config.aiDiagnosticsSavingsPct ?? 0}% AI diagnostics, ${config.adminAutomationSavingsPct ?? 0}% admin automation, and ${config.allPayerTransparencySavingsPct ?? 0}% transparency savings.`,
        },
        {
          label: 'Social Security baseline',
          value: formatCurrencyCompact(config.ssBaseline ?? 0),
          note: 'Used as the current federal retirement benchmark for scenario comparison.',
        },
      ],
    },
  ]

  return (
    <PublicSiteShell contentClassName="max-w-[1160px] mx-auto px-5 md:px-8 pt-10 pb-24">
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.heroKicker}>Model Reference</p>
          <h1 className={styles.heroTitle}>Model Assumptions</h1>
          <p className={styles.heroText}>
            {isScenarioSnapshot
              ? 'This page reflects the live simulator values from the scenario you just opened. It replaces the cramped modal with a full reference view.'
              : 'This page documents the baseline NAiERM assumptions in a dedicated reference view. Open it from the simulator to inspect the live values for your current scenario.'}
          </p>

          <div className={styles.heroActions}>
            <Link href="/methodology" className={styles.secondaryAction}>
              View Methodology
            </Link>
          </div>

          <div className={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.label} className={styles.summaryCard}>
                <p className={styles.summaryLabel}>{card.label}</p>
                <p className={styles.summaryValue}>{card.value}</p>
                <p className={styles.summaryNote}>{card.note}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>{section.kicker}</p>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <p className={styles.sectionText}>{section.text}</p>
                </div>
              </div>

              <div className={styles.sectionBody}>
                {section.rows.map((row) => (
                  <div key={row.label} className={styles.row}>
                    <div>
                      <p className={styles.rowLabel}>{row.label}</p>
                    </div>
                    <div>
                      <p className={styles.rowValue}>{row.value}</p>
                      <p className={styles.rowNote}>{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

      </main>
    </PublicSiteShell>
  )
}
