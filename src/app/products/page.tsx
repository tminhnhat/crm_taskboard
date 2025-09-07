'use client'

import { useState, useMemo } from 'react'
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
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import ProductCard from '@/components/ProductCard'
import ProductForm from '@/components/ProductForm'
import ProductFilters from '@/components/ProductFilters'
import { ProductCardSkeleton } from '@/components/LoadingSpinner'

export default function ProductsPage() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    productType: ''
  })

  // Get available product types for filter dropdown
  const availableProductTypes = useMemo(() => {
    const types = new Set<string>()
    products.forEach(product => {
      if (product.product_type) {
        types.add(product.product_type)
      }
    })
    return Array.from(types).sort()
  }, [products])

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || product.status === filters.status
      
      const matchesType = !filters.productType || product.product_type === filters.productType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [products, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length
    const active = products.filter(p => p.status === 'active').length
    const inactive = products.filter(p => p.status === 'inactive').length
    
    // Banking-specific statistics
    const loans = products.filter(p => p.product_type?.includes('Loan')).length
    const deposits = products.filter(p => 
      p.product_type === 'Savings Account' || 
      p.product_type === 'Current Account' || 
      p.product_type === 'Term Deposit'
    ).length
    const cards = products.filter(p => p.product_type?.includes('Card')).length
    const insurance = products.filter(p => p.product_type?.includes('Insurance')).length
    const feeBasedServices = products.filter(p => 
      p.product_type === 'Money Transfer' ||
      p.product_type === 'Cash Management' ||
      p.product_type === 'Trade Finance' ||
      p.product_type === 'Payment Services' ||
      p.product_type === 'Safe Deposit Box' ||
      p.product_type === 'Financial Advisory'
    ).length
    
    const avgInterestRate = products
      .filter(p => p.interest_rate && p.interest_rate > 0)
      .reduce((sum, p) => sum + (p.interest_rate || 0), 0) / 
      products.filter(p => p.interest_rate && p.interest_rate > 0).length || 0

    return { total, active, inactive, loans, deposits, cards, insurance, feeBasedServices, avgInterestRate }
  }, [products])

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.product_id, productData)
      } else {
        // Convert undefined metadata to null to match the expected type
        const createData: Omit<Product, 'product_id'> = {
          product_name: productData.product_name || '',
          product_type: productData.product_type || null,
          description: productData.description || null,
          status: productData.status || 'active',
          interest_rate: productData.interest_rate || null,
          minimum_amount: productData.minimum_amount || null,
          maximum_amount: productData.maximum_amount || null,
          currency: productData.currency || null,
          terms_months: productData.terms_months || null,
          fees: productData.fees || null,
          requirements: productData.requirements || null,
          benefits: productData.benefits || null,
          metadata: productData.metadata === undefined ? null : productData.metadata
        }
        await createProduct(createData)
      }
      setShowForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Lưu sản phẩm thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await deleteProduct(productId)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Xóa sản phẩm thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleStatusChange = async (productId: number, status: string) => {
    try {
      await updateProduct(productId, { status })
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Cập nhật trạng thái sản phẩm thất bại. Vui lòng thử lại.')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </Box>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Lỗi khi tải danh sách sản phẩm: {error}
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
                <CategoryOutlinedIcon sx={{ fontSize: 36 }} /> Quản Lý Sản Phẩm
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý và theo dõi danh mục sản phẩm một cách chuyên nghiệp
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
              Thêm Sản Phẩm
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Thống Kê Sản Phẩm
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(4, 1fr)', 
              lg: 'repeat(8, 1fr)' 
            }, 
            gap: 2
          }}>
            {/* Total Products */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(52, 71, 103, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Tổng SP
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>

            {/* Loan Products */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(251, 133, 0, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <MoneyIcon sx={{ color: '#fb8500', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Cho Vay
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: '#fb8500' }}>
                  {stats.loans}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Deposit Products */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(73, 163, 241, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <SecurityIcon sx={{ color: 'info.main', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Tiền Gửi
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'info.main' }}>
                  {stats.deposits}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Card Products */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(168, 85, 247, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <InventoryIcon sx={{ color: '#a855f7', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Thẻ
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: '#a855f7' }}>
                  {stats.cards}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Insurance Products */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(34, 197, 94, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <SecurityIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Bảo Hiểm
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: '#22c55e' }}>
                  {stats.insurance}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Fee-Based Services */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0px 4px 12px rgba(239, 68, 68, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <SettingsIcon sx={{ color: 'error.main', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Dịch Vụ
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'error.main' }}>
                  {stats.feeBasedServices}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <ProductFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            availableProductTypes={availableProductTypes}
            totalCount={products.length}
            filteredCount={filteredProducts.length}
          />
        </Paper>

        {/* Products List */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          {filteredProducts.length === 0 ? (
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
                <InventoryIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không có kết quả phù hợp'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {products.length === 0 
                  ? 'Tạo sản phẩm đầu tiên của bạn để bắt đầu!' 
                  : 'Thử điều chỉnh bộ lọc để tìm thấy sản phẩm bạn cần.'
                }
              </Typography>
              {products.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowForm(true)}
                  size="large"
                >
                  Tạo Sản Phẩm Đầu Tiên
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Danh sách sản phẩm ({filteredProducts.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị tất cả {filteredProducts.length} sản phẩm
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
                gap: 3
              }}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Container>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showForm}
        onClose={handleCancelForm}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </Box>
  )
}

