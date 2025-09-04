import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Divider,
  Chip,
  InputAdornment
} from '@mui/material'
import { DateRange, Today } from '@mui/icons-material'
import { ContractSectionProps } from './types'

export default function ContractDatesSection({
  formData,
  onDateChange,
  validateDateFormat
}: ContractSectionProps) {
  const setTodayDate = (field: 'start_date' | 'end_date') => {
    const today = new Date()
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    
    if (onDateChange) {
      const syntheticEvent = {
        target: { value: formattedDate }
      } as React.ChangeEvent<HTMLInputElement>
      onDateChange(field, syntheticEvent)
    }
  }

  const setNextYearDate = () => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const formattedDate = `${nextYear.getDate().toString().padStart(2, '0')}/${(nextYear.getMonth() + 1).toString().padStart(2, '0')}/${nextYear.getFullYear()}`
    
    if (onDateChange) {
      const syntheticEvent = {
        target: { value: formattedDate }
      } as React.ChangeEvent<HTMLInputElement>
      onDateChange('end_date', syntheticEvent)
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        Thời Hạn Hợp Đồng
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Start Date */}
        <Box>
          <TextField
            label="Ngày Bắt Đầu"
            value={formData.start_date}
            onChange={onDateChange ? (e) => onDateChange('start_date', e as React.ChangeEvent<HTMLInputElement>) : undefined}
            placeholder="dd/mm/yyyy"
            inputProps={{ maxLength: 10 }}
            error={formData.start_date ? !validateDateFormat?.(formData.start_date) : false}
            helperText={
              formData.start_date && !validateDateFormat?.(formData.start_date) 
                ? 'Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy' 
                : 'Ngày bắt đầu hiệu lực hợp đồng'
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
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip 
              label="Hôm nay"
              size="small"
              icon={<Today />}
              onClick={() => setTodayDate('start_date')}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        {/* End Date */}
        <Box>
          <TextField
            label="Ngày Kết Thúc"
            value={formData.end_date}
            onChange={onDateChange ? (e) => onDateChange('end_date', e as React.ChangeEvent<HTMLInputElement>) : undefined}
            placeholder="dd/mm/yyyy"
            inputProps={{ maxLength: 10 }}
            error={formData.end_date ? !validateDateFormat?.(formData.end_date) : false}
            helperText={
              formData.end_date && !validateDateFormat?.(formData.end_date) 
                ? 'Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy' 
                : 'Ngày kết thúc hiệu lực hợp đồng'
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
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip 
              label="Hôm nay"
              size="small"
              icon={<Today />}
              onClick={() => setTodayDate('end_date')}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
            <Chip 
              label="Năm sau"
              size="small"
              onClick={setNextYearDate}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}