"use client";

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  Chip,
  useTheme
} from '@mui/material'
import {
  Home,
  LocalShipping,
  AccountBalance,
  Description,
  Security,
  Assessment,
  Chat,
  LocationOn,
} from '@mui/icons-material'
import { formatMoneyToWords, formatAreaToWords } from '@/lib/currency'

// Hàm tự động chuyển key sang tiếng Việt (giống CollateralCard)
const formatFieldLabel = (key: string): string => {
  const vietnameseLabels: Record<string, string> = {
    property_certificate: 'Giấy chứng nhận',
    property_land: 'Thông tin đất',
    property_building: 'Thông tin công trình',
    property_value: 'Giá trị BĐS',
    property_assessment: 'Đánh giá BĐS',
    property_address: 'Địa chỉ BĐS',
    property_purpose: 'Mục đích sử dụng',
    property_ownership: 'Chủ sở hữu',
    property_restrictions: 'Hạn chế/Thế chấp',
    vehicle_type: 'Loại phương tiện',
    vehicle_brand: 'Nhãn hiệu',
    vehicle_model: 'Model',
    vehicle_year: 'Năm sản xuất',
    vehicle_color: 'Màu sắc',
    vehicle_registration: 'Đăng ký xe',
    vehicle_chassis: 'Số khung',
    vehicle_engine: 'Số máy',
    vehicle_condition: 'Tình trạng',
    vehicle_mileage: 'Số km đã đi',
    financial_value: 'Giá trị',
    financial_currency: 'Loại tiền',
    financial_institution: 'Tổ chức tài chính',
    financial_account: 'Số tài khoản',
    financial_type: 'Loại tài sản tài chính',
    financial_maturity: 'Ngày đáo hạn',
    financial_interest: 'Lãi suất',
    document_type: 'Loại tài liệu',
    document_number: 'Số tài liệu',
    document_date: 'Ngày tài liệu',
    document_issuer: 'Nơi cấp',
    document_status: 'Trạng thái',
    document_location: 'Nơi lưu trữ',
    legal_status: 'Tình trạng pháp lý',
    legal_restrictions: 'Hạn chế pháp lý',
    legal_disputes: 'Tranh chấp',
    legal_registration: 'Đăng ký pháp lý',
    legal_owner: 'Chủ sở hữu pháp lý',
    legal_representative: 'Người đại diện',
    assessment_date: 'Ngày đánh giá',
    assessment_method: 'Phương pháp đánh giá',
    assessment_appraiser: 'Đơn vị thẩm định',
    assessment_value: 'Giá trị thẩm định',
    assessment_notes: 'Ghi chú đánh giá',
    assessment_expiry: 'Ngày hết hạn',
    communication_contact: 'Người liên hệ',
    communication_phone: 'Số điện thoại',
    communication_email: 'Email',
    communication_address: 'Địa chỉ liên hệ',
    communication_preferred: 'Phương thức ưu tiên',
    communication_notes: 'Ghi chú liên hệ'
  };
  return vietnameseLabels[key] || key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

type IconType = typeof Home

interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section' | 'boolean'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: IconType
  fields: MetadataField[]
}

interface MetadataFormProps {
  initialData?: Record<string, Record<string, unknown>>
  onChange: (metadata: Record<string, Record<string, unknown>>) => void
  suggestedTemplates?: string[]
  customTemplates?: MetadataTemplates
}

type MetadataTemplates = {
  [key: string]: TemplateConfig
}

