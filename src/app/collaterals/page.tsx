'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
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
  Assessment as AssessmentIcon,
  TrendingUp as ChartBarIcon,
  Schedule as ScheduleIcon,
  AccountBalance as BankIcon,
  AttachMoney as BanknotesIcon
} from '@mui/icons-material'
import { useCollaterals } from '@/hooks/useCollaterals'
import { Collateral } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import Navigation from '@/components/Navigation'
import CollateralCard from '@/components/CollateralCard'
import CollateralForm from '@/components/CollateralForm'
import CollateralFilters from '@/components/CollateralFilters'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function CollateralsPage() {
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
    dateRange: '',
    reEvaluationDateRange: ''
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

      let matchesReEvaluationDateRange = true
      if (filters.reEvaluationDateRange && collateral.re_evaluation_date) {
        const reEvaluationDate = new Date(collateral.re_evaluation_date)
        const today = new Date()
        
        switch (filters.reEvaluationDateRange) {
          case 'overdue':
            matchesReEvaluationDateRange = reEvaluationDate < today
            break
          case 'month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
            matchesReEvaluationDateRange = reEvaluationDate >= today && reEvaluationDate <= monthFromNow
            break
          case 'quarter':
            const quarterFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
            matchesReEvaluationDateRange = reEvaluationDate >= today && reEvaluationDate <= quarterFromNow
            break
          case 'year':
            const yearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
            matchesReEvaluationDateRange = reEvaluationDate >= today && reEvaluationDate <= yearFromNow
            break
          case 'future':
            matchesReEvaluationDateRange = reEvaluationDate > today
            break
        }
      } else if (filters.reEvaluationDateRange) {
        matchesReEvaluationDateRange = false
      }

      return matchesSearch && matchesType && matchesStatus && matchesCustomer && matchesValueRange && matchesDateRange && matchesReEvaluationDateRange
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
    setCurrentPage(1); // Reset to first page when filters change
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
          <Alert severity="error" sx={{ mt: 2 }}>
            Lỗi: {error}
          </Alert>
        </Container>
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
                <AssessmentIcon sx={{ fontSize: 36, mr: 2 }} /> Tài Sản Đảm Bảo
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý tài sản đảm bảo và định giá của khách hàng một cách chuyên nghiệp
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewCollateral}
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
              Tài Sản Mới
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(52, 71, 103, 0.1) 0%, rgba(56, 103, 214, 0.1) 100%)',
            border: '1px solid rgba(52, 71, 103, 0.1)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(52, 71, 103, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(52, 71, 103, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AssessmentIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#344767', mb: 0.5 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tổng Tài Sản
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(76, 175, 80, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(76, 175, 80, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BankIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Loại Phổ Biến
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#4caf50' }}>
                    {stats.mostCommonType || 'Không có'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(255, 152, 0, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(255, 152, 0, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BanknotesIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Tổng Giá Trị
                  </Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#ff9800' }}>
                    {formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <CollateralFilters
            onFiltersChange={handleFiltersChange}
            availableCustomers={availableCustomers}
          />
        </Box>

        {/* Results Summary */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2, 
          border: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              Hiển thị {((currentPage - 1) * collateralsPerPage) + 1}-{Math.min(currentPage * collateralsPerPage, filteredCollaterals.length)} trong tổng số {filteredCollaterals.length} tài sản đảm bảo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChartBarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {filteredCollaterals.length > 0 
                  ? `Tổng giá trị: ${formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}`
                  : 'Không có dữ liệu'
                }
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Collaterals Grid */}
        {filteredCollaterals.length === 0 ? (
          <Paper elevation={0} sx={{ 
            textAlign: 'center', 
            py: 8, 
            borderRadius: 3, 
            border: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
              Không tìm thấy tài sản đảm bảo nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange || filters.reEvaluationDateRange
                ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.'
                : 'Bắt đầu bằng cách thêm tài sản đảm bảo đầu tiên của bạn.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewCollateral}
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
              Thêm Tài Sản Mới
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                lg: 'repeat(2, 1fr)', 
                xl: 'repeat(3, 1fr)' 
              }, 
              gap: 3,
              mb: 4
            }}>
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
