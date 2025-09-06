'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Box,
  Chip,
  Collapse,
  Divider
} from '@mui/material'

interface CollateralFiltersProps {
  onFiltersChange: (filters: {
    search: string
    type: string
    status: string
    customerId: string
    valueRange: string
    dateRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
}

export default function CollateralFilters({ 
  onFiltersChange, 
  availableCustomers
}: CollateralFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    customerId: '',
    valueRange: '',
    dateRange: ''
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      customerId: '',
      valueRange: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const collateralTypes = [
    { value: 'Real Estate', label: 'Bất Động Sản' },
    { value: 'Vehicle/Car', label: 'Xe Cộ' },
    { value: 'Savings Account', label: 'Tài Khoản Tiết Kiệm' },
    { value: 'Equipment', label: 'Thiết Bị' },
    { value: 'Jewelry', label: 'Trang Sức' },
    { value: 'Securities', label: 'Chứng Khoán' },
    { value: 'Land', label: 'Đất Đai' },
    { value: 'Building', label: 'Công Trình' },
    { value: 'Other', label: 'Khác' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'deactive', label: 'Không Hoạt Động' }
  ]

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Search and Toggle */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm tài sản theo mô tả, vị trí hoặc khách hàng..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
            >
              {isExpanded ? 'Ẩn Bộ Lọc' : 'Hiển Thị Bộ Lọc'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="error"
                onClick={clearFilters}
                size="small"
              >
                Xóa Tất Cả
              </Button>
            )}
          </Box>
        </Box>

        {/* Expanded Filters */}
        <Collapse in={isExpanded}>
          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
              {/* Collateral Type */}
              <FormControl fullWidth size="small">
                <InputLabel>Loại Tài Sản</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Loại Tài Sản"
                >
                  <MenuItem value="">Tất Cả Loại</MenuItem>
                  {collateralTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl fullWidth size="small">
                <InputLabel>Trạng Thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Trạng Thái"
                >
                  <MenuItem value="">Tất Cả Trạng Thái</MenuItem>
                  {statusOptions.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Customer */}
              <FormControl fullWidth size="small">
                <InputLabel>Khách Hàng</InputLabel>
                <Select
                  value={filters.customerId}
                  onChange={(e) => handleFilterChange('customerId', e.target.value)}
                  label="Khách Hàng"
                >
                  <MenuItem value="">Tất Cả Khách Hàng</MenuItem>
                  {availableCustomers.map(customer => (
                    <MenuItem key={customer.customer_id} value={customer.customer_id.toString()}>
                      {customer.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Value Range */}
              <FormControl fullWidth size="small">
                <InputLabel>Khoảng Giá Trị (VND)</InputLabel>
                <Select
                  value={filters.valueRange}
                  onChange={(e) => handleFilterChange('valueRange', e.target.value)}
                  label="Khoảng Giá Trị (VND)"
                >
                  <MenuItem value="">Tất Cả Giá Trị</MenuItem>
                  <MenuItem value="0-100000000">Dưới 100 Triệu</MenuItem>
                  <MenuItem value="100000000-500000000">100 Triệu - 500 Triệu</MenuItem>
                  <MenuItem value="500000000-1000000000">500 Triệu - 1 Tỷ</MenuItem>
                  <MenuItem value="1000000000-5000000000">1 Tỷ - 5 Tỷ</MenuItem>
                  <MenuItem value="5000000000+">Trên 5 Tỷ</MenuItem>
                </Select>
              </FormControl>

              {/* Date Range */}
              <FormControl fullWidth size="small">
                <InputLabel>Thời Gian Thẩm Định</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Thời Gian Thẩm Định"
                >
                  <MenuItem value="">Tất Cả Thời Gian</MenuItem>
                  <MenuItem value="month">Tháng Này</MenuItem>
                  <MenuItem value="quarter">Quý Này</MenuItem>
                  <MenuItem value="year">Năm Này</MenuItem>
                  <MenuItem value="older">Trên 1 Năm</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Collapse>
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.search && (
                <Chip
                  label={`Tìm kiếm: ${filters.search}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.type && (
                <Chip
                  label={`Loại: ${collateralTypes.find(t => t.value === filters.type)?.label}`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.status && (
                <Chip
                  label={`Trạng thái: ${statusOptions.find(s => s.value === filters.status)?.label}`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.customerId && (
                <Chip
                  label={`Khách hàng: ${availableCustomers.find(c => c.customer_id.toString() === filters.customerId)?.full_name}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.valueRange && (
                <Chip
                  label={`Giá trị: ${
                    filters.valueRange === '0-100000000' ? 'Dưới 100 Triệu' :
                    filters.valueRange === '100000000-500000000' ? '100 Triệu - 500 Triệu' :
                    filters.valueRange === '500000000-1000000000' ? '500 Triệu - 1 Tỷ' :
                    filters.valueRange === '1000000000-5000000000' ? '1 Tỷ - 5 Tỷ' :
                    filters.valueRange === '5000000000+' ? 'Trên 5 Tỷ' : filters.valueRange
                  }`}
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.dateRange && (
                <Chip
                  label={`Thời gian: ${
                    filters.dateRange === 'month' ? 'Tháng này' :
                    filters.dateRange === 'quarter' ? 'Quý này' :
                    filters.dateRange === 'year' ? 'Năm này' :
                    filters.dateRange === 'older' ? 'Trên 1 năm' : filters.dateRange
                  }`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
