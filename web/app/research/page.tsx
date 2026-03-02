import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function ResearchPage() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Research and Dataset</p>
        <h1 className="text-3xl font-bold text-bright mb-3">Dataset and Ethics</h1>
        <p className="text-sm text-dimmed">
          NAIERM submissions are stored in Supabase and exported as transparent, structured research records.
        </p>
      </section>

      <section id="data-policy" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">What We Store</h2>
          <ul className="space-y-2 text-sm text-dimmed">
            <li>Complete policy configuration inputs selected in the simulator.</li>
            <li>Computed outputs (revenue, obligations, balance, module-level metrics).</li>
            <li>Optional qualitative feedback submitted with policy scenario.</li>
          </ul>
        </article>
        <article className="bg-dark-slate rounded-lg border border-border-slate p-5">
          <h2 className="text-sm font-semibold text-bright mb-2">What We Do Not Require</h2>
          <ul className="space-y-2 text-sm text-dimmed">
            <li>No mandatory personally identifying information is required to submit scenarios.</li>
            <li>No hidden behavioral tracking for policy records.</li>
            <li>No opaque aggregation: export schema reflects the submission payload directly.</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 bg-dark-slate rounded-lg border border-border-slate p-5">
        <h2 className="text-sm font-semibold text-bright mb-3">Use of Submissions</h2>
        <p className="text-sm text-dimmed leading-relaxed mb-3">
          Submitted scenarios are used to build a comparative policy research dataset, support aggregated analytics,
          and publish transparent model behavior under varied assumptions.
        </p>
        <p className="text-sm text-dimmed leading-relaxed">
          Admin exports are available as CSV with flattened payload fields for independent verification and auditing.
        </p>
      </section>
    </PublicSiteShell>
  )
}

