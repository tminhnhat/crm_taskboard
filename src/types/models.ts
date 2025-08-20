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
  customer_id: string;
  loan_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  purpose: string;
  term: number;
  interest_rate: number;
}

export interface Collateral extends BaseModel {
  customer_id: string;
  type: string;
  description: string;
  value: number;
  location: string;
  status: string;
}
