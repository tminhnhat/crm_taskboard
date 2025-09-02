import React from 'react';
import { Product } from '@/lib/supabase'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Divider
} from '@mui/material'
import { 
  Inventory,
  Tag,
  Description,
  MonetizationOn,
  Percent,
  Schedule,
  CurrencyExchange,
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

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
  onStatusChange: (productId: number, status: string) => void
}

const getProductTypeColor = (productType: string) => {
  const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
    'Savings Account': 'primary',
    'Current Account': 'secondary',
    'Term Deposit': 'success',
    'Personal Loan': 'warning',
    'Home Loan': 'error',
    'Auto Loan': 'warning',
    'Business Loan': 'primary',
    'Credit Card': 'secondary',
    'Debit Card': 'info',
    'Life Insurance': 'success',
    'Health Insurance': 'success',
    'Property Insurance': 'info',
    'Auto Insurance': 'info',
    'Investment': 'secondary',
    'Foreign Exchange': 'warning',
    'Money Transfer': 'primary',
    'Cash Management': 'info',
    'Trade Finance': 'secondary',
    'Payment Services': 'primary',
    'Safe Deposit Box': 'info',
    'Financial Advisory': 'secondary'
  }
  return colorMap[productType] || 'default'
}

export default function ProductCard({ product, onEdit, onDelete, onStatusChange }: ProductCardProps) {
  const formatCurrency = (amount: number, currency = 'VND') => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  return (
    <StyledCard>
      <CardContent>
        <CardHeader>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Inventory color="primary" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  {product.product_name}
                </Typography>
                {product.product_type && (
                  <Chip 
                    icon={<Tag />}
                    label={product.product_type}
                    color={getProductTypeColor(product.product_type) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip 
                label={product.status === 'active' ? 'Hoạt Động' : 'Tạm Ngưng'}
                color={getStatusColor(product.status) as any}
                size="small"
              />
            </Stack>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
              gap: 2, 
              mb: 2 
            }}>
              {product.interest_rate && (
                <InfoBox>
                  <Percent fontSize="small" color="success" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary' }}>Lãi suất:</Box>
                    <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'success.main' }}>
                      {product.interest_rate}%/năm
                    </Box>
                  </Typography>
                </InfoBox>
              )}
              
              {product.terms_months && (
                <InfoBox>
                  <Schedule fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary' }}>Thời hạn:</Box>
                    <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'primary.main' }}>
                      {product.terms_months} tháng
                    </Box>
                  </Typography>
                </InfoBox>
              )}
              
              {(product.minimum_amount || product.maximum_amount) && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <InfoBox>
                    <MonetizationOn fontSize="small" color="secondary" />
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary' }}>Hạn mức:</Box>
                      <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'secondary.main' }}>
                        {product.minimum_amount && formatCurrency(product.minimum_amount, product.currency || 'VND')}
                        {product.minimum_amount && product.maximum_amount && ' - '}
                        {product.maximum_amount && formatCurrency(product.maximum_amount, product.currency || 'VND')}
                      </Box>
                    </Typography>
                  </InfoBox>
                </Box>
              )}
              
              {product.fees && (
                <InfoBox>
                  <CurrencyExchange fontSize="small" color="warning" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'text.secondary' }}>Phí:</Box>
                    <Box component="span" sx={{ ml: 1, fontWeight: 600, color: 'warning.main' }}>
                      {formatCurrency(product.fees, product.currency || 'VND')}
                    </Box>
                  </Typography>
                </InfoBox>
              )}
            </Box>
            
            <Stack spacing={2}>
              {product.description && (
                <Box>
                  <InfoBox>
                    <Description fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.description}
                    </Typography>
                  </InfoBox>
                </Box>
              )}

              {product.requirements && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>
                    Điều kiện:
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {product.requirements}
                  </Typography>
                </Box>
              )}

              {product.benefits && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>
                    Ưu đãi:
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {product.benefits}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
          
          <Box sx={{ ml: 2, minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <StyledSelect
                value={product.status}
                onChange={(e) => onStatusChange(product.product_id, e.target.value as string)}
              >
                <MenuItem value="active">Hoạt Động</MenuItem>
                <MenuItem value="inactive">Tạm Ngưng</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
        </CardHeader>
        
        <Divider sx={{ my: 2 }} />
        
        <CardActions>
          <ActionButton
            startIcon={<Edit />}
            onClick={() => onEdit(product)}
            color="primary"
            variant="outlined"
            size="small"
          >
            Chỉnh Sửa
          </ActionButton>
          <ActionButton
            startIcon={<DeleteOutline />}
            onClick={() => onDelete(product.product_id)}
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
