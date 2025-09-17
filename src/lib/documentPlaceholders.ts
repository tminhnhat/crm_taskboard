/**
 * Document Template Placeholders
 * 
 * This file contains a comprehensive list of all available variable placeholders
 * that can be used in DOCX and XLSX templates for document generation.
 * 
 * These placeholders are replaced with actual data when generating documents
 * through the documentService.ts
 */

// Core data structure interfaces
export interface DocumentPlaceholder {
  key: string;
  label: string;
  description: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object';
  example?: string;
  source: 'customer' | 'collateral' | 'credit_assessment' | 'system' | 'computed';
}

export interface PlaceholderCategory {
  title: string;
  description: string;
  placeholders: DocumentPlaceholder[];
}

// Customer-related placeholders
export const CUSTOMER_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Customer Information (Thông tin khách hàng)',
  description: 'Placeholders for customer personal and business information',
  placeholders: [
    {
      key: 'customer_id',
      label: 'Customer ID',
      description: 'Unique identifier for the customer',
      dataType: 'number',
      example: '12345',
      source: 'customer'
    },
    {
      key: 'customer_name',
      label: 'Customer Name',
      description: 'Full name of the customer (alias for full_name)',
      dataType: 'string',
      example: 'Nguyễn Văn An',
      source: 'customer'
    },
    {
      key: 'full_name',
      label: 'Full Name',
      description: 'Complete full name of the customer',
      dataType: 'string',
      example: 'Nguyễn Văn An',
      source: 'customer'
    },
    {
      key: 'customer_type',
      label: 'Customer Type',
      description: 'Type of customer (individual, corporate, business_individual)',
      dataType: 'string',
      example: 'individual',
      source: 'customer'
    },
    {
      key: 'date_of_birth',
      label: 'Date of Birth',
      description: 'Customer\'s date of birth',
      dataType: 'date',
      example: '01/01/1990',
      source: 'customer'
    },
    {
      key: 'gender',
      label: 'Gender',
      description: 'Customer\'s gender',
      dataType: 'string',
      example: 'Nam',
      source: 'customer'
    },
    {
      key: 'id_number',
      label: 'ID Number',
      description: 'CMND/CCCD number',
      dataType: 'string',
      example: '123456789012',
      source: 'customer'
    },
    {
      key: 'id_issue_date',
      label: 'ID Issue Date',
      description: 'Date when ID was issued',
      dataType: 'date',
      example: '01/01/2015',
      source: 'customer'
    },
    {
      key: 'id_issue_authority',
      label: 'ID Issue Authority',
      description: 'Authority that issued the ID',
      dataType: 'string',
      example: 'Cục CS QLHC về TTXH',
      source: 'customer'
    },
    {
      key: 'phone',
      label: 'Phone Number',
      description: 'Customer\'s phone number',
      dataType: 'string',
      example: '0901234567',
      source: 'customer'
    },
    {
      key: 'email',
      label: 'Email',
      description: 'Customer\'s email address',
      dataType: 'string',
      example: 'customer@example.com',
      source: 'customer'
    },
    {
      key: 'address',
      label: 'Address',
      description: 'Customer\'s current address',
      dataType: 'string',
      example: '123 Nguyễn Trãi, Quận 1, TP.HCM',
      source: 'customer'
    },
    {
      key: 'account_number',
      label: 'Account Number',
      description: 'Bank account number',
      dataType: 'string',
      example: '1234567890',
      source: 'customer'
    },
    {
      key: 'cif_number',
      label: 'CIF Number',
      description: 'Customer Information File number',
      dataType: 'string',
      example: 'CIF123456',
      source: 'customer'
    },
    {
      key: 'status',
      label: 'Customer Status',
      description: 'Current status of the customer',
      dataType: 'string',
      example: 'active',
      source: 'customer'
    },
    // Business/Corporate specific fields
    {
      key: 'company_name',
      label: 'Company Name',
      description: 'Name of the company (for corporate customers)',
      dataType: 'string',
      example: 'Công ty TNHH ABC',
      source: 'customer'
    },
    {
      key: 'business_registration_number',
      label: 'Business Registration Number',
      description: 'Business registration certificate number',
      dataType: 'string',
      example: '0123456789',
      source: 'customer'
    },
    {
      key: 'business_registration_authority',
      label: 'Business Registration Authority',
      description: 'Authority that issued business registration',
      dataType: 'string',
      example: 'Sở Kế hoạch và Đầu tư TP.HCM',
      source: 'customer'
    },
    {
      key: 'registration_date',
      label: 'Registration Date',
      description: 'Date of business registration',
      dataType: 'date',
      example: '01/01/2020',
      source: 'customer'
    },
    {
      key: 'legal_representative',
      label: 'Legal Representative',
      description: 'Name of legal representative',
      dataType: 'string',
      example: 'Nguyễn Văn A',
      source: 'customer'
    },
    {
      key: 'business_sector',
      label: 'Business Sector',
      description: 'Primary business sector/industry',
      dataType: 'string',
      example: 'Thương mại',
      source: 'customer'
    }
  ]
};

