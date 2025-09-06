'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useCollaterals } from '@/hooks/useCollaterals'
import { Collateral } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import Navigation from '@/components/Navigation'
import CollateralCard from '@/components/CollateralCard'
import CollateralForm from '@/components/CollateralForm'
import CollateralFilters from '@/components/CollateralFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  HomeIcon,
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { 
  Pagination, 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Alert,
  useTheme
} from '@mui/material'
import { Add as AddIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material'

export default function CollateralsPage() {
  const theme = useTheme()
  const { 
    collaterals, 
    loading, 
    error, 
    createCollateral, 
    updateCollateral, 
    deleteCollateral,
    fetchCustomers,
    getCollateralStats
  } = useCollaterals()

  const [showForm, setShowForm] = useState(false)
  const [editingCollateral, setEditingCollateral] = useState<Collateral | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'active',
    customerId: '',
    valueRange: '',
    dateRange: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const collateralsPerPage = 6 // Show 6 items per page in grid layout

  const stats = getCollateralStats()

  // Extract unique customers for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    collaterals.forEach(collateral => {
      if (collateral.customer) {
        customers.set(collateral.customer.customer_id, {
          customer_id: collateral.customer.customer_id,
          full_name: collateral.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [collaterals])

  // Filter collaterals based on current filters
  const filteredCollaterals = useMemo(() => {
    return collaterals.filter(collateral => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        (collateral.description?.toLowerCase().includes(searchLower)) ||
        (collateral.location?.toLowerCase().includes(searchLower)) ||
        (collateral.customer?.full_name.toLowerCase().includes(searchLower)) ||
        (collateral.collateral_type?.toLowerCase().includes(searchLower)) ||
        collateral.collateral_id.toString().includes(searchLower);
      
      const matchesType = !filters.type || 
        (collateral.collateral_type && collateral.collateral_type === filters.type);
      
      const matchesStatus = !filters.status || 
        (collateral.status?.toLowerCase() === filters.status.toLowerCase());
      
      const matchesCustomer = !filters.customerId || 
        collateral.customer_id.toString() === filters.customerId;

      let matchesValueRange = true
      if (filters.valueRange && collateral.value) {
        const value = collateral.value
        switch (filters.valueRange) {
          case '0-100000000':
            matchesValueRange = value >= 0 && value <= 100000000
            break
          case '100000000-500000000':
            matchesValueRange = value > 100000000 && value <= 500000000
            break
          case '500000000-1000000000':
            matchesValueRange = value > 500000000 && value <= 1000000000
            break
          case '1000000000-5000000000':
            matchesValueRange = value > 1000000000 && value <= 5000000000
            break
          case '5000000000+':
            matchesValueRange = value > 5000000000
            break
        }
      } else if (filters.valueRange) {
        matchesValueRange = false
      }

      let matchesDateRange = true
      if (filters.dateRange && collateral.valuation_date) {
        const valuationDate = new Date(collateral.valuation_date)
        const today = new Date()
        
        switch (filters.dateRange) {
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            matchesDateRange = valuationDate >= monthAgo && valuationDate <= today
            break
          case 'quarter':
            const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
            matchesDateRange = valuationDate >= quarterAgo && valuationDate <= today
            break
          case 'year':
            const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            matchesDateRange = valuationDate >= yearAgo && valuationDate <= today
            break
          case 'older':
            const yearAgoForOlder = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            matchesDateRange = valuationDate < yearAgoForOlder
            break
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesCustomer && matchesValueRange && matchesDateRange
    })
  }, [collaterals, filters])

  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCollaterals.length / collateralsPerPage)), [filteredCollaterals.length, collateralsPerPage])

  // Reset current page when filters change or if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Get paginated collaterals
  const paginatedCollaterals = useMemo(() => {
    const startIndex = (currentPage - 1) * collateralsPerPage
    const endIndex = startIndex + collateralsPerPage
    return filteredCollaterals.slice(startIndex, endIndex)
  }, [filteredCollaterals, currentPage, collateralsPerPage])



    const handleCloseForm = () => {
    setShowForm(false)
    setEditingCollateral(null)
  }

  const handleNewCollateral = () => {
    setEditingCollateral(null)
    setShowForm(true)
  }

  const handleEditCollateral = useCallback((collateral: Collateral) => {
    setEditingCollateral(collateral);
    setShowForm(true);
  }, []);

  const handleDeleteCollateral = useCallback(async (collateral: Collateral) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài sản đảm bảo này không?')) {
      try {
        await deleteCollateral(collateral.collateral_id);
      } catch (error) {
        console.error('Error deleting collateral:', error);
      }
    }
  }, [deleteCollateral]);

  const handleSaveCollateral = useCallback(async (collateralData: Partial<Collateral>) => {
    try {
      if (editingCollateral) {
        await updateCollateral(editingCollateral.collateral_id, collateralData);
      } else {
        await createCollateral(collateralData);
      }
      setShowForm(false);
      setEditingCollateral(null);
    } catch (error) {
      console.error('Error saving collateral:', error);
    }
  }, [editingCollateral, updateCollateral, createCollateral]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingCollateral(null);
  }, []);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, [])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <LoadingSpinner />
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Lỗi: {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      
      {/* Header Section */}
      <Paper sx={{ 
        background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
        color: 'white',
        py: 6,
        borderRadius: 0
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Tài Sản Đảm Bảo
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Quản lý tài sản đảm bảo và định giá của khách hàng
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleNewCollateral}
              startIcon={<AddIcon />}
              size="large"
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Thêm Tài Sản
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Thống Kê Tài Sản
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)' },
              transition: 'transform 0.2s ease-in-out'
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CubeIcon className="h-8 w-8" />
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Tổng Tài Sản
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)' },
              transition: 'transform 0.2s ease-in-out'
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HomeIcon className="h-8 w-8" />
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Loại Phổ Biến
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.mostCommonType || 'Không có'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters */}
        <CollateralFilters
          onFiltersChange={handleFiltersChange}
          availableCustomers={availableCustomers}
        />

        {/* Results Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Hiển thị {((currentPage - 1) * collateralsPerPage) + 1}-{Math.min(currentPage * collateralsPerPage, filteredCollaterals.length)} trong tổng số {filteredCollaterals.length} tài sản đảm bảo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChartBarIcon className="h-5 w-5" />
            <Typography variant="body2" color="text.secondary">
              {filteredCollaterals.length > 0 
                ? `Tổng giá trị: ${formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}`
                : 'Không có dữ liệu'
              }
            </Typography>
          </Box>
        </Box>

        {/* Collaterals Grid */}
        {filteredCollaterals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HomeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <Typography variant="h6" color="text.primary" gutterBottom>
              Không tìm thấy tài sản đảm bảo nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange
                ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.'
                : 'Bắt đầu bằng cách thêm tài sản đảm bảo đầu tiên của bạn.'
              }
            </Typography>
            <Button
              variant="contained"
              onClick={handleNewCollateral}
              startIcon={<AddIcon />}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)'
              }}
            >
              Thêm Tài Sản
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
              {paginatedCollaterals.map((collateral: Collateral) => (
                <CollateralCard
                  key={collateral.collateral_id}
                  collateral={collateral}
                  onEdit={handleEditCollateral}
                  onDelete={handleDeleteCollateral}
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

        {/* Collateral Form Modal */}
        <CollateralForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSaveCollateral}
          collateral={editingCollateral}
          isLoading={loading}
          fetchCustomers={fetchCustomers}
        />
      </Container>
    </Box>
  )
}
