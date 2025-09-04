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

interface StaffFiltersProps {
  filters: {
    search: string
    status: string
    department: string
    position: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    department: string
    position: string
  }) => void
  availableDepartments: string[]
  availablePositions: string[]
  totalCount: number
  filteredCount: number
}

export default function StaffFilters({
  filters,
  onFiltersChange,
  availableDepartments,
  availablePositions,
  totalCount,
  filteredCount
}: StaffFiltersProps) {
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
      department: '',
      position: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.department || filters.position

  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
              Bộ lọc nhân viên
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
          direction={{ xs: 'column', lg: 'row' }} 
          spacing={2} 
          sx={{ mb: 2 }}
        >
          <TextField
            size="small"
            label="Tìm kiếm nhân viên"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc email..."
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Phòng ban</InputLabel>
            <Select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              label="Phòng ban"
            >
              <MenuItem value="">Tất cả phòng ban</MenuItem>
              {availableDepartments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chức vụ</InputLabel>
            <Select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              label="Chức vụ"
            >
              <MenuItem value="">Tất cả chức vụ</MenuItem>
              {availablePositions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Results Summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredCount} trong tổng số {totalCount} nhân viên
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
                  label={`Trạng thái: ${filters.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}`}
                  variant="outlined"
                  color="success"
                  onDelete={() => handleFilterChange('status', '')}
                />
              )}
              {filters.department && (
                <Chip
                  size="small"
                  label={`Phòng ban: ${filters.department}`}
                  variant="outlined"
                  color="secondary"
                  onDelete={() => handleFilterChange('department', '')}
                />
              )}
              {filters.position && (
                <Chip
                  size="small"
                  label={`Chức vụ: ${filters.position}`}
                  variant="outlined"
                  color="info"
                  onDelete={() => handleFilterChange('position', '')}
                />
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </StyledCard>
  )
}
