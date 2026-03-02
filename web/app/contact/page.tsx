import PublicSiteShell from '@/components/site/PublicSiteShell'

export default function ContactPage() {
  return (
    <PublicSiteShell>
      <section className="bg-dark-slate rounded-xl border border-border-slate p-8">
        <p className="text-xs uppercase tracking-widest text-blue-200 mb-2">Contact</p>
        <h1 className="text-3xl font-bold text-bright mb-3">Inquiries and Partnerships</h1>
        <p className="text-sm text-dimmed">
          For policy collaborations, institutional demos, and research partnerships, reach out directly.
        </p>
      </section>

      <section className="mt-6 bg-dark-slate rounded-lg border border-border-slate p-5">
        <p className="text-sm text-dimmed mb-2">Primary contact</p>
        <a
          href="mailto:research@breakouteconomy.org"
          className="text-blue-200 text-sm hover:text-bright transition"
        >
          research@breakouteconomy.org
        </a>
      </section>
    </PublicSiteShell>
  )
}

