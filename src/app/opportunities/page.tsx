'use client'

import { useState, useMemo } from 'react'
import { useOpportunities } from '@/hooks/useOpportunities'
import { Opportunity } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import OpportunityCard from '@/components/OpportunityCard'
import OpportunityForm from '@/components/OpportunityForm'
import OpportunityFilters from '@/components/OpportunityFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export default function OpportunitiesPage() {
  const { 
    opportunities, 
    loading, 
    error, 
    createOpportunity, 
    updateOpportunity, 
    deleteOpportunity,
    fetchCustomers,
    fetchProducts,
    fetchStaff
  } = useOpportunities()
  const [showForm, setShowForm] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customerId: '',
    productId: '',
    staffId: '',
    valueRange: ''
  })

  // Get available options for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    opportunities.forEach(opportunity => {
      if (opportunity.customer) {
        customers.set(opportunity.customer.customer_id, {
          customer_id: opportunity.customer.customer_id,
          full_name: opportunity.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [opportunities])

  const availableProducts = useMemo(() => {
    const products = new Map()
    opportunities.forEach(opportunity => {
      if (opportunity.product) {
        products.set(opportunity.product.product_id, {
          product_id: opportunity.product.product_id,
          product_name: opportunity.product.product_name
        })
      }
    })
    return Array.from(products.values()).sort((a, b) => a.product_name.localeCompare(b.product_name))
  }, [opportunities])

  const availableStaff = useMemo(() => {
    const staff = new Map()
    opportunities.forEach(opportunity => {
      if (opportunity.staff) {
        staff.set(opportunity.staff.staff_id, {
          staff_id: opportunity.staff.staff_id,
          full_name: opportunity.staff.full_name
        })
      }
    })
    return Array.from(staff.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [opportunities])

  // Filter opportunities based on current filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      const matchesSearch = !filters.search || 
        (opportunity.customer && opportunity.customer.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (opportunity.product && opportunity.product.product_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (opportunity.staff && opportunity.staff.full_name.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || opportunity.status === filters.status
      
      const matchesCustomer = !filters.customerId || opportunity.customer_id.toString() === filters.customerId
      
      const matchesProduct = !filters.productId || opportunity.product_id.toString() === filters.productId
      
      const matchesStaff = !filters.staffId || opportunity.staff_id.toString() === filters.staffId

      let matchesValueRange = true
      if (filters.valueRange && opportunity.expected_value !== null) {
        const value = opportunity.expected_value
        switch (filters.valueRange) {
          case '0-2000000000':
            matchesValueRange = value >= 0 && value <= 2000000000
            break
          case '2000000000-5000000000':
            matchesValueRange = value > 2000000000 && value <= 5000000000
            break
          case '5000000000+':
            matchesValueRange = value > 5000000000
            break
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesProduct && matchesStaff && matchesValueRange
    })
  }, [opportunities, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = opportunities.length
    const totalValue = opportunities
      .filter(o => o.expected_value !== null)
      .reduce((sum, o) => sum + (o.expected_value || 0), 0)
    
    const won = opportunities.filter(o => o.status === 'won').length
    const wonValue = opportunities
      .filter(o => o.status === 'won' && o.expected_value !== null)
      .reduce((sum, o) => sum + (o.expected_value || 0), 0)
    
    const inProgress = opportunities.filter(o => o.status === 'in_progress').length
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0'

    return { total, totalValue, won, wonValue, inProgress, conversionRate }
  }, [opportunities])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleSaveOpportunity = async (opportunityData: Partial<Opportunity>) => {
    try {
      if (editingOpportunity) {
        await updateOpportunity(editingOpportunity.opportunity_id, opportunityData)
      } else {
        await createOpportunity(opportunityData)
      }
      setShowForm(false)
      setEditingOpportunity(null)
    } catch (error) {
      console.error('Error saving opportunity:', error)
      alert('Lưu cơ hội thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setShowForm(true)
  }

  const handleDeleteOpportunity = async (opportunityId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ hội này không?')) {
      try {
        await deleteOpportunity(opportunityId)
      } catch (error) {
        console.error('Error deleting opportunity:', error)
        alert('Xóa cơ hội thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleStatusChange = async (opportunityId: number, status: string) => {
    try {
      await updateOpportunity(opportunityId, { status })
    } catch (error) {
      console.error('Error updating opportunity status:', error)
      alert('Cập nhật trạng thái cơ hội thất bại. Vui lòng thử lại.')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingOpportunity(null)
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
              <p className="text-red-800">Lỗi khi tải danh sách cơ hội: {error}</p>
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
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cơ Hội Bán Hàng</h1>
                <p className="text-gray-600">Theo dõi và quản lý quy trình bán hàng của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm Cơ Hội
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Cơ Hội</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Giá Trị Pipeline</p>
                <p className="text-xl font-semibold text-blue-600">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Giao Dịch Thành Công</p>
                <p className="text-2xl font-semibold text-green-600">{stats.won}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Giá Trị Thành Công</p>
                <p className="text-xl font-semibold text-green-600">{formatCurrency(stats.wonValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tỷ Lệ Chuyển Đổi</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <OpportunityFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCustomers={availableCustomers}
          availableProducts={availableProducts}
          availableStaff={availableStaff}
          totalCount={opportunities.length}
          filteredCount={filteredOpportunities.length}
        />

        {/* Opportunities List */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {opportunities.length === 0 ? 'Chưa có cơ hội nào' : 'Không có cơ hội nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {opportunities.length === 0 
                ? 'Bắt đầu bằng cách tạo cơ hội bán hàng đầu tiên của bạn.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </p>
            {opportunities.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Tạo Cơ Hội Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.opportunity_id}
                opportunity={opportunity}
                onEdit={handleEditOpportunity}
                onDelete={handleDeleteOpportunity}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Opportunity Form Modal */}
        {showForm && (
          <OpportunityForm
            opportunity={editingOpportunity}
            onSave={handleSaveOpportunity}
            onCancel={handleCancelForm}
            isLoading={loading}
            fetchCustomers={fetchCustomers}
            fetchProducts={fetchProducts}
            fetchStaff={fetchStaff}
          />
        )}
      </div>
    </div>
  )
}
