'use client'

import React from 'react'
import {
  Box,
  Container,
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
  Tooltip,
  Button
} from '@mui/material'
import {
  CakeOutlined as CakeIcon,
  PersonOutline as PersonIcon,
  FavoriteOutlined as FavoriteIcon,
  CallOutlined as CallIcon,
  EmailOutlined as EmailIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'

// Demo data for birthday customers
const demoBirthdayCustomers = [
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
  },
  {
    customer_id: 4,
    full_name: 'Phạm Văn Nam',
    date_of_birth: '1988-12-08',
    customer_type: 'individual' as const,
    hobby: 'Câu cá, xem phim',
    phone: '0901234564',
    email: 'nam.pham@email.com'
  }
]

export default function DemoHomePage() {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <Paper elevation={0} sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            py: 6 
          }}>
            <Box>
              <Typography variant="h2" component="h1" fontWeight="800" sx={{ 
                mb: 2, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <BusinessIcon sx={{ fontSize: 36 }} /> Demo - Trang Chủ CRM
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Xem trước chức năng "Sinh Nhật Tháng Này"
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Demo Alert */}
        <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
          🎂 <strong>Demo Chức Năng:</strong> Bảng danh sách khách hàng có sinh nhật trong tháng này với thông tin sở thích
        </Alert>

        {/* Birthday Customers Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CakeIcon fontSize="medium" />
              </Box>
              Sinh Nhật Tháng Này
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              href="/customers"
              sx={{ borderRadius: 3 }}
            >
              Xem Tất Cả Khách Hàng
            </Button>
          </Box>
          
          <Card elevation={2} sx={{ borderRadius: 3 }}>
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
                    {demoBirthdayCustomers.map((customer) => (
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
                                Cá nhân
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Birthday */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CakeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight={500}>
                              {formatBirthday(customer.date_of_birth)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Age */}
                        <TableCell>
                          <Chip 
                            label={`${calculateAge(customer.date_of_birth)} tuổi`}
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            <Typography variant="body2" color="text.primary">
                              {customer.hobby}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={customer.phone}>
                              <IconButton 
                                size="small" 
                                sx={{ color: 'success.main' }}
                                href={`tel:${customer.phone}`}
                              >
                                <CallIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={customer.email}>
                              <IconButton 
                                size="small" 
                                sx={{ color: 'info.main' }}
                                href={`mailto:${customer.email}`}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Features Explanation */}
        <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: 'primary.main' }}>
              ✨ Tính Năng Đã Thực Hiện
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Lọc sinh nhật theo tháng hiện tại:</strong> Tự động hiển thị khách hàng có sinh nhật trong tháng 12
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Thông tin sở thích:</strong> Hiển thị hobby/preferences của khách hàng từ trường "hobby" trong database
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Giao diện chuyên nghiệp:</strong> Table responsive với avatar, age calculation và contact buttons
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Tích hợp hoàn chỉnh:</strong> Component BirthdayCustomers được thêm vào homepage với header và navigation
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Xử lý trạng thái:</strong> Loading states, empty states và demo data khi không có kết nối database
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}