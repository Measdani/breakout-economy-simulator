import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell contentClassName="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-16">
      <section className="rounded-2xl border border-border-slate bg-darker-navy/60 p-8 md:p-12">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Landing Page Reset</p>
        <h1 className="mb-4 text-3xl font-semibold text-bright md:text-4xl">NAIERM</h1>
        <p className="max-w-2xl text-sm text-dimmed md:text-base">
          The public homepage has been reset to a clean starting point. The simulator and app routes are unchanged.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/model"
            className="rounded border border-emerald-400 bg-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/35 transition"
          >
            Launch Simulator
          </Link>
          <Link
            href="/methodology"
            className="rounded border border-border-slate px-4 py-2 text-sm text-bright hover:bg-dark-slate/40 transition"
          >
            Read Methodology
          </Link>
        </div>
      </section>
    </PublicSiteShell>
  )
}