// Collateral-related placeholders
export const COLLATERAL_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Collateral Information (Thông tin tài sản thế chấp)',
  description: 'Placeholders for collateral and asset information',
  placeholders: [
    {
      key: 'collateral_id',
      label: 'Collateral ID',
      description: 'Unique identifier for the collateral',
      dataType: 'number',
      example: '67890',
      source: 'collateral'
    },
    {
      key: 'collateral_type',
      label: 'Collateral Type',
      description: 'Type of collateral asset',
      dataType: 'string',
      example: 'Bất động sản',
      source: 'collateral'
    },
    {
      key: 'collateral_value',
      label: 'Collateral Value',
      description: 'Current value of the collateral',
      dataType: 'number',
      example: '2000000000',
      source: 'collateral'
    },
    {
      key: 'collateral_value_formatted',
      label: 'Collateral Value (Formatted)',
      description: 'Formatted collateral value with currency',
      dataType: 'string',
      example: '2,000,000,000 VNĐ',
      source: 'computed'
    },
    {
      key: 'collateral_description',
      label: 'Collateral Description',
      description: 'Detailed description of the collateral',
      dataType: 'string',
      example: 'Nhà ở tại 123 Nguyễn Trãi',
      source: 'collateral'
    },
    {
      key: 'location',
      label: 'Location',
      description: 'Physical location of the collateral',
      dataType: 'string',
      example: '123 Nguyễn Trãi, Quận 1, TP.HCM',
      source: 'collateral'
    },
    {
      key: 'appraised_value',
      label: 'Appraised Value',
      description: 'Professional appraisal value',
      dataType: 'number',
      example: '1950000000',
      source: 'collateral'
    },
    {
      key: 'market_value',
      label: 'Market Value',
      description: 'Current market value',
      dataType: 'number',
      example: '2100000000',
      source: 'collateral'
    },
    {
      key: 'valuation_date',
      label: 'Valuation Date',
      description: 'Date of last valuation',
      dataType: 'date',
      example: '01/01/2024',
      source: 'collateral'
    },
    {
      key: 're_evaluation_date',
      label: 'Re-evaluation Date',
      description: 'Next scheduled re-evaluation date',
      dataType: 'date',
      example: '01/01/2025',
      source: 'collateral'
    },
    {
      key: 'legal_status',
      label: 'Legal Status',
      description: 'Legal status of the collateral',
      dataType: 'string',
      example: 'Sở hữu hoàn toàn',
      source: 'collateral'
    },
    {
      key: 'ownership_status',
      label: 'Ownership Status',
      description: 'Current ownership status',
      dataType: 'string',
      example: 'Sở hữu hoàn toàn',
      source: 'collateral'
    },
    {
      key: 'condition',
      label: 'Asset Condition',
      description: 'Physical condition of the asset',
      dataType: 'string',
      example: 'Tốt',
      source: 'collateral'
    }
  ]
};

