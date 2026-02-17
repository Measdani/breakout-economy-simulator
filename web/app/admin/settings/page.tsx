import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { getActiveConfig, getConfigHistory } from '@/app/actions/config'
import AdminSettingsForm from '@/components/AdminSettingsForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  // Check admin auth
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  // Fetch active config and history
  const activeConfig = await getActiveConfig()
  const history = await getConfigHistory()

  return (
    <div className="min-h-screen bg-deep-navy px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 text-sm inline-block mb-4">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-bright mb-2">⚙️ Global Configuration</h1>
          <p className="text-muted text-sm">Manage simulator defaults that apply to all future simulations</p>
        </div>

        {/* Settings Form */}
        <div className="bg-dark-slate rounded-lg border border-border-slate p-6">
          <AdminSettingsForm currentConfig={activeConfig} history={history} />
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-darker-navy border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-bright font-semibold mb-3">ℹ️ How It Works</h3>
          <ul className="text-muted text-sm space-y-2">
            <li>• Changes apply to all <strong>future submissions</strong> — past submissions retain their original configuration</li>
            <li>• Each change is saved to the configuration history with a timestamp and optional note</li>
            <li>• Use the <strong>Preview</strong> button to see how changes affect the simulation before saving</li>
            <li>• View the <strong>History</strong> tab to see all previous configurations and revert if needed</li>
            <li>• Only admins can modify the global configuration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
