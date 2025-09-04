import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Divider,
  InputAdornment
} from '@mui/material';
import { CustomerFormSectionProps } from './types';

export default function CustomerAccountSection({ formData, onChange }: CustomerFormSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Section Header */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
        Thông Tin Tài Khoản
      </Typography>

      {/* Account Number */}
      <TextField
        size="small"
        fullWidth
        label="Mã Tài Khoản"
        value={formData.account_number || ''}
        onChange={(e) => onChange({ account_number: e.target.value })}
        placeholder="Nhập số tài khoản Vietinbank (VD: 123456789)"
        helperText="💡 Số tài khoản này sẽ được sử dụng tự động khi tạo mã QR thanh toán cho khách hàng"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="primary">
                📱 QR
              </Typography>
            </InputAdornment>
          ),
        }}
      />

      {/* CIF Number */}
      <TextField
        size="small"
        fullWidth
        label="Số CIF"
        value={formData.cif_number || ''}
        onChange={(e) => onChange({ cif_number: e.target.value })}
        placeholder="Nhập số CIF (Customer Information File)"
      />
    </Box>
  );
}