// Credit Assessment placeholders
export const CREDIT_ASSESSMENT_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Credit Assessment Information (Thông tin thẩm định tín dụng)',
  description: 'Placeholders for credit assessment and loan information',
  placeholders: [
    {
      key: 'assessment_id',
      label: 'Assessment ID',
      description: 'Unique identifier for the credit assessment',
      dataType: 'number',
      example: '54321',
      source: 'credit_assessment'
    },
    {
      key: 'loan_amount',
      label: 'Loan Amount',
      description: 'Requested or approved loan amount',
      dataType: 'number',
      example: '500000000',
      source: 'credit_assessment'
    },
    {
      key: 'loan_amount_number',
      label: 'Loan Amount (Number)',
      description: 'Loan amount as numeric value for Excel calculations',
      dataType: 'number',
      example: '500000000',
      source: 'computed'
    },
    {
      key: 'loan_amount_formatted',
      label: 'Loan Amount (Formatted)',
      description: 'Formatted loan amount with currency',
      dataType: 'string',
      example: '500,000,000 VNĐ',
      source: 'computed'
    },
    {
      key: 'interest_rate',
      label: 'Interest Rate',
      description: 'Annual interest rate',
      dataType: 'string',
      example: '12.5%',
      source: 'credit_assessment'
    },
    {
      key: 'interest_rate_number',
      label: 'Interest Rate (Number)',
      description: 'Interest rate as numeric value',
      dataType: 'number',
      example: '12.5',
      source: 'computed'
    },
    {
      key: 'loan_term',
      label: 'Loan Term',
      description: 'Loan term in months',
      dataType: 'string',
      example: '24 tháng',
      source: 'credit_assessment'
    },
    {
      key: 'loan_term_number',
      label: 'Loan Term (Number)',
      description: 'Loan term as numeric value in months',
      dataType: 'number',
      example: '24',
      source: 'computed'
    },
    {
      key: 'loan_type',
      label: 'Loan Type',
      description: 'Type of loan product',
      dataType: 'string',
      example: 'Kinh doanh',
      source: 'credit_assessment'
    },
    {
      key: 'status',
      label: 'Assessment Status',
      description: 'Current status of the assessment',
      dataType: 'string',
      example: 'approved',
      source: 'credit_assessment'
    },
    {
      key: 'department',
      label: 'Department',
      description: 'Processing department',
      dataType: 'string',
      example: 'Phòng Tín dụng',
      source: 'credit_assessment'
    },
    {
      key: 'department_head',
      label: 'Department Head',
      description: 'Head of processing department',
      dataType: 'string',
      example: 'Nguyễn Văn B',
      source: 'credit_assessment'
    },
    {
      key: 'fee_amount',
      label: 'Assessment Fee',
      description: 'Credit assessment fee amount',
      dataType: 'number',
      example: '1000000',
      source: 'credit_assessment'
    },
    {
      key: 'approval_decision',
      label: 'Approval Decision',
      description: 'Final approval decision',
      dataType: 'string',
      example: 'Approved',
      source: 'credit_assessment'
    }
  ]
};

// System and date placeholders
export const SYSTEM_PLACEHOLDERS: PlaceholderCategory = {
  title: 'System Information (Thông tin hệ thống)',
  description: 'System-generated placeholders for dates and computed values',
  placeholders: [
    {
      key: 'current_date',
      label: 'Current Date',
      description: 'Current date in DD/MM/YYYY format',
      dataType: 'string',
      example: '15/01/2024',
      source: 'system'
    },
    {
      key: 'current_year',
      label: 'Current Year',
      description: 'Current year (4 digits)',
      dataType: 'string',
      example: '2024',
      source: 'system'
    },
    {
      key: 'current_month',
      label: 'Current Month',
      description: 'Current month (2 digits)',
      dataType: 'string',
      example: '01',
      source: 'system'
    },
    {
      key: 'current_day',
      label: 'Current Day',
      description: 'Current day (2 digits)',
      dataType: 'string',
      example: '15',
      source: 'system'
    }
  ]
};

