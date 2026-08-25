import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './white-paper.module.css'

const pressurePoints = [
  'GDP growth can continue while wage income and household purchasing power weaken.',
  'AI-driven productivity may reduce dependence on taxable human labor.',
  'Public systems built around wage-based tax flows may face structural pressure.',
  'Economic liquidity becomes a central variable for keeping value circulating.',
]

const modelQuestions = [
  'What happens when productive capacity rises faster than household demand?',
  'How do wage contraction and purchasing-power pressure affect public finance?',
  'What mechanisms could sustain participation in an AI-shaped economy?',
]

export default function WhitePaperPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.kicker}>White Paper</div>
            <h1 className={styles.title}>
              National AI Economy Resilience Model
            </h1>
            <p className={styles.subtitle}>
              A research framework for examining what happens when AI-driven output,
              wages, purchasing power, and public finance stop moving together.
            </p>
          </header>

          <div className={styles.grid}>
            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Abstract Overview</h2>
              <p className={styles.p}>
                NAiERM explores the economic stability challenge that may emerge as
                artificial intelligence generates increasing productive value without
                relying on human labor in the traditional way.
              </p>
              <p className={styles.p}>
                The paper frames a system-level question: if GDP and productivity grow
                while wages, purchasing power, and tax bases weaken, how does economic
                value continue to circulate through households, businesses, and public
                systems?
              </p>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Core Pressure Points</h2>
              <ul className={styles.list}>
                {pressurePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Research Questions</h2>
              <ul className={styles.list}>
                {modelQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>

            <section className={`${styles.card} ${styles.full}`}>
              <h2 className={styles.h2}>Why Liquidity Matters</h2>
              <p className={styles.p}>
                The framework treats economic liquidity as a resilience variable. Rising
                output alone does not guarantee stability if households lose the ability
                to participate in the economy as consumers, taxpayers, and members of
                public systems.
              </p>
              <p className={styles.p}>
                NAiERM therefore examines the relationship between productive capacity
                and aggregate demand, with particular attention to how policy mechanisms
                could preserve participation as AI changes the structure of income.
              </p>
            </section>

            <section className={`${styles.card} ${styles.full} ${styles.ctaCard}`}>
              <div>
                <h2 className={styles.h2}>Read the Full Paper</h2>
                <p className={styles.p}>
                  Use the official SSRN page for the formal paper record. The local PDF
                  is also available for direct browser viewing.
                </p>
              </div>

              <div className={styles.actions}>
                <a
                  className={styles.primaryLink}
                  href="https://ssrn.com/abstract=6858658"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read on SSRN
                </a>
                <a
                  className={styles.secondaryLink}
                  href="/NAIERM_Abstract_V2.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF
                </a>
              </div>
            </section>
          </div>

          <div className={styles.footerSpacer} />
        </div>
      </main>
    </PublicSiteShell>
  )
}
