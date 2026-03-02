import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function Home() {
  return (
    <PublicSiteShell contentClassName="max-w-[1120px] mx-auto px-3 md:px-6 py-8 md:py-10">
      <div className="rounded-2xl overflow-hidden border border-border-slate bg-gradient-to-b from-[#06132a] via-[#08162f] to-[#071127] shadow-[0_24px_48px_rgba(3,8,20,0.55)]">
        <section className="px-7 py-12 md:px-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-[13px] uppercase tracking-[0.18em] text-blue-100/80 mb-4">Model Architecture Overview</p>
              <h1 className="text-4xl md:text-5xl leading-tight font-semibold text-white mb-8">
                Revenue to Obligations Sequencing Framework
              </h1>

              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">Stage 1 - Revenue Generation</h2>
                  <p className="text-xl text-blue-100/80 leading-relaxed">
                    Friction tax and supplemental income tax generate total fiscal inflow.
                  </p>
                </div>

                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">Stage 2 - Allocation Order</h2>
                  <p className="text-xl text-blue-100/80 leading-relaxed">
                    Basic Economic Liquidity (BEL) is funded first. Remaining fiscal space allocated to national programs.
                  </p>
                </div>

                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">Stage 3 - Obligations and Balance</h2>
                  <p className="text-xl text-blue-100/80 leading-relaxed">
                    Retirement and healthcare obligations funded from remaining space. Final fiscal balance calculated.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[460px] rounded-xl border border-blue-200/10 bg-gradient-to-br from-[#0b2547]/55 to-[#08172e]/75 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(56,189,248,0.35),transparent_45%)]" />
              <div className="absolute inset-x-8 bottom-8 h-1 bg-cyan-300/70 shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
              <div className="absolute inset-x-10 bottom-10 h-[2px] bg-cyan-200/45" />
              <div className="absolute left-10 right-10 bottom-16 h-36">
                <div className="absolute bottom-0 left-0 w-6 h-16 bg-cyan-200/35" />
                <div className="absolute bottom-0 left-8 w-6 h-20 bg-cyan-200/35" />
                <div className="absolute bottom-0 left-16 w-8 h-28 bg-cyan-200/40" />
                <div className="absolute bottom-0 left-28 w-9 h-[9.5rem] bg-cyan-200/45" />
                <div className="absolute bottom-0 left-[10.5rem] w-10 h-[11.5rem] bg-cyan-100/50" />
                <div className="absolute bottom-0 left-[14.5rem] w-9 h-[14rem] bg-cyan-100/55" />
                <div className="absolute bottom-0 left-[18.5rem] w-11 h-[16.5rem] bg-cyan-100/60" />
                <div className="absolute bottom-0 left-[22.5rem] w-11 h-[18.5rem] bg-cyan-50/65" />
              </div>
              <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 420 280" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="36,220 98,208 150,185 206,162 264,138 322,111 382,82" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
                <circle cx="98" cy="208" r="4" fill="#a5f3fc" />
                <circle cx="150" cy="185" r="4" fill="#a5f3fc" />
                <circle cx="206" cy="162" r="4" fill="#a5f3fc" />
                <circle cx="264" cy="138" r="4" fill="#a5f3fc" />
                <circle cx="322" cy="111" r="4" fill="#a5f3fc" />
              </svg>
            </div>
          </div>
        </section>

        <div className="h-px bg-blue-200/20" />

        <section className="px-7 py-12 md:px-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[13px] uppercase tracking-[0.18em] text-blue-100/80 mb-4">How NAIERM Works</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight text-white mb-6">
                NAIERM models how federal revenue architecture, income floor policy (BEL), retirement systems and healthcare obligations interact within a unified fiscal framework.
              </h2>
              <p className="text-xl text-blue-100/80 leading-relaxed mb-4">
                Users configure revenue architecture and program parameters, then observe allocation order, fiscal balance, and sustainability indicators in real time.
              </p>
              <p className="text-xl text-blue-100/80 leading-relaxed">
                The interface is designed for transparent scenario testing, with output structured aligned for comparative review and export.
              </p>
            </div>

            <div className="relative min-h-[420px] rounded-xl border border-blue-200/10 bg-gradient-to-br from-[#0c2442]/60 to-[#09172a]/80 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.3),transparent_42%)]" />
              <div className="absolute left-12 bottom-14 w-44 h-[7.5rem] rounded border border-cyan-200/35 bg-cyan-100/10" />
              <div className="absolute left-[5.5rem] bottom-[4.5rem] w-52 h-40 rounded border border-cyan-200/40 bg-cyan-100/12" />
              <div className="absolute left-[9.5rem] bottom-[5.5rem] w-56 h-52 rounded border border-cyan-200/45 bg-cyan-100/16" />
              <div className="absolute left-[11rem] bottom-28 w-[7.5rem] h-[5.5rem] rounded border border-cyan-50/50 bg-cyan-100/20 flex items-center justify-center">
                <div className="w-16 h-10 border border-cyan-100/60 rounded-sm" />
              </div>
              <div className="absolute inset-x-10 bottom-9 h-[2px] bg-cyan-200/60 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
            </div>
          </div>
        </section>

        <div className="h-px bg-blue-200/20" />

        <section className="px-7 py-12 md:px-10 md:py-14">
          <p className="text-[13px] uppercase tracking-[0.18em] text-blue-100/80 mb-3">Core Engines</p>
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight text-white mb-8">
            Integrated Policy Modules
          </h2>

          <div className="space-y-6">
            <article className="rounded-xl border border-blue-300/20 bg-[#0b1b35]/70 p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
                <div className="h-36 rounded-lg border border-cyan-200/30 bg-gradient-to-r from-[#0d2548] to-[#132f55] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(103,232,249,0.3),transparent_45%)]" />
                  <div className="absolute left-4 bottom-4 right-4 h-[2px] bg-cyan-200/55" />
                  <div className="absolute left-7 bottom-8 w-8 h-10 bg-cyan-100/35" />
                  <div className="absolute left-[4.5rem] bottom-8 w-10 h-14 bg-cyan-100/40" />
                  <div className="absolute left-[7.75rem] bottom-8 w-8 h-12 bg-cyan-100/35" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-cyan-200 mb-2">Revenue &amp; Funding Engine</h3>
                  <p className="text-xl text-blue-100/80 leading-relaxed">
                    Friction tax and supplemental income tax generate total fiscal inflow.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-blue-300/20 bg-[#0b1b35]/70 p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
                <div className="h-36 rounded-lg border border-violet-200/30 bg-gradient-to-r from-[#281e4c] to-[#1c2f57] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_45%,rgba(196,181,253,0.35),transparent_45%)]" />
                  <div className="absolute left-4 bottom-4 right-4 h-[2px] bg-violet-200/55" />
                  <div className="absolute left-8 bottom-10 w-8 h-8 rounded-full border border-violet-100/50" />
                  <div className="absolute left-20 bottom-10 w-8 h-8 rounded-full border border-violet-100/50" />
                  <div className="absolute left-12 bottom-[4.5rem] w-16 h-2 bg-violet-100/45 rounded" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-violet-200 mb-2">Demographics &amp; Income Floor</h3>
                  <p className="text-xl text-blue-100/80 leading-relaxed">
                    Basic Economic Liquidity (BEL) is funded first. Remaining fiscal space allocated to national programs.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  )
}
