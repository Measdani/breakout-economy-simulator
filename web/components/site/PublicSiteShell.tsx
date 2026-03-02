import Link from 'next/link'
import type { ReactNode } from 'react'

interface PublicSiteShellProps {
  children: ReactNode
  contentClassName?: string
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/model', label: 'Model' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function PublicSiteShell({
  children,
  contentClassName = 'max-w-6xl mx-auto px-4 py-10',
}: PublicSiteShellProps) {
  return (
    <div className="min-h-screen text-bright">
      <header className="sticky top-0 z-40 border-b border-border-slate bg-darker-navy/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wide text-bright">
            NAIERM
          </Link>
          <nav className="flex flex-wrap items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-dimmed hover:text-bright transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/model"
            className="px-3 py-1.5 text-xs font-semibold rounded border border-blue-400 text-blue-200 hover:bg-blue-900/40 transition"
          >
            Launch Simulator
          </Link>
        </div>
      </header>

      <main className={contentClassName}>{children}</main>

      <footer className="border-t border-border-slate bg-darker-navy">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-dimmed">
          <p>NAIERM Web v0.3</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/methodology" className="hover:text-bright transition">Methodology</Link>
            <Link href="/research#data-policy" className="hover:text-bright transition">Data Policy</Link>
            <Link href="/glossary" className="hover:text-bright transition">Glossary</Link>
            <a
              href="https://github.com/Measdani/breakout-economy-simulator/commits/main"
              target="_blank"
              rel="noreferrer"
              className="hover:text-bright transition"
            >
              Changelog
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

