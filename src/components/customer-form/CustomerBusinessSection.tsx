import React from 'react';
import {
  Box,
  TextField,
  Typography
} from '@mui/material';
import { CustomerFormSectionProps } from './types';

interface CustomerBusinessSectionProps extends CustomerFormSectionProps {
  onDateChange: (field: 'registration_date', e: React.ChangeEvent<HTMLInputElement>) => void;
  validateDateFormat: (dateString: string) => boolean;
}

export default function CustomerBusinessSection({ 
  formData, 
  onChange, 
  onDateChange,
  validateDateFormat 
}: CustomerBusinessSectionProps) {
  if (formData.customer_type === 'individual') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" color="primary">
        Thông Tin Doanh Nghiệp
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          size="small"
          fullWidth
          required
          label="Số Đăng Ký Kinh Doanh"
          value={formData.business_registration_number || ''}
          onChange={(e) => onChange({ business_registration_number: e.target.value })}
          placeholder="Nhập số đăng ký kinh doanh"
        />
        
        <TextField
          size="small"
          fullWidth
          required
          label="Người Đại Diện Pháp Luật"
          value={formData.legal_representative || ''}
          onChange={(e) => onChange({ legal_representative: e.target.value })}
          placeholder="Nhập tên người đại diện"
        />
        
        <TextField
          size="small"
          fullWidth
          label="Số CIF Người Đại Diện"
          value={formData.legal_representative_cif_number || ''}
          onChange={(e) => onChange({ legal_representative_cif_number: e.target.value })}
          placeholder="Nhập số CIF của người đại diện"
        />
        
        <TextField
          size="small"
          fullWidth
          label="Ngành Nghề Kinh Doanh"
          value={formData.business_sector || ''}
          onChange={(e) => onChange({ business_sector: e.target.value })}
          placeholder="Nhập ngành nghề kinh doanh"
        />

        <TextField
          size="small"
          fullWidth
          label="Ngày Đăng Ký"
          value={formData.registration_date || ''}
          onChange={(e) => onDateChange('registration_date', e)}
          placeholder="dd/mm/yyyy"
          inputProps={{ maxLength: 10 }}
          error={formData.registration_date && !validateDateFormat(formData.registration_date)}
          helperText={formData.registration_date && !validateDateFormat(formData.registration_date) ? "Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy" : ""}
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
    </Box>
  );
}