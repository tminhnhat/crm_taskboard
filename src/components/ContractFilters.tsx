'use client'

import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Button,
  Stack,
  Paper,
  InputAdornment
} from '@mui/material'
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material'

interface ContractFiltersProps {
  filters: {
    search: string
    status: string
    customerId: string
    productId: string
    signedBy: string
    dateRange: string
    creditRange: string
  }
  onFiltersChange: (filters: ContractFiltersProps['filters']) => void
  availableStatuses: string[]
  availableCustomers: Array<{ customer_id: string; full_name: string }>
  availableProducts: Array<{ product_id: string; product_name: string }>
  availableStaff: Array<{ staff_id: string; full_name: string }>
  totalCount: number
  filteredCount: number
}

export default function ContractFilters({
  filters,
  onFiltersChange,
  availableStatuses = [],
  availableCustomers = [],
  availableProducts = [],
  availableStaff = [],
  totalCount,
  filteredCount
}: ContractFiltersProps) {
  const handleFilterChange = (key: keyof ContractFiltersProps['filters'], value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      customerId: '',
      productId: '',
      signedBy: '',
      dateRange: '',
      creditRange: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <Paper elevation={0} sx={{ 
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      p: 3,
      mb: 3
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
          Bộ lọc hợp đồng
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
            sx={{ 
              ml: 'auto',
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.light' }
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(1, 1fr)', 
          md: 'repeat(2, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        }, 
        gap: 2, 
        mb: 3 
      }}>
        {/* Search Filter */}
        <Box>
          <TextField
            fullWidth
            size="small"
            label="Tìm kiếm hợp đồng"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Số hợp đồng, khách hàng..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Status Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status}
              label="Trạng thái"
              onChange={(e) => handleFilterChange('status', e.target.value as string)}
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              {availableStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'active' ? 'Hoạt động' : 
                   status === 'expired' ? 'Hết hạn' : 
                   status === 'cancelled' ? 'Đã hủy' : status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Customer Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Khách hàng</InputLabel>
            <Select
              value={filters.customerId}
              label="Khách hàng"
              onChange={(e) => handleFilterChange('customerId', e.target.value as string)}
            >
              <MenuItem value="">Tất cả khách hàng</MenuItem>
              {availableCustomers.map((customer) => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Product Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Sản phẩm</InputLabel>
            <Select
              value={filters.productId}
              label="Sản phẩm"
              onChange={(e) => handleFilterChange('productId', e.target.value as string)}
            >
              <MenuItem value="">Tất cả sản phẩm</MenuItem>
              {availableProducts.map((product) => (
                <MenuItem key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Staff Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Người ký</InputLabel>
            <Select
              value={filters.signedBy}
              label="Người ký"
              onChange={(e) => handleFilterChange('signedBy', e.target.value as string)}
            >
              <MenuItem value="">Tất cả nhân viên</MenuItem>
              {availableStaff.map((staff) => (
                <MenuItem key={staff.staff_id} value={staff.staff_id}>
                  {staff.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Date Range Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Khoảng thời gian</InputLabel>
            <Select
              value={filters.dateRange}
              label="Khoảng thời gian"
              onChange={(e) => handleFilterChange('dateRange', e.target.value as string)}
            >
              <MenuItem value="">Tất cả thời gian</MenuItem>
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="week">Tuần này</MenuItem>
              <MenuItem value="month">Tháng này</MenuItem>
              <MenuItem value="quarter">Quý này</MenuItem>
              <MenuItem value="year">Năm này</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Credit Range Filter */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel>Mức tín dụng</InputLabel>
            <Select
              value={filters.creditRange}
              label="Mức tín dụng"
              onChange={(e) => handleFilterChange('creditRange', e.target.value as string)}
            >
              <MenuItem value="">Tất cả mức</MenuItem>
              <MenuItem value="under100">Dưới 100 triệu</MenuItem>
              <MenuItem value="100to500">100 - 500 triệu</MenuItem>
              <MenuItem value="500to1b">500 triệu - 1 tỷ</MenuItem>
              <MenuItem value="over1b">Trên 1 tỷ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Bộ lọc đang áp dụng:
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {filters.search && (
              <Chip
                label={`Tìm kiếm: "${filters.search}"`}
                onDelete={() => handleFilterChange('search', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.status && (
              <Chip
                label={`Trạng thái: ${filters.status === 'active' ? 'Hoạt động' : 
                                    filters.status === 'expired' ? 'Hết hạn' : 
                                    filters.status === 'cancelled' ? 'Đã hủy' : filters.status}`}
                onDelete={() => handleFilterChange('status', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.customerId && (
              <Chip
                label={`KH: ${availableCustomers.find(c => c.customer_id === filters.customerId)?.full_name || filters.customerId}`}
                onDelete={() => handleFilterChange('customerId', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.productId && (
              <Chip
                label={`SP: ${availableProducts.find(p => p.product_id === filters.productId)?.product_name || filters.productId}`}
                onDelete={() => handleFilterChange('productId', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.signedBy && (
              <Chip
                label={`Người ký: ${availableStaff.find(s => s.staff_id === filters.signedBy)?.full_name || filters.signedBy}`}
                onDelete={() => handleFilterChange('signedBy', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.dateRange && (
              <Chip
                label={`Thời gian: ${
                  filters.dateRange === 'today' ? 'Hôm nay' :
                  filters.dateRange === 'week' ? 'Tuần này' :
                  filters.dateRange === 'month' ? 'Tháng này' :
                  filters.dateRange === 'quarter' ? 'Quý này' :
                  filters.dateRange === 'year' ? 'Năm này' : filters.dateRange
                }`}
                onDelete={() => handleFilterChange('dateRange', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.creditRange && (
              <Chip
                label={`Tín dụng: ${
                  filters.creditRange === 'under100' ? 'Dưới 100 triệu' :
                  filters.creditRange === '100to500' ? '100-500 triệu' :
                  filters.creditRange === '500to1b' ? '500 triệu - 1 tỷ' :
                  filters.creditRange === 'over1b' ? 'Trên 1 tỷ' : filters.creditRange
                }`}
                onDelete={() => handleFilterChange('creditRange', '')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}

      {/* Filter Summary */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filteredCount} / {totalCount} hợp đồng
        </Typography>
        {hasActiveFilters && (
          <Typography variant="body2" color="primary.main">
            Đang lọc kết quả
          </Typography>
        )}
      </Box>
    </Paper>
  )
}