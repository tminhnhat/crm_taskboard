'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import { Staff } from '@/lib/supabase'

interface StaffFormProps {
  staff?: Staff | null
  onSave: (staffData: Partial<Staff>) => void
  onCancel: () => void
  isLoading?: boolean
  open: boolean
}

export default function StaffForm({ staff, onSave, onCancel, isLoading, open }: StaffFormProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [formData, setFormData] = useState({
    full_name: staff?.full_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    position: staff?.position || '',
    department: staff?.department || '',
    status: staff?.status || 'active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      position: formData.position.trim() || null,
      department: formData.department.trim() || null
    }

    onSave(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog 
      open={open}
      onClose={onCancel}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <PersonIcon />
        <Typography variant="h6" component="div" sx={{ color: 'primary.contrastText' }}>
          {staff ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Full Name */}
            <TextField
              name="full_name"
              label="Họ Và Tên"
              value={formData.full_name}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              placeholder="Nhập họ và tên"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <PersonIcon color="action" />
                  </Box>
                ),
              }}
              helperText="Trường này là bắt buộc"
            />

            {/* Email */}
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Nhập địa chỉ email"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <EmailIcon color="action" />
                  </Box>
                ),
              }}
            />

            {/* Phone */}
            <TextField
              name="phone"
              label="Số Điện Thoại"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Nhập số điện thoại"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <PhoneIcon color="action" />
                  </Box>
                ),
              }}
            />

            {/* Position */}
            <TextField
              name="position"
              label="Chức Vụ"
              value={formData.position}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Ví dụ: Kỹ sư phần mềm, Quản lý"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <WorkIcon color="action" />
                  </Box>
                ),
              }}
            />

            {/* Department */}
            <TextField
              name="department"
              label="Phòng Ban"
              value={formData.department}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Ví dụ: Công nghệ, Kinh doanh, Nhân sự"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <BusinessIcon color="action" />
                  </Box>
                ),
              }}
            />

            {/* Status */}
            <TextField
              name="status"
              label="Trạng Thái"
              value={formData.status}
              onChange={handleChange}
              select
              fullWidth
              variant="outlined"
            >
              <MenuItem value="active">Hoạt Động</MenuItem>
              <MenuItem value="inactive">Không Hoạt Động</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button
            onClick={onCancel}
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !formData.full_name.trim()}
            size="large"
            sx={{ minWidth: 120 }}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {isLoading 
              ? 'Đang lưu...' 
              : (staff ? 'Cập Nhật' : 'Tạo Mới')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
