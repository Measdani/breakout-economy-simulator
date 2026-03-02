import PublicSiteShell from '@/components/site/PublicSiteShell'
import Image from 'next/image'

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

function ArchitectureVisual() {
  return (
    <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#041226]">
      <Image
        src="/home/firstbackground.png"
        alt="Revenue growth city visual"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 44vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#03102a]/55 via-transparent to-[#020919]/20" />
    </div>
  )
}

export default function Home() {
  return (
    <PublicSiteShell contentClassName="mx-auto max-w-[1120px] px-3 py-8 md:px-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/15 bg-[radial-gradient(circle_at_18%_0%,rgba(14,116,255,0.24),transparent_40%),radial-gradient(circle_at_86%_26%,rgba(34,211,238,0.16),transparent_45%),linear-gradient(180deg,#030c20_0%,#040f27_55%,#030a1b_100%)] shadow-[0_30px_66px_rgba(2,8,24,0.72)]">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:76px_76px]" />

        <section id="architecture" className="px-6 py-12 md:px-10 md:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.04fr_1fr]">
            <div>
              <p className="mb-4 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">Model Architecture Overview</p>
              <h1 className="mb-8 text-[clamp(2.1rem,3.6vw,3.3rem)] font-semibold leading-[1.1] text-white">
                Revenue to Obligations Sequencing Framework
              </h1>

              <div className="space-y-7">
                {stageItems.map((item) => (
                  <div key={item.title}>
                    <h2 className="mb-2 text-[clamp(1.65rem,2.65vw,2.2rem)] font-semibold leading-[1.15] text-white">{item.title}</h2>
                    <p className="border-l border-cyan-100/20 pl-3 text-lg leading-relaxed text-slate-200/85">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <ArchitectureVisual />
          </div>
        </section>

        <div className="h-px bg-sky-200/15" />

        <section id="how-it-works" className="px-6 py-12 md:px-10 md:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.04fr_1fr]">
            <div>
              <p className="mb-4 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">How NAIERM Works</p>
              <h2 className="mb-6 text-[clamp(2.1rem,4vw,3.45rem)] font-semibold leading-[1.14] text-white">
                NAIERM models how federal revenue architecture, income floor policy (BEL), retirement systems and healthcare obligations interact within a unified fiscal framework.
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-200/85">
                Users configure revenue architecture and program parameters, then observe allocation order, fiscal balance, and sustainability indicators in real time.
              </p>
              <p className="text-lg leading-relaxed text-slate-200/85">
                The interface is designed for transparent scenario testing, with output structured for comparative review and export.
              </p>
            </div>

            <div className="relative min-h-[360px] rounded-2xl border border-cyan-200/20 bg-[radial-gradient(circle_at_70%_26%,rgba(34,211,238,0.28),transparent_46%),linear-gradient(155deg,#081f43_0%,#061734_58%,#040f29_100%)] overflow-hidden">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:58px_58px]" />
              <div className="absolute left-6 right-6 bottom-8 h-[2px] bg-cyan-200/65 shadow-[0_0_14px_rgba(34,211,238,0.42)]" />
              <div className="absolute left-10 bottom-14 h-36 w-44 rounded-md border border-cyan-200/35 bg-cyan-100/10" />
              <div className="absolute left-[5.5rem] bottom-[4.5rem] h-44 w-52 rounded-md border border-cyan-200/35 bg-cyan-100/12" />
              <div className="absolute left-[9.2rem] bottom-[5.4rem] h-52 w-60 rounded-md border border-cyan-200/40 bg-cyan-100/16" />
              <div className="absolute right-8 top-12 h-16 w-28 rounded border border-cyan-200/35 bg-cyan-100/10" />
              <div className="absolute right-14 top-36 h-14 w-24 rounded border border-cyan-200/35 bg-cyan-100/10" />
            </div>
          </div>
        </section>

        <div className="h-px bg-sky-200/15" />

        <section id="core-engines" className="px-6 py-12 md:px-10 md:py-16">
          <p className="mb-3 text-[13px] uppercase tracking-[0.18em] text-slate-300/90">Core Engines</p>
          <h2 className="mb-8 text-[clamp(2rem,3.3vw,3.1rem)] font-semibold leading-tight text-white">
            Integrated Policy Modules
          </h2>

          <div className="space-y-6">
            <article className="rounded-xl border border-cyan-200/18 bg-[#071a37]/78 p-4 md:p-5">
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="relative min-h-[144px] overflow-hidden rounded-lg border border-cyan-200/22 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.3),transparent_45%),linear-gradient(150deg,#0b2548_0%,#091f3d_55%,#07172f_100%)]">
                  <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)] [background-size:46px_46px]" />
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_46%] md:items-center rounded-lg border border-cyan-200/12 bg-[#061935]/72 p-4 md:p-5">
                  <div>
                    <h3 className="mb-2 text-[clamp(1.5rem,2.6vw,2.3rem)] font-semibold text-cyan-200">Revenue &amp; Funding Engine</h3>
                    <p className="text-lg leading-relaxed text-slate-200/85">
                      Friction tax and supplemental income tax generate total fiscal inflow.
                    </p>
                  </div>
                  <div className="relative min-h-[180px] overflow-hidden rounded-xl border border-cyan-200/20 bg-[radial-gradient(circle_at_72%_28%,rgba(34,211,238,0.3),transparent_48%),linear-gradient(155deg,#0b2448_0%,#091f3f_58%,#081734_100%)]">
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.09)_1px,transparent_1px)] [background-size:42px_42px]" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true">
                      <polyline points="20,138 70,130 118,116 168,98 220,84 272,66 332,46" fill="none" stroke="rgba(34,211,238,0.72)" strokeWidth="3" />
                      <polyline points="20,140 70,132 118,118 168,100 220,86 272,68 332,48" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="8" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-violet-200/18 bg-[#071a37]/78 p-4 md:p-5">
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <div className="relative min-h-[144px] overflow-hidden rounded-lg border border-violet-200/22 bg-[radial-gradient(circle_at_34%_44%,rgba(196,181,253,0.3),transparent_45%),linear-gradient(150deg,#232350_0%,#1a2850_55%,#162142_100%)]">
                  <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(196,181,253,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(196,181,253,0.09)_1px,transparent_1px)] [background-size:42px_42px]" />
                </div>
                <div className="rounded-lg border border-violet-200/12 bg-[#081739]/72 px-5 py-7 md:px-7 md:py-8">
                  <h3 className="mb-2 text-[clamp(1.5rem,2.6vw,2.3rem)] font-semibold text-violet-200">Demographics &amp; Income Floor</h3>
                  <p className="text-lg leading-relaxed text-slate-200/85">
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
