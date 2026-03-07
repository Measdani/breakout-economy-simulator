import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './dataset-ethics.module.css'

export default function DatasetEthicsPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.kicker}>Research and Dataset</div>
            <h1 className={styles.title}>Dataset and Ethics</h1>
            <p className={styles.subtitle}>
              NAIERM submissions are stored in Supabase and exported as transparent,
              structured research records.
            </p>
          </header>

          <div id="data-policy" className={styles.grid}>
            <section id="research-purpose" className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Research Purpose</h2>
              <p className={styles.p}>
                The NAIERM simulator generates a structured dataset of policy architecture scenarios.
                Each submitted configuration represents a modeled fiscal system under defined parameters.
              </p>
              <p className={styles.p}>The dataset allows researchers to analyze:</p>
              <ul className={styles.list}>
                <li>fiscal solvency across policy structures</li>
                <li>liquidity distribution effects on demand</li>
                <li>parameter sensitivity across economic scenarios</li>
                <li>long-term stability thresholds in AI-driven economies</li>
              </ul>
              <p className={styles.p}>
                The goal is to support transparent policy modeling and comparative research.
              </p>
            </section>

            <section id="submission-use" className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Use of Submissions</h2>
              <p className={styles.p}>
                Submitted scenarios are aggregated into a comparative fiscal architecture dataset.
              </p>
              <p className={styles.p}>
                Researchers can use this dataset to evaluate how different policy configurations
                influence:
              </p>
              <ul className={styles.list}>
                <li>national fiscal balance</li>
                <li>real economic output</li>
                <li>liquidity distribution across households</li>
                <li>debt trajectory under varying assumptions</li>
              </ul>
              <p className={styles.p}>
                Admin exports are available as structured CSV files for independent verification
                and external analysis.
              </p>
            </section>

            <section id="dataset-structure" className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Dataset Structure</h2>
              <p className={styles.p}>Each record in the research dataset contains:</p>
              <ul className={styles.list}>
                <li>policy parameter inputs selected in the simulator</li>
                <li>derived economic outputs and fiscal metrics</li>
                <li>module-level results across revenue, liquidity, and obligations</li>
                <li>optional qualitative scenario feedback</li>
              </ul>
              <p className={styles.p}>
                Exports preserve the exact structure of the model inputs and outputs to allow
                reproducibility of policy scenarios.
              </p>
            </section>

            <section id="no-pii" className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Privacy Posture</h2>
              <p className={styles.p}>
                The model is designed to support research without collecting personal identity.
              </p>
              <p className={styles.p}>We prioritize:</p>
              <ul className={styles.list}>
                <li>minimal data collection</li>
                <li>transparent modeling parameters</li>
                <li>exportable research records</li>
                <li>no behavioral tracking</li>
              </ul>
              <p className={styles.p}>
                No personally identifiable information is collected or stored.
              </p>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
