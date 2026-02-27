'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, requireAdmin } from '@/lib/auth/admin'
import type { PolicyConfig } from '@/lib/types'
import type { GlobalConfigRow } from '@/lib/supabase/types'

export async function getActiveConfig(): Promise<PolicyConfig> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('global_config')
    .select('config')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching active config:', error)
    // Return default config if fetch fails
    return {
      tokenTaxRate: 0.0035,
      flowBaseAnnual: 1e15,
      ubiAnnualPerAdult: 12000,
      adultPopulation: 265000000,
      welfareSavingsCredit: 630e9,
      govtOperatingRequirement: 2.74e12,
      breakoutPoint: 60000,
      tier1Rate: 0.19,
      tier1Start: 60000,
      tier2Rate: 0.29,
      tier2Start: 135000,
      supplementApexIncome: 24000,
      supplementApexBonus: 6000,
      personaWeights: [0.25, 0.25, 0.25, 0.25],
      medicareAnnualSpend: 1.05e12,
      medicaidAnnualSpend: 0.86e12,
      federalHealthcareSpendTotal: 1.91e12,
      nationalHealthcareSpendTotal: 4.90e12,
      healthcareEmployerSharePct: 30,
      healthcareHouseholdSharePct: 28,
      aiDiagnosticsSavingsPct: 0,
      adminAutomationSavingsPct: 0,
      allPayerTransparencySavingsPct: 0,
    }
  }

  return data.config
}

export async function getConfigHistory(): Promise<GlobalConfigRow[]> {
  await requireAdmin()

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('global_config')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching config history:', error)
    throw new Error('Failed to fetch configuration history')
  }

  return data || []
}

export async function updateGlobalConfig(
  newConfig: PolicyConfig,
  note: string
): Promise<void> {
  await requireAdmin()

  const supabase = createServiceClient()

  // Mark current active config as inactive
  const { error: deactivateError } = await supabase
    .from('global_config')
    .update({ is_active: false })
    .eq('is_active', true)

  if (deactivateError) {
    console.error('Error deactivating old config:', deactivateError)
    throw new Error('Failed to update configuration')
  }

  // Insert new active config
  const { error: insertError } = await supabase
    .from('global_config')
    .insert({
      is_active: true,
      config: newConfig,
      note: note || null,
      changed_by: 'admin',
    })

  if (insertError) {
    console.error('Error inserting new config:', insertError)
    throw new Error('Failed to save new configuration')
  }
}
