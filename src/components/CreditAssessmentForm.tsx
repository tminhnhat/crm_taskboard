'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Close,
  AccountBalance,
  Description,
  Assessment as AssessmentIcon,
  CheckCircle,
  People,
  ExpandMore,
  AttachMoney,
} from '@mui/icons-material'
import { toVNDate } from '@/lib/date'

// Helper function to flatten nested metadata structure
// Helper function to extract metadata from collateral using the same logic as CollateralCard
const extractCollateralMetadata = (collateral: any): Record<string, any> => {
  if (!collateral) return {}
  
  console.log('Extracting metadata from collateral:', collateral)
  
  // Use the metadata from the collaterals table if available
  if (collateral.metadata && typeof collateral.metadata === 'object') {
    const flattened: Record<string, any> = {}
    
    // Flatten the nested metadata structure like in CollateralCard
    Object.entries(collateral.metadata as Record<string, Record<string, unknown>>).forEach(([categoryKey, categoryData]) => {
      if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData)) {
        // This is a nested category object, flatten its contents
        Object.entries(categoryData as Record<string, unknown>).forEach(([fieldKey, fieldValue]) => {
          flattened[fieldKey] = fieldValue
        })
      } else {
        // This is a direct property at the root level
        flattened[categoryKey] = categoryData
      }
    })
    
    console.log('Flattened metadata:', flattened)
    return flattened
  }
  
  // Fallback to direct field mapping if no metadata
  const fallbackData = {
    collateral_id: collateral.collateral_id || '',
    collateral_type: collateral.collateral_type || '',
    appraisal_date: collateral.valuation_date || '',
    appraised_value: collateral.value || '',
    ownership_status: collateral.legal_status || '',
    location: collateral.location || '',
    notes: collateral.description || '',
    contact_person: collateral.owner_info || ''
  }
  
  console.log('Using fallback data:', fallbackData)
  return fallbackData
}

// --- Types ---
interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section' | 'boolean'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: any
  fields: MetadataField[]
}

interface MetadataTemplates {
  [key: string]: TemplateConfig
}

interface CreditAssessmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  assessment?: any
  isLoading?: boolean
  customers: any[]
  staff: any[]
  products: any[]
  collaterals?: any[]
}

