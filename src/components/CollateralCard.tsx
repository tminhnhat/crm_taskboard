'use client'

import React, { useState } from 'react'
import { Collateral } from '@/lib/supabase'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Collapse,
  IconButton,
  Link,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button
} from '@mui/material'
import { 
  Home,
  DirectionsCar,
  AttachMoney,
  Description,
  LocationOn,
  Event,
  Business,
  Security,
  Assessment,
  Chat,
  ExpandMore,
  Edit,
  Delete,
  Person
} from '@mui/icons-material'
import { StyledCard, ActionButton } from './StyledComponents'

interface CollateralCardProps {
  collateral: Collateral
  onEdit: (collateral: Collateral) => void
  onDelete: (collateral: Collateral) => void
}

const getMetadataIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case 'property':
      return Home
    case 'vehicle':
      return DirectionsCar
    case 'financial':
      return AttachMoney
    case 'documents':
      return Description
    case 'legal':
      return Security
    case 'assessment':
      return Assessment
    case 'communication':
      return Chat
    default:
      return Business
  }
}

const getMetadataTitle = (key: string): string => {
  const templateTitles: Record<string, string> = {
    // Templates cho bất động sản
    'property': 'Thông tin bất động sản',
    'property_residential': 'Thông tin nhà ở',
    'property_commercial': 'Thông tin BĐS thương mại',
    'property_industrial': 'Thông tin BĐS công nghiệp',
    'property_land_only': 'Thông tin đất',

    // Templates cho phương tiện
    'vehicle': 'Thông tin phương tiện',
    'vehicle_car': 'Thông tin ô tô',
    'vehicle_motorcycle': 'Thông tin xe máy',
    'vehicle_truck': 'Thông tin xe tải',
    'vehicle_special': 'Thông tin xe đặc biệt',

    // Templates cho máy móc thiết bị
    'machinery': 'Thông tin máy móc',
    'machinery_production': 'Máy móc sản xuất',
    'machinery_construction': 'Máy móc xây dựng',
    'machinery_special': 'Máy móc chuyên dụng',

    // Templates cho hàng hóa
    'inventory': 'Thông tin hàng hóa',
    'inventory_goods': 'Hàng hóa thành phẩm',
    'inventory_materials': 'Nguyên vật liệu',
    'inventory_wip': 'Hàng đang sản xuất',

    // Templates tài chính
    'financial': 'Thông tin tài chính',
    'financial_deposit': 'Tiền gửi',
    'financial_bond': 'Trái phiếu',
    'financial_stock': 'Cổ phiếu',

    // Templates pháp lý
    'legal': 'Thông tin pháp lý',
    'legal_property': 'Pháp lý BĐS',
    'legal_vehicle': 'Pháp lý phương tiện',
    'legal_business': 'Pháp lý doanh nghiệp',

    // Templates đánh giá
    'assessment': 'Đánh giá',
    'assessment_property': 'Đánh giá BĐS',
    'assessment_vehicle': 'Đánh giá phương tiện',
    'assessment_machinery': 'Đánh giá máy móc',

    // Templates khác
    'documents': 'Tài liệu',
    'communication': 'Giao tiếp',
    'business_assets': 'Tài sản doanh nghiệp',
    'intellectual_property': 'Tài sản trí tuệ',
    'receivables': 'Khoản phải thu'
  }

  // Trả về tiêu đề tiếng Việt nếu có, nếu không thì format key gốc
  return templateTitles[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1)
}

