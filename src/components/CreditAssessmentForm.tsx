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
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },
  business_plan: {
    title: '2. Phương án kinh doanh',
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
    title: '3. Báo cáo tài chính',
    icon: Description,
    fields: [
      { key: 'bc_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'bc_loinhuan', label: 'Lợi nhuận', type: 'number' },
      { key: 'bc_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'bc_tongchiphi', label: 'Tổng chi phí', type: 'number' }
    ]
  },
  assessment_details: {
    title: '4. Đánh giá thẩm định',
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
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },
  repayment_sources: {
    title: '2. Nguồn trả nợ',
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
    title: '3. Thông tin nợ phải trả',
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
    title: '4. Chi phí sinh hoạt hàng tháng',
    icon: AssessmentIcon,
    fields: [
      { key: 'food_expense', label: 'Chi phí ăn uống', type: 'number' },
      { key: 'medical_expense', label: 'Chi phí y tế', type: 'number' },
      { key: 'other_expense', label: 'Chi phí khác', type: 'number' },
      { key: 'total_expenses', label: 'Tổng chi phí', type: 'number', readOnly: true }
    ]
  },
  residual_income: {
    title: '5. Thu nhập còn lại',
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
      { key: 'term.requested_months', label: 'Thời hạn thẻ (tháng)', type: 'number' }
    ]
  },
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

  useEffect(() => { setMetadata(initialData) }, [initialData])

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
          <Typography variant="h6" fontWeight="medium">
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
  isOpen, onClose, onSubmit, assessment, isLoading, customers, staff, products
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
          business_plan: details.business_plan || {},
          financial_reports: details.financial_reports || {},
          assessment_details: details.assessment_details || {},
          repayment_sources: details.repayment_sources || {},
          liabilities: details.liabilities || {}
        }
      }
  })

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
                      setFormState(prev => ({ ...prev, customer_id: newValue?.customer_id.toString() || '' }))
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

          {/* Dynamic Metadata Sections */}
          {Object.entries(selectedTemplates).map(([sectionKey, section]) => {
            let initialData = formState.assessment_details[sectionKey] || {};
            // Format date fields for spouse_info
            if (sectionKey === 'spouse_info') {
              initialData = {
                ...initialData,
                date_of_birth: initialData.date_of_birth ? toVNDate(initialData.date_of_birth) : '',
                id_issue_date: initialData.id_issue_date ? toVNDate(initialData.id_issue_date) : ''
              };
            }
            return (
              <MetadataSection
                key={sectionKey}
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
