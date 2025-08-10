'use client'

import { useState, useEffect } from 'react'

interface CreditAssessmentFiltersProps {
  onFiltersChange: (filters: {
    search: string
    result: string
    customerId: string
    dateRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
    // availableStaff: Array<{ staff_id: number; full_name: string }>
}

export default function CreditAssessmentFilters({ 
  onFiltersChange, 
  availableCustomers,
    // availableStaff
}: CreditAssessmentFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    result: '',
    customerId: '',
    dateRange: ''
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      result: '',
      customerId: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4">
        {/* Search and Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                Xóa Tất Cả
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {/* Assessment Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kết quả
              </label>
              <select
                value={filters.result}
                onChange={(e) => handleFilterChange('result', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả kết quả</option>
                <option value="pending">Đang chờ</option>
                <option value="approved">Đã phê duyệt</option>
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khách hàng
              </label>
              <select
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả khách hàng</option>
                {availableCustomers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id.toString()}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian đánh giá
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">Quý này</option>
                <option value="year">Năm này</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tìm kiếm: {filters.search}
              </span>
            )}
            {filters.result && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Kết quả: {filters.result === 'approved' ? 'Đã phê duyệt' :
                         filters.result === 'pending' ? 'Đang chờ' :
                         filters.result}
              </span>
            )}
            {filters.customerId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Khách hàng: {availableCustomers.find(c => c.customer_id.toString() === filters.customerId)?.full_name}
              </span>
            )}
            {filters.dateRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Thời gian: {filters.dateRange === 'today' ? 'Hôm nay' :
                           filters.dateRange === 'week' ? 'Tuần này' :
                           filters.dateRange === 'month' ? 'Tháng này' :
                           filters.dateRange === 'quarter' ? 'Quý này' :
                           filters.dateRange === 'year' ? 'Năm này' :
                           filters.dateRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
