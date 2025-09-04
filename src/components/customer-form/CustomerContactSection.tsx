import React from 'react';
import {
  Box,
  TextField
} from '@mui/material';
import { CustomerFormSectionProps } from './types';

export default function CustomerContactSection({ formData, onChange }: CustomerFormSectionProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <TextField
        size="small"
        fullWidth
        type="tel"
        label="Số Điện Thoại"
        value={formData.phone || ''}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Nhập số điện thoại"
      />

      <TextField
        size="small"
        fullWidth
        type="email"
        label="Email"
        value={formData.email || ''}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="Nhập địa chỉ email"
      />
    </Box>
  );
}