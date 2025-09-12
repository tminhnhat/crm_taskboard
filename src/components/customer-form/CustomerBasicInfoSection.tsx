import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider
} from '@mui/material';
import { CustomerType } from '@/lib/supabase';
import { CustomerFormSectionProps } from './types';

export default function CustomerBasicInfoSection({ formData, onChange }: CustomerFormSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Customer Type and Status */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <FormControl size="small" required>
          <InputLabel>Loại Khách Hàng</InputLabel>
          <Select
            value={formData.customer_type || 'individual'}
            label="Loại Khách Hàng"
            onChange={(e) => {
              const newType = e.target.value as CustomerType;
              onChange({
                customer_type: newType
              });
            }}
          >
            <MenuItem value="individual">Cá Nhân</MenuItem>
            <MenuItem value="corporate">Doanh Nghiệp</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Trạng Thái</InputLabel>
          <Select
            value={formData.status || 'active'}
            label="Trạng Thái"
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <MenuItem value="active">Đang Hoạt Động</MenuItem>
            <MenuItem value="inactive">Không Hoạt Động</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Name Fields */}
      <TextField
        size="small"
        fullWidth
        required
        label={formData.customer_type === 'corporate' ? 'Người Đại Diện' : 'Họ Và Tên'}
        value={formData.full_name || ''}
        onChange={(e) => onChange({ full_name: e.target.value })}
        placeholder="Nhập họ và tên"
      />

      {/* Corporate Company Name */}
      {formData.customer_type !== 'individual' && (
        <TextField
          size="small"
          fullWidth
          required
          label="Tên Doanh Nghiệp"
          value={formData.company_name || ''}
          onChange={(e) => onChange({ company_name: e.target.value })}
          placeholder="Nhập tên doanh nghiệp"
        />
      )}
    </Box>
  );
}