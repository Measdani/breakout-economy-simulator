import type { PolicyConfig, SimulationResult } from '../types'
import type { SubmissionPayload } from '../submissionPayload'

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
  config_name: string | null
  user_feedback_text?: string | null
  submission_payload_json?: SubmissionPayload | null
}

export interface FeedbackRow {
  id: string
  created_at: string
  name: string | null
  email: string | null
  category: string
  message: string
  config_snapshot: PolicyConfig | null
  surplus_deficit: number | null
  config_name: string | null
}

export interface GlobalConfigRow {
  id: string
  created_at: string
  is_active: boolean
  config: PolicyConfig
  note: string | null
  changed_by: string
}

export interface SubmissionContactRow {
  submission_id: string
  email: string
  created_at: string
}

export interface FeedbackContactRow {
  feedback_id: string
  email: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      submissions: {
        Row: SubmissionRow
        Insert: Omit<SubmissionRow, 'id' | 'created_at'>
        Update: Partial<Omit<SubmissionRow, 'id' | 'created_at'>>
      }
      feedback: {
        Row: FeedbackRow
        Insert: Omit<FeedbackRow, 'id' | 'created_at'>
        Update: Partial<Omit<FeedbackRow, 'id' | 'created_at'>>
      }
      submission_contacts: {
        Row: SubmissionContactRow
        Insert: Omit<SubmissionContactRow, 'created_at'>
        Update: Partial<Omit<SubmissionContactRow, 'created_at'>>
      }
      feedback_contacts: {
        Row: FeedbackContactRow
        Insert: Omit<FeedbackContactRow, 'created_at'>
        Update: Partial<Omit<FeedbackContactRow, 'created_at'>>
      }
      global_config: {
        Row: GlobalConfigRow
        Insert: Omit<GlobalConfigRow, 'id' | 'created_at'>
        Update: Partial<Omit<GlobalConfigRow, 'id' | 'created_at'>>
      }
    }
  }
}
