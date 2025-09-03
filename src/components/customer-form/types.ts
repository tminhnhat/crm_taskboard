import { Customer, CustomerType } from '@/lib/supabase';

export interface CustomerFormData {
  // Core Customer fields
  customer_id?: number;
  customer_type?: CustomerType;
  full_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  id_number?: string | null;
  id_issue_date?: string | null;
  id_issue_authority?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  hobby?: string | null;
  status?: string;
  account_number?: string | null;
  cif_number?: string | null;
  numerology_data?: Record<string, unknown> | null;
  relationship?: string | null;
  
  // Business registration fields
  business_registration_number?: string | null;
  business_registration_authority?: string | null;
  registration_date?: string | null;
  
  // Corporate specific fields
  company_name?: string | null;
  legal_representative?: string | null;
  legal_representative_cif_number?: string | null;
  business_sector?: string | null;
  company_size?: 'micro' | 'small' | 'medium' | 'large' | null;
  annual_revenue?: string | null;
  
  // Additional form-specific fields
  relationship_other?: string;
  spouse_id?: number;
  spouse_info?: any;
  
  // Timestamps (for editing existing customers)
  created_at?: string;
  updated_at?: string;
}

export interface CustomerFormSectionProps {
  formData: CustomerFormData;
  onChange: (data: Partial<CustomerFormData>) => void;
  customers?: Customer[];
}

export interface NumerologyPreview {
  walksOfLife: string;
  mission: string;
  soul: string;
  birthDate: string;
}

export interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Partial<Customer>) => void;
  customer?: Customer | null;
}