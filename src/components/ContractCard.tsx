import React from 'react';
import { Contract } from '@/lib/supabase'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Chip
} from '@mui/material'
import { 
  Description,
  Person,
  Inventory,
  MonetizationOn,
  CalendarToday,
  Badge,
  Schedule,
  Edit,
  DeleteOutline
} from '@mui/icons-material'
import {
  StyledCard,
  ActionButton,
  InfoBox,
  CardHeader,
  CardActions,
  StyledSelect
} from './StyledComponents'

interface ContractCardProps {
  contract: Contract
  onEdit: (contract: Contract) => void
  onDelete: (contractId: number) => void
  onStatusChange: (contractId: number, status: string) => void
}

export default function ContractCard({ contract, onEdit, onDelete, onStatusChange }: ContractCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return 'N/A'
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  const isExpired = () => {
    if (!contract.end_date) return false
    
    // Parse end date safely
    const dateMatch = contract.end_date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
      return endDate < today
    }
    
    return new Date(contract.end_date) < new Date()
  }

  const getDaysRemaining = () => {
    if (!contract.end_date) return null
    
    // Parse end date safely
    const dateMatch = contract.end_date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for consistent calculation
      endDate.setHours(0, 0, 0, 0)
      const diffTime = endDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    
    // Fallback for other date formats
    const endDate = new Date(contract.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'expired': return 'error'
      case 'draft': return 'default'
      default: return 'default'
    }
  }

  const daysRemaining = getDaysRemaining()

  return (
    <StyledCard>
      <CardContent>
        <CardHeader>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Description color="primary" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {contract.contract_number}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(contract.contract_credit_limit)}
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                color={getStatusColor(contract.status) as any}
                size="small"
              />
              
              {isExpired() && contract.status === 'active' && (
                <Chip 
                  label="Hết Hạn"
                  color="error"
                  size="small"
                />
              )}
              
              {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && contract.status === 'active' && (
                <Chip 
                  icon={<Schedule />}
                  label={`Còn ${daysRemaining} ngày`}
                  color="warning"
                  size="small"
                />
              )}
            </Stack>
            
            <Stack spacing={1}>
              {contract.customer && (
                <InfoBox>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    Khách hàng: {contract.customer.full_name}
                  </Typography>
                </InfoBox>
              )}
              
              {contract.product && (
                <InfoBox>
                  <Inventory fontSize="small" />
                  <Typography variant="body2">
                    Sản phẩm: {contract.product.product_name}
                  </Typography>
                </InfoBox>
              )}
              
              <InfoBox>
                <MonetizationOn fontSize="small" color="success" />
                <Typography variant="body2">
                  Hạn mức: {formatCurrency(contract.contract_credit_limit)}
                </Typography>
              </InfoBox>
              
              <InfoBox>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  Từ: {formatDate(contract.start_date)} - Đến: {formatDate(contract.end_date)}
                </Typography>
              </InfoBox>
              
              {/* Đã gỡ bỏ hiển thị contract id */}
            </Stack>
          </Box>
          
          {/* Đã gỡ bỏ contract status input field */}
        </CardHeader>
        
        <CardActions>
          <ActionButton
            startIcon={<Edit />}
            onClick={() => onEdit(contract)}
            color="primary"
            variant="outlined"
            size="small"
          >
            Sửa
          </ActionButton>
          <ActionButton
            startIcon={<DeleteOutline />}
            onClick={() => onDelete(contract.contract_id)}
            color="error"
            variant="outlined"
            size="small"
          >
            Xóa
          </ActionButton>
        </CardActions>
      </CardContent>
    </StyledCard>
  )
}


