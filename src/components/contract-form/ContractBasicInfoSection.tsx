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
  Divider
} from '@mui/material'
import { ContractSectionProps } from './types'

export default function ContractBasicInfoSection({
  formData,
  onChange,
  customers = [],
  products = [],
  staff = [],
  contractNumberError,
  onContractNumberBlur
}: ContractSectionProps) {
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

        {/* Product Selection */}
        <Autocomplete
          options={products}
          getOptionLabel={(product) => 
            `${product.product_name}${product.product_type ? ` (${product.product_type})` : ''}`
          }
          value={products.find(p => p.product_id?.toString() === formData.product_id) || null}
          onChange={(_, newValue) => {
            const syntheticEvent = {
              target: {
                name: 'product_id',
                value: newValue?.product_id?.toString() || ''
              }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sản Phẩm *"
              required
              error={!formData.product_id}
              helperText={!formData.product_id ? 'Vui lòng chọn sản phẩm' : ''}
            />
          )}
          isOptionEqualToValue={(option, value) => 
            option.product_id === value?.product_id
          }
        />

        {/* Contract Number */}
        <TextField
          name="contract_number"
          label="Số Hợp Đồng *"
          value={formData.contract_number}
          onChange={onChange}
          onBlur={onContractNumberBlur}
          required
          error={!!contractNumberError}
          helperText={contractNumberError || 'Nhập số hợp đồng duy nhất'}
          fullWidth
        />

        {/* Credit Limit */}
        <TextField
          name="contract_credit_limit"
          label="Hạn Mức Tín Dụng (VND)"
          type="number"
          value={formData.contract_credit_limit}
          onChange={onChange}
          inputProps={{ min: 0, step: 1000000 }}
          fullWidth
          helperText={formData.contract_credit_limit ? 
            new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(parseFloat(formData.contract_credit_limit) || 0) : 
            'Nhập hạn mức tín dụng'
          }
        />

        {/* Signed By */}
        <Autocomplete
          options={staff}
          getOptionLabel={(staffMember) => 
            `${staffMember.full_name}${staffMember.position ? ` (${staffMember.position})` : ''}`
          }
          value={staff.find(s => s.staff_id?.toString() === formData.signed_by) || null}
          onChange={(_, newValue) => {
            const syntheticEvent = {
              target: {
                name: 'signed_by',
                value: newValue?.staff_id?.toString() || ''
              }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Người Ký *"
              required
              error={!formData.signed_by}
              helperText={!formData.signed_by ? 'Vui lòng chọn người ký' : ''}
            />
          )}
          isOptionEqualToValue={(option, value) => 
            option.staff_id === value?.staff_id
          }
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
            <MenuItem value="draft">Bản Nháp</MenuItem>
            <MenuItem value="active">Đang Hoạt Động</MenuItem>
            <MenuItem value="expired">Hết Hạn</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}