// --- Templates ---
const SPOUSE_TEMPLATE: TemplateConfig = {
  title: 'Thông tin vợ/chồng',
  icon: People,
  fields: [
    { key: 'full_name', label: 'Họ và tên', type: 'text' },
    { key: 'date_of_birth', label: 'Ngày sinh', type: 'date' },
    { key: 'gender', label: 'Giới tính', type: 'select', options: ['Nam', 'Nữ', 'Khác'] },
    { key: 'id_number', label: 'Số CMND/CCCD', type: 'text' },
    { key: 'id_issue_date', label: 'Ngày cấp', type: 'date' },
    { key: 'id_issue_authority', label: 'Nơi cấp', type: 'text' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel' },
    { key: 'address', label: 'Địa chỉ', type: 'text' },
    { key: 'account_number', label: 'Số tài khoản', type: 'text' },
    { key: 'cif_number', label: 'Số CIF', type: 'text' },
  ]
}

// Base collateral fields that are common to all types
const BASE_COLLATERAL_FIELDS: MetadataField[] = [
  { key: 'collateral_id', label: 'ID tài sản thế chấp', type: 'text', readOnly: true },
  { key: 'collateral_type', label: 'Loại tài sản thế chấp', type: 'text', readOnly: true },
  { key: 'collateral_value', label: 'Giá trị tài sản (VNĐ)', type: 'number' },
  { key: 'collateral_description', label: 'Mô tả tài sản', type: 'textarea' },
  { key: 'location', label: 'Vị trí tài sản', type: 'text' },
]

// Real estate specific fields
const REAL_ESTATE_FIELDS: MetadataField[] = [
  { key: 'so_gcn', label: 'Số giấy chứng nhận', type: 'text' },
  { key: 'ngay_cap_gcn', label: 'Ngày cấp GCN', type: 'date' },
  { key: 'noi_cap_gcn', label: 'Nơi cấp GCN', type: 'text' },
  { key: 'so_thua', label: 'Số thửa', type: 'text' },
  { key: 'to_ban_do', label: 'Tờ bản đồ số', type: 'text' },
  { key: 'dien_tich', label: 'Diện tích (m²)', type: 'number' },
  { key: 'muc_dich_su_dung_dat', label: 'Mục đích sử dụng đất', type: 'text' },
  { key: 'dien_tich_xay_dung', label: 'Diện tích xây dựng (m²)', type: 'number' },
  { key: 'ket_cau', label: 'Kết cấu', type: 'text' },
  { key: 'so_tang', label: 'Số tầng', type: 'number' },
  { key: 'nam_hoan_thanh_xd', label: 'Năm hoàn thành', type: 'number' }
]

// Vehicle specific fields
const VEHICLE_FIELDS: MetadataField[] = [
  { key: 'vehicle_type', label: 'Loại phương tiện', type: 'select', options: ['Ô tô', 'Xe máy', 'Xe tải', 'Xe khách', 'Khác'] },
  { key: 'brand', label: 'Thương hiệu', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'year', label: 'Năm sản xuất', type: 'number' },
  { key: 'license_plate', label: 'Biển số', type: 'text' },
  { key: 'chassis_number', label: 'Số khung', type: 'text' },
  { key: 'engine_number', label: 'Số máy', type: 'text' }
]

// Financial asset specific fields
const FINANCIAL_FIELDS: MetadataField[] = [
  { key: 'account_type', label: 'Loại tài khoản', type: 'select', options: ['Tiết kiệm', 'Vãng lai', 'Đầu tư', 'Khác'] },
  { key: 'bank_name', label: 'Tên ngân hàng/Tổ chức tài chính', type: 'text' },
  { key: 'account_number', label: 'Số tài khoản', type: 'text' },
  { key: 'balance', label: 'Số dư', type: 'number' },
  { key: 'currency', label: 'Loại tiền', type: 'select', options: ['VND', 'USD', 'EUR', 'JPY'] },
  { key: 'maturity_date', label: 'Ngày đáo hạn', type: 'date' }
]

// Common legal and assessment fields
const LEGAL_ASSESSMENT_FIELDS: MetadataField[] = [
  { key: 'ownership_status', label: 'Tình trạng sở hữu', type: 'select', options: ['Sở hữu hoàn toàn', 'Sở hữu chung', 'Đang thế chấp', 'Đang tranh chấp', 'Khác'] },
  { key: 'legal_restrictions', label: 'Hạn chế pháp lý', type: 'textarea' },
  { key: 'appraised_value', label: 'Giá trị định giá', type: 'number' },
  { key: 'market_value', label: 'Giá trị thị trường', type: 'number' },
  { key: 'condition', label: 'Tình trạng tài sản', type: 'text' }
]

// Function to get collateral template based on type
const getCollateralTemplate = (collateralType: string): TemplateConfig => {
  let specificFields: MetadataField[] = []
  
  const normalizedType = collateralType?.toLowerCase() || ''
  
  if (normalizedType.includes('bất động sản') || normalizedType.includes('real_estate') || normalizedType.includes('nhà') || normalizedType.includes('đất')) {
    specificFields = REAL_ESTATE_FIELDS
  } else if (normalizedType.includes('phương tiện') || normalizedType.includes('vehicle') || normalizedType.includes('xe') || normalizedType.includes('ô tô')) {
    specificFields = VEHICLE_FIELDS
  } else if (normalizedType.includes('tài chính') || normalizedType.includes('financial') || normalizedType.includes('tiết kiệm') || normalizedType.includes('savings')) {
    specificFields = FINANCIAL_FIELDS
  }
  
  return {
    title: 'Thông tin tài sản bảo đảm',
    icon: Description,
    fields: [...BASE_COLLATERAL_FIELDS, ...specificFields, ...LEGAL_ASSESSMENT_FIELDS]
  }
}

const COLLATERAL_TEMPLATE: TemplateConfig = {
  title: 'Thông tin tài sản bảo đảm',
  icon: Description,
  fields: BASE_COLLATERAL_FIELDS
}

const TEMPLATES_KINH_DOANH: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Kinh doanh)',
    icon: AccountBalance,
    fields: [
      { key: 'purpose.main_purpose', label: 'Mục đích vay', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền vay', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn vay (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' },
      { key: 'guarantee_type', label: 'Loại bảo đảm', type: 'select', options: ['Không bảo đảm', 'Bảo đảm một phần tài sản', 'Bảo đảm đầy đủ tài sản'] }
    ]
  },
  collateral_info: COLLATERAL_TEMPLATE,
  business_plan: {
    title: '3. Phương án kinh doanh',
    icon: AssessmentIcon,
    fields: [
      { key: 'pakd_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'pakd_giavon', label: 'Giá vốn', type: 'number' },
      { key: 'pakd_nhancong', label: 'Chi phí nhân công', type: 'number' },
      { key: 'pakd_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'pakd_laivay', label: 'Lãi vay', type: 'number' },
      { key: 'pakd_thue', label: 'Thuế', type: 'number' },
      { key: 'pakd_loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' },
      { key: 'pakd_tongchiphi', label: 'Tổng chi phí', type: 'number' },
      { key: 'pakd_vongquay', label: 'Vòng quay', type: 'number' },
      { key: 'pakd_nhucauvon', label: 'Nhu cầu vốn', type: 'number' },
      { key: 'pakd_vontuco', label: 'Vốn tự có', type: 'number' },
      { key: 'pakd_vaytctdkhac', label: 'Vay TCTD khác', type: 'number' },
      { key: 'pakd_vaynhct', label: 'Vay NHCT', type: 'number' }
    ]
  },
  financial_reports: {
    title: '4. Báo cáo tài chính',
    icon: Description,
    fields: [
      { key: 'bc_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'bc_loinhuan', label: 'Lợi nhuận', type: 'number' },
      { key: 'bc_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'bc_tongchiphi', label: 'Tổng chi phí', type: 'number' }
    ]
  },
  assessment_details: {
    title: '5. Đánh giá thẩm định',
    icon: CheckCircle,
    fields: [
      { key: 'danhgia_khachhang', label: 'Đánh giá khách hàng', type: 'textarea' },
      { key: 'danhgia_taisan', label: 'Đánh giá tài sản', type: 'textarea' },
      { key: 'danhgia_khac', label: 'Đánh giá khác', type: 'textarea' }
    ]
  }
}

const TEMPLATES_TIEU_DUNG: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Tiêu dùng)',
    icon: AccountBalance,
    fields: [
      { key: 'purpose.main_purpose', label: 'Mục đích vay', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền vay', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn vay (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' },
      { key: 'guarantee_type', label: 'Loại bảo đảm', type: 'select', options: ['Không bảo đảm', 'Bảo đảm một phần tài sản', 'Bảo đảm đầy đủ tài sản'] }
    ]
  },
  collateral_info: COLLATERAL_TEMPLATE,
  repayment_sources: {
    title: '3. Nguồn trả nợ',
    icon: CheckCircle,
    fields: [
      { key: 'from_customer_salary', label: 'Từ lương của khách hàng', type: 'number' },
      { key: 'from_customer_salary_desc', label: 'Mô tả nguồn lương của khách hàng', type: 'textarea' },
      { key: 'from_spouse_salary', label: 'Từ lương của vợ/chồng', type: 'number' },
      { key: 'from_spouse_salary_desc', label: 'Mô tả nguồn lương của vợ/chồng', type: 'textarea' },
      { key: 'from_asset_rental', label: 'Từ cho thuê tài sản', type: 'number' },
      { key: 'from_asset_rental_desc', label: 'Mô tả nguồn cho thuê tài sản', type: 'textarea' },
      { key: 'from_business', label: 'Từ hoạt động kinh doanh', type: 'number' },
      { key: 'from_business_desc', label: 'Mô tả nguồn hoạt động kinh doanh', type: 'textarea' },
      { key: 'from_other', label: 'Từ nguồn khác', type: 'number' },
      { key: 'from_other_desc', label: 'Mô tả nguồn khác', type: 'textarea' },
      { key: 'total_repayment_sources', label: 'Tổng nguồn trả nợ', type: 'number', readOnly: true }
    ]
  },
  liabilities: {
    title: '4. Thông tin nợ phải trả',
    icon: Description,
    fields: [
      { key: 'expected_loan_liability', label: 'Nợ phải trả cho khoản vay dự kiến', type: 'number' },
      { key: 'expected_loan_liability_desc', label: 'Mô tả nợ phải trả cho khoản vay dự kiến', type: 'textarea' },
      { key: 'other_bank_liability', label: 'Nợ phải trả tại TCTD khác', type: 'number' },
      { key: 'other_bank_liability_desc', label: 'Mô tả nợ phải trả tại TCTD khác', type: 'textarea' },
      { key: 'credit_card_liability', label: 'Nợ phải trả thẻ TD', type: 'number' },
      { key: 'credit_card_liability_desc', label: 'Mô tả nợ phải trả thẻ TD', type: 'textarea' },
      { key: 'other_liability', label: 'Nợ phải trả khác', type: 'number' },
      { key: 'other_liability_desc', label: 'Mô tả nợ phải trả khác', type: 'textarea' },
      { key: 'total_liability', label: 'Tổng nợ phải trả', type: 'number', readOnly: true }
    ]
  },
  monthly_expenses: {
    title: '5. Chi phí sinh hoạt hàng tháng',
    icon: AssessmentIcon,
    fields: [
      { key: 'food_expense', label: 'Chi phí ăn uống', type: 'number' },
      { key: 'medical_expense', label: 'Chi phí y tế', type: 'number' },
      { key: 'other_expense', label: 'Chi phí khác', type: 'number' },
      { key: 'total_expenses', label: 'Tổng chi phí', type: 'number', readOnly: true }
    ]
  },
  residual_income: {
    title: '6. Thu nhập còn lại',
    icon: AssessmentIcon,
    fields: [
      { key: 'total_residual_income', label: 'Thu nhập còn lại', type: 'number', readOnly: true }
    ]
  }
}