const METADATA_TEMPLATES: MetadataTemplates = {
  property_certificate: {
    title: '1. Thông tin giấy chứng nhận',
    icon: Description,
    fields: [
      { 
        key: 'loai_gcn', 
        label: 'Loại giấy chứng nhận', 
        type: 'select', 
        options: [
          'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất',
          'Giấy chứng nhận quyền sử dụng đất',
          'Giấy chứng nhận quyền sở hữu nhà ở và quyền sử dụng đất ở',
          'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất'
        ]
      },
      { key: 'so_gcn', label: 'Số giấy chứng nhận', type: 'text' },
      { key: 'so_vao_so_gcn', label: 'Số vào sổ GCN', type: 'text' },
      { key: 'ngay_cap_gcn', label: 'Ngày cấp GCN', type: 'date' },
      { key: 'noi_cap_gcn', label: 'Nơi cấp GCN', type: 'text' }
    ]
  },
  
  property_land: {
    title: '2. Thông tin thửa đất',
    icon: LocationOn,
    fields: [
      // Thông tin cơ bản thửa đất
      { key: 'so_thua', label: 'Số thửa', type: 'text' },
      { key: 'to_ban_do', label: 'Tờ bản đồ số', type: 'text' },
      { key: 'dia_chi_dat', label: 'Địa chỉ thửa đất', type: 'text' },
      { key: 'vitri_thua_dat', label: 'Vị trí thửa đất', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { key: 'muc_dich_su_dung_dat', label: 'Mục đích sử dụng đất', type: 'text' },
      { key: 'thoi_gian_su_dung', label: 'Thời hạn sử dụng', type: 'text' },
      { key: 'nguon_goc_dat', label: 'Nguồn gốc sử dụng', type: 'text' },
      { key: 'hinh_thuc_su_dung', label: 'Hình thức sử dụng', type: 'text' },
      
      // Thông tin diện tích
      { key: 'dien_tich', label: 'Tổng diện tích (m²)', type: 'number' },
      { key: 'dien_tich_bang_chu', label: 'Diện tích bằng chữ', type: 'text', readOnly: true },
      { key: 'dien_tich_dat_o', label: 'Diện tích đất ở (m²)', type: 'number' },
      { key: 'dien_tich_dat_trong_cay', label: 'Diện tích đất trồng cây (m²)', type: 'number' },
      { key: 'dien_tich_dat_khac', label: 'Diện tích đất khác (m²)', type: 'number' }
    ]
  },

  property_building: {
    title: '3. Thông tin nhà ở/tài sản gắn liền với đất',
    icon: Home,
    fields: [
      { key: 'loai_ts_tren_dat', label: 'Loại tài sản', type: 'text' },
      { key: 'dia_chi_nha', label: 'Địa chỉ', type: 'text' },
      { key: 'dien_tich_xay_dung', label: 'Diện tích xây dựng (m²)', type: 'number' },
      { key: 'dien_tich_san', label: 'Diện tích sàn (m²)', type: 'number' },
      { key: 'ket_cau', label: 'Kết cấu', type: 'text' },
      { key: 'cap_hang', label: 'Cấp hạng', type: 'text' },
      { key: 'so_tang', label: 'Số tầng', type: 'number' },
      { key: 'nam_hoan_thanh_xd', label: 'Năm hoàn thành', type: 'number' },
      { key: 'thoi_han_so_huu', label: 'Thời hạn sở hữu', type: 'text' },
      { key: 'hinh_thuc_so_huu_nha', label: 'Hình thức sở hữu', type: 'text' }
    ]
  },

  property_value: {
    title: '4. Thông tin giá trị tài sản',
    icon: AccountBalance,
    fields: [
      { key: 'tong_gia_tri_tsbd', label: 'Tổng giá trị TSBĐ (VNĐ)', type: 'number' },
      { key: 'tong_gia_tri_tsbd_bang_chu', label: 'Tổng giá trị bằng chữ', type: 'text', readOnly: true },
      { key: 'tong_gia_tri_dat', label: 'Giá trị đất (VNĐ)', type: 'number' },
      { key: 'don_gia_dat_o', label: 'Đơn giá đất ở (VNĐ/m²)', type: 'number' },
      { key: 'don_gia_dat_trong_cay', label: 'Đơn giá đất trồng cây (VNĐ/m²)', type: 'number' },
      { key: 'don_gia_dat_khac', label: 'Đơn giá đất khác (VNĐ/m²)', type: 'number' },
      { key: 'tong_gia_tri_nha', label: 'Giá trị nhà (VNĐ)', type: 'number' },
      { key: 'don_gia_nha', label: 'Đơn giá nhà (VNĐ/m²)', type: 'number' },
      { key: 'ty_le_khau_hao_nha_o', label: 'Tỷ lệ khấu hao (%)', type: 'number' }
    ]
  },

  property_assessment: {
    title: '5. Thông tin thẩm định',
    icon: Security,
    fields: [
      { key: 'so_cif_chu_ts', label: 'Số CIF chủ tài sản', type: 'text' },
      { key: 'muc_cho_vay_toi_da', label: 'Mức cho vay tối đa (VNĐ)', type: 'number' },
      { key: 'danhgiatsbd', label: 'Nhận xét đánh giá', type: 'textarea' },
      { key: 'so_hdtc_tsbd', label: 'Số HĐTC TSBĐ', type: 'text' },
      { key: 'van_phong_dktc', label: 'Văn phòng ĐKTC', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'textarea' }
    ]
  },
  vehicle: {
    title: 'Thông tin phương tiện',
    icon: LocalShipping,
    fields: [
      { key: 'vehicle_type', label: 'Loại phương tiện', type: 'select', options: ['Ô tô', 'Xe máy', 'Xe tải', 'Khác'] },
      { key: 'brand', label: 'Thương hiệu', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'year', label: 'Năm sản xuất', type: 'number' },
      { key: 'license_plate', label: 'Biển số', type: 'text' }
    ]
  },
  financial: {
    title: 'Thông tin tài chính',
    icon: AccountBalance,
    fields: [
      { key: 'account_type', label: 'Loại tài khoản', type: 'select', options: ['Tiết kiệm', 'Vãng lai', 'Khác'] },
      { key: 'bank_name', label: 'Tên ngân hàng', type: 'text' },
      { key: 'account_number', label: 'Số tài khoản', type: 'text' },
      { key: 'balance', label: 'Số dư', type: 'number' },
      { key: 'currency', label: 'Loại tiền', type: 'select', options: ['VND', 'USD', 'EUR'] }
    ]
  },
  documents: {
    title: 'Tài liệu pháp lý',
    icon: Description,
    fields: [
      { key: 'document_type', label: 'Loại giấy tờ', type: 'select', options: ['CMND/CCCD', 'Hộ chiếu', 'Sổ hộ khẩu', 'Khác'] },
      { key: 'document_number', label: 'Số giấy tờ', type: 'text' },
      { key: 'issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'expiry_date', label: 'Ngày hết hạn', type: 'date' }
    ]
  },
  legal: {
    title: 'Thông tin pháp lý',
    icon: Security,
    fields: [
      { key: 'ownership_status', label: 'Tình trạng sở hữu', type: 'select', options: ['Đã thanh toán', 'Đang trả góp', 'Thuê'] },
      { key: 'legal_restrictions', label: 'Hạn chế pháp lý', type: 'text' },
      { key: 'registration_date', label: 'Ngày đăng ký', type: 'date' },
      { key: 'contract_number', label: 'Số hợp đồng', type: 'text' }
    ]
  },
  assessment: {
    title: 'Thông tin định giá',
    icon: Assessment,
    fields: [
      { key: 'appraised_value', label: 'Giá trị định giá', type: 'number' },
      { key: 'appraisal_date', label: 'Ngày định giá', type: 'date' },
      { key: 'appraiser', label: 'Đơn vị định giá', type: 'text' },
      { key: 'appraisal_method', label: 'Phương pháp định giá', type: 'select', options: ['So sánh', 'Thu nhập', 'Chi phí', 'Khác'] },
      { key: 'next_appraisal_date', label: 'Ngày định giá tiếp theo', type: 'date' }
    ]
  },
  communication: {
    title: 'Ghi chú & Liên hệ',
    icon: Chat,
    fields: [
      { key: 'contact_person', label: 'Người liên hệ', type: 'text' },
      { key: 'phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'notes', label: 'Ghi chú', type: 'textarea' }
    ]
  }
}

export default function MetadataForm({ 
  initialData = {}, 
  onChange,
  suggestedTemplates,
  customTemplates
}: MetadataFormProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, Record<string, unknown>>>(initialData)
  const theme = useTheme()

  // Use custom templates if provided, otherwise use default templates
  const templates = customTemplates || METADATA_TEMPLATES

  const handleFieldChange = (template: string, field: string, value: unknown) => {
    const newMetadata = {
      ...metadata,
      [template]: {
        ...(metadata[template] || {}),
        [field]: value
      }
    }

    // Automatically update text representations of numbers
    if (typeof value === 'number') {
      // Update currency in words
      if (template === 'property_value' && field === 'tong_gia_tri_tsbd') {
        newMetadata[template] = {
          ...newMetadata[template],
          tong_gia_tri_tsbd_bang_chu: formatMoneyToWords(value)
        }
      }
      
      // Update area in words
      if (template === 'property_land' && field === 'dien_tich') {
        newMetadata[template] = {
          ...newMetadata[template],
          dien_tich_bang_chu: formatAreaToWords(value)
        }
      }
    }

    setMetadata(newMetadata)
    onChange(newMetadata)
  }

  return (
    <Box sx={{ spacing: 3 }}>
      {/* Template Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(templates)
          .filter(([key]) => !suggestedTemplates || suggestedTemplates.includes(key))
          .map(([key, template]) => {
          const Icon = template.icon
          const isActive = activeTemplate === key
          const hasData = !!metadata[key]

          return (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: 2,
                  borderColor: isActive 
                    ? 'primary.main' 
                    : hasData 
                    ? 'success.light' 
                    : 'grey.300',
                  backgroundColor: isActive 
                    ? 'primary.50' 
                    : hasData 
                    ? 'success.50' 
                    : 'background.paper',
                  '&:hover': {
                    borderColor: isActive ? 'primary.main' : 'grey.400',
                    backgroundColor: isActive 
                      ? 'primary.50' 
                      : hasData 
                      ? 'success.50' 
                      : 'grey.50',
                  }
                }}
                onClick={() => setActiveTemplate(isActive ? null : key)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Icon 
                    sx={{ 
                      fontSize: 32, 
                      mb: 1,
                      color: isActive 
                        ? 'primary.main' 
                        : hasData 
                        ? 'success.main' 
                        : 'grey.400'
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500}
                    color={isActive 
                      ? 'primary.main' 
                      : hasData 
                      ? 'success.main' 
                      : 'text.secondary'}
                    gutterBottom
                  >
                    {template.title}
                  </Typography>
                  {hasData && (
                    <Chip 
                      label="Đã nhập" 
                      size="small" 
                      color="success" 
                      variant="filled"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Form Fields */}
      {activeTemplate && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {templates[activeTemplate].title}
          </Typography>
          <Grid container spacing={3}>
            {templates[activeTemplate].fields.map((field) => (
              field.type === 'section' ? (
                <Grid key={field.key} size={{ xs: 12 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      pb: 1, 
                      borderBottom: 1, 
                      borderColor: 'divider' 
                    }}
                  >
                    {field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                  </Typography>
                </Grid>
              ) : (
                <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
                  {field.type === 'select' ? (
                    <FormControl fullWidth>
                      <InputLabel>
                        {field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                      </InputLabel>
                      <Select
                        value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                        onChange={(e) => handleFieldChange(activeTemplate, field.key, e.target.value)}
                        label={field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                      >
                        <MenuItem value="">
                          Chọn {field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                        </MenuItem>
                        {field.options?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : field.type === 'textarea' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                      value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                      onChange={(e) => handleFieldChange(activeTemplate, field.key, e.target.value)}
                    />
                  ) : field.type === 'boolean' ? (
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(metadata[activeTemplate]?.[field.key])}
                            onChange={(e) => handleFieldChange(activeTemplate, field.key, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                      />
                    </Box>
                  ) : (
                    <TextField
                      fullWidth
                      type={field.type}
                      label={field.label && field.label.trim() !== '' ? field.label : formatFieldLabel(field.key)}
                      value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                      onChange={(e) => {
                        const value = field.type === 'number' 
                          ? parseFloat(e.target.value) || 0
                          : e.target.value
                        handleFieldChange(activeTemplate, field.key, value)
                      }}
                      InputProps={{
                        readOnly: field.readOnly,
                      }}
                      sx={field.readOnly ? {
                        '& .MuiInputBase-input': {
                          backgroundColor: 'grey.50',
                          color: 'text.secondary'
                        }
                      } : {}}
                    />
                  )}
                </Grid>
              )
            ))}
          </Grid>
        </Card>
      )}
    </Box>
  )
}
