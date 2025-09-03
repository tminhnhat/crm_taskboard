import { Collateral, Customer } from '@/lib/supabase'

export interface CollateralFormData {
  collateral_type: string
  value: string
  customer_id: string
  valuation_date: string
  status: string
  location: string
  description: string
  owner_info: string
  metadata: Record<string, Record<string, unknown>>
}

export interface CollateralFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (collateralData: Partial<Collateral>) => void
  collateral?: Collateral | null
  isLoading?: boolean
  fetchCustomers: () => Promise<Customer[]>
}

export interface CollateralSectionProps {
  formData: CollateralFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onFormDataChange?: (field: string, value: string) => void
  customers?: Customer[]
  validateDateFormat?: (dateString: string) => boolean
}

export interface CollateralOwnerInfo {
  primary_owner_id: string
  primary_owner_name: string
  spouse_id: string
  spouse_name: string
  id_number: string
  id_issue_date: string
  id_issue_authority: string
  address: string
  phone: string
  spouse_id_number: string
  spouse_id_issue_date: string
  spouse_id_issue_authority: string
  spouse_address: string
  spouse_phone: string
  notes: string
}