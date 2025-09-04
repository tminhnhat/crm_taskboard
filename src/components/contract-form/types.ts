import { Contract, Customer, Product, Staff } from '@/lib/supabase'

export interface ContractFormData {
  customer_id: string
  product_id: string
  contract_number: string
  contract_credit_limit: string
  start_date: string
  end_date: string
  status: string
  signed_by: string
  metadata: Record<string, any>
}

export interface ContractFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (contractData: Partial<Contract>) => void
  contract?: Contract | null
  isLoading?: boolean
  checkContractNumberExists: (contractNumber: string, excludeId?: number) => Promise<boolean>
  fetchCustomers: () => Promise<Customer[]>
  fetchProducts: () => Promise<Product[]>
  fetchStaff: () => Promise<Staff[]>
}

export interface ContractSectionProps {
  formData: ContractFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onDateChange?: (field: 'start_date' | 'end_date', e: React.ChangeEvent<HTMLInputElement>) => void
  validateDateFormat?: (dateString: string) => boolean
  customers?: Customer[]
  products?: Product[]
  staff?: Staff[]
  contractNumberError?: string
  onContractNumberBlur?: () => void
}