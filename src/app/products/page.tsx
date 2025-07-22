'use client'

import { useState, useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import ProductCard from '@/components/ProductCard'
import ProductForm from '@/components/ProductForm'
import ProductFilters from '@/components/ProductFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function ProductsPage() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
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

    return { total, active, inactive }
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">Lỗi khi tải danh sách sản phẩm: {error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm</h1>
                <p className="text-gray-600">Quản lý danh mục sản phẩm của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm Sản Phẩm
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Sản Phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Đang Hoạt Động</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Không Hoạt Động</p>
                <p className="text-2xl font-semibold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableProductTypes={availableProductTypes}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
        />

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không có sản phẩm nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {products.length === 0 
                ? 'Hãy bắt đầu bằng cách tạo sản phẩm đầu tiên của bạn.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </p>
            {products.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Thêm Sản Phẩm Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancelForm}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  )
}
