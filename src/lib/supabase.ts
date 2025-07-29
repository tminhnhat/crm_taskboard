import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Create Supabase client with schema configuration
// This configures the client to use the 'dulieu_congviec' schema by default
// so all table references like .from('tasks') will automatically point to dulieu_congviec.tasks
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'dulieu_congviec'
  }
})

// TypeScript types for our database schema based on your SQL
export type TaskStatusEnum = 'needsAction' | 'inProgress' | 'onHold' | 'completed' | 'cancelled' | 'deleted'

export type TaskPriority = 'Do first' | 'Schedule' | 'Delegate' | 'Eliminate'

export interface Task {
  task_id: number
  task_name: string
  task_type: string | null
  task_priority: TaskPriority | null
  task_time_process: string | null // INTERVAL type
  task_date_start: string | null // DATE
  task_start_time: string | null // TIME
  task_category: string | null
  task_note: string | null
  task_due_date: string | null // DATE
  task_time_finish: string | null // TIME
  task_date_finish: string | null // DATE
  task_status: TaskStatusEnum
  calendar_event_id: string | null
  sync_status: string
  created_at: string
  updated_at: string
  timezone_offset: number
  timezone: string
  google_task_id: string | null
}

// Customer types
export type CustomerType = 'individual' | 'corporate'

export interface Customer {
  customer_id: number
  customer_type: CustomerType
  full_name: string
  date_of_birth: string | null
  gender: string | null
  id_number: string | null
  id_issue_date: string | null
  id_issue_authority: string | null
  phone: string | null
  email: string | null
  address: string | null
  hobby: string | null
  status: string
  account_number: string
  cif_number: string | null
  numerology_data: Record<string, unknown> | null // JSONB type
  created_at: string
  updated_at: string
  // Corporate specific fields
  company_name: string | null
  business_registration_number: string | null
  tax_number: string | null
  registration_date: string | null
  legal_representative: string | null
  business_sector: string | null
  company_size: 'micro' | 'small' | 'medium' | 'large' | null
  annual_revenue: string | null
}

// Product types
export interface Product {
  product_id: number
  product_name: string
  product_type: string | null
  description: string | null
  status: string
  interest_rate: number | null // Interest rate for loans/deposits
  minimum_amount: number | null // Minimum amount required
  maximum_amount: number | null // Maximum amount allowed
  currency: string | null // Currency code (VND, USD, etc.)
  terms_months: number | null // Terms in months
  fees: number | null // Associated fees
  requirements: string | null // Eligibility requirements
  benefits: string | null // Product benefits
  metadata: Record<string, unknown> | null // JSONB type
}

// Staff types
export interface Staff {
  staff_id: number
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  department: string | null
  status: string
}

// Interaction types
export interface Interaction {
  interaction_id: number
  customer_id: number
  staff_id: number
  interaction_type: string | null
  interaction_date: string
  notes: string | null
  // Extended fields for joins
  customer?: Customer
  staff?: Staff
}

// Opportunity types
export interface Opportunity {
  opportunity_id: number
  customer_id: number
  product_id: number
  staff_id: number
  status: string // 'new', 'in_progress', 'won', 'lost'
  expected_value: number | null
  created_at: string
  closed_at: string | null
  // Extended fields for joins
  customer?: Customer
  product?: Product
  staff?: Staff
}

// Contract types
export interface Contract {
  contract_id: number
  customer_id: number
  product_id: number
  contract_number: string
  contract_credit_limit: number
  start_date: string | null
  end_date: string | null
  status: string
  signed_by: number
  metadata: Record<string, unknown> | null // JSONB type
  // Extended fields for joins
  customer?: Customer
  product?: Product
  signed_by_staff?: Staff
}

// Credit Assessment types
export interface CreditAssessment {
  assessment_id: number
  customer_id: number
  staff_id: number
  assessment_date: string // DATE
  assessment_result: string | null
  comments: string | null
  documents: string | null // link or file name
  metadata: Record<string, unknown> | null // JSONB type
  created_at: string
  // Extended fields for joins
  customer?: Customer
  staff?: Staff
}

// Collateral types
export interface Collateral {
  collateral_id: number
  customer_id: number
  collateral_type: string | null // e.g., real estate, car, savings book, etc.
  description: string | null
  value: number | null // NUMERIC(18,0)
  valuation_date: string | null // DATE
  legal_status: string | null // legal status
  location: string | null
  owner_info: string | null
  status: string | null // e.g., frozen, released, etc.
  metadata: Record<string, unknown> | null // JSONB type
  created_at: string
  // Extended fields for joins
  customer?: Customer
}

export interface Database {
  dulieu_congviec: {
    Tables: {
      tasks: {
        Row: Task
        Insert: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'task_id' | 'created_at' | 'updated_at'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'product_id'>
        Update: Partial<Omit<Product, 'product_id'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'staff_id'>
        Update: Partial<Omit<Staff, 'staff_id'>>
      }
      interactions: {
        Row: Interaction
        Insert: Omit<Interaction, 'interaction_id' | 'interaction_date' | 'customer' | 'staff'>
        Update: Partial<Omit<Interaction, 'interaction_id' | 'interaction_date' | 'customer' | 'staff'>>
      }
      opportunities: {
        Row: Opportunity
        Insert: Omit<Opportunity, 'opportunity_id' | 'created_at' | 'customer' | 'product' | 'staff'>
        Update: Partial<Omit<Opportunity, 'opportunity_id' | 'created_at' | 'customer' | 'product' | 'staff'>>
      }
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'contract_id' | 'customer' | 'product' | 'signed_by_staff'>
        Update: Partial<Omit<Contract, 'contract_id' | 'customer' | 'product' | 'signed_by_staff'>>
      }
      credit_assessments: {
        Row: CreditAssessment
        Insert: Omit<CreditAssessment, 'assessment_id' | 'created_at' | 'customer' | 'staff'>
        Update: Partial<Omit<CreditAssessment, 'assessment_id' | 'created_at' | 'customer' | 'staff'>>
      }
      collaterals: {
        Row: Collateral
        Insert: Omit<Collateral, 'collateral_id' | 'created_at' | 'customer'>
        Update: Partial<Omit<Collateral, 'collateral_id' | 'created_at' | 'customer'>>
      }
    }
    Enums: {
      task_status_enum: TaskStatusEnum
    }
  }
}
