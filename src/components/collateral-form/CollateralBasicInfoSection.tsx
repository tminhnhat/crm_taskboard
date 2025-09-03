import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
  Divider,
  InputAdornment
} from '@mui/material'
import { AccountBalance, AttachMoney } from '@mui/icons-material'
import { CollateralSectionProps } from './types'

const collateralTypeOptions = [
  { value: 'real_estate', label: 'Bất động sản' },
  { value: 'vehicle', label: 'Phương tiện' },
  { value: 'savings', label: 'Sổ tiết kiệm' },
  { value: 'stocks', label: 'Cổ phiếu' },
  { value: 'bonds', label: 'Trái phiếu' },
  { value: 'machinery', label: 'Máy móc thiết bị' },
  { value: 'other', label: 'Khác' }
]

const statusOptions = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'released', label: 'Đã giải chấp' }
]

export default function CollateralBasicInfoSection({
  formData,
  onChange,
  customers = []
}: CollateralSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        Thông Tin Cơ Bản
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Customer Selection */}
        <Autocomplete
          options={customers}
          getOptionLabel={(customer) => customer.full_name || ''}
          value={customers.find(c => c.customer_id?.toString() === formData.customer_id) || null}
          onChange={(_, newValue) => {
            const syntheticEvent = {
              target: {
                name: 'customer_id',
                value: newValue?.customer_id?.toString() || ''
              }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Khách Hàng *"
              required
              error={!formData.customer_id}
              helperText={!formData.customer_id ? 'Vui lòng chọn khách hàng' : ''}
            />
          )}
          isOptionEqualToValue={(option, value) => 
            option.customer_id === value?.customer_id
          }
        />

        {/* Collateral Type */}
        <FormControl fullWidth required error={!formData.collateral_type}>
          <InputLabel>Loại Tài Sản *</InputLabel>
          <Select
            name="collateral_type"
            value={formData.collateral_type}
            onChange={(e) => onChange(e as any)}
            label="Loại Tài Sản *"
            startAdornment={
              <InputAdornment position="start">
                <AccountBalance />
              </InputAdornment>
            }
          >
            {collateralTypeOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {!formData.collateral_type && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
              Vui lòng chọn loại tài sản
            </Typography>
          )}
        </FormControl>

        {/* Value */}
        <TextField
          name="value"
          label="Giá Trị (VND) *"
          type="number"
          value={formData.value}
          onChange={onChange}
          required
          inputProps={{ min: 0, step: 1000000 }}
          error={!formData.value}
          helperText={formData.value ? 
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(parseFloat(formData.value)) : 
            'Nhập giá trị tài sản'
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoney />
              </InputAdornment>
            )
          }}
          fullWidth
        />

        {/* Status */}
        <FormControl fullWidth>
          <InputLabel>Trạng Thái</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={(e) => onChange(e as any)}
            label="Trạng Thái"
          >
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 3, display: 'grid', gap: 2 }}>
        {/* Location */}
        <TextField
          name="location"
          label="Địa Điểm"
          value={formData.location}
          onChange={onChange}
          placeholder="Địa chỉ/vị trí của tài sản"
          fullWidth
          multiline
          rows={2}
        />

        {/* Description */}
        <TextField
          name="description"
          label="Mô Tả"
          value={formData.description}
          onChange={onChange}
          placeholder="Mô tả chi tiết về tài sản"
          fullWidth
          multiline
          rows={3}
        />
      </Box>
    </Box>
  )
}