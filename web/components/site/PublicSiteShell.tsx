import Link from 'next/link'
import type { ReactNode } from 'react'
import PublicTopNav from './PublicTopNav'

interface PublicSiteShellProps {
  children: ReactNode
  contentClassName?: string
}

export default function PublicSiteShell({
  children,
  contentClassName = 'max-w-[1120px] mx-auto px-5 md:px-8 pt-12 md:pt-14 pb-24',
}: PublicSiteShellProps) {
  return (
    <div className="min-h-screen text-bright">
      <PublicTopNav />

      <main className={contentClassName}>{children}</main>

      <footer className="footer bg-[#0a1220] shadow-[0_-18px_42px_rgba(5,10,18,0.55)]">
        <div className="max-w-[1120px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Model</p>
              <div className="space-y-2 text-dimmed">
                <Link href="/model" className="block hover:text-bright transition">Launch Simulator</Link>
                <Link href="/leaderboard" className="block hover:text-bright transition">Leaderboard</Link>
                <Link href="/glossary" className="block hover:text-bright transition">Glossary</Link>
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
                <Link href="/research" className="block hover:text-bright transition">Dataset &amp; Ethics</Link>
                <Link href="/research#submission-use" className="block hover:text-bright transition">Submission Use</Link>
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

          <div className="mt-10 text-xs text-muted">
            <p>NAIERM Web v0.3 | Last updated March 2, 2026</p>
            <p className="mt-2">Model assumptions versioned and archived. See changelog for revisions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
