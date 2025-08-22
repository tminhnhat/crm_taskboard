export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Customer extends BaseModel {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreditAssessment extends BaseModel {
  assessment_id: number;
  customer_id: number;
  staff_id: number;
  product_id: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  department?: string;
  department_head?: string;
  fee_amount?: number;
  approval_decision?: string;
  loan_info: {
    loan_type?: {
      category?: string;
      product_code?: string;
      product_name?: string;
    };
    purpose?: {
      main_purpose?: string;
      sub_purpose?: string;
      description?: string;
    };
    amount?: {
      requested?: number;
      approved?: number;
      disbursement?: number;
    };
    term?: {
      requested_months?: number;
      approved_months?: number;
      grace_period_months?: number;
    };
    interest?: {
      base_rate?: number;
      margin?: number;
      final_rate?: number;
      type?: string;
      adjustment_period?: number;
    };
    payment?: {
      method?: string;
      frequency?: string;
      monthly_amount?: number;
      grace_enddate?: string;
    };
  };
  business_plan?: any;
  customer_analysis?: any;
  financial_info?: any;
  risk_assessment?: any;
  decision_info?: any;
}

export interface Collateral extends BaseModel {
  customer_id: string;
  type: string;
  description: string;
  value: number;
  location: string;
  status: string;
}