const formatFieldLabel = (key: string): string => {
  // Mapping specific field names to Vietnamese labels
  const vietnameseLabels: Record<string, string> = {
    // Thông tin bất động sản
    property_certificate: 'Giấy chứng nhận',
    property_land: 'Thông tin đất',
    property_building: 'Thông tin công trình',
    property_value: 'Giá trị BĐS',
    property_assessment: 'Đánh giá BĐS',
    property_address: 'Địa chỉ BĐS',
    property_purpose: 'Mục đích sử dụng',
    property_ownership: 'Chủ sở hữu',
    property_restrictions: 'Hạn chế/Thế chấp',

    // Thông tin phương tiện
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

    // Thông tin tài chính
    financial_value: 'Giá trị',
    financial_currency: 'Loại tiền',
    financial_institution: 'Tổ chức tài chính',
    financial_account: 'Số tài khoản',
    financial_type: 'Loại tài sản tài chính',
    financial_maturity: 'Ngày đáo hạn',
    financial_interest: 'Lãi suất',
    
    // Tài liệu
    document_type: 'Loại tài liệu',
    document_number: 'Số tài liệu',
    document_date: 'Ngày tài liệu',
    document_issuer: 'Nơi cấp',
    document_status: 'Trạng thái',
    document_location: 'Nơi lưu trữ',
    
    // Thông tin pháp lý
    legal_status: 'Tình trạng pháp lý',
    legal_restrictions: 'Hạn chế pháp lý',
    legal_disputes: 'Tranh chấp',
    legal_registration: 'Đăng ký pháp lý',
    legal_owner: 'Chủ sở hữu pháp lý',
    legal_representative: 'Người đại diện',
    
    // Đánh giá
    assessment_date: 'Ngày đánh giá',
    assessment_method: 'Phương pháp đánh giá',
    assessment_appraiser: 'Đơn vị thẩm định',
    assessment_value: 'Giá trị thẩm định',
    assessment_notes: 'Ghi chú đánh giá',
    assessment_expiry: 'Ngày hết hạn',
    
    // Giao tiếp
    communication_contact: 'Người liên hệ',
    communication_phone: 'Số điện thoại',
    communication_email: 'Email',
    communication_address: 'Địa chỉ liên hệ',
    communication_preferred: 'Phương thức ưu tiên',
    communication_notes: 'Ghi chú liên hệ'
  }

  // Return Vietnamese label if it exists, otherwise format the key as before
  return vietnameseLabels[key] || key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getCollateralTypeInVietnamese = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'real_estate':
      return 'Bất động sản'
    case 'vehicle':
      return 'Phương tiện'
    case 'machinery':
      return 'Máy móc thiết bị'
    case 'inventory':
      return 'Hàng hóa tồn kho'
    case 'receivables':
      return 'Khoản phải thu'
    case 'securities':
      return 'Chứng khoán'
    case 'business_assets':
      return 'Tài sản doanh nghiệp'
    case 'intellectual_property':
      return 'Tài sản trí tuệ'
    case 'personal_property':
      return 'Tài sản cá nhân'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

export default function CollateralCard({ collateral, onEdit, onDelete }: CollateralCardProps) {
  return (
    <StyledCard>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Assessment color="primary" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {collateral.collateral_type ? (
                    getCollateralTypeInVietnamese(collateral.collateral_type)
                  ) : (
                    'Tài sản thế chấp'
                  )}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {collateral.value !== null ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(collateral.value) : 'Chưa có giá trị'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Stack spacing={1}>
          {/* Customer Information */}
          {collateral.customer && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              mb: 1
            }}>
              <Person fontSize="small" />
              <Typography variant="body2">
                Khách hàng: {collateral.customer.full_name}
              </Typography>
            </Box>
          )}

          {/* Valuation Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Event fontSize="small" />
            <Typography variant="body2">
              Định giá: {collateral.valuation_date ? new Date(collateral.valuation_date).toLocaleDateString('vi-VN') : 'Chưa định giá'}
            </Typography>
          </Box>

          {/* Re-evaluation Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Assessment fontSize="small" />
            <Typography variant="body2">
              Đánh giá lại: {collateral.re_evaluation_date ? new Date(collateral.re_evaluation_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
            </Typography>
          </Box>

          {/* Location */}
          {collateral.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">
                Địa điểm: {collateral.location}
              </Typography>
            </Box>
          )}

          {/* Description */}
          {collateral.description && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Description fontSize="small" sx={{ mt: 0.2 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {collateral.description}
              </Typography>
            </Box>
          )}

          {/* Metadata Sections */}
          {collateral.metadata && typeof collateral.metadata === 'object' && 
            Object.entries(collateral.metadata as Record<string, Record<string, unknown>>).map(([key, data], index) => {
              const IconComponent = getMetadataIcon(key);
              
              return (
                <Accordion key={key} elevation={0} sx={{ 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'rgba(52, 71, 103, 0.1)',
                  borderRadius: 2,
                  '&:before': { display: 'none' }
                }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#344767' }} />}
                    sx={{ 
                      bgcolor: 'rgba(52, 71, 103, 0.04)',
                      borderRadius: 2,
                      '&.Mui-expanded': {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <IconComponent sx={{ color: '#344767', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#344767' }}>
                        {formatFieldLabel(key)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {Object.entries(data).map(([fieldKey, value]) => (
                            <TableRow key={fieldKey} sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: 'rgba(248, 250, 252, 0.5)' },
                              '&:hover': { bgcolor: 'rgba(52, 71, 103, 0.04)' }
                            }}>
                              <TableCell sx={{ 
                                width: '30%', 
                                fontWeight: 600, 
                                bgcolor: 'rgba(52, 71, 103, 0.08)',
                                color: '#344767',
                                borderColor: 'rgba(52, 71, 103, 0.1)'
                              }}>
                                {formatFieldLabel(fieldKey)}
                              </TableCell>
                              <TableCell sx={{ 
                                borderColor: 'rgba(52, 71, 103, 0.1)',
                                color: '#344767',
                                fontWeight: 500
                              }}>
                                {typeof value === 'boolean' ? (
                                  <Chip 
                                    label={value ? 'Có' : 'Không'}
                                    color={value ? 'success' : 'error'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                  />
                                ) : typeof value === 'number' ? (
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {value.toLocaleString('vi-VN')}
                                  </Typography>
                                ) : typeof value === 'string' ? (
                                  (() => {
                                    // Check if it's a date field
                                    const isDateField = fieldKey.toLowerCase().includes('date') || 
                                                      fieldKey.toLowerCase().includes('ngay') ||
                                                      fieldKey.toLowerCase().includes('birthday') ||
                                                      fieldKey.toLowerCase().includes('expiry')
                                    
                                    // Try to parse as date if it's a date field
                                    if (isDateField) {
                                      const date = new Date(value)
                                      if (!isNaN(date.getTime())) {
                                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
                                        return (
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formattedDate}
                                          </Typography>
                                        )
                                      }
                                    }
                                    
                                    // If it's a URL, render as link
                                    if (value.startsWith('http')) {
                                      return (
                                        <Link 
                                          href={value}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ 
                                            fontSize: '0.875rem',
                                            color: '#344767',
                                            fontWeight: 600,
                                            '&:hover': { color: '#3867d6' }
                                          }}
                                        >
                                          {value}
                                        </Link>
                                      )
                                    }
                                    
                                    // Regular string display
                                    return (
                                      <Typography variant="body2" sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        fontWeight: 500,
                                        color: '#344767'
                                      }}>
                                        {value}
                                      </Typography>
                                    )
                                  })()
                                ) : (
                                  <Box component="pre" sx={{ 
                                    fontSize: '0.875rem', 
                                    bgcolor: 'rgba(52, 71, 103, 0.04)', 
                                    borderRadius: 1, 
                                    p: 1, 
                                    overflow: 'auto',
                                    fontFamily: 'monospace',
                                    color: '#344767',
                                    border: 1,
                                    borderColor: 'rgba(52, 71, 103, 0.1)'
                                  }}>
                                    {JSON.stringify(value, null, 2)}
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}

        </Stack>

        {/* Action Buttons */}
        <Box sx={{
          display: 'flex',
          width: '100%',
          flexDirection: { xs: 'row', sm: 'row' },
          justifyContent: { xs: 'space-between', sm: 'flex-start' },
          alignItems: 'center',
          gap: 2,
          mt: 3
        }}>
          <ActionButton
            startIcon={<Edit />}
            onClick={() => onEdit(collateral)}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ minWidth: 90 }}
          >
            Sửa
          </ActionButton>
          <Box sx={{ flex: 1, display: { xs: 'block', sm: 'none' } }} />
          <ActionButton
            startIcon={<Delete />}
            onClick={() => onDelete(collateral)}
            color="error"
            variant="outlined"
            size="small"
            sx={{ minWidth: 90 }}
          >
            Xóa
          </ActionButton>
        </Box>
      </CardContent>
    </StyledCard>
  )
}
