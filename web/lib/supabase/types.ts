import type { PolicyConfig, SimulationResult } from '../types'

export interface SubmissionRow {
  id: string
  created_at: string
  name: string | null
  email: string | null
  config: PolicyConfig
  result: SimulationResult
  surplus_deficit: number
  ubi_annual: number
  token_tax_rate: number
  breakout_point: number
  is_solvent: boolean
}

export type Database = {
  public: {
    Tables: {
      submissions: {
        Row: SubmissionRow
        Insert: Omit<SubmissionRow, 'id' | 'created_at'>
        Update: Partial<Omit<SubmissionRow, 'id' | 'created_at'>>
      }
    }
  }
}
