import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell>
      <div className="space-y-20 py-8 md:py-10">
        <section className="relative overflow-hidden rounded-xl border border-border-slate min-h-[430px] glow-border-blue">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172af2] via-[#13243de6] to-[#0c1528f2]" />
          <div
            className="absolute inset-0 opacity-18"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(148,163,184,0.2) 0, rgba(148,163,184,0.2) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(to bottom, rgba(148,163,184,0.12) 0, rgba(148,163,184,0.12) 1px, transparent 1px, transparent 28px)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
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
            <p className="text-base md:text-xl text-blue-100/95 max-w-3xl mb-3 leading-8">
              A transparent federal simulation engine for revenue architecture, national obligations, and long-term household stability.
            </p>
            <p className="text-sm text-blue-100/85 mb-7">
              Transparent assumptions | Scenario modeling | Exportable datasets
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

        <section className="bg-dark-slate rounded-xl border border-border-slate p-6 md:p-8 shadow-[0_12px_36px_rgba(8,14,28,0.35)]">
          <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">How AIERM Works</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
            <div className="space-y-4 text-base text-dimmed leading-7">
              <p>
                AIERM models how revenue, income floors, retirement systems, and healthcare obligations interact under explicit policy assumptions.
              </p>
              <p>
                Users configure revenue architecture and program parameters, then observe allocation order, fiscal balance, and sustainability indicators in real time.
              </p>
            </div>
            <div className="bg-darker-navy rounded-lg border border-border-slate p-4">
              <div className="h-52 rounded border border-border-slate bg-dark-slate relative overflow-hidden">
                <div className="absolute inset-0 opacity-35 bg-gradient-to-r from-blue-900/45 to-emerald-900/30" />
                <div className="absolute left-4 right-4 top-5 h-2 bg-border-slate rounded" />
                <div className="absolute left-4 top-12 w-[62%] h-2 bg-sky-300/80 rounded" />
                <div className="absolute left-4 top-18 w-[45%] h-2 bg-violet-300/75 rounded" />
                <div className="absolute left-4 top-24 w-[74%] h-2 bg-orange-300/75 rounded" />
                <div className="absolute right-4 top-12 w-28 h-28 rounded border border-border-slate bg-darker-navy/90 p-2">
                  <div className="h-2 w-full bg-emerald-400/75 rounded mb-2" />
                  <div className="h-2 w-3/4 bg-sky-300/75 rounded mb-2" />
                  <div className="h-2 w-1/2 bg-violet-300/75 rounded" />
                </div>
                <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points="20,145 95,118 160,126 235,88 315,96 380,60" fill="none" stroke="#93c5fd" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-blue-200">Core Engines</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-bright">Integrated Policy Modules</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="group bg-dark-slate rounded-2xl border border-border-slate p-6 shadow-[0_10px_28px_rgba(10,18,34,0.36)] relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(14,30,56,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400/60 to-cyan-300/70" />
              <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-blue-900/25 blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg border border-blue-300/40 bg-blue-900/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 16h4v4H4v-4Zm6-6h4v10h-4V10Zm6-6h4v16h-4V4Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">Revenue and Funding Engine</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Models federal revenue architecture and stress-tests financing under BEL-first allocation rules.
                </p>
                <Link
                  href="/model"
                  className="inline-flex items-center gap-2 rounded-md border border-blue-300/40 bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-blue-900/35 hover:border-blue-200/60"
                >
                  Explore Revenue Engine
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>

            <article className="group bg-dark-slate rounded-2xl border border-border-slate p-6 shadow-[0_10px_28px_rgba(10,18,34,0.36)] relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(14,30,56,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400/60 to-indigo-300/70" />
              <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-violet-900/25 blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg border border-violet-300/40 bg-violet-900/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-violet-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 18c4-7 12-7 16 0M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-5 3v7" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">Demographics and BEL/SBI</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Simulates household distribution, incentive taper dynamics, and income floor configuration.
                </p>
                <Link
                  href="/model"
                  className="inline-flex items-center gap-2 rounded-md border border-violet-300/40 bg-violet-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-violet-900/35 hover:border-violet-200/60"
                >
                  Explore Demographics
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>

            <article className="group bg-dark-slate rounded-2xl border border-border-slate p-6 shadow-[0_10px_28px_rgba(10,18,34,0.36)] relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(14,30,56,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-300/70 to-amber-200/70" />
              <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-orange-900/25 blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg border border-orange-300/40 bg-orange-900/30 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-orange-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 5h14v5H5V5Zm0 9h6v5H5v-5Zm8 0h6v5h-6v-5Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">National Social Programs</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Evaluates retirement and healthcare obligations with sustainability and funding indicators.
                </p>
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 rounded-md border border-orange-300/40 bg-orange-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-orange-900/35 hover:border-orange-200/60"
                >
                  Explore Social Programs
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="relative overflow-hidden bg-dark-slate rounded-2xl border border-border-slate p-8 md:p-10 shadow-[0_16px_44px_rgba(8,14,28,0.42)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
            style={{
              backgroundImage: "url('/hero-family-scene.svg')",
              filter: 'blur(0.8px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172adf] via-[#122238cc] to-[#0f172adf]" />
          <div className="relative max-w-4xl">
            <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Designed for Household Stability</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-bright mb-4">
              Modeling Fiscal Systems That Support Household Stability
            </h2>
            <p className="text-sm md:text-base text-blue-100/90 leading-7">
              AIERM connects macro-fiscal policy decisions to household-level stability outcomes. Income floors, retirement sustainability,
              healthcare obligations, and capital formation are modeled together, not in isolation.
            </p>
          </div>
        </section>

      </div>
    </PublicSiteShell>
  )
}
