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
              NAIERM provides transparent, policy-grade scenario modeling for AI-era public
              finance and national social programs. The framework allows policymakers, analysts,
              and researchers to explore how fiscal architecture influences economic stability in
              economies shaped by artificial intelligence and automated productivity.
            </p>
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
                The National AI Economy Resiliency Model (NAIERM) was developed by <strong>Dr.
                James W. Bunger</strong>, a systems engineer with more than four decades of
                experience designing and optimizing complex technological systems.
              </p>
              <p className={styles.p}>
                Dr. Bunger&apos;s work spans energy systems, petroleum refining, specialty chemicals,
                unconventional fuels development, environmental forensics, and process modeling
                software.
              </p>
              <p className={styles.p}>
                He earned his <strong>PhD in Fuels Engineering from the University of Utah</strong>,
                holds <strong>15 patents</strong>, and has authored <strong>more than 50
                peer-reviewed and technical journal publications</strong>.
              </p>
              <p className={styles.p}>
                Dr. Bunger also served for many years as the <strong>State Science Advisor for
                Utah</strong>, providing scientific and technical guidance on technology development
                and public policy initiatives.
              </p>
              <p className={styles.p}>
                NAIERM applies systems engineering principles to economic architecture, enabling
                policymakers and researchers to evaluate fiscal stability in economies shaped by
                artificial intelligence and automation.
              </p>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
