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
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Model</p>
              <div className="space-y-2 text-dimmed">
                <Link href="/model" className="block hover:text-bright transition">Launch Simulator</Link>
                <Link href="/glossary" className="block hover:text-bright transition">Glossary</Link>
                <Link href="/admin/login" className="block hover:text-bright transition">Admin Login</Link>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Methodology</p>
              <div className="space-y-2 text-dimmed">
                <Link href="/methodology" className="block hover:text-bright transition">Framework</Link>
                <Link href="/methodology#assumptions" className="block hover:text-bright transition">Assumptions</Link>
                <Link href="/methodology#modules" className="block hover:text-bright transition">Program Modules</Link>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Research</p>
              <div className="space-y-2 text-dimmed">
                <Link href="/research" className="block hover:text-bright transition">Dataset and Ethics</Link>
                <Link href="/research#submission-use" className="block hover:text-bright transition">Submission Use</Link>
                <a
                  href="https://github.com/Measdani/breakout-economy-simulator/commits/main"
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-bright transition"
                >
                  Changelog
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
              <div className="space-y-2 text-dimmed">
                <Link href="/research#data-policy" className="block hover:text-bright transition">Data Policy</Link>
                <Link href="/research#no-pii" className="block hover:text-bright transition">No PII Scope</Link>
                <Link href="/contact" className="block hover:text-bright transition">Contact</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border-slate/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
            <p>NAIERM Web v0.3</p>
            <p>Last updated March 2, 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
