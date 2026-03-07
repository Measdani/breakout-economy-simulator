import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './methodology.module.css'

const assumptions = [
  {
    variable: 'Adult Population',
    baseline: '265,000,000',
    rationale: 'Federal-scale modeled adult base',
  },
  {
    variable: 'National Settlement Base',
    baseline: '1.0 quadrillion tokens',
    rationale: 'Base transaction volume assumption',
  },
  {
    variable: 'BEL Adult Allocation (default)',
    baseline: '$12,000',
    rationale: 'Annual per adult baseline',
  },
  {
    variable: 'BEL Breakout / SBI phase-out (default)',
    baseline: '$60,000',
    rationale: 'SBI tapers to zero by this level',
  },
  {
    variable: 'Government Operations Requirement',
    baseline: '$2.74T',
    rationale: 'Non-BEL federal operations baseline',
  },
  {
    variable: 'Legacy Program Consolidation Offset',
    baseline: '$630B',
    rationale: 'Modeled offset in annual revenue',
  },
]

const fiscalLayers = [
  {
    layer: 'Compute Economy',
    purpose: 'AI productivity and transaction volume generation',
  },
  {
    layer: 'Revenue Architecture',
    purpose: 'Token friction tax capturing compute-derived value',
  },
  {
    layer: 'Liquidity Distribution',
    purpose: 'BEL and SBI supporting aggregate consumer demand',
  },
]

const datasetAnalyses = [
  'fiscal architecture tradeoffs',
  'parameter sensitivity',
  'policy stability thresholds',
  'long-term solvency scenarios',
]

