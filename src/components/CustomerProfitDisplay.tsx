'use client'

import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  Stack,
  Divider
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  MonetizationOn,
  AttachMoney
} from '@mui/icons-material'
import { formatCurrency } from '@/lib/profitCalculation'
import { CustomerProfitData } from '@/hooks/useCustomerProfits'

interface CustomerProfitDisplayProps {
  profitData: CustomerProfitData | null
  compact?: boolean
}

export default function CustomerProfitDisplay({ 
  profitData, 
  compact = false 
}: CustomerProfitDisplayProps) {
  if (!profitData || profitData.totalProfit === 0) {
    return null
  }

  if (compact) {
    return (
      <Tooltip title="Tổng lợi nhuận ước tính">
        <Chip
          icon={<TrendingUp />}
          label={formatCurrency(profitData.totalProfit)}
          color={profitData.totalProfit > 0 ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Tooltip>
    )
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp fontSize="small" />
        Dự tính lợi nhuận
      </Typography>
      
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {/* Total Profit */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tổng lợi nhuận
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(profitData.totalProfit)}
          </Typography>
        </Box>

        <Divider />

        {/* Lending Profit */}
        {profitData.totalLendingProfit > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOn fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Lợi nhuận cho vay
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(profitData.totalLendingProfit)}
            </Typography>
          </Box>
        )}

        {/* Capital Mobilization Profit */}
        {profitData.totalCapitalMobilizationProfit > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance fontSize="small" color="info" />
              <Typography variant="body2" color="text.secondary">
                Lợi nhuận huy động vốn
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(profitData.totalCapitalMobilizationProfit)}
            </Typography>
          </Box>
        )}

        {/* Fee Profit */}
        {profitData.totalFeeProfit > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney fontSize="small" color="warning" />
              <Typography variant="body2" color="text.secondary">
                Lợi nhuận thu phí
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(profitData.totalFeeProfit)}
            </Typography>
          </Box>
        )}

        {/* Contract count */}
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Từ {profitData.contractCount} hợp đồng
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

/**
 * Compact profit badge for displaying in customer cards
 */
export function CustomerProfitBadge({ profitData }: { profitData: CustomerProfitData | null }) {
  if (!profitData || profitData.totalProfit === 0) {
    return null
  }

  return (
    <Chip
      icon={<TrendingUp />}
      label={formatCurrency(profitData.totalProfit)}
      color="success"
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: 'success.main'
        }
      }}
    />
  )
}
