'use client'

import { useState, useEffect } from 'react'

interface CollateralFiltersProps {
  onFiltersChange: (filters: {
    search: string
    type: string
    status: string
    customerId: string
    valueRange: string
    dateRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
}

export default function CollateralFilters({ 
  onFiltersChange, 
  availableCustomers
}: CollateralFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    customerId: '',
    valueRange: '',
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
      type: '',
      status: '',
      customerId: '',
      valueRange: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const collateralTypes = [
    { value: 'Real Estate', label: 'Bất Động Sản' },
    { value: 'Vehicle/Car', label: 'Xe Cộ' },
    { value: 'Savings Account', label: 'Tài Khoản Tiết Kiệm' },
    { value: 'Equipment', label: 'Thiết Bị' },
    { value: 'Jewelry', label: 'Trang Sức' },
    { value: 'Securities', label: 'Chứng Khoán' },
    { value: 'Land', label: 'Đất Đai' },
    { value: 'Building', label: 'Công Trình' },
    { value: 'Other', label: 'Khác' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'deactive', label: 'Không Hoạt Động' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4">
        {/* Search and Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tài sản theo mô tả, vị trí hoặc khách hàng..."
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
              {isExpanded ? 'Ẩn Bộ Lọc' : 'Hiển Thị Bộ Lọc'}
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
            {/* Collateral Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Tài Sản
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất Cả Loại</option>
                {collateralTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng Thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất Cả Trạng Thái</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khách Hàng
              </label>
              <select
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất Cả Khách Hàng</option>
                {availableCustomers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id.toString()}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoảng Giá Trị (VND)
              </label>
              <select
                value={filters.valueRange}
                onChange={(e) => handleFilterChange('valueRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất Cả Giá Trị</option>
                <option value="0-100000000">Dưới 100 Triệu</option>
                <option value="100000000-500000000">100 Triệu - 500 Triệu</option>
                <option value="500000000-1000000000">500 Triệu - 1 Tỷ</option>
                <option value="1000000000-5000000000">1 Tỷ - 5 Tỷ</option>
                <option value="5000000000+">Trên 5 Tỷ</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời Gian Thẩm Định
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất Cả Thời Gian</option>
                <option value="month">Tháng Này</option>
                <option value="quarter">Quý Này</option>
                <option value="year">Năm Này</option>
                <option value="older">Trên 1 Năm</option>
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
            {filters.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Loại: {collateralTypes.find(t => t.value === filters.type)?.label}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Trạng thái: {statusOptions.find(s => s.value === filters.status)?.label}
              </span>
            )}
            {filters.customerId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Khách hàng: {availableCustomers.find(c => c.customer_id.toString() === filters.customerId)?.full_name}
              </span>
            )}
            {filters.valueRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Giá trị: {
                  filters.valueRange === '0-100000000' ? 'Dưới 100 Triệu' :
                  filters.valueRange === '100000000-500000000' ? '100 Triệu - 500 Triệu' :
                  filters.valueRange === '500000000-1000000000' ? '500 Triệu - 1 Tỷ' :
                  filters.valueRange === '1000000000-5000000000' ? '1 Tỷ - 5 Tỷ' :
                  filters.valueRange === '5000000000+' ? 'Trên 5 Tỷ' : filters.valueRange
                }
              </span>
            )}
            {filters.dateRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Thời gian: {
                  filters.dateRange === 'month' ? 'Tháng này' :
                  filters.dateRange === 'quarter' ? 'Quý này' :
                  filters.dateRange === 'year' ? 'Năm này' :
                  filters.dateRange === 'older' ? 'Trên 1 năm' : filters.dateRange
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
