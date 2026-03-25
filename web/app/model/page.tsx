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
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-bright mb-2">
            The National AI Economy Resiliency Model
          </h1>
          <p className="text-sm text-dimmed">
            Policy simulator exploring the balance between AI productivity, consumer demand, and federal fiscal stability.
          </p>
        </div>
      </div>
      <Simulator initialConfig={initialConfig} />
    </PublicSiteShell>
  )
}
