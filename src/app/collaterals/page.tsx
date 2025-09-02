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
    dateRange: ''
  })

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navigation />
        <div className="container mx-auto p-8 max-w-7xl">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navigation />
        <div className="container mx-auto p-8 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">❌ Có lỗi xảy ra</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Enhanced header section */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-5 rounded-tr-full"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg">
                  <CubeIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">💎 Tài Sản Đảm Bảo</h1>
                  <p className="text-gray-600 text-lg">Quản lý tài sản đảm bảo và định giá của khách hàng một cách hiệu quả</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      <span className="font-medium">Cập nhật realtime</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleNewCollateral}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  ✨ Thêm Tài Sản
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20"></div>
            <div className="flex items-center relative z-10">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                <CubeIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">📦 Tổng Tài Sản</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-sm text-blue-600 font-medium">Đang hoạt động</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20"></div>
            <div className="flex items-center relative z-10">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-3 shadow-lg">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">🏠 Loại Phổ Biến</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {stats.mostCommonType || 'Không có'}
                </p>
                <p className="text-sm text-emerald-600 font-medium">Được ưa chuộng</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20"></div>
            <div className="flex items-center relative z-10">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-3 shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">💰 Tổng Giá Trị</p>
                <p className="text-lg font-bold text-purple-600 mt-1">
                  {formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}
                </p>
                <p className="text-sm text-purple-600 font-medium">Tài sản hiện có</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">🔍 Bộ Lọc Tìm Kiếm</h2>
            <p className="text-gray-600">Lọc và tìm kiếm tài sản đảm bảo theo nhiều tiêu chí</p>
          </div>
          <div className="p-8">
            <CollateralFilters
              onFiltersChange={handleFiltersChange}
              availableCustomers={availableCustomers}
            />
          </div>
        </div>

        {/* Enhanced Results Summary */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Hiển thị {filteredCollaterals.length} trong tổng số {collaterals.length} tài sản
                </p>
                <p className="text-sm text-gray-600">
                  {filteredCollaterals.length > 0 
                    ? `Tổng giá trị: ${formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}`
                    : 'Không có dữ liệu phù hợp'
                  }
                </p>
              </div>
            </div>
            {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange ? (
              <button
                onClick={() => setFilters({
                  search: '',
                  type: '',
                  status: 'active',
                  customerId: '',
                  valueRange: '',
                  dateRange: ''
                })}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🧹 Xóa bộ lọc
              </button>
            ) : null}
          </div>
        </div>

        {/* Enhanced Collaterals Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredCollaterals.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange
                  ? '🔍 Không tìm thấy kết quả phù hợp'
                  : '💎 Chưa có tài sản đảm bảo nào'
                }
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange
                  ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả hoặc tạo tài sản đảm bảo mới.'
                  : 'Bắt đầu xây dựng danh mục tài sản đảm bảo bằng cách thêm tài sản đầu tiên của bạn.'
                }
              </p>
              {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange ? (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      type: '',
                      status: 'active',
                      customerId: '',
                      valueRange: '',
                      dateRange: ''
                    })}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🧹 Xóa bộ lọc
                  </button>
                  <button
                    onClick={handleNewCollateral}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Tạo thêm tài sản
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNewCollateral}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Tạo tài sản đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCollaterals.map((collateral: Collateral) => (
                  <CollateralCard
                    key={collateral.collateral_id}
                    collateral={collateral}
                    onEdit={handleEditCollateral}
                    onDelete={handleDeleteCollateral}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Collateral Form Modal */}
        <CollateralForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSaveCollateral}
          collateral={editingCollateral}
          isLoading={loading}
          fetchCustomers={fetchCustomers}
        />
      </div>
    </div>
  )
}
