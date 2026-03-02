import PublicSiteShell from '@/components/site/PublicSiteShell'

const assumptions = [
  { name: 'Adult Population', value: '265,000,000', note: 'Federal-scale modeled adult base' },
  { name: 'National Settlement Base', value: '1.0 quadrillion tokens', note: 'Base transaction volume assumption' },
  { name: 'BEL Adult Allocation (default)', value: '$12,000', note: 'Annual per adult baseline' },
  { name: 'BEL Breakout / SBI phase-out (default)', value: '$60,000', note: 'SBI tapers to zero by this level' },
  { name: 'Government Operations Requirement', value: '$2.74T', note: 'Non-BEL federal operations baseline' },
  { name: 'Legacy Program Consolidation Offset', value: '$630B', note: 'Modeled offset in annual revenue' },
]

export default function MethodologyPage() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Methodology</p>
        <h1 className="text-3xl font-bold text-bright mb-3">NAIERM Methodological Framework</h1>
        <p className="text-sm text-dimmed">Last updated: March 2, 2026</p>
      </section>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Model Scope</h2>
          <p className="text-sm text-dimmed leading-relaxed">
            Phase 1 models federal-level revenue, BEL/SBI obligations, retirement, and healthcare baselines.
            It is a deterministic policy simulator intended for scenario comparison, not macroeconomic forecasting.
          </p>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Financing Approach</h2>
          <p className="text-sm text-dimmed leading-relaxed">
            Primary: electronic transaction friction tax. Supplemental: simplified income tax. Advanced Mode
            allows architecture toggling (hybrid, friction-dominant, friction-only) for stress testing.
          </p>
        </article>
      </section>

      <section id="assumptions" className="mt-6 bg-dark-slate rounded-lg border border-border-slate p-5">
        <h2 className="text-sm font-semibold text-bright mb-4">Core Assumptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-slate">
                <th className="py-2 text-left text-xs uppercase tracking-wide text-muted">Variable</th>
                <th className="py-2 text-left text-xs uppercase tracking-wide text-muted">Baseline</th>
                <th className="py-2 text-left text-xs uppercase tracking-wide text-muted">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {assumptions.map((row) => (
                <tr key={row.name} className="border-b border-border-slate/70">
                  <td className="py-2 text-bright">{row.name}</td>
                  <td className="py-2 text-blue-200">{row.value}</td>
                  <td className="py-2 text-dimmed">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="modules" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Program Modules</h2>
          <ul className="space-y-2 text-sm text-dimmed">
            <li><span className="text-bright">BEL:</span> Basic Economic Liquidity floor allocated by adult + dependent structure.</li>
            <li><span className="text-bright">SBI:</span> Systemic Bonus Incentive that ramps then phases out at breakout threshold.</li>
            <li><span className="text-bright">Retirement:</span> configurable replacement architecture against SS baseline.</li>
            <li><span className="text-bright">Healthcare:</span> federal baseline with optional efficiency reform levers.</li>
          </ul>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">Limitations and Roadmap</h2>
          <ul className="space-y-2 text-sm text-dimmed">
            <li><span className="text-bright">Phase 1:</span> deterministic budgeting with federal-only scope.</li>
            <li><span className="text-bright">Phase 2:</span> richer labor supply elasticity and behavior-response modeling.</li>
            <li><span className="text-bright">Phase 3:</span> broader macro linkages and deeper healthcare structural modules.</li>
          </ul>
        </article>
      </section>
    </PublicSiteShell>
  )
}
