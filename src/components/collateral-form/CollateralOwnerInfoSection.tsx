import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Divider,
  Chip,
  InputAdornment,
  Paper
} from '@mui/material'
import { DateRange, Today, Person, Group, Schedule } from '@mui/icons-material'
import { CollateralSectionProps, CollateralOwnerInfo } from './types'
import { toVNDate } from '@/lib/date'

export default function CollateralOwnerInfoSection({
  formData,
  onChange,
  onFormDataChange,
  customers = []
}: CollateralSectionProps) {
  const ownerInfo: CollateralOwnerInfo = JSON.parse(formData.owner_info || '{}')

  const setTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const isoDate = `${year}-${month}-${day}`
    
    if (onFormDataChange) {
      onFormDataChange('valuation_date', isoDate)
    }
  }

  const setNextYearDate = () => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const year = nextYear.getFullYear()
    const month = String(nextYear.getMonth() + 1).padStart(2, '0')
    const day = String(nextYear.getDate()).padStart(2, '0')
    const isoDate = `${year}-${month}-${day}`
    
    if (onFormDataChange) {
      onFormDataChange('re_evaluation_date', isoDate)
    }
  }

  const [displayValues, setDisplayValues] = React.useState<{[key: string]: string}>({})

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Store the display value for this field
    setDisplayValues(prev => ({ ...prev, [name]: value }))
    
    // Allow user to type freely without validation interference
    // Only convert to ISO when we have a complete DD/MM/YYYY format
    if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      try {
        const [day, month, year] = value.split('/').map(Number)
        
        // Validate date parts
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
          // Create ISO date string
          const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          
          // Validate the resulting date
          const date = new Date(isoDate)
          if (date.toString() !== 'Invalid Date') {
            if (onFormDataChange) {
              onFormDataChange(name, isoDate)
            }
          }
        }
      } catch {
        // Invalid date - do nothing but keep the display value
      }
    } else {
      // For incomplete dates, clear the ISO value but keep the display
      if (onFormDataChange) {
        onFormDataChange(name, '')
      }
    }
  }

  // Get display value for a date field
  const getDisplayValue = (fieldName: string, isoValue: string) => {
    // If user is actively typing, show their input
    if (displayValues[fieldName] !== undefined) {
      return displayValues[fieldName]
    }
    // Otherwise show formatted ISO value
    return isoValue ? toVNDate(isoValue) : ''
  }

  const handleOwnerInfoChange = (field: string, value: string) => {
    const currentInfo = JSON.parse(formData.owner_info || '{}')
    const updatedInfo = { ...currentInfo, [field]: value }
    
    if (onFormDataChange) {
      onFormDataChange('owner_info', JSON.stringify(updatedInfo))
    }
  }

  const handleOwnerSelection = (type: 'primary' | 'spouse', customerId: string) => {
    const selectedCustomer = customers.find(c => c.customer_id.toString() === customerId)
    const currentInfo = JSON.parse(formData.owner_info || '{}')
    
    let updatedInfo = { ...currentInfo }
    
    if (type === 'primary') {
      updatedInfo = {
        ...updatedInfo,
        primary_owner_id: customerId,
        primary_owner_name: selectedCustomer?.full_name || '',
        id_number: selectedCustomer?.id_number || '',
        id_issue_date: selectedCustomer?.id_issue_date || '',
        id_issue_authority: selectedCustomer?.id_issue_authority || '',
        address: selectedCustomer?.address || '',
        phone: selectedCustomer?.phone || ''
      }
    } else {
      updatedInfo = {
        ...updatedInfo,
        spouse_id: customerId,
        spouse_name: selectedCustomer?.full_name || '',
        spouse_id_number: selectedCustomer?.id_number || '',
        spouse_id_issue_date: selectedCustomer?.id_issue_date || '',
        spouse_id_issue_authority: selectedCustomer?.id_issue_authority || '',
        spouse_address: selectedCustomer?.address || '',
        spouse_phone: selectedCustomer?.phone || ''
      }
    }
    
    if (onFormDataChange) {
      onFormDataChange('owner_info', JSON.stringify(updatedInfo))
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        Ngày Định Giá & Thông Tin Chủ Sở Hữu
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Date Fields Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Valuation Date */}
          <Box>
            <TextField
              name="valuation_date"
              label="Ngày Định Giá"
              value={getDisplayValue('valuation_date', formData.valuation_date || '')}
              onChange={handleDateChange}
              placeholder="dd/mm/yyyy"
              inputProps={{ maxLength: 10 }}
              error={!!(formData.valuation_date && !formData.valuation_date.match(/^\d{4}-\d{2}-\d{2}$/))}
              helperText={
                formData.valuation_date && !formData.valuation_date.match(/^\d{4}-\d{2}-\d{2}$/)
                  ? 'Vui lòng chọn ngày hợp lệ'
                  : 'Ngày thực hiện định giá tài sản'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange />
                  </InputAdornment>
                )
              }}
              fullWidth
            />
            <Box sx={{ mt: 1 }}>
              <Chip 
                label="Hôm nay"
                size="small"
                icon={<Today />}
                onClick={setTodayDate}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>

          {/* Re-evaluation Date */}
          <Box>
            <TextField
              name="re_evaluation_date"
              label="Ngày Đánh Giá Lại"
              value={getDisplayValue('re_evaluation_date', formData.re_evaluation_date || '')}
              onChange={handleDateChange}
              placeholder="dd/mm/yyyy"
              inputProps={{ maxLength: 10 }}
              error={!!(formData.re_evaluation_date && !formData.re_evaluation_date.match(/^\d{4}-\d{2}-\d{2}$/))}
              helperText={
                formData.re_evaluation_date && !formData.re_evaluation_date.match(/^\d{4}-\d{2}-\d{2}$/)
                  ? 'Vui lòng chọn ngày hợp lệ'
                  : 'Ngày cần đánh giá lại tài sản'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Schedule />
                  </InputAdornment>
                )
              }}
              fullWidth
            />
            <Box sx={{ mt: 1 }}>
              <Chip 
                label="+1 năm"
                size="small"
                icon={<Schedule />}
                onClick={setNextYearDate}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Group />
          Thông Tin Chủ Sở Hữu
        </Typography>

        {/* Owner Information Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Primary Owner */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              Chủ Sở Hữu Chính
            </Typography>
            
            <TextField
              select
              label="Chọn Khách Hàng"
              value={ownerInfo.primary_owner_id || ''}
              onChange={(e) => handleOwnerSelection('primary', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="">Chọn chủ sở hữu chính</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name}
                </option>
              ))}
            </TextField>

            {ownerInfo.primary_owner_id && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField value={ownerInfo.id_number || ''} label="Số CMND/CCCD" InputProps={{ readOnly: true }} fullWidth size="small" />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <TextField value={ownerInfo.id_issue_date || ''} label="Ngày cấp" InputProps={{ readOnly: true }} fullWidth size="small" />
                  <TextField value={ownerInfo.id_issue_authority || ''} label="Nơi cấp" InputProps={{ readOnly: true }} fullWidth size="small" />
                </Box>
                <TextField value={ownerInfo.address || ''} label="Địa chỉ" InputProps={{ readOnly: true }} fullWidth size="small" />
                <TextField value={ownerInfo.phone || ''} label="Số điện thoại" InputProps={{ readOnly: true }} fullWidth size="small" />
              </Box>
            )}
          </Paper>

          {/* Spouse Owner */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              Vợ/Chồng Đồng Sở Hữu
            </Typography>
            
            <TextField
              select
              label="Chọn Vợ/Chồng (nếu có)"
              value={ownerInfo.spouse_id || ''}
              onChange={(e) => handleOwnerSelection('spouse', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="">Chọn vợ/chồng (nếu có)</option>
              {customers
                .filter(customer => customer.customer_id.toString() !== ownerInfo.primary_owner_id)
                .map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.full_name}
                  </option>
                ))}
            </TextField>

            {ownerInfo.spouse_id && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField value={ownerInfo.spouse_id_number || ''} label="Số CMND/CCCD" InputProps={{ readOnly: true }} fullWidth size="small" />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <TextField value={ownerInfo.spouse_id_issue_date || ''} label="Ngày cấp" InputProps={{ readOnly: true }} fullWidth size="small" />
                  <TextField value={ownerInfo.spouse_id_issue_authority || ''} label="Nơi cấp" InputProps={{ readOnly: true }} fullWidth size="small" />
                </Box>
                <TextField value={ownerInfo.spouse_address || ''} label="Địa chỉ" InputProps={{ readOnly: true }} fullWidth size="small" />
                <TextField value={ownerInfo.spouse_phone || ''} label="Số điện thoại" InputProps={{ readOnly: true }} fullWidth size="small" />
              </Box>
            )}
          </Paper>
        </Box>

        {/* Additional Notes */}
        <TextField
          label="Thông Tin Bổ Sung"
          value={ownerInfo.notes || ''}
          onChange={(e) => handleOwnerInfoChange('notes', e.target.value)}
          placeholder="Thông tin bổ sung về chủ sở hữu (nếu có)"
          fullWidth
          multiline
          rows={2}
        />
      </Box>
    </Box>
  )
}