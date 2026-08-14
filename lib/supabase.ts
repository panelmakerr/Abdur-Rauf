import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'applicant'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'applicant'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'applicant'
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          department: string
          description: string
          status: 'draft' | 'active' | 'archived'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          department: string
          description: string
          status?: 'draft' | 'active' | 'archived'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string
          description?: string
          status?: 'draft' | 'active' | 'archived'
          created_by?: string | null
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          applicant_name: string
          applicant_email: string
          resume_storage_path: string
          status: 'received' | 'reviewing' | 'shortlisted' | 'rejected'
          applied_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_name: string
          applicant_email: string
          resume_storage_path: string
          status?: 'received' | 'reviewing' | 'shortlisted' | 'rejected'
          applied_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_name?: string
          applicant_email?: string
          resume_storage_path?: string
          status?: 'received' | 'reviewing' | 'shortlisted' | 'rejected'
          applied_at?: string
        }
      }
    }
  }
}
