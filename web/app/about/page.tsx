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
            <div className={styles.subtitle}>
              <p>
                NAiERM was developed by a systems engineer with over 40 years of experience
                designing and optimizing complex technological systems.
              </p>
              <p>
                NAiERM provides transparent, policy-grade scenario modeling for AI-era public
                finance and national social programs. The framework allows policymakers, analysts,
                and researchers to explore how fiscal architecture influences economic stability in
                economies shaped by artificial intelligence and automated productivity.
              </p>
            </div>
          </header>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.h2}>Institutional Focus</h2>
              <p className={styles.p}>
                Designed for policy analysts, economic researchers, and public-sector stakeholders
                evaluating fiscal resilience and long-term program sustainability.
              </p>
              <p className={styles.p}>
                The simulator enables structured comparison of fiscal architectures under transparent
                assumptions.
              </p>
              <p className={styles.p}>
                The National AI Economy Resilience Model is an initiative of Energy and Wealth, a
                trade name of JWBA, Inc. Research published here is produced independently of client
                engagements.
              </p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Model Design Principles</h2>
              <ul className={styles.list}>
                <li>Explicit assumptions and deterministic model logic.</li>
                <li>Structured scenario testing with reproducible outputs.</li>
                <li>Exportable datasets for independent review and auditing.</li>
                <li>Transparent fiscal architecture for AI-era economic systems.</li>
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Model Author</h2>
              <p className={styles.authorName}>Dr. James W. Bunger</p>
              <p className={styles.authorCredentials}>BSc Chemistry | PhD Fuels Engineering</p>
              <p className={styles.authorHighlights}>
                40+ Years Systems Engineering - 15 Patents - 50+ Publications - Former Utah State
                Science Advisor
              </p>
              <p className={styles.p}>
                Dr. James W. Bunger is a systems engineer with more than four decades of
                experience designing and optimizing complex technological systems.
              </p>
              <p className={styles.p}>
                His work spans energy systems, petroleum refining, specialty chemicals,
                unconventional fuels development, environmental forensics, and process modeling
                software.
              </p>
              <p className={styles.p}>
                He earned his PhD in Fuels Engineering from the University of Utah, holds 15
                patents, and has authored more than 50 peer-reviewed and technical journal
                publications.
              </p>
              <p className={styles.p}>
                With more than a decade of research conducted at the University of Utah, he has
                also built a successful career as an entrepreneur and previously served as the
                State Science Advisor for Utah, contributing to public policy and legislative
                initiatives.
              </p>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
