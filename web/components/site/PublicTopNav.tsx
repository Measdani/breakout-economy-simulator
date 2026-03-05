'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './PublicTopNav.module.css'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/research', label: 'Research' },
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
        <Link href="/" className={styles.brand}>
          NAIERM
        </Link>

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
          href="/model"
          className={styles.cta}
        >
          Launch Simulator
        </Link>
      </div>
    </header>
  )
}
