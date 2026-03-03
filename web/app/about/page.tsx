import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './about.module.css'

export default function AboutPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.kicker}>About</div>
            <h1 className={styles.title}>Mission and Credibility</h1>
            <p className={styles.subtitle}>
              NAIERM provides transparent, policy-grade scenario modeling for AI-era public finance and national social programs.
            </p>
          </header>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.h2}>Institutional Focus</h2>
              <p className={styles.p}>
                Designed for analysts, policy teams, and public-sector stakeholders evaluating fiscal resilience and program
                sustainability scenarios.
              </p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Model Design Principles</h2>
              <ul className={styles.list}>
                <li>Explicit assumptions and deterministic model logic.</li>
                <li>Structured scenario testing with reproducible outputs.</li>
                <li>Exportable data for independent review and auditing.</li>
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Built By</h2>
              <p className={styles.p}>
                Built by the Breakout Economy project with a commitment to transparent methodology, iterative refinement,
                and professional-grade policy tooling.
              </p>
              <p className={styles.p}>
                NAIERM is developed as a versioned simulation platform with openly documented assumptions and model updates.
              </p>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
