'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  Pagination
} from '@mui/material'
import { 
  Add as AddIcon,
  QrCode as QrCodeIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import CustomerCard from '@/components/CustomerCard'
import CustomerForm from '@/components/CustomerForm'
import CustomerFilters from '@/components/CustomerFilters'
import { CustomerCardSkeleton } from '@/components/LoadingSpinner'
import QRPaymentGenerator from '@/components/QRPaymentGenerator'
import { useCustomers } from '@/hooks/useCustomers'
import type { CustomerType } from '@/lib/supabase'
import { Customer } from '@/lib/supabase'

export default function CustomersPage() {
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, updateCustomerStatus, recalculateNumerology } = useCustomers()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false)
  const [selectedCustomerForQR, setSelectedCustomerForQR] = useState<number | undefined>(undefined)
  const [filters, setFilters] = useState({
    customerType: '',
    status: 'active',
    search: '',
    sortBy: 'created_at'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 8 // Show 4 rows in 2 columns

  // Filter and sort customers based on current filters
  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(customer => {
      const matchesType = !filters.customerType || customer.customer_type === filters.customerType
      const matchesStatus = !filters.status || customer.status === filters.status
      const matchesSearch = !filters.search || 
        customer.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.account_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.cif_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (customer.customer_type === 'corporate' && (
          customer.business_registration_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.registration_date?.toLowerCase().includes(filters.search.toLowerCase())
        )) ||
        (customer.customer_type === 'individual' && (
          customer.id_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.id_issue_authority?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.id_issue_date?.toLowerCase().includes(filters.search.toLowerCase())
        ))
      
      return matchesType && matchesStatus && matchesSearch
    })

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const sortBy = filters.sortBy as keyof Customer
      
      // Handle date fields
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'date_of_birth') {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        if (!aValue && !bValue) return 0
        if (!aValue) return 1
        if (!bValue) return -1
        return new Date(aValue).getTime() - new Date(bValue).getTime()
      }
      
      // Handle customer type sorting
      if (sortBy === 'customer_type') {
        const typeOrder: Record<CustomerType, number> = {
          'individual': 1,
          'corporate': 2,
          'business_individual': 3
        }
        return typeOrder[a.customer_type] - typeOrder[b.customer_type]
      }
      
      // Handle status sorting
      if (sortBy === 'status') {
        const statusOrder = { 'active': 1, 'inactive': 2 }
        const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 3
        const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 3
        return aStatus - bStatus
      }
      
      // Handle string fields
      const aValue = String(a[sortBy] || '')
      const bValue = String(b[sortBy] || '')
      return aValue.localeCompare(bValue)
    })
  }, [customers, filters])

  const handleCreateCustomer = async (customerData: Partial<Customer>) => {
    try {
      await createCustomer(customerData as Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to create customer:', err)
      alert('Tạo khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!editingCustomer) return
    
    try {
      await updateCustomer(editingCustomer.customer_id, customerData)
      setEditingCustomer(null)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to update customer:', err)
      alert('Cập nhật khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      try {
        await deleteCustomer(customerId)
      } catch (err) {
        console.error('Failed to delete customer:', err)
        alert('Xóa khách hàng thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleStatusChange = async (customerId: number, status: string) => {
    try {
      await updateCustomerStatus(customerId, status)
    } catch (err) {
      console.error('Failed to update customer status:', err)
      alert('Cập nhật trạng thái khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCustomer(null)
  }

  const handleRecalculateNumerology = async (customerId: number) => {
    try {
      await recalculateNumerology(customerId)
      alert('Đã tính toán lại dữ liệu thần số học thành công!')
    } catch (err) {
      console.error('Failed to recalculate numerology:', err)
      alert('Tính toán thần số học thất bại. Vui lòng thử lại.')
    }
  }

  const handleOpenQRGenerator = (customerId?: number) => {
    setSelectedCustomerForQR(customerId)
    setIsQRGeneratorOpen(true)
  }

  const handleOpenQRGeneratorForCustomer = (customer: Customer) => {
    setSelectedCustomerForQR(customer.customer_id)
    setIsQRGeneratorOpen(true)
  }

  const handleCloseQRGenerator = () => {
    setIsQRGeneratorOpen(false)
    setSelectedCustomerForQR(undefined)
  }

  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage)), [filteredCustomers.length, customersPerPage])

  // Reset current page when filters change or if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Customer statistics
  const stats = useMemo(() => {
    const total = customers.length
    const active = customers.filter(c => c.status === 'active').length
    const inactive = customers.filter(c => c.status === 'inactive').length
    const individual = customers.filter(c => c.customer_type === 'individual').length
    const corporate = customers.filter(c => c.customer_type === 'corporate').length

    return { total, active, inactive, individual, corporate }
  }, [customers])

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Lỗi khi tải danh sách khách hàng: {error}
              </Alert>
              <Typography color="text.secondary">
                Vui lòng kiểm tra cấu hình Supabase trong file .env.local
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    )
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
            py: 4 
          }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="700" sx={{ 
                mb: 1, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                👥 Quản Lý Khách Hàng
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý và theo dõi thông tin khách hàng một cách chuyên nghiệp
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Tạo QR thanh toán">
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  onClick={() => handleOpenQRGenerator()}
                  sx={{ 
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  QR Thanh Toán
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                  boxShadow: '0px 4px 8px rgba(52, 71, 103, 0.2)',
                  '&:hover': {
                    boxShadow: '0px 6px 16px rgba(52, 71, 103, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Khách Hàng Mới
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Thống Kê Khách Hàng
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(5, 1fr)' 
            }, 
            gap: 3
          }}>
            {/* Total Customers */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(52, 71, 103, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #3867d6 0%, #8854d0 100%)',
                    color: 'white'
                  }}>
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Tổng Cộng
                </Typography>
              </CardContent>
            </Card>
            
            {/* Active Customers */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(130, 214, 22, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #82d616 0%, #a8e6cf 100%)',
                    color: 'white'
                  }}>
                    <CheckCircleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Đang Hoạt Động
                </Typography>
              </CardContent>
            </Card>
            
            {/* Inactive Customers */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(123, 128, 154, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #7b809a 0%, #9ca3af 100%)',
                    color: 'white'
                  }}>
                    <ErrorIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.inactive}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Không Hoạt Động
                </Typography>
              </CardContent>
            </Card>
            
            {/* Individual Customers */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(73, 163, 241, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #49a3f1 0%, #5dade2 100%)',
                    color: 'white'
                  }}>
                    <PersonIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.individual}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Cá Nhân
                </Typography>
              </CardContent>
            </Card>
            
            {/* Corporate Customers */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(168, 85, 247, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                    color: 'white'
                  }}>
                    <BusinessIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.corporate}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Doanh Nghiệp
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <CustomerFilters filters={filters} onFiltersChange={setFilters} />
        </Paper>

        {/* Customers List */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(4)].map((_, i) => (
                <CustomerCardSkeleton key={i} />
              ))}
            </Box>
          ) : filteredCustomers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'grey.100', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <PersonIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không có kết quả phù hợp'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {customers.length === 0 
                  ? 'Tạo khách hàng đầu tiên của bạn để bắt đầu!' 
                  : 'Thử điều chỉnh bộ lọc để tìm thấy khách hàng bạn cần.'
                }
              </Typography>
              {customers.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                  size="large"
                >
                  Tạo Khách Hàng Đầu Tiên
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Danh sách khách hàng ({filteredCustomers.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {((currentPage - 1) * customersPerPage) + 1}-{Math.min(currentPage * customersPerPage, filteredCustomers.length)} trong tổng số {filteredCustomers.length} khách hàng
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
                gap: 3,
                mb: 4
              }}>
                {filteredCustomers
                  .slice((currentPage - 1) * customersPerPage, currentPage * customersPerPage)
                  .map((customer) => (
                    <CustomerCard
                      key={customer.customer_id}
                      customer={customer}
                      onEdit={handleEditCustomer}
                      onDelete={handleDeleteCustomer}
                      onStatusChange={handleStatusChange}
                      onRecalculateNumerology={handleRecalculateNumerology}
                      onGenerateQR={handleOpenQRGeneratorForCustomer}
                    />
                  ))}
              </Box>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        customer={editingCustomer}
      />

      {/* QR Payment Generator Modal */}
      <QRPaymentGenerator
        isOpen={isQRGeneratorOpen}
        onClose={handleCloseQRGenerator}
        prefilledCustomerId={selectedCustomerForQR}
      />
    </Box>
  )
}
