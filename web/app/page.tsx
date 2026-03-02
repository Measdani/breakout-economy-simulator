import Link from 'next/link'
import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell>
      <div className="space-y-24 py-8 md:py-10">
        <section className="relative overflow-hidden rounded-2xl border border-border-slate min-h-[430px] glow-border-blue">
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

          <div className="relative px-7 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12 max-w-4xl">
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

        <section className="bg-dark-slate rounded-2xl border border-border-slate px-7 py-8 md:px-10 md:py-10 shadow-[0_12px_36px_rgba(8,14,28,0.35)]">
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
                <div className="h-[180px] rounded-xl border border-blue-300/25 bg-gradient-to-br from-[#102743] to-[#111d32] relative overflow-hidden mb-5">
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_70%_25%,rgba(125,211,252,0.35),transparent_45%)]" />
                  <div className="absolute left-4 right-4 top-5 h-1.5 rounded bg-slate-700/75" />
                  <div className="absolute left-4 top-10 w-[64%] h-2 rounded bg-cyan-300/75" />
                  <div className="absolute left-4 top-16 w-[52%] h-2 rounded bg-sky-200/70" />
                  <div className="absolute left-4 top-[86px] w-[75%] h-2 rounded bg-blue-200/65" />
                  <div className="absolute right-4 top-10 w-24 h-24 rounded-lg border border-blue-200/30 bg-slate-900/65 p-2">
                    <div className="h-2 w-full rounded bg-cyan-300/80 mb-2" />
                    <div className="h-2 w-3/4 rounded bg-sky-200/75 mb-2" />
                    <div className="h-2 w-1/2 rounded bg-blue-200/70" />
                  </div>
                  <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="18,145 94,118 164,125 236,92 316,98 382,64" fill="none" stroke="#7dd3fc" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">Revenue and Funding Engine</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Models federal revenue architecture and stress-tests financing under BEL-first allocation rules.
                </p>
                <Link href="/model" className="inline-flex items-center gap-2 rounded-md border border-blue-300/40 bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-blue-900/35 hover:border-blue-200/60">
                  Explore Revenue Engine
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>

            <article className="group bg-dark-slate rounded-2xl border border-border-slate p-6 shadow-[0_10px_28px_rgba(10,18,34,0.36)] relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(14,30,56,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400/60 to-indigo-300/70" />
              <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-violet-900/25 blur-2xl" />
              <div className="relative">
                <div className="h-[180px] rounded-xl border border-violet-300/25 bg-gradient-to-br from-[#24163f] to-[#171e36] relative overflow-hidden mb-5">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_25%,rgba(196,181,253,0.38),transparent_45%)]" />
                  <div className="absolute left-4 top-6 w-9 h-9 rounded-full bg-violet-200/20 border border-violet-200/35" />
                  <div className="absolute left-16 top-6 w-9 h-9 rounded-full bg-violet-200/20 border border-violet-200/35" />
                  <div className="absolute left-10 top-14 w-16 h-1 rounded bg-violet-200/45" />
                  <div className="absolute left-4 right-4 bottom-9 h-8 rounded border border-violet-200/25 bg-slate-900/65" />
                  <div className="absolute left-7 right-7 bottom-12 h-2 rounded bg-violet-300/70" />
                  <div className="absolute left-7 bottom-[54px] w-[58%] h-2 rounded bg-indigo-300/65" />
                  <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="20,135 90,125 155,95 220,84 285,76 380,52" fill="none" stroke="#c4b5fd" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">Demographics and BEL/SBI</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Simulates household distribution, incentive taper dynamics, and income floor configuration.
                </p>
                <Link href="/model" className="inline-flex items-center gap-2 rounded-md border border-violet-300/40 bg-violet-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-violet-900/35 hover:border-violet-200/60">
                  Explore Demographics
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>

            <article className="group bg-dark-slate rounded-2xl border border-border-slate p-6 shadow-[0_10px_28px_rgba(10,18,34,0.36)] relative overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(14,30,56,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-300/70 to-amber-200/70" />
              <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-orange-900/25 blur-2xl" />
              <div className="relative">
                <div className="h-[180px] rounded-xl border border-orange-300/25 bg-gradient-to-br from-[#35220f] to-[#20222f] relative overflow-hidden mb-5">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_72%_22%,rgba(253,186,116,0.38),transparent_45%)]" />
                  <div className="absolute left-4 right-4 top-7 h-8 rounded border border-orange-100/20 bg-slate-900/65" />
                  <div className="absolute left-7 top-9 w-[62%] h-2 rounded bg-amber-200/80" />
                  <div className="absolute left-7 top-[54px] w-[48%] h-2 rounded bg-orange-300/75" />
                  <div className="absolute left-4 right-4 top-[94px] h-8 rounded border border-orange-100/20 bg-slate-900/65" />
                  <div className="absolute left-7 top-[102px] w-[70%] h-2 rounded bg-orange-200/75" />
                  <div className="absolute left-7 top-[116px] w-[38%] h-2 rounded bg-amber-100/65" />
                  <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="18,148 90,126 156,133 230,104 300,114 382,86" fill="none" stroke="#fdba74" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-bright mb-2">National Social Programs</h3>
                <p className="text-sm text-dimmed leading-6 mb-5">
                  Evaluates retirement and healthcare obligations with sustainability and funding indicators.
                </p>
                <Link href="/methodology" className="inline-flex items-center gap-2 rounded-md border border-orange-300/40 bg-orange-900/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-orange-900/35 hover:border-orange-200/60">
                  Explore Social Programs
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#122136] rounded-2xl px-7 py-10 md:px-10 md:py-12 shadow-[0_20px_52px_rgba(6,11,20,0.52)]">
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
            <p className="text-sm md:text-base text-blue-100/90 leading-8">
              AIERM connects macro-fiscal policy decisions to household-level stability outcomes. Income floors, retirement sustainability,
              healthcare obligations, and capital formation are modeled together, not in isolation.
            </p>
          </div>
        </section>

      </div>
    </PublicSiteShell>
  )
}