// Real Estate specific metadata placeholders (from metadata forms)
export const REAL_ESTATE_METADATA_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Real Estate Metadata (Metadata bất động sản)',
  description: 'Detailed real estate information from metadata forms',
  placeholders: [
    // Property Certificate Information
    {
      key: 'so_gcn',
      label: 'Certificate Number',
      description: 'Property certificate number (Số giấy chứng nhận)',
      dataType: 'string',
      example: 'BH 123456',
      source: 'collateral'
    },
    {
      key: 'ngay_cap_gcn',
      label: 'Certificate Issue Date',
      description: 'Date when property certificate was issued',
      dataType: 'date',
      example: '01/01/2020',
      source: 'collateral'
    },
    {
      key: 'noi_cap_gcn',
      label: 'Certificate Issue Authority',
      description: 'Authority that issued the property certificate',
      dataType: 'string',
      example: 'Sở Tài nguyên và Môi trường TP.HCM',
      source: 'collateral'
    },
    // Land Information
    {
      key: 'so_thua',
      label: 'Plot Number',
      description: 'Land plot number (Số thửa)',
      dataType: 'string',
      example: '123',
      source: 'collateral'
    },
    {
      key: 'to_ban_do',
      label: 'Map Sheet Number',
      description: 'Map sheet number (Tờ bản đồ số)',
      dataType: 'string',
      example: '45',
      source: 'collateral'
    },
    {
      key: 'dia_chi_dat',
      label: 'Land Address',
      description: 'Address of the land plot',
      dataType: 'string',
      example: '123 Nguyễn Trãi, Phường 1, Quận 1',
      source: 'collateral'
    },
    {
      key: 'dien_tich',
      label: 'Total Area',
      description: 'Total land area in square meters',
      dataType: 'number',
      example: '120.5',
      source: 'collateral'
    },
    {
      key: 'dien_tich_bang_chu',
      label: 'Area in Words',
      description: 'Land area written in words',
      dataType: 'string',
      example: 'Một trăm hai mươi phẩy năm mét vuông',
      source: 'computed'
    },
    {
      key: 'muc_dich_su_dung_dat',
      label: 'Land Use Purpose',
      description: 'Purpose of land use',
      dataType: 'string',
      example: 'Đất ở',
      source: 'collateral'
    },
    // Building Information
    {
      key: 'dien_tich_xay_dung',
      label: 'Construction Area',
      description: 'Building construction area in square meters',
      dataType: 'number',
      example: '80.0',
      source: 'collateral'
    },
    {
      key: 'ket_cau',
      label: 'Construction Structure',
      description: 'Building structure type',
      dataType: 'string',
      example: 'Bê tông cốt thép',
      source: 'collateral'
    },
    {
      key: 'so_tang',
      label: 'Number of Floors',
      description: 'Number of building floors',
      dataType: 'number',
      example: '3',
      source: 'collateral'
    },
    {
      key: 'nam_hoan_thanh_xd',
      label: 'Construction Completion Year',
      description: 'Year when construction was completed',
      dataType: 'number',
      example: '2018',
      source: 'collateral'
    },
    // Value Information
    {
      key: 'tong_gia_tri_tsbd',
      label: 'Total Asset Value',
      description: 'Total value of the real estate asset',
      dataType: 'number',
      example: '2000000000',
      source: 'collateral'
    },
    {
      key: 'tong_gia_tri_tsbd_bang_chu',
      label: 'Total Value in Words',
      description: 'Total asset value written in words',
      dataType: 'string',
      example: 'Hai tỷ đồng',
      source: 'computed'
    },
    {
      key: 'tong_gia_tri_dat',
      label: 'Land Value',
      description: 'Total value of land only',
      dataType: 'number',
      example: '1500000000',
      source: 'collateral'
    },
    {
      key: 'tong_gia_tri_nha',
      label: 'Building Value',
      description: 'Total value of building/construction',
      dataType: 'number',
      example: '500000000',
      source: 'collateral'
    }
  ]
};

// Vehicle specific metadata placeholders
export const VEHICLE_METADATA_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Vehicle Metadata (Metadata phương tiện)',
  description: 'Detailed vehicle information from metadata forms',
  placeholders: [
    {
      key: 'vehicle_type',
      label: 'Vehicle Type',
      description: 'Type of vehicle',
      dataType: 'string',
      example: 'Ô tô',
      source: 'collateral'
    },
    {
      key: 'brand',
      label: 'Brand',
      description: 'Vehicle brand/manufacturer',
      dataType: 'string',
      example: 'Toyota',
      source: 'collateral'
    },
    {
      key: 'model',
      label: 'Model',
      description: 'Vehicle model',
      dataType: 'string',
      example: 'Vios',
      source: 'collateral'
    },
    {
      key: 'year',
      label: 'Manufacturing Year',
      description: 'Year of manufacture',
      dataType: 'number',
      example: '2020',
      source: 'collateral'
    },
    {
      key: 'license_plate',
      label: 'License Plate',
      description: 'Vehicle license plate number',
      dataType: 'string',
      example: '51A-12345',
      source: 'collateral'
    },
    {
      key: 'chassis_number',
      label: 'Chassis Number',
      description: 'Vehicle chassis number',
      dataType: 'string',
      example: 'VNKKTUD20MA123456',
      source: 'collateral'
    },
    {
      key: 'engine_number',
      label: 'Engine Number',
      description: 'Vehicle engine number',
      dataType: 'string',
      example: '2NZ1234567',
      source: 'collateral'
    }
  ]
};

