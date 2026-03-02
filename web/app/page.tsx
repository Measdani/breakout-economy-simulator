import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8 md:p-10 glow-border-blue">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-3">National AI Economy Resiliency Model</p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-bright mb-4">
          Policy-grade modeling for AI-era fiscal resilience
        </h1>
        <p className="text-base md:text-lg text-dimmed max-w-3xl mb-8">
          NAIERM is a policy-grade simulator for revenue architecture and national social programs,
          designed for federal scenario analysis.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/model"
            className="px-4 py-2 rounded border border-emerald-400 text-emerald-300 text-sm font-semibold hover:bg-emerald-900/30 transition"
          >
            Launch Simulator
          </Link>
          <Link
            href="/methodology"
            className="px-4 py-2 rounded border border-blue-400 text-blue-200 text-sm font-semibold hover:bg-blue-900/30 transition"
          >
            Read Methodology
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Revenue & Funding Engine</h2>
          <p className="text-sm text-dimmed">
            Models token-based friction tax, simplified income tax, and funding allocation across federal obligations.
          </p>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Demographics & BEL/SBI</h2>
          <p className="text-sm text-dimmed">
            Simulates Basic Economic Liquidity (BEL) and Systemic Bonus Incentive (SBI) with household composition controls.
          </p>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">National Social Programs</h2>
          <p className="text-sm text-dimmed">
            Evaluates retirement and healthcare obligations under BEL-first allocation with fiscal crowd-out checks.
          </p>
        </article>
      </section>

      <section className="mt-8 bg-darker-navy rounded-lg border border-border-slate p-4">
        <p className="text-sm text-dimmed">
          Transparent assumptions • Scenario modeling • Exportable datasets
        </p>
      </section>
    </PublicSiteShell>
  )
}
