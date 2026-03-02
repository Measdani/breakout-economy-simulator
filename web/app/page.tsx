import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell>
      <section className="relative overflow-hidden rounded-xl border border-border-slate min-h-[430px] glow-border-blue">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-family-scene.svg')",
            filter: 'blur(1.2px) saturate(0.9)',
            transform: 'scale(1.03)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172aee] via-[#122238e0] to-[#0c1528f0]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, rgba(148,163,184,0.18) 0, rgba(148,163,184,0.18) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(to bottom, rgba(148,163,184,0.12) 0, rgba(148,163,184,0.12) 1px, transparent 1px, transparent 28px)',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="40,330 180,295 320,310 460,260 620,270 770,215 940,230 1160,160" fill="none" stroke="#7dd3fc" strokeWidth="2" />
          <line x1="120" y1="110" x2="280" y2="190" stroke="#93c5fd" strokeWidth="1.2" />
          <line x1="280" y1="190" x2="510" y2="150" stroke="#93c5fd" strokeWidth="1.2" />
          <line x1="510" y1="150" x2="710" y2="235" stroke="#93c5fd" strokeWidth="1.2" />
          <line x1="710" y1="235" x2="980" y2="170" stroke="#93c5fd" strokeWidth="1.2" />
          <circle cx="120" cy="110" r="4" fill="#bfdbfe" />
          <circle cx="280" cy="190" r="4" fill="#bfdbfe" />
          <circle cx="510" cy="150" r="4" fill="#bfdbfe" />
          <circle cx="710" cy="235" r="4" fill="#bfdbfe" />
          <circle cx="980" cy="170" r="4" fill="#bfdbfe" />
        </svg>

        <div className="relative p-8 md:p-10 lg:p-12 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-blue-100 mb-3">National AI Economy Resiliency Model</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-bright mb-4">
            Policy-Grade Modeling for AI-Era Fiscal Resilience
          </h1>
          <p className="text-base md:text-xl text-blue-100/95 max-w-3xl mb-3">
            A transparent federal simulation engine for revenue architecture, national obligations, and long-term household stability.
          </p>
          <p className="text-sm text-blue-100/85 mb-7">
            Transparent assumptions • Scenario modeling • Exportable datasets
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/model"
              className="px-5 py-2.5 rounded border border-emerald-400 bg-emerald-900/30 text-emerald-200 text-sm font-semibold hover:bg-emerald-900/45 transition"
            >
              Launch Simulator
            </Link>
            <Link
              href="/methodology"
              className="px-5 py-2.5 rounded border border-blue-300 text-blue-100 text-sm font-semibold hover:bg-blue-900/30 transition"
            >
              Read Methodology
            </Link>
          </div>
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

      <section className="mt-8 bg-dark-slate rounded-xl border border-border-slate p-6 md:p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">What This Tool Does</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-3 text-sm text-dimmed leading-relaxed">
            <p>
              NAIERM models how federal revenue architecture and national obligations interact under explicit policy assumptions.
            </p>
            <p>
              Users adjust financing, BEL/SBI, and program parameters, then observe allocation order, deficits, and funding ratios in real time.
            </p>
            <p>
              Every submission is stored in Supabase-backed records with exportable structured payloads for audit and comparative analysis.
            </p>
          </div>
          <div className="bg-darker-navy rounded-lg border border-border-slate p-4">
            <div className="h-44 rounded border border-border-slate bg-dark-slate relative overflow-hidden">
              <div className="absolute inset-0 opacity-35 bg-gradient-to-r from-blue-900/50 to-emerald-900/40" />
              <div className="absolute left-4 right-4 top-5 h-2 bg-border-slate rounded" />
              <div className="absolute left-4 top-12 w-[62%] h-2 bg-blue-400/70 rounded" />
              <div className="absolute left-4 top-18 w-[48%] h-2 bg-sky-300/70 rounded" />
              <div className="absolute left-4 top-24 w-[75%] h-2 bg-emerald-300/70 rounded" />
              <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="20,145 95,118 160,126 235,88 315,96 380,60" fill="none" stroke="#93c5fd" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <article className="bg-dark-slate rounded-xl border border-border-slate p-6 shadow-[0_10px_24px_rgba(15,23,42,0.28)]">
          <h2 className="text-lg font-semibold text-bright mb-2">Revenue & Funding Engine</h2>
          <p className="text-sm text-dimmed mb-2">
            Federal revenue architecture for baseline and stress-test financing.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-4 list-disc list-inside">
            <li>Friction tax and supplemental income tax</li>
            <li>BEL-first waterfall and crowd-out checks</li>
          </ul>
          <Link href="/model" className="text-sm text-blue-200 hover:text-bright transition">
            Open module
          </Link>
        </article>
        <article className="bg-dark-slate rounded-xl border border-border-slate p-6 shadow-[0_10px_24px_rgba(15,23,42,0.28)]">
          <h2 className="text-lg font-semibold text-bright mb-2">Demographics & BEL/SBI</h2>
          <p className="text-sm text-dimmed mb-2">
            Household and incentive engine for BEL distribution and SBI phase-out.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-4 list-disc list-inside">
            <li>Tiered dependent and household controls</li>
            <li>Incentive breakout and taper behavior</li>
          </ul>
          <Link href="/model" className="text-sm text-blue-200 hover:text-bright transition">
            Open module
          </Link>
        </article>
        <article className="bg-dark-slate rounded-xl border border-border-slate p-6 shadow-[0_10px_24px_rgba(15,23,42,0.28)]">
          <h2 className="text-lg font-semibold text-bright mb-2">National Social Programs</h2>
          <p className="text-sm text-dimmed mb-2">
            Retirement and healthcare obligations with funding sustainability indicators.
          </p>
          <ul className="text-sm text-dimmed space-y-1 mb-4 list-disc list-inside">
            <li>Retirement replacement and baseline comparisons</li>
            <li>Healthcare efficiency and net savings levers</li>
          </ul>
          <Link href="/methodology" className="text-sm text-blue-200 hover:text-bright transition">
            Learn more
          </Link>
        </article>
      </section>

      <section className="mt-8 bg-dark-slate rounded-xl border border-border-slate p-6 md:p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Designed for Household Stability</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-bright mb-3">
          Modeling Fiscal Systems That Support Household Stability
        </h2>
        <p className="text-sm text-dimmed leading-relaxed max-w-4xl">
          The model links predictable income floors, retirement sustainability, healthcare obligations, and capital formation balance
          into a single federal scenario framework so household-relevant outcomes remain visible in fiscal decisions.
        </p>
      </section>
    </PublicSiteShell>
  )
}
