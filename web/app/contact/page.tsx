import PublicSiteShell from '@/components/site/PublicSiteShell'
import styles from './contact.module.css'

export default function ContactPage() {
  return (
    <PublicSiteShell contentClassName="px-0 py-0">
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.card}>
            <h1 className={styles.title}>Contact</h1>
            <p className={styles.message}>All questions and comments</p>
            <p className={styles.emailLine}>
              email us{' '}
              <a href="mailto:info@naierm.com" className={styles.link}>
                info@naierm.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  )
}
