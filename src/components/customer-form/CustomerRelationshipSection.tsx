import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { Customer } from '@/lib/supabase';
import { CustomerFormSectionProps } from './types';

interface CustomerRelationshipSectionProps extends CustomerFormSectionProps {
  customer?: Customer | null;
}

export default function CustomerRelationshipSection({ 
  formData, 
  onChange, 
  customers = [],
  customer 
}: CustomerRelationshipSectionProps) {
  const selectedSpouse = customers.find(c => c.customer_id === formData.spouse_id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Section Header */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
        Mối Quan Hệ (Vợ/Chồng, Cha/Mẹ, Con, Bạn bè...)
      </Typography>

      {/* Relationship Selection */}
      <FormControl size="small" fullWidth>
        <InputLabel>Chọn mối quan hệ</InputLabel>
        <Select
          value={formData.spouse_id || ''}
          label="Chọn mối quan hệ"
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const selected = customers.find(c => c.customer_id === selectedId);
            onChange({
              spouse_id: selectedId || undefined,
              spouse_info: selected ? {
                full_name: selected.full_name,
                id_number: selected.id_number,
                id_issue_date: selected.id_issue_date,
                id_issue_authority: selected.id_issue_authority,
                address: selected.address,
                phone: selected.phone
              } : {},
              relationship: selected ? selected.full_name : '',
            });
          }}
        >
          <MenuItem value="">Không có mối quan hệ</MenuItem>
          {customers
            .filter(c => !customer || c.customer_id !== customer.customer_id)
            .map(c => (
              <MenuItem key={c.customer_id} value={c.customer_id}>
                {c.full_name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Selected Spouse Information Display */}
      {selectedSpouse && formData.spouse_info && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 1, 
          border: 1, 
          borderColor: 'divider' 
        }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
            Thông tin người liên quan: {selectedSpouse.full_name}
          </Typography>
          
          <Stack spacing={1}>
            <TextField
              size="small"
              fullWidth
              label="Số CMND/CCCD"
              value={formData.spouse_info.id_number || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField
                size="small"
                label="Ngày cấp"
                value={formData.spouse_info.id_issue_date || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
              
              <TextField
                size="small"
                label="Nơi cấp"
                value={formData.spouse_info.id_issue_authority || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Box>
            
            <TextField
              size="small"
              fullWidth
              label="Địa chỉ"
              value={formData.spouse_info.address || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
            
            <TextField
              size="small"
              fullWidth
              label="Số điện thoại"
              value={formData.spouse_info.phone || ''}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      {/* Other Relationship Input */}
      <TextField
        size="small"
        fullWidth
        label="Mối quan hệ khác (tùy chọn)"
        value={formData.relationship_other || ''}
        onChange={(e) => onChange({ relationship_other: e.target.value })}
        placeholder="Nhập mối quan hệ khác nếu không chọn từ danh sách"
        helperText="Có thể để trống nếu đã chọn từ danh sách bên trên"
      />
    </Box>
  );
}