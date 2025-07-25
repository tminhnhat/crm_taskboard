'use client'

import { useState, useMemo } from 'react'
import { useCollaterals } from '@/hooks/useCollaterals'
import { Collateral } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import CollateralCard from '@/components/CollateralCard'
import CollateralForm from '@/components/CollateralForm'
import CollateralFilters from '@/components/CollateralFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  HomeIcon,
  BanknotesIcon,
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
      const matchesSearch = !filters.search || 
        (collateral.description && collateral.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (collateral.location && collateral.location.toLowerCase().includes(filters.search.toLowerCase())) ||
        (collateral.customer && collateral.customer.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (collateral.collateral_type && collateral.collateral_type.toLowerCase().includes(filters.search.toLowerCase())) ||
        collateral.collateral_id.toString().includes(filters.search)
      
      const matchesType = !filters.type || 
        (collateral.collateral_type && collateral.collateral_type === filters.type)
      
      const matchesStatus = !filters.status || 
        (collateral.status && collateral.status.toLowerCase() === filters.status.toLowerCase())
      
      const matchesCustomer = !filters.customerId || 
        collateral.customer_id.toString() === filters.customerId

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

  const handleNewCollateral = () => {
    setEditingCollateral(null)
    setShowForm(true)
  }

  const handleEditCollateral = (collateral: Collateral) => {
    setEditingCollateral(collateral)
    setShowForm(true)
  }

  const handleDeleteCollateral = async (collateralId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài sản đảm bảo này không?')) {
      try {
        await deleteCollateral(collateralId)
      } catch (error) {
        console.error('Error deleting collateral:', error)
      }
    }
  }

  const handleSaveCollateral = async (collateralData: Partial<Collateral>) => {
    try {
      if (editingCollateral) {
        await updateCollateral(editingCollateral.collateral_id, collateralData)
      } else {
        await createCollateral(collateralData)
      }
      setShowForm(false)
      setEditingCollateral(null)
    } catch (error) {
      console.error('Error saving collateral:', error)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingCollateral(null)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
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
            <p className="text-red-600">Lỗi: {error}</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tài Sản Đảm Bảo</h1>
            <p className="text-gray-600 mt-1">Quản lý tài sản đảm bảo và định giá của khách hàng</p>
          </div>
          <button
            onClick={handleNewCollateral}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Tài Sản
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Tài Sản</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Giá Trị</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giá Trị Trung Bình</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(stats.averageValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loại Phổ Biến</p>
                <p className="text-sm font-bold text-indigo-600">
                  {stats.mostCommonType || 'Không có'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CollateralFilters
          onFiltersChange={handleFiltersChange}
          availableCustomers={availableCustomers}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị {filteredCollaterals.length} trong tổng số {collaterals.length} tài sản đảm bảo
          </p>
          <div className="flex items-center space-x-4">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredCollaterals.length > 0 
                ? `Tổng giá trị đã lọc: ${formatCurrency(filteredCollaterals.reduce((sum, c) => sum + (c.value || 0), 0))}`
                : 'Không có dữ liệu'
              }
            </span>
          </div>
        </div>

        {/* Collaterals Grid */}
        {filteredCollaterals.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tài sản đảm bảo nào</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.type || filters.status || filters.customerId || filters.valueRange || filters.dateRange
                ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.'
                : 'Bắt đầu bằng cách thêm tài sản đảm bảo đầu tiên của bạn.'
              }
            </p>
            <button
              onClick={handleNewCollateral}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm Tài Sản
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCollaterals.map((collateral) => (
              <CollateralCard
                key={collateral.collateral_id}
                collateral={collateral}
                onEdit={handleEditCollateral}
                onDelete={handleDeleteCollateral}
              />
            ))}
          </div>
        )}

        {/* Collateral Form Modal */}
        {showForm && (
          <CollateralForm
            collateral={editingCollateral}
            onSave={handleSaveCollateral}
            onCancel={handleCancelForm}
            isLoading={loading}
            fetchCustomers={fetchCustomers}
          />
        )}
      </div>
    </div>
  )
}
