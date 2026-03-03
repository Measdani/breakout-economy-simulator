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
                Deterministic fiscal simulator · Scenario comparison (not forecasting)
              </span>
            </div>
          </header>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.h2}>Model Scope</h2>
              <p className={styles.p}>
                Phase 1 models federal-level revenue, BEL/SBI obligations, retirement,
                and healthcare baselines. It is a deterministic policy simulator intended
                for scenario comparison, not macroeconomic forecasting.
              </p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Financing Approach</h2>
              <p className={styles.p}>
                Primary: electronic transaction friction tax. Supplemental: simplified income tax.
                Advanced Mode allows architecture toggling (hybrid, friction-dominant,
                friction-only) for stress testing and transition scenarios.
              </p>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
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

            <section className={styles.card}>
              <h2 className={styles.h2}>Program Modules</h2>
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
                  <span className={styles.listStrong}>Retirement:</span> Configurable replacement
                  architecture benchmarked against Social Security baseline.
                </li>
                <li>
                  <span className={styles.listStrong}>Healthcare:</span> Federal baseline with optional
                  efficiency reform levers (Phase 1).
                </li>
              </ul>
            </section>

            <section className={styles.card}>
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
