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
import { CustomerFormSectionProps } from './types';

interface CustomerPersonalInfoSectionProps extends CustomerFormSectionProps {
  onDateChange: (field: 'date_of_birth' | 'id_issue_date', e: React.ChangeEvent<HTMLInputElement>) => void;
  validateDateFormat: (dateString: string) => boolean;
}

export default function CustomerPersonalInfoSection({ 
  formData, 
  onChange, 
  onDateChange,
  validateDateFormat 
}: CustomerPersonalInfoSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Section Header */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
        Thông Tin Cá Nhân
      </Typography>
      
      {/* Basic Personal Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <TextField
          size="small"
          fullWidth
          label="Ngày Sinh"
          value={formData.date_of_birth || ''}
          onChange={(e) => onDateChange('date_of_birth', e as React.ChangeEvent<HTMLInputElement>)}
          placeholder="dd/mm/yyyy"
          inputProps={{ maxLength: 10 }}
          error={!!(formData.date_of_birth && !validateDateFormat(formData.date_of_birth))}
          helperText={formData.date_of_birth && !validateDateFormat(formData.date_of_birth) ? "Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy" : ""}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Giới Tính</InputLabel>
          <Select
            value={formData.gender || ''}
            label="Giới Tính"
            onChange={(e) => onChange({ gender: e.target.value })}
          >
            <MenuItem value="">Chọn giới tính</MenuItem>
            <MenuItem value="male">Nam</MenuItem>
            <MenuItem value="female">Nữ</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          fullWidth
          label="Số CCCD"
          value={formData.id_number || ''}
          onChange={(e) => onChange({ id_number: e.target.value })}
          placeholder="Nhập số CCCD"
        />
      </Box>

      {/* ID Information */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          size="small"
          fullWidth
          label="Ngày Cấp CCCD"
          value={formData.id_issue_date || ''}
          onChange={(e) => onDateChange('id_issue_date', e as React.ChangeEvent<HTMLInputElement>)}
          placeholder="dd/mm/yyyy"
          inputProps={{ maxLength: 10 }}
          error={!!(formData.id_issue_date && !validateDateFormat(formData.id_issue_date))}
          helperText={formData.id_issue_date && !validateDateFormat(formData.id_issue_date) ? "Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy" : ""}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Nơi Cấp</InputLabel>
            <Select
              value={['Cục CS QLHC về TTXH', 'Bộ Công An'].includes(formData.id_issue_authority || '') ? (formData.id_issue_authority || '') : ''}
              label="Nơi Cấp"
              onChange={(e) => {
                if (e.target.value) {
                  onChange({ id_issue_authority: e.target.value });
                }
              }}
            >
              <MenuItem value="">Chọn nhanh</MenuItem>
              <MenuItem value="Cục CS QLHC về TTXH">Cục CS QLHC về TTXH</MenuItem>
              <MenuItem value="Bộ Công An">Bộ Công An</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            fullWidth
            label="Hoặc nhập nơi cấp khác"
            value={formData.id_issue_authority || ''}
            onChange={(e) => onChange({ id_issue_authority: e.target.value })}
            placeholder="Nhập nơi cấp CCCD"
          />
        </Box>
      </Box>

      {/* Business Registration for Individual */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          size="small"
          fullWidth
          label="Số Đăng Ký Kinh Doanh"
          value={formData.business_registration_number || ''}
          onChange={(e) => onChange({ business_registration_number: e.target.value })}
          placeholder="Nhập số đăng ký kinh doanh (nếu có)"
        />

        <TextField
          size="small"
          fullWidth
          label="Nơi Cấp ĐKKD"
          value={formData.business_registration_authority || ''}
          onChange={(e) => onChange({ business_registration_authority: e.target.value })}
          placeholder="Nhập nơi cấp đăng ký kinh doanh"
        />
      </Box>

      {/* Address and Hobby */}
      <TextField
        size="small"
        fullWidth
        multiline
        rows={2}
        label="Địa Chỉ"
        value={formData.address || ''}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="Nhập địa chỉ"
      />

      <TextField
        size="small"
        fullWidth
        multiline
        rows={2}
        label="Sở Thích"
        value={formData.hobby || ''}
        onChange={(e) => onChange({ hobby: e.target.value })}
        placeholder="VD: Đọc sách, du lịch, thể thao, âm nhạc..."
      />
    </Box>
  );
}