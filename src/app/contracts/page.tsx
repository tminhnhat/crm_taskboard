'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  useTheme,
  Pagination
} from '@mui/material'
import { 
  Add as AddIcon,
  Description as DocumentTextIcon,
  TrendingUp as ChartBarIcon,
  Warning as ExclamationTriangleIcon,
  AttachMoney as BanknotesIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { useContracts } from '@/hooks/useContracts'
import { Contract } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import ContractCard from '@/components/ContractCard'
import ContractForm from '@/components/ContractForm'
import ContractFilters from '@/components/ContractFilters'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ContractsPage() {
  const { 
    contracts, 
    loading, 
    error, 
    createContract, 
    updateContract, 
    deleteContract,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    checkContractNumberExists
  } = useContracts()
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    customerId: '',
    productId: '',
    signedBy: '',
    dateRange: '',
    creditRange: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const contractsPerPage = 8 // 4 rows in 2 columns

  // Get available options for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    contracts.forEach(contract => {
      if (contract.customer) {
        customers.set(contract.customer.customer_id, {
          customer_id: contract.customer.customer_id,
          full_name: contract.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [contracts])

  const availableProducts = useMemo(() => {
    const products = new Map()
    contracts.forEach(contract => {
      if (contract.product) {
        products.set(contract.product.product_id, {
          product_id: contract.product.product_id,
          product_name: contract.product.product_name
        })
      }
    })
    return Array.from(products.values()).sort((a, b) => a.product_name.localeCompare(b.product_name))
  }, [contracts])

  const availableStaff = useMemo(() => {
    const staff = new Map()
    contracts.forEach(contract => {
      if (contract.signed_by_staff) {
        staff.set(contract.signed_by_staff.staff_id, {
          staff_id: contract.signed_by_staff.staff_id,
          full_name: contract.signed_by_staff.full_name
        })
      }
    })
    return Array.from(staff.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [contracts])

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>()
    contracts.forEach(contract => {
      if (contract.status) {
        statuses.add(contract.status)
      }
    })
    return Array.from(statuses).sort()
  }, [contracts])

  // Filter contracts based on current filters
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = !filters.search || 
        contract.contract_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        (contract.customer && contract.customer.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (contract.product && contract.product.product_name.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || contract.status === filters.status
      
      const matchesCustomer = !filters.customerId || contract.customer_id.toString() === filters.customerId
      
      const matchesProduct = !filters.productId || contract.product_id.toString() === filters.productId
      
      const matchesSigner = !filters.signedBy || contract.signed_by?.toString() === filters.signedBy

      let matchesDateRange = true
      if (filters.dateRange) {
        const today = new Date()
        const startDate = contract.start_date ? new Date(contract.start_date) : null
        const endDate = contract.end_date ? new Date(contract.end_date) : null
        
        switch (filters.dateRange) {
          case 'current':
            matchesDateRange = !!(startDate && endDate && startDate <= today && endDate >= today)
            break
          case 'starting-soon':
            if (startDate) {
              const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
              matchesDateRange = startDate >= today && startDate <= monthFromNow
            } else {
              matchesDateRange = false
            }
            break
          case 'expiring-soon':
            if (endDate) {
              const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
              matchesDateRange = endDate >= today && endDate <= monthFromNow
            } else {
              matchesDateRange = false
            }
            break
          case 'expired':
            matchesDateRange = !!(endDate && endDate < today)
            break
        }
      }

      let matchesCreditRange = true
      if (filters.creditRange && contract.contract_credit_limit !== null) {
        const credit = contract.contract_credit_limit
        switch (filters.creditRange) {
          case '0-10000':
            matchesCreditRange = credit >= 0 && credit <= 10000
            break
          case '10000-50000':
            matchesCreditRange = credit > 10000 && credit <= 50000
            break
          case '50000-100000':
            matchesCreditRange = credit > 50000 && credit <= 100000
            break
          case '100000-500000':
            matchesCreditRange = credit > 100000 && credit <= 500000
            break
          case '500000+':
            matchesCreditRange = credit > 500000
            break
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesProduct && matchesSigner && matchesDateRange && matchesCreditRange
    })
  }, [contracts, filters])

  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredContracts.length / contractsPerPage)), [filteredContracts.length, contractsPerPage])

  // Reset current page when filters change or if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = contracts.length
    const totalCreditLimit = contracts
      .filter(c => c.contract_credit_limit !== null)
      .reduce((sum, c) => sum + (c.contract_credit_limit || 0), 0)
    
    const active = contracts.filter(c => c.status === 'active').length
    const today = new Date()
    
    const expiringSoon = contracts.filter(c => {
      if (!c.end_date) return false
      const endDate = new Date(c.end_date)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      return endDate >= today && endDate <= monthFromNow
    }).length

    const expired = contracts.filter(c => {
      if (!c.end_date) return false
      const endDate = new Date(c.end_date)
      return endDate < today
    }).length

    return { total, totalCreditLimit, active, expiringSoon, expired }
  }, [contracts])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleSaveContract = async (contractData: Partial<Contract>) => {
    try {
      if (editingContract) {
        await updateContract(editingContract.contract_id, contractData)
      } else {
        await createContract(contractData)
      }
      setShowForm(false)
      setEditingContract(null)
    } catch (error) {
      console.error('Error saving contract:', error)
      alert('Lưu hợp đồng thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setShowForm(true)
  }

  const handleDeleteContract = async (contractId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này không?')) {
      try {
        await deleteContract(contractId)
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Xóa hợp đồng thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleStatusChange = async (contractId: number, status: string) => {
    try {
      await updateContract(contractId, { status })
    } catch (error) {
      console.error('Error updating contract status:', error)
      alert('Cập nhật trạng thái hợp đồng thất bại. Vui lòng thử lại.')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingContract(null)
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Lỗi khi tải danh sách hợp đồng: {error}
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
                <DocumentTextIcon sx={{ fontSize: 36 }} /> Quản Lý Hợp Đồng
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý hợp đồng và thỏa thuận với khách hàng một cách chuyên nghiệp
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
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
              Hợp Đồng Mới
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChartBarIcon color="primary" />
            Thống Kê Hợp Đồng
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
            {/* Total Contracts */}
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
                    <ChartBarIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Tổng Hợp Đồng
                </Typography>
              </CardContent>
            </Card>

            {/* Total Credit Limit */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(72, 187, 120, 0.1)' 
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
                    background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)',
                    color: 'white'
                  }}>
                    <BanknotesIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary', fontSize: '1.5rem' }}>
                  {formatCurrency(stats.totalCreditLimit)}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Tổng Hạn Mức
                </Typography>
              </CardContent>
            </Card>
            
            {/* Active Contracts */}
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
            
            {/* Expiring Soon */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(245, 158, 11, 0.1)' 
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
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    color: 'white'
                  }}>
                    <ScheduleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.expiringSoon}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Sắp Hết Hạn
                </Typography>
              </CardContent>
            </Card>

            {/* Expired */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(220, 38, 38, 0.1)' 
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
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    color: 'white'
                  }}>
                    <ExclamationTriangleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.expired}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Đã Hết Hạn
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <ContractFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableStatuses={availableStatuses}
            availableCustomers={availableCustomers}
            availableProducts={availableProducts}
            availableStaff={availableStaff}
            totalCount={contracts.length}
            filteredCount={filteredContracts.length}
          />
        </Paper>

        {/* Contracts List */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <LoadingSpinner />
            </Box>
          ) : filteredContracts.length === 0 ? (
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
                <DocumentTextIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {contracts.length === 0 ? 'Chưa có hợp đồng nào' : 'Không có kết quả phù hợp'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {contracts.length === 0 
                  ? 'Tạo hợp đồng đầu tiên của bạn để bắt đầu!' 
                  : 'Thử điều chỉnh bộ lọc để tìm thấy hợp đồng bạn cần.'
                }
              </Typography>
              {contracts.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowForm(true)}
                  size="large"
                >
                  Tạo Hợp Đồng Đầu Tiên
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Danh sách hợp đồng ({filteredContracts.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {((currentPage - 1) * contractsPerPage) + 1}-{Math.min(currentPage * contractsPerPage, filteredContracts.length)} trong tổng số {filteredContracts.length} hợp đồng
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
                gap: 3,
                mb: 4
              }}>
                {filteredContracts
                  .slice((currentPage - 1) * contractsPerPage, currentPage * contractsPerPage)
                  .map((contract) => (
                    <ContractCard
                      key={contract.contract_id}
                      contract={contract}
                      onEdit={handleEditContract}
                      onDelete={handleDeleteContract}
                      onStatusChange={handleStatusChange}
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

      {/* Contract Form Modal */}
      <ContractForm
        isOpen={showForm}
        onClose={handleCancelForm}
        onSubmit={handleSaveContract}
        contract={editingContract}
        isLoading={loading}
        checkContractNumberExists={checkContractNumberExists}
        fetchCustomers={fetchCustomers}
        fetchProducts={fetchProducts}
        fetchStaff={fetchStaff}
      />
    </Box>
  )
}
