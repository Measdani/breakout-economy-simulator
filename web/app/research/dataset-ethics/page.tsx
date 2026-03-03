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

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.h2}>What We Store</h2>
              <ul className={styles.list}>
                <li>Complete policy configuration inputs selected in the simulator.</li>
                <li>
                  Computed outputs (revenue, obligations, balance, module-level metrics).
                </li>
                <li>Optional qualitative feedback submitted with the policy scenario.</li>
              </ul>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>What We Do Not Require</h2>
              <ul className={styles.list}>
                <li>No mandatory personally identifying information is required to submit scenarios.</li>
                <li>No hidden behavioral tracking for policy records.</li>
                <li>
                  No opaque aggregation: export schema reflects the submission payload directly.
                </li>
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Use of Submissions</h2>
              <p className={styles.p}>
                Submitted scenarios are used to build a comparative policy research dataset,
                support aggregated analytics, and publish transparent model behavior under
                varied assumptions.
              </p>
              <p className={styles.p}>
                Admin exports are available as CSV with flattened payload fields for independent
                verification and auditing.
              </p>

              <div className={styles.callout}>
                <div className={styles.calloutTitle}>Privacy posture</div>
                <div className={styles.calloutBody}>
                  The model is designed to be research-grade without collecting user identity.
                  We prioritize transparency, minimal data collection, and exportable structure.
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
