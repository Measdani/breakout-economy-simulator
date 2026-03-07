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
              For policy collaboration, institutional demos, research partnerships, or media
              inquiries, contact the NAIERM team directly.
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
                <li>Policy architecture and fiscal scenario reviews.</li>
                <li>Institutional walkthroughs of the NAIERM modeling framework.</li>
                <li>Research collaboration and publication partnerships.</li>
                <li>Academic and think tank demonstrations of the simulation model.</li>
                <li>Government and policy advisory discussions related to AI-era fiscal systems.</li>
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Collaboration Opportunities</h2>
              <p className={styles.p}>
                NAIERM welcomes collaboration with researchers, academic institutions, public
                policy organizations, and government agencies interested in exploring fiscal
                architecture for AI-driven economies.
              </p>
              <p className={styles.p}>Potential collaboration areas include:</p>
              <ul className={styles.list}>
                <li>policy research and scenario analysis</li>
                <li>academic publication and peer review</li>
                <li>institutional demonstrations and workshops</li>
                <li>model evaluation and refinement</li>
              </ul>
            </section>
          </div>

          <p className={styles.credibilityNote}>
            The NAIERM framework is developed as part of the Breakout Economy research initiative
            and is designed to support transparent policy modeling and institutional collaboration.
          </p>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
