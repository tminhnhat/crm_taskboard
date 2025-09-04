'use client'

import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Chip,
  Divider,
  InputAdornment
} from '@mui/material'
import { FilterList, Search, Clear } from '@mui/icons-material'
import { StyledCard } from './StyledComponents'

interface ProductFiltersProps {
  filters: {
    search: string
    status: string
    productType: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    productType: string
  }) => void
  availableProductTypes: string[]
  totalCount: number
  filteredCount: number
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  availableProductTypes,
  totalCount,
  filteredCount
}: ProductFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      productType: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.productType

  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
              Bộ lọc sản phẩm
            </Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{ color: 'text.secondary' }}
            >
              Xóa tất cả
            </Button>
          )}
        </Box>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          sx={{ mb: 2 }}
        >
          <TextField
            size="small"
            label="Tìm kiếm sản phẩm"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả..."
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Tạm ngưng</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại sản phẩm</InputLabel>
            <Select
              value={filters.productType}
              onChange={(e) => handleFilterChange('productType', e.target.value)}
              label="Loại sản phẩm"
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              {availableProductTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Results Summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredCount} trong tổng số {totalCount} sản phẩm
            {hasActiveFilters && (
              <Typography component="span" color="primary.main" sx={{ ml: 0.5 }}>
                (đã lọc)
              </Typography>
            )}
          </Typography>
          
          {hasActiveFilters && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                Bộ lọc:
              </Typography>
              {filters.search && (
                <Chip
                  size="small"
                  label={`Tìm kiếm: ${filters.search}`}
                  variant="outlined"
                  color="primary"
                  onDelete={() => handleFilterChange('search', '')}
                />
              )}
              {filters.status && (
                <Chip
                  size="small"
                  label={`Trạng thái: ${filters.status === 'active' ? 'Hoạt động' : 
                                      filters.status === 'inactive' ? 'Tạm ngưng' : filters.status}`}
                  variant="outlined"
                  color="success"
                  onDelete={() => handleFilterChange('status', '')}
                />
              )}
              {filters.productType && (
                <Chip
                  size="small"
                  label={`Loại: ${filters.productType}`}
                  variant="outlined"
                  color="secondary"
                  onDelete={() => handleFilterChange('productType', '')}
                />
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </StyledCard>
  )
}
