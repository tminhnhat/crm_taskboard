'use client'

import React from 'react'
import { formatCurrency } from '@/lib/currency'
import { toVNDate } from '@/lib/date'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Divider
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'primary.light', 
              borderRadius: 2, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Assessment sx={{ fontSize: 24, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Thẩm định cho {assessment.customer?.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {toVNDate(assessment.created_at)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ActionButton
              size="small"
              startIcon={<Visibility />}
              onClick={() => onView(assessment)}
              color="info"
              variant="outlined"
            >
              Xem
            </ActionButton>
            <ActionButton
              size="small"
              startIcon={<Edit />}
              onClick={() => onEdit(assessment)}
              color="primary"
              variant="outlined"
            >
              Sửa
            </ActionButton>
            <ActionButton
              size="small"
              startIcon={<Delete />}
              onClick={() => onDelete(assessment)}
              color="error"
              variant="outlined"
            >
              Xóa
            </ActionButton>
          </Box>
        </Box>

        {/* Content Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                Nhân viên thẩm định
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium" color="text.primary">
              {assessment.staff?.full_name || 'Chưa phân công'}
            </Typography>
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Business sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                Sản phẩm
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium" color="text.primary">
              {assessment.product?.product_name || 'Chưa chọn sản phẩm'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Phòng ban
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="text.primary">
              {assessment.department || 'Chưa xác định'}
            </Typography>
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoney sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                Phí thẩm định
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold" color="primary.main">
              {formatCurrency(assessment.fee_amount)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status and Update Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Trạng thái:
            </Typography>
            <Chip 
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Cập nhật: {toVNDate(assessment.updated_at)}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  )
}
