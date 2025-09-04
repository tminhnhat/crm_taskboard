'use client'

import React from 'react'
import { formatCurrency } from '@/lib/currency'
import { toVNDate } from '@/lib/date'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  Button
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
    <Card elevation={0} sx={{
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 4px 12px rgba(52, 71, 103, 0.1)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'rgba(52, 71, 103, 0.1)', 
              borderRadius: 2, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Assessment sx={{ fontSize: 24, color: '#344767' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#344767', mb: 0.5 }}>
                Thẩm định cho {assessment.customer?.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {toVNDate(assessment.created_at)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => onView(assessment)}
              variant="outlined"
              sx={{
                borderColor: '#00acc1',
                color: '#00acc1',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#00acc1',
                  bgcolor: 'rgba(0, 172, 193, 0.04)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Xem
            </Button>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => onEdit(assessment)}
              variant="outlined"
              sx={{
                borderColor: '#344767',
                color: '#344767',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#344767',
                  bgcolor: 'rgba(52, 71, 103, 0.04)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Sửa
            </Button>
            <Button
              size="small"
              startIcon={<Delete />}
              onClick={() => onDelete(assessment)}
              variant="outlined"
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'error.main',
                  bgcolor: 'rgba(211, 47, 47, 0.04)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Xóa
            </Button>
          </Box>
        </Box>

        {/* Content Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3, 
          mb: 3 
        }}>
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(248, 250, 252, 0.8)', 
            borderRadius: 2,
            border: 1,
            borderColor: 'rgba(52, 71, 103, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Person sx={{ color: '#344767', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Nhân viên thẩm định
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="600" sx={{ color: '#344767' }}>
              {assessment.staff?.full_name || 'Chưa phân công'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(248, 250, 252, 0.8)', 
            borderRadius: 2,
            border: 1,
            borderColor: 'rgba(52, 71, 103, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Business sx={{ color: '#344767', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Sản phẩm
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="600" sx={{ color: '#344767' }}>
              {assessment.product?.product_name || 'Chưa chọn sản phẩm'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(248, 250, 252, 0.8)', 
            borderRadius: 2,
            border: 1,
            borderColor: 'rgba(52, 71, 103, 0.1)'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              Phòng ban
            </Typography>
            <Typography variant="body1" fontWeight="600" sx={{ color: '#344767' }}>
              {assessment.department || 'Chưa xác định'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(52, 71, 103, 0.04)', 
            borderRadius: 2,
            border: 1,
            borderColor: 'rgba(52, 71, 103, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <AttachMoney sx={{ color: '#344767', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Phí thẩm định
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="700" sx={{ color: '#344767' }}>
              {formatCurrency(assessment.fee_amount)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(52, 71, 103, 0.1)' }} />

        {/* Status and Update Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Trạng thái:
            </Typography>
            <Chip 
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
              variant="outlined"
              sx={{ 
                fontWeight: 600,
                borderWidth: 1.5
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Cập nhật: {toVNDate(assessment.updated_at)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
