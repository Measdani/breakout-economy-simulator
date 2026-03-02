import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function AboutPage() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">About</p>
        <h1 className="text-3xl font-bold text-bright mb-3">Mission and Credibility</h1>
        <p className="text-sm text-dimmed leading-relaxed">
          NAIERM exists to provide transparent, policy-grade scenario modeling for AI-era public finance and social
          program design. The model emphasizes explicit assumptions, reproducible outputs, and exportable datasets.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Institutional Focus</h2>
          <p className="text-sm text-dimmed">
            Designed for analysts, policy teams, and public-sector stakeholders evaluating fiscal resilience scenarios.
          </p>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Built By</h2>
          <p className="text-sm text-dimmed">
            Built by the Breakout Economy project with a commitment to open assumptions and iterative model refinement.
          </p>
        </article>
      </section>
    </PublicSiteShell>
  )
}

