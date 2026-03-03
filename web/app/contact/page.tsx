import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './contact.module.css'

export default function ContactPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.kicker}>Contact</div>
            <h1 className={styles.title}>Inquiries and Partnerships</h1>
            <p className={styles.subtitle}>
              For policy collaboration, institutional demos, and research partnerships, contact the NAIERM team directly.
            </p>
          </header>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2 className={styles.h2}>Primary Contact</h2>
              <p className={styles.p}>Research and institutional inquiries:</p>
              <a href="mailto:research@breakouteconomy.org" className={styles.link}>
                research@breakouteconomy.org
              </a>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Best Use Cases</h2>
              <ul className={styles.list}>
                <li>Policy architecture and financing scenario reviews.</li>
                <li>Institutional walkthroughs of model assumptions.</li>
                <li>Partnership discussions for research and publication.</li>
              </ul>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