export default function MethodologyPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.kicker}>Methodology</div>
            <h1 className={styles.title}>NAIERM Methodological Framework</h1>
            <div className={styles.metaRow}>
              <span className={styles.badge}>Last updated: March 2, 2026</span>
              <span className={styles.metaNote}>
                Deterministic fiscal simulator - Scenario comparison (not forecasting)
              </span>
            </div>
          </header>

          <div className={styles.grid}>
            <div className={`${styles.groupDivider} ${styles.full}`}>Model Design</div>

            <section className={styles.card} id="scope">
              <h2 className={styles.h2}>Model Scope</h2>
              <p className={styles.p}>
                Phase 1 models federal-level revenue, BEL/SBI obligations, retirement,
                and healthcare baselines. It is a deterministic policy simulator intended
                for scenario comparison, not macroeconomic forecasting.
              </p>
            </section>

            <section className={styles.card} id="deterministic-modeling">
              <h2 className={styles.h2}>Deterministic Scenario Modeling</h2>
              <p className={styles.p}>
                NAIERM is a deterministic fiscal simulator, not a macroeconomic forecasting model.
              </p>
              <p className={styles.p}>
                The framework allows policymakers and researchers to explore how different fiscal
                architectures influence economic outcomes under defined assumptions.
              </p>
              <p className={styles.p}>
                Each configuration represents a policy scenario comparison, rather than a prediction
                of future economic conditions.
              </p>
            </section>

            <section className={styles.card} id="financing">
              <h2 className={styles.h2}>Financing Approach</h2>
              <p className={styles.p}>
                Primary: electronic transaction friction tax. Supplemental: simplified income tax.
                Advanced Mode allows architecture toggling (hybrid, friction-dominant,
                friction-only) for stress testing and transition scenarios.
              </p>
            </section>

            <section className={styles.card} id="objective">
              <h2 className={styles.h2}>Model Objective</h2>
              <p className={styles.p}>
                The model evaluates how policy parameters change the balance between productive
                capacity and aggregate demand.
              </p>
            </section>

            <section className={`${styles.card} ${styles.full}`} id="objective-function">
              <h2 className={styles.h2}>Objective Function</h2>
              <p className={styles.p}>
                The NAIERM simulator evaluates fiscal architecture by modeling the balance between
                productive capacity and aggregate demand.
              </p>
              <p className={styles.p}>The model&apos;s objective function is:</p>
              <p className={styles.formula}>
                <code>Y_t = min(Ycap, AD)</code>
              </p>
              <p className={styles.p}>Where:</p>
              <ul className={styles.list}>
                <li><span className={styles.listStrong}>Y_t:</span> Real economic output.</li>
                <li>
                  <span className={styles.listStrong}>Ycap:</span> Total productive capacity from both
                  human labor and AI compute.
                </li>
                <li>
                  <span className={styles.listStrong}>AD:</span> Aggregate demand supported by
                  consumer liquidity.
                </li>
              </ul>
              <p className={styles.p}>
                When aggregate demand falls below productive capacity, output becomes demand-constrained,
                increasing contraction risk.
              </p>
            </section>

            <div className={`${styles.groupDivider} ${styles.full}`}>Core Assumptions</div>

            <section className={styles.card} id="year5-baseline">
              <h2 className={styles.h2}>Year 5 Baseline Scenario</h2>
              <ul className={styles.list}>
                <li><span className={styles.listStrong}>Token Tax:</span> ~6.6% equivalent (UI baseline input uses 0.66%).</li>
                <li><span className={styles.listStrong}>BEL:</span> $12,000.</li>
                <li><span className={styles.listStrong}>SBI Maximum:</span> $6,000.</li>
                <li><span className={styles.listStrong}>Breakout:</span> $60,000.</li>
                <li><span className={styles.listStrong}>Projected output:</span> ~$49.5T economy (illustrative baseline).</li>
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`} id="assumptions">
              <h2 className={styles.h2}>Core Assumptions</h2>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Baseline</th>
                      <th>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assumptions.map((row) => (
                      <tr key={row.variable}>
                        <td className={styles.tdStrong}>{row.variable}</td>
                        <td className={styles.tdMono}>{row.baseline}</td>
                        <td>{row.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={`${styles.card} ${styles.full}`} id="fiscal-architecture-layers">
              <h2 className={styles.h2}>Fiscal Architecture Layers</h2>
              <p className={styles.p}>
                NAIERM models fiscal stability through three interacting economic layers.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Layer</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fiscalLayers.map((item) => (
                      <tr key={item.layer}>
                        <td className={styles.tdStrong}>{item.layer}</td>
                        <td>{item.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.p}>
                Together these mechanisms maintain equilibrium between productive capacity and
                economic demand.
              </p>
            </section>

            <section className={styles.card} id="modules">
              <h2 className={styles.h2}>Model Framework</h2>
              <ul className={styles.list}>
                <li>
                  <span className={styles.listStrong}>BEL:</span> Basic Economic Liquidity floor
                  allocated by adult + dependent structure.
                </li>
                <li>
                  <span className={styles.listStrong}>SBI:</span> Systemic Bonus Incentive that ramps
                  then phases out at breakout threshold.
                </li>
                <li>
                  <span className={styles.listStrong}>Tax Tiers:</span> Simplified two-tier income tax
                  with breakout-aligned threshold plus token tax financing layer.
                </li>
                <li>
                  <span className={styles.listStrong}>Retirement:</span> Configurable replacement
                  architecture benchmarked against Social Security baseline.
                </li>
                <li>
                  <span className={styles.listStrong}>Healthcare:</span> Federal baseline with optional
                  efficiency reform levers (Phase 1).
                </li>
              </ul>
            </section>

            <div className={`${styles.groupDivider} ${styles.full}`}>Research Framework</div>

            <section className={styles.card} id="research-dataset">
              <h2 className={styles.h2}>Research Dataset Generation</h2>
              <p className={styles.p}>
                Each simulator configuration submitted through the platform contributes to an
                anonymized research dataset.
              </p>
              <p className={styles.p}>This dataset enables analysis of:</p>
              <ul className={styles.list}>
                {datasetAnalyses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={styles.p}>No personally identifiable information is collected or stored.</p>
            </section>

            <section className={styles.card} id="limitations">
              <h2 className={styles.h2}>Limitations and Roadmap</h2>
              <div className={styles.roadmap}>
                <div className={styles.roadmapItem}>
                  <span className={styles.phase}>Phase 1</span>
                  <span className={styles.phaseText}>Deterministic budgeting with federal-only scope.</span>
                </div>
                <div className={styles.roadmapItem}>
                  <span className={styles.phase}>Phase 2</span>
                  <span className={styles.phaseText}>
                    Labor supply elasticity and behavior-response modeling.
                  </span>
                </div>
                <div className={styles.roadmapItem}>
                  <span className={styles.phase}>Phase 3</span>
                  <span className={styles.phaseText}>
                    Broader macro linkages and deeper healthcare structural modules.
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
