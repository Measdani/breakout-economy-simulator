'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './PublicTopNav.module.css'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/research', label: 'Research' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' },
]

export default function PublicTopNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brand}>
            NAiERM
          </Link>
          <p className={styles.tagline}>Exploring the Future Economy Together</p>
        </div>

        <nav className={styles.links}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? `${styles.link} ${styles.linkActive}` : styles.link}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/survey"
          className={styles.cta}
        >
          Take the Survey
        </Link>
      </div>
    </header>
  )
}
