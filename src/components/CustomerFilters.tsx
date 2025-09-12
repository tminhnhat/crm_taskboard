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
  Stack
} from '@mui/material'
import { FilterList, Sort, Clear } from '@mui/icons-material'
import { StyledCard } from './StyledComponents'

interface CustomerFiltersProps {
  filters: {
    customerType: string
    status: string
    search: string
    sortBy: string
  }
  onFiltersChange: (filters: { customerType: string; status: string; search: string; sortBy: string }) => void
}

export default function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
            Bộ lọc khách hàng
          </Typography>
        </Box>
        
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', md: 'center' }}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            label="Tìm kiếm"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Tìm kiếm khách hàng..."
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại khách hàng</InputLabel>
            <Select
              value={filters.customerType}
              onChange={(e) => updateFilter('customerType', e.target.value)}
              label="Loại khách hàng"
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="individual">Cá nhân</MenuItem>
              <MenuItem value="corporate">Doanh nghiệp</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status || 'active'}
              onChange={(e) => updateFilter('status', e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Sort sx={{ fontSize: 16 }} />
                Sắp xếp
              </Box>
            </InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              label="Sắp xếp"
            >
              <MenuItem value="created_at">Ngày tạo</MenuItem>
              <MenuItem value="full_name">Tên</MenuItem>
              <MenuItem value="account_number">Mã tài khoản</MenuItem>
              <MenuItem value="cif_number">Số CIF</MenuItem>
              <MenuItem value="customer_type">Loại khách hàng</MenuItem>
              <MenuItem value="status">Trạng thái</MenuItem>
              <MenuItem value="date_of_birth">Ngày sinh</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="text"
            size="small"
            startIcon={<Clear />}
            onClick={() => onFiltersChange({ customerType: '', status: '', search: '', sortBy: 'created_at' })}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Box>
    </StyledCard>
  )
}
