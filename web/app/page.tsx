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
        <p className="text-base md:text-lg text-dimmed max-w-3xl mb-3">
          NAIERM is a policy-grade simulator for revenue architecture and national program obligations,
          built for transparent scenario analysis in the AI era.
        </p>
        <p className="text-sm text-blue-100 mb-7">
          Transparent assumptions • Scenario modeling • Exportable datasets
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/model"
            className="px-5 py-2.5 rounded border border-emerald-400 bg-emerald-900/25 text-emerald-200 text-sm font-semibold hover:bg-emerald-900/40 transition"
          >
            Launch Simulator
          </Link>
          <Link
            href="/methodology"
            className="px-5 py-2.5 rounded border border-blue-400 text-blue-200 text-sm font-semibold hover:bg-blue-900/30 transition"
          >
            Read Methodology
          </Link>
          <Link
            href="/research"
            className="text-sm text-dimmed hover:text-bright underline underline-offset-4 transition"
          >
            View Research
          </Link>
        </div>
      </section>

      <section className="mt-5 bg-darker-navy rounded-lg border border-border-slate p-4">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Start Here</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <Link href="/model" className="rounded border border-border-slate bg-dark-slate px-3 py-2 text-dimmed hover:text-bright hover:border-blue-400 transition">
            Run a scenario
          </Link>
          <Link href="/methodology" className="rounded border border-border-slate bg-dark-slate px-3 py-2 text-dimmed hover:text-bright hover:border-blue-400 transition">
            Understand the model
          </Link>
          <Link href="/research" className="rounded border border-border-slate bg-dark-slate px-3 py-2 text-dimmed hover:text-bright hover:border-blue-400 transition">
            Review assumptions & datasets
          </Link>
          <a
            href="https://github.com/Measdani/breakout-economy-simulator/commits/main"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-border-slate bg-dark-slate px-3 py-2 text-dimmed hover:text-bright hover:border-blue-400 transition"
          >
            See change history
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-lg font-semibold text-bright mb-2">Revenue & Funding Engine</h2>
          <p className="text-sm text-dimmed mb-3">
            National revenue architecture module for baseline and stress-test financing.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-3 list-disc list-inside">
            <li>Friction tax + supplemental income tax structure</li>
            <li>Allocation waterfall across BEL, retirement, healthcare</li>
            <li>Sensitivity and crowd-out signals</li>
          </ul>
          <Link href="/model" className="text-sm text-blue-200 hover:text-bright transition">
            Open module
          </Link>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-lg font-semibold text-bright mb-2">Demographics & BEL/SBI</h2>
          <p className="text-sm text-dimmed mb-3">
            Household and incentive module for BEL distribution and SBI phase-out dynamics.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-3 list-disc list-inside">
            <li>Tiered dependent support inputs</li>
            <li>Household distribution controls</li>
            <li>SBI breakout and incentive behavior</li>
          </ul>
          <Link href="/model" className="text-sm text-blue-200 hover:text-bright transition">
            Open module
          </Link>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-lg font-semibold text-bright mb-2">National Social Programs</h2>
          <p className="text-sm text-dimmed mb-3">
            Program obligations module for retirement and healthcare policy options.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-3 list-disc list-inside">
            <li>Retirement replacement and baseline comparisons</li>
            <li>Healthcare efficiency reform levers</li>
            <li>Funding ratio and net savings indicators</li>
          </ul>
          <Link href="/methodology" className="text-sm text-blue-200 hover:text-bright transition">
            Learn more
          </Link>
        </article>
      </section>
    </PublicSiteShell>
  )
}
