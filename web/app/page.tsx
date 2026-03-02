import PublicSiteShell from '@/components/site/PublicSiteShell'

const stageItems = [
  {
    title: 'Stage 1 - Revenue Generation',
    body: 'Friction tax and supplemental income tax generate total fiscal inflow.',
  },
  {
    title: 'Stage 2 - Allocation Order',
    body: 'Basic Economic Liquidity (BEL) is funded first. Remaining fiscal space allocated to national programs.',
  },
  {
    title: 'Stage 3 - Obligations and Balance',
    body: 'Retirement and healthcare obligations are funded from remaining fiscal space. Final fiscal balance is calculated.',
  },
]

function SequencingVisual() {
  const bars = [38, 44, 52, 66, 78, 94, 112, 132, 156, 178]

  return (
    <div className="relative min-h-[360px] sm:min-h-[430px] rounded-2xl border border-cyan-200/20 bg-[radial-gradient(circle_at_70%_28%,rgba(96,165,250,0.42),transparent_50%),linear-gradient(160deg,rgba(6,23,53,0.95)_0%,rgba(4,17,42,0.96)_52%,rgba(3,14,34,0.98)_100%)] overflow-hidden">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute right-6 top-8 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="absolute left-6 right-6 bottom-8 h-[2px] bg-cyan-200/70 shadow-[0_0_16px_rgba(34,211,238,0.55)]" />
      <div className="absolute left-8 right-8 bottom-10 flex items-end gap-1.5">
        {bars.map((height, index) => (
          <div
            key={index}
            style={{ height: `${height}px` }}
            className="w-[8%] rounded-t-sm border border-cyan-100/25 bg-gradient-to-t from-cyan-300/15 to-cyan-100/55"
          />
        ))}
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 420" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points="36,314 96,302 150,288 210,270 274,244 336,216 402,192 474,160 532,126"
          fill="none"
          stroke="rgba(103,232,249,0.95)"
          strokeWidth="3"
        />
        <polyline
          points="36,316 96,304 150,290 210,272 274,246 336,218 402,194 474,162 532,128"
          fill="none"
          stroke="rgba(34,211,238,0.3)"
          strokeWidth="8"
        />
        {[96, 150, 210, 274, 336, 402, 474].map((point) => (
          <circle key={point} cx={point} cy={point === 96 ? 302 : point === 150 ? 288 : point === 210 ? 270 : point === 274 ? 244 : point === 336 ? 216 : point === 402 ? 192 : 160} r="4.8" fill="rgba(186,230,253,0.95)" />
        ))}
      </svg>
    </div>
  )
}

function FrameworkVisual() {
  return (
    <div className="relative min-h-[360px] sm:min-h-[430px] rounded-2xl border border-cyan-200/20 bg-[radial-gradient(circle_at_72%_26%,rgba(34,211,238,0.28),transparent_46%),linear-gradient(155deg,rgba(6,24,52,0.96)_0%,rgba(4,16,40,0.98)_58%,rgba(3,11,30,1)_100%)] overflow-hidden">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="absolute left-6 right-6 bottom-8 h-[2px] bg-cyan-200/70 shadow-[0_0_15px_rgba(56,189,248,0.45)]" />

      <div className="absolute left-10 bottom-14 h-36 w-44 rounded-md border border-cyan-200/30 bg-cyan-100/10" />
      <div className="absolute left-[5.8rem] bottom-[4.4rem] h-44 w-56 rounded-md border border-cyan-200/35 bg-cyan-100/12" />
      <div className="absolute left-[9.3rem] bottom-[5.3rem] h-52 w-64 rounded-md border border-cyan-200/40 bg-cyan-100/15" />

      <div className="absolute left-[11.8rem] bottom-[9.7rem] h-24 w-32 rounded-md border border-cyan-100/60 bg-cyan-200/12">
        <div className="mx-auto mt-4 h-2 w-16 rounded-sm bg-cyan-100/65" />
        <div className="mx-auto mt-2 grid w-20 grid-cols-4 gap-1 px-1">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-9 rounded-sm bg-cyan-50/45" />
          ))}
        </div>
      </div>

      <div className="absolute right-10 top-14 h-16 w-28 rounded border border-cyan-200/30 bg-cyan-100/10" />
      <div className="absolute right-16 top-40 h-14 w-24 rounded border border-cyan-200/30 bg-cyan-100/10" />
    </div>
  )
}

function RevenueThumbnail() {
  return (
    <div className="relative h-full min-h-[146px] overflow-hidden rounded-lg border border-cyan-200/20 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.28),transparent_45%),linear-gradient(150deg,#0b2548_0%,#09203f_52%,#071833_100%)]">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-4 right-4 bottom-4 h-[2px] bg-cyan-200/65" />
      <div className="absolute left-6 bottom-6 h-8 w-6 bg-cyan-100/35" />
      <div className="absolute left-14 bottom-6 h-12 w-8 bg-cyan-100/45" />
      <div className="absolute left-24 bottom-6 h-10 w-7 bg-cyan-100/40" />
    </div>
  )
}

