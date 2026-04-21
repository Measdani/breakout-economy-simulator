import styles from './contact.module.css'

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <p className={styles.message}>All questions and comments</p>
        <p className={styles.emailLine}>
          email us{' '}
          <a href="mailto:info@naierm.com" className={styles.link}>
            info@naierm.com
          </a>
        </p>
      </div>
    </main>
  )
}
