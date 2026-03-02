import Link from 'next/link'
import type { ReactNode } from 'react'
import PublicTopNav from './PublicTopNav'

interface PublicSiteShellProps {
  children: ReactNode
  contentClassName?: string
}

export default function PublicSiteShell({
  children,
  contentClassName = 'max-w-6xl mx-auto px-4 py-10',
}: PublicSiteShellProps) {
  return (
    <div className="min-h-screen text-bright">
      <PublicTopNav />

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