// Financial asset metadata placeholders
export const FINANCIAL_METADATA_PLACEHOLDERS: PlaceholderCategory = {
  title: 'Financial Asset Metadata (Metadata tài sản tài chính)',
  description: 'Detailed financial asset information from metadata forms',
  placeholders: [
    {
      key: 'account_type',
      label: 'Account Type',
      description: 'Type of financial account',
      dataType: 'string',
      example: 'Tiết kiệm',
      source: 'collateral'
    },
    {
      key: 'bank_name',
      label: 'Bank Name',
      description: 'Name of the financial institution',
      dataType: 'string',
      example: 'Ngân hàng Vietcombank',
      source: 'collateral'
    },
    {
      key: 'account_number',
      label: 'Account Number',
      description: 'Financial account number',
      dataType: 'string',
      example: '1234567890',
      source: 'collateral'
    },
    {
      key: 'balance',
      label: 'Account Balance',
      description: 'Current account balance',
      dataType: 'number',
      example: '100000000',
      source: 'collateral'
    },
    {
      key: 'currency',
      label: 'Currency',
      description: 'Account currency',
      dataType: 'string',
      example: 'VND',
      source: 'collateral'
    },
    {
      key: 'maturity_date',
      label: 'Maturity Date',
      description: 'Account or investment maturity date',
      dataType: 'date',
      example: '01/01/2025',
      source: 'collateral'
    }
  ]
};

// All placeholder categories combined
export const ALL_PLACEHOLDER_CATEGORIES: PlaceholderCategory[] = [
  CUSTOMER_PLACEHOLDERS,
  COLLATERAL_PLACEHOLDERS,
  CREDIT_ASSESSMENT_PLACEHOLDERS,
  SYSTEM_PLACEHOLDERS,
  REAL_ESTATE_METADATA_PLACEHOLDERS,
  VEHICLE_METADATA_PLACEHOLDERS,
  FINANCIAL_METADATA_PLACEHOLDERS
];

// Flattened list of all placeholders for quick lookup
export const ALL_PLACEHOLDERS: DocumentPlaceholder[] = ALL_PLACEHOLDER_CATEGORIES.reduce(
  (acc, category) => [...acc, ...category.placeholders],
  [] as DocumentPlaceholder[]
);

// Helper function to get placeholder by key
export function getPlaceholderByKey(key: string): DocumentPlaceholder | undefined {
  return ALL_PLACEHOLDERS.find(p => p.key === key);
}

// Helper function to get placeholders by source
export function getPlaceholdersBySource(source: DocumentPlaceholder['source']): DocumentPlaceholder[] {
  return ALL_PLACEHOLDERS.filter(p => p.source === source);
}

// Helper function to generate placeholder map for templates
export function generatePlaceholderMap(): Record<string, string> {
  const map: Record<string, string> = {};
  ALL_PLACEHOLDERS.forEach(placeholder => {
    map[`{{${placeholder.key}}}`] = placeholder.label;
  });
  return map;
}

// Usage examples for template creators
export const USAGE_EXAMPLES = {
  docx: {
    customer_name: '{{customer_name}}',
    loan_amount: '{{loan_amount_formatted}}',
    current_date: '{{current_date}}',
    collateral_description: '{{collateral_description}}'
  },
  xlsx: {
    customer_name: '{{customer_name}}',
    loan_amount: '{{loan_amount_number}}', // Use _number for calculations
    current_date: '{{current_date}}',
    collateral_value: '{{collateral_value_number}}'
  }
};

export default {
  ALL_PLACEHOLDER_CATEGORIES,
  ALL_PLACEHOLDERS,
  CUSTOMER_PLACEHOLDERS,
  COLLATERAL_PLACEHOLDERS,
  CREDIT_ASSESSMENT_PLACEHOLDERS,
  SYSTEM_PLACEHOLDERS,
  REAL_ESTATE_METADATA_PLACEHOLDERS,
  VEHICLE_METADATA_PLACEHOLDERS,
  FINANCIAL_METADATA_PLACEHOLDERS,
  getPlaceholderByKey,
  getPlaceholdersBySource,
  generatePlaceholderMap,
  USAGE_EXAMPLES
};