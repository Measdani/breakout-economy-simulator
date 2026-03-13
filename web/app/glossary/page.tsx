import PublicSiteShell from '@/components/site/PublicSiteShell'

const terms = [
  {
    term: 'NAiERM',
    definition: 'National AI Economy Resiliency Model; a federal policy scenario simulator.',
  },
  {
    term: 'BEL',
    definition: 'Basic Economic Liquidity; the guaranteed baseline economic floor in the model.',
  },
  {
    term: 'SBI',
    definition: 'Systemic Bonus Incentive; earnings-linked incentive layer that tapers with income.',
  },
]

export default function GlossaryPage() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Glossary</p>
        <h1 className="text-3xl font-bold text-bright mb-3">Terminology Lock</h1>
        <p className="text-sm text-dimmed">
          Core terms used throughout the NAiERM website and simulator.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        {terms.map((item) => (
          <article key={item.term} className="bg-dark-slate rounded-lg border border-border-slate p-5">
            <h2 className="text-sm font-semibold text-bright mb-1">{item.term}</h2>
            <p className="text-sm text-dimmed">{item.definition}</p>
          </article>
        ))}
      </section>
    </PublicSiteShell>
  )
}

