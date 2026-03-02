import Simulator from '@/components/Simulator'
import PublicSiteShell from '@/components/site/PublicSiteShell'
import { getActiveConfig } from '@/app/actions/config'

export const dynamic = 'force-dynamic'

export default async function ModelPage() {
  let initialConfig = undefined

  try {
    initialConfig = await getActiveConfig()
  } catch (err) {
    console.error('Failed to fetch global config:', err)
  }

  return (
    <PublicSiteShell contentClassName="max-w-none px-4 py-6">
      <div className="max-w-6xl mx-auto mb-4 bg-dark-slate rounded-lg border border-border-slate p-4">
        <p className="text-xs uppercase tracking-wide text-muted mb-1">Model Workspace</p>
        <h1 className="text-xl font-semibold text-bright mb-1">NAIERM Simulator</h1>
        <p className="text-sm text-dimmed">
          Embedded policy modeling environment with Supabase-backed submissions and admin exports.
        </p>
      </div>
      <Simulator initialConfig={initialConfig} />
    </PublicSiteShell>
  )
}