const TEMPLATES_THE_TIN_DUNG: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Thẻ tín dụng)',
    icon: AccountBalance,
    fields: [
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Hạn mức thẻ', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn thẻ (tháng)', type: 'number' },
      { key: 'card_expried', label:' Thẻ hết hạn (tháng/năm)', type: 'text' },
      { key: 'card_type', label: 'Loại thẻ', type: 'select', options: ['Visa', 'MasterCard', 'JCB', 'American Express', 'Khác'] },
      { key: 'min_payment_percent', label: 'Tỷ lệ thanh toán tối thiểu (%)', type: 'number' },
      { key: 'guarantee_type', label: 'Loại bảo đảm', type: 'select', options: ['Không bảo đảm', 'Bảo đảm một phần tài sản', 'Bảo đảm đầy đủ tài sản'] }
    ]
  },
  collateral_info: COLLATERAL_TEMPLATE,
  repayment_sources: TEMPLATES_TIEU_DUNG.repayment_sources,
  liabilities: TEMPLATES_TIEU_DUNG.liabilities
}

// --- Metadata Section ---
function MetadataSection({ title, icon: Icon, initialData, fields, onChange }: {
  title: string
  icon: any
  initialData: Record<string, any>
  fields: MetadataField[]
  onChange: (data: Record<string, any>) => void
}) {
  const [metadata, setMetadata] = useState<Record<string, any>>(initialData)
  const [expanded, setExpanded] = useState<boolean>(true)

  // Use effect to update metadata when initialData changes
  useEffect(() => { 
    setMetadata(initialData) 
  }, [initialData])

  const handleFieldChange = (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value }
    setMetadata(newMetadata)
    onChange(newMetadata)
  }

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        mb: 2, 
        boxShadow: 3,
        '&:before': { display: 'none' },
        borderRadius: '12px !important',
        overflow: 'hidden'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          minHeight: 64,
          '&.Mui-expanded': {
            minHeight: 64,
          },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            bgcolor: 'primary.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon sx={{ fontSize: 20, color: 'primary.contrastText' }} />
          </Box>
          <Typography variant="h6" fontWeight="medium" sx={{ color: 'primary.contrastText' }}>
            {title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, backgroundColor: 'background.paper' }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3 
        }}>
          {fields.map(field => (
            <Box key={field.key}>
              {field.type === 'select' ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={metadata[field.key] || ''}
                    onChange={e => handleFieldChange(field.key, e.target.value)}
                    label={field.label}
                  >
                    <MenuItem value="">
                      <em>Chọn {field.label}</em>
                    </MenuItem>
                    {field.options?.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : field.type === 'textarea' ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={field.label}
                  value={metadata[field.key] || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  variant="outlined"
                />
              ) : field.type === 'number' ? (
                <TextField
                  fullWidth
                  type="number"
                  label={field.label}
                  value={metadata[field.key] || ''}
                  onChange={e => handleFieldChange(field.key, parseFloat(e.target.value))}
                  InputProps={{
                    readOnly: field.readOnly,
                    startAdornment: field.label.includes('tiền') || field.label.includes('phí') ? (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ) : undefined,
                  }}
                  variant="outlined"
                  sx={field.readOnly ? { 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'primary.light',
                      '& input': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      }
                    }
                  } : {}}
                />
              ) : (
                <TextField
                  fullWidth
                  type={field.type}
                  label={field.label}
                  value={metadata[field.key] || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  InputProps={{
                    readOnly: field.readOnly,
                  }}
                  variant="outlined"
                  sx={field.readOnly ? { 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'primary.light',
                      '& input': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      }
                    }
                  } : {}}
                />
              )}
              {field.readOnly && (
                <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block' }}>
                  Tự động tính
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

// --- Main Form ---
export default function CreditAssessmentForm({
  isOpen, onClose, onSubmit, assessment, isLoading, customers, staff, products, collaterals = []
}: CreditAssessmentFormProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  // --- State ---
  const [formState, setFormState] = useState(() => {
    const details = assessment?.assessment_details || {}
      let loan_type = details.loan_info?.['loan_type.category'] || details.loan_info?.loan_type?.category || ''
      return {
        customer_id: assessment?.customer_id?.toString() || '',
        staff_id: assessment?.staff_id?.toString() || '',
        product_id: assessment?.product_id?.toString() || '',
        loan_type,
        department: assessment?.department || '',
        department_head: assessment?.department_head || '',
        fee_amount: assessment?.fee_amount?.toString() || '',
        status: assessment?.status || 'draft',
        assessment_details: {
          ...details,
          spouse_info: details.spouse_info || {},
          loan_info: details.loan_info || {},
          collateral_info: details.collateral_info || {},
          business_plan: details.business_plan || {},
          financial_reports: details.financial_reports || {},
          assessment_details: details.assessment_details || {},
          repayment_sources: details.repayment_sources || {},
          liabilities: details.liabilities || {}
        }
      }
  })

  // Filter collaterals by customer_id
  const availableCollaterals = React.useMemo(() => {
    if (!formState.customer_id || !collaterals.length) return []
    return collaterals.filter(c => c.customer_id?.toString() === formState.customer_id)
  }, [collaterals, formState.customer_id])

  // --- Template selection ---
  let selectedTemplates: MetadataTemplates = TEMPLATES_KINH_DOANH
  if (formState.loan_type === 'Tiêu dùng') selectedTemplates = TEMPLATES_TIEU_DUNG
  else if (formState.loan_type === 'Thẻ tín dụng' || formState.loan_type === 'Thẻ Tín Dụng') selectedTemplates = TEMPLATES_THE_TIN_DUNG

  // --- Update state on assessment change ---
  useEffect(() => {
    if (assessment) {
      const details = assessment.assessment_details || {}
      let loan_type = details.loan_info?.['loan_type.category'] || details.loan_info?.loan_type?.category || ''
      setFormState({
        customer_id: assessment.customer_id?.toString() || '',
        staff_id: assessment.staff_id?.toString() || '',
        product_id: assessment.product_id?.toString() || '',
        loan_type,
        department: assessment.department || '',
        department_head: assessment.department_head || '',
        fee_amount: assessment.fee_amount?.toString() || '',
        status: assessment.status || 'draft',
        assessment_details: {
          ...details,
          spouse_info: details.spouse_info || {},
          loan_info: details.loan_info || {},
          collateral_info: details.collateral_info || {},
          business_plan: details.business_plan || {},
          financial_reports: details.financial_reports || {},
          assessment_details: details.assessment_details || {},
          repayment_sources: details.repayment_sources || {},
          liabilities: details.liabilities || {}
        }
      })
    } else {
      setFormState({
        customer_id: '',
        staff_id: '',
        product_id: '',
        loan_type: '',
        department: '',
        department_head: '',
        fee_amount: '',
        status: 'draft',
        assessment_details: {
          spouse_info: {},
          loan_info: {},
          collateral_info: {},
          business_plan: {},
          financial_reports: {},
          assessment_details: {},
          repayment_sources: {},
          liabilities: {}
        }
      })
    }
  }, [assessment])

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState(prev => {
      if (name === 'staff_id') {
        const selectedStaff = staff.find(s => s.staff_id.toString() === value)
        return { ...prev, staff_id: value, department: selectedStaff?.department || '' }
      }
      if (name === 'loan_type') {
        return {
          ...prev,
          loan_type: value,
          assessment_details: {
            ...prev.assessment_details,
            loan_info: {
              ...prev.assessment_details.loan_info,
              ['loan_type.category']: value
            }
          }
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleLoanTypeChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      loan_type: value,
      assessment_details: {
        ...prev.assessment_details,
        loan_info: {
          ...prev.assessment_details.loan_info,
          ['loan_type.category']: value
        }
      }
    }))
  }

  const handleSectionDataChange = (section: string, data: Record<string, any>) => {
    let newData = { ...data };
    // Tính tổng chi phí sinh hoạt
    if (section === 'monthly_expenses') {
      const food = parseFloat(newData.food_expense) || 0;
      const medical = parseFloat(newData.medical_expense) || 0;
      const other = parseFloat(newData.other_expense) || 0;
      newData.total_expenses = food + medical + other;
    }

    // Tính tổng nguồn trả nợ
    if (section === 'repayment_sources') {
      const fromCustomer = parseFloat(newData.from_customer_salary) || 0;
      const fromSpouse = parseFloat(newData.from_spouse_salary) || 0;
      const fromAsset = parseFloat(newData.from_asset_rental) || 0;
      const fromBusiness = parseFloat(newData.from_business) || 0;
      const fromOther = parseFloat(newData.from_other) || 0;
      newData.total_repayment_sources = fromCustomer + fromSpouse + fromAsset + fromBusiness + fromOther;
    }

    // Tính tổng nợ phải trả
    if (section === 'liabilities') {
      const expectedLoan = parseFloat(newData.expected_loan_liability) || 0;
      const otherBank = parseFloat(newData.other_bank_liability) || 0;
      const creditCard = parseFloat(newData.credit_card_liability) || 0;
      const otherLiability = parseFloat(newData.other_liability) || 0;
      newData.total_liability = expectedLoan + otherBank + creditCard + otherLiability;
    }

    // Cập nhật section hiện tại
    setFormState(prev => {
      // Lấy dữ liệu mới nhất từ các section liên quan
      const repayment = section === 'repayment_sources' ? newData : prev.assessment_details.repayment_sources || {};
      const liabilities = section === 'liabilities' ? newData : prev.assessment_details.liabilities || {};
      const expenses = section === 'monthly_expenses' ? newData : prev.assessment_details.monthly_expenses || {};

      const total_repayment_sources = parseFloat(repayment.total_repayment_sources) || 0;
      const total_liability = parseFloat(liabilities.total_liability) || 0;
      const total_expenses = parseFloat(expenses.total_expenses) || 0;

      const total_residual_income = total_repayment_sources - total_liability - total_expenses;

      return {
        ...prev,
        assessment_details: {
          ...prev.assessment_details,
          [section]: newData,
          residual_income: {
            total_residual_income
          }
        }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      customer_id: parseInt(formState.customer_id),
      staff_id: parseInt(formState.staff_id),
      product_id: parseInt(formState.product_id),
      department: formState.department,
      department_head: formState.department_head,
      fee_amount: parseFloat(formState.fee_amount) || 0,
      status: formState.status,
      assessment_details: formState.assessment_details
    }
    onSubmit(data)
  }

  // --- Render ---
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      sx={{ '& .MuiDialog-paper': { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
        color: 'white',
        fontWeight: 700
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
          {assessment ? 'Chỉnh sửa thẩm định' : 'Thẩm định mới'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3 }}>
                Thông tin cơ bản
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
              }}>
                <Box>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formState.status}
                      onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as string }))}
                      label="Trạng thái"
                      required
                    >
                      <MenuItem value="draft">Nháp</MenuItem>
                      <MenuItem value="approve">Phê duyệt</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.full_name}
                    value={customers.find(c => c.customer_id.toString() === formState.customer_id) || null}
                    onChange={(event, newValue) => {
                      setFormState(prev => ({ 
                        ...prev, 
                        customer_id: newValue?.customer_id.toString() || '',
                        // Clear collateral selection when customer changes
                        assessment_details: {
                          ...prev.assessment_details,
                          collateral_info: {}
                        }
                      }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Khách hàng" variant="outlined" required />
                    )}
                  />
                </Box>

                <Box>
                  <Autocomplete
                    options={staff}
                    getOptionLabel={(option) => option.full_name}
                    value={staff.find(s => s.staff_id.toString() === formState.staff_id) || null}
                    onChange={(event, newValue) => {
                      const selectedStaff = newValue
                      setFormState(prev => ({ 
                        ...prev, 
                        staff_id: selectedStaff?.staff_id.toString() || '',
                        department: selectedStaff?.department || '' 
                      }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Nhân viên" variant="outlined" required />
                    )}
                  />
                </Box>

                <Box>
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option.product_name}
                    value={products.find(p => p.product_id.toString() === formState.product_id) || null}
                    onChange={(event, newValue) => {
                      setFormState(prev => ({ ...prev, product_id: newValue?.product_id.toString() || '' }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Sản phẩm" variant="outlined" required />
                    )}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    name="department"
                    label="Phòng ban"
                    value={formState.department}
                    onChange={(e) => setFormState(prev => ({ ...prev, department: e.target.value }))}
                    variant="outlined"
                  />
                </Box>

                <Box>
                  <Autocomplete
                    options={staff}
                    getOptionLabel={(option) => option.full_name}
                    value={staff.find(s => s.full_name === formState.department_head) || null}
                    onChange={(event, newValue) => {
                      setFormState(prev => ({ ...prev, department_head: newValue?.full_name || '' }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Lãnh đạo phòng" variant="outlined" required />
                    )}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    type="number"
                    name="fee_amount"
                    label="Phí thẩm định"
                    value={formState.fee_amount}
                    onChange={(e) => setFormState(prev => ({ ...prev, fee_amount: e.target.value }))}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Loại khoản vay</InputLabel>
                    <Select
                      value={formState.loan_type}
                      onChange={(e) => handleLoanTypeChange(e.target.value as string)}
                      label="Loại khoản vay"
                    >
                      <MenuItem value="Kinh doanh">Kinh doanh</MenuItem>
                      <MenuItem value="Tiêu dùng">Tiêu dùng</MenuItem>
                      <MenuItem value="Thẻ tín dụng">Thẻ tín dụng</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Spouse Selection */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3 }}>
                Chọn thông tin vợ/chồng
              </Typography>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.full_name}
                value={customers.find(c => c.customer_id.toString() === (formState.assessment_details.spouse_info?.customer_id?.toString() || '')) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    const mapped = {
                      customer_id: newValue.customer_id,
                      full_name: newValue.full_name,
                      date_of_birth: newValue.date_of_birth,
                      gender: newValue.gender,
                      id_number: newValue.id_number,
                      id_issue_date: newValue.id_issue_date,
                      id_issue_authority: newValue.id_issue_authority,
                      phone: newValue.phone,
                      address: newValue.address,
                      account_number: newValue.account_number,
                      cif_number: newValue.cif_number
                    }
                    handleSectionDataChange('spouse_info', mapped)
                  } else {
                    handleSectionDataChange('spouse_info', {})
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn khách hàng làm vợ/chồng" variant="outlined" />
                )}
              />
            </CardContent>
          </Card>

          {/* Collateral Selection */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3 }}>
                Chọn tài sản thế chấp
              </Typography>
              <Autocomplete
                options={availableCollaterals}
                getOptionLabel={(option) => `${option.collateral_type} - ${option.description || 'Không có mô tả'}`}
                value={availableCollaterals.find(c => 
                  c.collateral_id?.toString() === formState.assessment_details.collateral_info?.collateral_id?.toString()
                ) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    console.log('🔍 Selected collateral object:', newValue)
                    console.log('🔍 Raw metadata field:', newValue.metadata)
                    
                    // Extract and flatten metadata structure to handle multiple formats
                    const metadata = extractCollateralMetadata(newValue)
                    console.log('🔍 Extracted metadata:', metadata)
                    
                    const mapped = {
                      // Thông tin cơ bản từ table chính
                      collateral_id: newValue.collateral_id,
                      collateral_type: newValue.collateral_type,
                      collateral_value: newValue.value,
                      collateral_description: newValue.description || '',
                      location: newValue.location || '',
                      
                      // Thông tin từ metadata JSONB - với fallback empty string
                      so_gcn: metadata.so_gcn || '',
                      ngay_cap_gcn: metadata.ngay_cap_gcn || '',
                      noi_cap_gcn: metadata.noi_cap_gcn || '',
                      
                      // Thông tin đất đai
                      so_thua: metadata.so_thua || '',
                      to_ban_do: metadata.to_ban_do || '',
                      dien_tich: metadata.dien_tich || '',
                      muc_dich_su_dung_dat: metadata.muc_dich_su_dung_dat || '',
                      
                      // Thông tin nhà ở/công trình
                      dien_tich_xay_dung: metadata.dien_tich_xay_dung || '',
                      ket_cau: metadata.ket_cau || '',
                      so_tang: metadata.so_tang || '',
                      nam_hoan_thanh_xd: metadata.nam_hoan_thanh_xd || '',
                      
                      // Thông tin phương tiện
                      vehicle_type: metadata.vehicle_type || '',
                      brand: metadata.brand || '',
                      model: metadata.model || '',
                      year: metadata.year || '',
                      license_plate: metadata.license_plate || '',
                      
                      // Thông tin tài chính
                      account_type: metadata.account_type || '',
                      bank_name: metadata.bank_name || '',
                      account_number: metadata.account_number || '',
                      balance: metadata.balance || '',
                      currency: metadata.currency || '',
                      
                      // Thông tin pháp lý
                      ownership_status: metadata.ownership_status || newValue.legal_status || '',
                      legal_restrictions: metadata.legal_restrictions || '',
                      registration_date: metadata.registration_date || '',
                      contract_number: metadata.contract_number || '',
                      
                      // Thông tin định giá
                      appraised_value: metadata.appraised_value || newValue.value || '',
                      appraisal_date: metadata.appraisal_date || newValue.valuation_date || '',
                      appraiser: metadata.appraiser || '',
                      appraisal_method: metadata.appraisal_method || '',
                      next_appraisal_date: metadata.next_appraisal_date || newValue.re_evaluation_date || '',
                      
                      // Thông tin liên hệ
                      contact_person: metadata.contact_person || '',
                      phone: metadata.phone || '',
                      email: metadata.email || '',
                      notes: metadata.notes || ''
                    }
                    handleSectionDataChange('collateral_info', mapped)
                  } else {
                    handleSectionDataChange('collateral_info', {})
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Chọn tài sản thế chấp" 
                    variant="outlined" 
                    helperText={
                      !formState.customer_id 
                        ? "Vui lòng chọn khách hàng trước"
                        : availableCollaterals.length === 0
                        ? "Không có tài sản thế chấp nào cho khách hàng này"
                        : `${availableCollaterals.length} tài sản có sẵn`
                    }
                  />
                )}
                disabled={!formState.customer_id}
                noOptionsText={
                  !formState.customer_id 
                    ? "Chọn khách hàng trước"
                    : "Không có tài sản thế chấp"
                }
              />
            </CardContent>
          </Card>

          {/* Dynamic Metadata Sections */}
          {Object.entries(selectedTemplates).map(([sectionKey, section]) => {
            let initialData = formState.assessment_details[sectionKey] || {};
            
            // For collateral_info, use dynamic template based on collateral type
            if (sectionKey === 'collateral_info') {
              const collateralType = initialData.collateral_type || '';
              const dynamicTemplate = getCollateralTemplate(collateralType);
              
              return (
                <MetadataSection
                  key={`${sectionKey}-${JSON.stringify(initialData)}`}
                  title={dynamicTemplate.title}
                  icon={dynamicTemplate.icon}
                  initialData={initialData}
                  fields={dynamicTemplate.fields}
                  onChange={data => handleSectionDataChange(sectionKey, data)}
                />
              );
            }
            
            return (
              <MetadataSection
                key={`${sectionKey}-${JSON.stringify(initialData)}`}
                title={section.title}
                icon={section.icon}
                initialData={initialData}
                fields={section.fields}
                onChange={data => handleSectionDataChange(sectionKey, data)}
              />
            );
          })}
        </Box>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit"
          size="large"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
          size="large"
          startIcon={isLoading ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid',
                borderColor: 'currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          ) : null}
        >
          {isLoading ? 'Đang xử lý...' : assessment ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
