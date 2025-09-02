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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm tài sản theo mô tả, vị trí hoặc khách hàng..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none"></div>
      </div>

      {/* Filter Toggle and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isExpanded 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          <span>{isExpanded ? '🔼 Ẩn Bộ Lọc' : '🔽 Mở Bộ Lọc'}</span>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>🧹 Xóa Tất Cả</span>
          </button>
        )}
      </div>

        {/* Enhanced Expanded Filters */}
        {isExpanded && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Collateral Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                💎 Loại Tài Sản
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 shadow-lg hover:shadow-xl"
              >
                <option value="">🌟 Tất Cả Loại</option>
                {collateralTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                📊 Trạng Thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300 shadow-lg hover:shadow-xl"
              >
                <option value="">🌟 Tất Cả Trạng Thái</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.value === 'active' ? '✅' : '❌'} {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                👤 Khách Hàng
              </label>
              <select
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 shadow-lg hover:shadow-xl"
              >
                <option value="">🌟 Tất Cả Khách Hàng</option>
                {availableCustomers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id.toString()}>
                    👤 {customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Value Range */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                💰 Khoảng Giá Trị (VND)
              </label>
              <select
                value={filters.valueRange}
                onChange={(e) => handleFilterChange('valueRange', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-yellow-300 shadow-lg hover:shadow-xl"
              >
                <option value="">🌟 Tất Cả Giá Trị</option>
                <option value="0-100000000">💵 Dưới 100 Triệu</option>
                <option value="100000000-500000000">💶 100 Triệu - 500 Triệu</option>
                <option value="500000000-1000000000">💷 500 Triệu - 1 Tỷ</option>
                <option value="1000000000-5000000000">💸 1 Tỷ - 5 Tỷ</option>
                <option value="5000000000+">💎 Trên 5 Tỷ</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                📅 Thời Gian Thẩm Định
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 shadow-lg hover:shadow-xl"
              >
                <option value="">🌟 Tất Cả Thời Gian</option>
                <option value="month">📅 Tháng Này</option>
                <option value="quarter">📊 Quý Này</option>
                <option value="year">🗓️ Năm Này</option>
                <option value="older">⏰ Trên 1 Năm</option>
              </select>
            </div>
          </div>
        )}

      {/* Enhanced Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-1">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-700">🏷️ Bộ lọc đang áp dụng:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                🔍 {filters.search}
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300">
                💎 {collateralTypes.find(t => t.value === filters.type)?.label}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                📊 {statusOptions.find(s => s.value === filters.status)?.label}
              </span>
            )}
            {filters.customerId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300">
                👤 {availableCustomers.find(c => c.customer_id.toString() === filters.customerId)?.full_name}
              </span>
            )}
            {filters.valueRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                💰 {
                  filters.valueRange === '0-100000000' ? 'Dưới 100 Triệu' :
                  filters.valueRange === '100000000-500000000' ? '100 Triệu - 500 Triệu' :
                  filters.valueRange === '500000000-1000000000' ? '500 Triệu - 1 Tỷ' :
                  filters.valueRange === '1000000000-5000000000' ? '1 Tỷ - 5 Tỷ' :
                  'Trên 5 Tỷ'
                }
              </span>
            )}
            {filters.dateRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border border-rose-300">
                📅 {
                  filters.dateRange === 'month' ? 'Tháng Này' :
                  filters.dateRange === 'quarter' ? 'Quý Này' :
                  filters.dateRange === 'year' ? 'Năm Này' :
                  'Trên 1 Năm'
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
