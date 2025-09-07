'use client'

import React from 'react'
import { formatCurrency } from '@/lib/currency'
import { toVNDate } from '@/lib/date'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Chip
} from '@mui/material'
import { 
  Visibility,
  Edit,
  Delete,
  Assessment,
  Person,
  Business,
  AttachMoney
} from '@mui/icons-material'
import { StyledCard, ActionButton } from './StyledComponents'

interface CreditAssessmentCardProps {
  assessment: any
  onView: (assessment: any) => void
  onEdit: (assessment: any) => void
  onDelete: (assessment: any) => void
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return { label: 'Đã duyệt', color: 'success' as const }
    case 'rejected':
      return { label: 'Từ chối', color: 'error' as const }
    case 'draft':
      return { label: 'Bản nháp', color: 'default' as const }
    case 'in_review':
      return { label: 'Đang xem xét', color: 'warning' as const }
    default:
      return { label: status, color: 'default' as const }
  }
}

export default function CreditAssessmentCard({
  assessment,
  onView,
  onEdit,
  onDelete,
}: CreditAssessmentCardProps) {
  const statusConfig = getStatusConfig(assessment.status)
  
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
                  Thẩm định cho {assessment.customer?.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {toVNDate(assessment.created_at)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Stack spacing={1}>
          {/* Staff Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Person fontSize="small" />
            <Typography variant="body2">
              Nhân viên: {assessment.staff?.full_name || 'Chưa phân công'}
            </Typography>
          </Box>

          {/* Product Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Business fontSize="small" />
            <Typography variant="body2">
              Sản phẩm: {assessment.product?.product_name || 'Chưa chọn sản phẩm'}
            </Typography>
          </Box>

          {/* Department */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Business fontSize="small" />
            <Typography variant="body2">
              Phòng ban: {assessment.department || 'Chưa xác định'}
            </Typography>
          </Box>

          {/* Fee Amount */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AttachMoney fontSize="small" />
            <Typography variant="body2">
              Phí thẩm định: {formatCurrency(assessment.fee_amount)}
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Trạng thái:
            </Typography>
            <Chip 
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, borderWidth: 1.5 }}
            />
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 3, 
          pt: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'row', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'flex-end' }
        }}>
          <ActionButton
            size="small"
            startIcon={<Visibility />}
            onClick={() => onView(assessment)}
            variant="outlined"
            sx={{
              borderColor: '#00acc1',
              color: '#00acc1',
              '&:hover': {
                borderColor: '#00acc1',
                bgcolor: 'rgba(0, 172, 193, 0.04)'
              }
            }}
          >
            Xem
          </ActionButton>
          <ActionButton
            size="small"
            startIcon={<Edit />}
            onClick={() => onEdit(assessment)}
            variant="outlined"
            sx={{
              borderColor: '#344767',
              color: '#344767',
              '&:hover': {
                borderColor: '#344767',
                bgcolor: 'rgba(52, 71, 103, 0.04)'
              }
            }}
          >
            Sửa
          </ActionButton>
          <ActionButton
            size="small"
            startIcon={<Delete />}
            onClick={() => onDelete(assessment)}
            variant="outlined"
            sx={{
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.main',
                bgcolor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            Xóa
          </ActionButton>
        </Box>
      </CardContent>
    </StyledCard>
  )
}