function RevenueGrowthVisual() {
  return (
    <div className="relative h-full min-h-[180px] overflow-hidden rounded-xl border border-cyan-200/20 bg-[radial-gradient(circle_at_72%_28%,rgba(34,211,238,0.3),transparent_48%),linear-gradient(155deg,#0b2448_0%,#091f3f_58%,#081734_100%)]">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.09)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute bottom-5 left-6 right-6 h-[2px] bg-cyan-200/65" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="20,138 70,130 118,116 168,98 220,84 272,66 332,46" fill="none" stroke="rgba(34,211,238,0.75)" strokeWidth="3" />
        <polyline points="20,140 70,132 118,118 168,100 220,86 272,68 332,48" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="8" />
      </svg>
      <div className="absolute right-6 top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
    </div>
  )
}

function DemographicsThumbnail() {
  return (
    <div className="relative h-full min-h-[146px] overflow-hidden rounded-lg border border-violet-200/25 bg-[radial-gradient(circle_at_34%_44%,rgba(196,181,253,0.28),transparent_45%),linear-gradient(150deg,#232350_0%,#1a2850_55%,#162142_100%)]">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(196,181,253,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(196,181,253,0.09)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute left-6 bottom-6 h-10 w-8 rounded-full border border-violet-100/55" />
      <div className="absolute left-16 bottom-6 h-10 w-8 rounded-full border border-violet-100/55" />
      <div className="absolute left-[6.5rem] bottom-8 h-14 w-10 rounded border border-violet-100/45 bg-violet-100/10" />
      <div className="absolute left-[9.4rem] bottom-8 h-16 w-11 rounded border border-violet-100/45 bg-violet-100/12" />
      <div className="absolute left-5 right-5 bottom-4 h-[2px] bg-violet-200/65" />
    </div>
  )
}

export default function Home() {
  return (
    <PublicSiteShell contentClassName="mx-auto max-w-[1120px] px-3 py-8 md:px-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/15 bg-[radial-gradient(circle_at_20%_0%,rgba(14,116,255,0.26),transparent_42%),radial-gradient(circle_at_86%_30%,rgba(34,211,238,0.16),transparent_45%),linear-gradient(180deg,#030d22_0%,#04102a_52%,#030b1d_100%)] shadow-[0_28px_62px_rgba(2,8,24,0.7)]">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:78px_78px]" />

        <section className="px-7 py-12 md:px-10 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_1fr]">
            <div>
              <p className="mb-4 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">Model Architecture Overview</p>
              <h1 className="mb-8 text-[clamp(2.35rem,4.1vw,3.85rem)] font-semibold leading-[1.08] text-white">
                Revenue to Obligations Sequencing Framework
              </h1>

              <div className="space-y-8">
                {stageItems.map((item) => (
                  <div key={item.title}>
                    <h2 className="mb-2 text-[clamp(1.95rem,3.2vw,2.95rem)] font-semibold leading-[1.1] text-white">{item.title}</h2>
                    <p className="text-xl leading-relaxed text-slate-200/85">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <SequencingVisual />
          </div>
        </section>

        <div className="h-px bg-sky-200/15" />

        <section className="px-7 py-12 md:px-10 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.03fr_1fr]">
            <div>
              <p className="mb-4 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">How NAIERM Works</p>
              <h2 className="mb-6 text-[clamp(2.2rem,4.3vw,3.75rem)] font-semibold leading-[1.14] text-white">
                NAIERM models how federal revenue architecture, income floor policy (BEL), retirement systems and healthcare obligations interact within a unified fiscal framework.
              </h2>
              <p className="mb-4 text-xl leading-relaxed text-slate-200/85">
                Users configure revenue architecture and program parameters, then observe allocation order, fiscal balance, and sustainability indicators in real time.
              </p>
              <p className="text-xl leading-relaxed text-slate-200/85">
                The interface is designed for transparent scenario testing, with output structured for comparative review and export.
              </p>
            </div>

            <FrameworkVisual />
          </div>
        </section>

        <div className="h-px bg-sky-200/15" />

        <section className="px-7 py-12 md:px-10 md:py-16">
          <p className="mb-3 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">Core Engines</p>
          <h2 className="mb-8 text-[clamp(2.1rem,3.4vw,3.45rem)] font-semibold leading-tight text-white">
            Integrated Policy Modules
          </h2>

          <div className="space-y-6">
            <article className="rounded-xl border border-cyan-200/18 bg-[#071a37]/78 p-4 md:p-5">
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <RevenueThumbnail />

                <div className="grid gap-5 md:grid-cols-[1fr_46%] md:items-center rounded-lg border border-cyan-200/12 bg-[#061935]/72 p-4 md:p-5">
                  <div>
                    <h3 className="mb-2 text-[clamp(1.6rem,2.8vw,2.6rem)] font-semibold text-cyan-200">Revenue &amp; Funding Engine</h3>
                    <p className="text-xl leading-relaxed text-slate-200/85">
                      Friction tax and supplemental income tax generate total fiscal inflow.
                    </p>
                  </div>
                  <RevenueGrowthVisual />
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-violet-200/18 bg-[#071a37]/78 p-4 md:p-5">
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <DemographicsThumbnail />
                <div className="rounded-lg border border-violet-200/12 bg-[#081739]/72 px-5 py-7 md:px-7 md:py-8">
                  <h3 className="mb-2 text-[clamp(1.6rem,2.8vw,2.6rem)] font-semibold text-violet-200">Demographics &amp; Income Floor</h3>
                  <p className="text-xl leading-relaxed text-slate-200/85">
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
