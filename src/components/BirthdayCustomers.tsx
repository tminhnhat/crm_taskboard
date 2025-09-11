'use client'

import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  CakeOutlined as CakeIcon,
  PersonOutline as PersonIcon,
  FavoriteOutlined as FavoriteIcon,
  CallOutlined as CallIcon,
  EmailOutlined as EmailIcon
} from '@mui/icons-material'
import { Customer } from '@/lib/supabase'

interface BirthdayCustomersProps {
  customers: Customer[]
  loading?: boolean
}

const BirthdayCustomers: React.FC<BirthdayCustomersProps> = ({ customers, loading }) => {
  // Demo data for when database is not available
  const demoCustomers = [
    {
      customer_id: 1,
      full_name: 'Nguyễn Thị Mai',
      date_of_birth: '1990-12-05',
      customer_type: 'individual' as const,
      hobby: 'Đọc sách, nghe nhạc',
      phone: '0901234561',
      email: 'mai.nguyen@email.com'
    },
    {
      customer_id: 2,
      full_name: 'Trần Văn Bình', 
      date_of_birth: '1985-12-15',
      customer_type: 'individual' as const,
      hobby: 'Chơi golf, du lịch',
      phone: '0901234562',
      email: 'binh.tran@email.com'
    },
    {
      customer_id: 3,
      full_name: 'Lê Thị Hoa',
      date_of_birth: '1992-12-22', 
      customer_type: 'individual' as const,
      hobby: 'Nấu ăn, yoga',
      phone: '0901234563',
      email: 'hoa.le@email.com'
    }
  ]

  // Use demo data if no customers are available and we're not loading
  const activeCustomers = customers.length === 0 && !loading ? demoCustomers : customers

  // Filter customers with birthdays in the current month
  const birthdayCustomers = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed
    
    return activeCustomers.filter(customer => {
      if (!customer.date_of_birth) return false
      
      const birthDate = new Date(customer.date_of_birth)
      const birthMonth = birthDate.getMonth() + 1
      
      return birthMonth === currentMonth
    }).sort((a, b) => {
      // Sort by day of birth
      const dayA = new Date(a.date_of_birth!).getDate()
      const dayB = new Date(b.date_of_birth!).getDate()
      return dayA - dayB
    })
  }, [activeCustomers])

  // Format date for display
  const formatBirthday = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit'
    })
  }

  // Calculate age
  const calculateAge = (dateString: string) => {
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Đang tải danh sách sinh nhật...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (birthdayCustomers.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CakeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Không có khách hàng nào sinh nhật trong tháng này
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const isUsingDemoData = customers.length === 0 && !loading

  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      {isUsingDemoData && (
        <Alert severity="info" sx={{ borderRadius: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          📊 Đang hiển thị dữ liệu mẫu - Kết nối database để xem dữ liệu thực tế
        </Alert>
      )}
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Khách Hàng
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Sinh Nhật
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Tuổi
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Sở Thích
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Liên Hệ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {birthdayCustomers.map((customer) => (
                <TableRow 
                  key={customer.customer_id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'action.hover' 
                    },
                    '&:last-child td, &:last-child th': { 
                      border: 0 
                    }
                  }}
                >
                  {/* Customer Info */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {getInitials(customer.full_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {customer.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.customer_type === 'individual' ? 'Cá nhân' : 
                           customer.customer_type === 'corporate' ? 'Doanh nghiệp' : 'Cá nhân kinh doanh'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Birthday */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={500}>
                        {formatBirthday(customer.date_of_birth!)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Age */}
                  <TableCell>
                    <Chip 
                      label={`${calculateAge(customer.date_of_birth!)} tuổi`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>

                  {/* Hobby/Preferences */}
                  <TableCell>
                    {customer.hobby ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        <Typography variant="body2" color="text.primary">
                          {customer.hobby}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Chưa cập nhật
                      </Typography>
                    )}
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {customer.phone && (
                        <Tooltip title={customer.phone}>
                          <IconButton 
                            size="small" 
                            sx={{ color: 'success.main' }}
                            href={`tel:${customer.phone}`}
                          >
                            <CallIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {customer.email && (
                        <Tooltip title={customer.email}>
                          <IconButton 
                            size="small" 
                            sx={{ color: 'info.main' }}
                            href={`mailto:${customer.email}`}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default BirthdayCustomers