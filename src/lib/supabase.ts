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
export type CustomerType = 'individual' | 'corporate' | 'business_individual'

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
  account_number: string | null
  cif_number: string | null
  numerology_data: Record<string, unknown> | null // JSONB type
  created_at: string
  updated_at: string
  // Business registration fields
  business_registration_number: string | null
  business_registration_authority: string | null
  registration_date: string | null
  // Corporate specific fields
  company_name: string | null
  legal_representative: string | null
  legal_representative_cif_number: string | null
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

// Credit Assessment types
export type AssessmentStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface LoanInfo {
  loan_type?: {
    category?: string
    product_code?: string
    product_name?: string
  }
  purpose?: {
    main_purpose?: string
    sub_purpose?: string
    description?: string
  }
  amount?: {
    requested?: number
    approved?: number
    disbursement?: number
  }
  term?: {
    requested_months?: number
    approved_months?: number
    grace_period_months?: number
  }
  interest?: {
    base_rate?: number
    margin?: number
    final_rate?: number
    type?: string
    adjustment_period?: number
  }
  collateral?: {
    type?: string
    required?: boolean
    assets?: Array<{
      type?: string
      description?: string
      owner?: string
      value_market?: number
      value_accepted?: number
    }>
    total_value?: number
    ltv_ratio?: number
  }
  payment?: {
    method?: string
    frequency?: string
    monthly_amount?: number
    grace_enddate?: string
  }
  fees?: Array<{
    name?: string
    amount?: number
    calculation?: string
    payment_method?: string
  }>
  insurance?: {
    required?: boolean
    types?: Array<{
      name?: string
      company?: string
      amount?: number
      term_months?: number
    }>
  }
}

export interface BusinessPlan {
  pakd_doanhthu?: number
  pakd_giavon?: number
  pakd_nhancong?: number
  pakd_chiphikhac?: number
  pakd_laivay?: number
  pakd_thue?: number
  pakd_loinhuansauthue?: number
  pakd_tongchiphi?: number
  pakd_vongquay?: number
  pakd_nhucauvon?: number
  pakd_vontuco?: number
  pakd_vaytctdkhac?: number
  pakd_vaynhct?: number
}

export interface FinancialReport {
  title?: number
  tongtaisan?: number
  taisannganhang?: number
  tien?: number
  phaithu?: number
  tonkho?: number
  tscd?: number
  tongnguonvon?: number
  notranguoiban?: number
  nonhct?: number
  notctd?: number
  nodaihan?: number
  voncsh?: number
  doanhthu?: number
  giavon?: number
  chingoaigiavon?: number
  thue?: number
  laivay?: number
  loinhuan?: number
}

export interface AssessmentDetails {
  danhgiathongtintaichinh?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgiapakd?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  linhvuc_kinhnghiemsxkd?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  phuongthuchoatdongsxkd?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  cosovatchatthietbi?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  diadiemkinhdoanh?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgiaquymo?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgianangluctochuckd?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgianguonlaodong?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgianguyenlieudauvao?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  nhacungcapdauvao?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  mucdophuthuocnhacungcap?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgiathitruongtieuthu?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgialoiich?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  danhgiaruiro?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
  bienphapkiemsoatruiro?: {
    checked?: boolean
    keyword?: string
    content?: string
  }
}

export interface CreditAssessmentMetadata {
  borrower?: {
    full_name?: string
    birth_date?: string
    gender?: string
    id_number?: string
    id_issue_date?: string
    id_issue_place?: string
    phone?: string
    email?: string
    marital_status?: string
    education_level?: string
    current_address?: string
    permanent_address?: string
    residence_status?: string
    residence_time_years?: number
    occupation?: string
    workplace?: string
    position?: string
    work_experience_years?: number
    income?: {
      salary_monthly?: number
      business_monthly?: number
      other_monthly?: number
      total_monthly?: number
    }
    assets?: Array<{
      type?: string
      description?: string
      value?: number
      ownership_type?: string
      collateral_status?: boolean
      registration_number?: string
    }>
    business_info?: {
      personal_tax_number?: string
      business_registration?: {
        number?: string
        date?: string
        place?: string
        business_type?: string
        business_sector?: string
        employee_count?: number
        business_locations?: Array<{
          address?: string
          ownership?: string
          area?: number
        }>
      }
      business_experience_years?: number
      business_partners?: Array<{
        name?: string
        relationship?: string
        cooperation_time_years?: number
      }>
    }
    credit_history?: {
      credit_score?: number
      existing_loans?: Array<{
        bank?: string
        product?: string
        original_amount?: number
        current_balance?: number
        monthly_payment?: number
        start_date?: string
        end_date?: string
        collateral?: string
        status?: string
      }>
      credit_cards?: Array<{
        bank?: string
        limit?: number
        current_balance?: number
        status?: string
      }>
    }
  }
  spouse?: {
    full_name?: string
    birth_date?: string
    id_number?: string
    id_issue_date?: string
    id_issue_place?: string
    phone?: string
    current_address?: string
    permanent_address?: string
    occupation?: string
    workplace?: string
    position?: string
    income_monthly?: number
    assets?: Array<{
      type?: string
      description?: string
      value?: number
      ownership_type?: string
    }>
    personal_tax_number?: string
    business_registration?: {
      number?: string
      date?: string
      place?: string
      business_type?: string
      business_sector?: string
    }
  }
}

export interface CreditAssessment {
  assessment_id: number
  customer_id: number
  staff_id: number
  product_id: number
  status: AssessmentStatus
  department: string | null
  department_head: string | null
  fee_amount: number | null
  approval_decision: string | null
  loan_info: LoanInfo
  business_plan: BusinessPlan
  financial_reports: { [key: string]: FinancialReport }
  assessment_details: AssessmentDetails
  metadata: CreditAssessmentMetadata
  created_at: string
  updated_at: string
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
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'contract_id' | 'customer' | 'product' | 'signed_by_staff'>
        Update: Partial<Omit<Contract, 'contract_id' | 'customer' | 'product' | 'signed_by_staff'>>
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
