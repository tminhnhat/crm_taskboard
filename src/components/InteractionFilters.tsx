'use client'

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface InteractionFiltersProps {
  filters: {
    search: string
    interactionType: string
    customerId: string
    staffId: string
    dateRange: string
  }
  onFiltersChange: (filters: {
    search: string
    interactionType: string
    customerId: string
    staffId: string
    dateRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
  availableStaff: Array<{ staff_id: number; full_name: string }>
  totalCount: number
  filteredCount: number
}

export default function InteractionFilters({
  filters,
  onFiltersChange,
  availableCustomers,
  availableStaff,
  totalCount,
  filteredCount
}: InteractionFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      interactionType: '',
      customerId: '',
      staffId: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = filters.search || filters.interactionType || filters.customerId || filters.staffId || filters.dateRange

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Bộ Lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
          >
            Xóa Tất Cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Search Filter */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm Kiếm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm kiếm ghi chú..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Interaction Type Filter */}
        <div>
          <label htmlFor="interactionType" className="block text-sm font-medium text-gray-700 mb-1">
            Loại
          </label>
          <select
            id="interactionType"
            value={filters.interactionType}
            onChange={(e) => handleFilterChange('interactionType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Loại</option>
            <option value="call">Gọi Điện</option>
            <option value="email">Email</option>
            <option value="meeting">Cuộc Họp</option>
            <option value="chat">Trò Chuyện/Tin Nhắn</option>
            <option value="visit">Thăm Trực Tiếp</option>
            <option value="support">Phiếu Hỗ Trợ</option>
            <option value="follow-up">Theo Dõi</option>
            <option value="complaint">Khiếu Nại</option>
            <option value="inquiry">Yêu Cầu Thông Tin</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
            Khách Hàng
          </label>
          <select
            id="customerId"
            value={filters.customerId}
            onChange={(e) => handleFilterChange('customerId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Khách Hàng</option>
            {availableCustomers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Filter */}
        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
            Nhân Viên
          </label>
          <select
            id="staffId"
            value={filters.staffId}
            onChange={(e) => handleFilterChange('staffId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Nhân Viên</option>
            {availableStaff.map((member) => (
              <option key={member.staff_id} value={member.staff_id}>
                {member.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng Thời Gian
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Thời Gian</option>
            <option value="today">Hôm Nay</option>
            <option value="yesterday">Hôm Qua</option>
            <option value="week">Tuần Này</option>
            <option value="month">Tháng Này</option>
            <option value="quarter">Quý Này</option>
            <option value="year">Năm Này</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span>
          Hiển thị {filteredCount} trong tổng số {totalCount} tương tác
          {hasActiveFilters && (
            <span className="text-blue-600 ml-1">
              (đã lọc)
            </span>
          )}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Bộ lọc đang hoạt động:</span>
            <div className="flex gap-1 flex-wrap">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: {filters.search}
                </span>
              )}
              {filters.interactionType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Loại: {filters.interactionType}
                </span>
              )}
              {filters.customerId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Khách hàng
                </span>
              )}
              {filters.staffId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Nhân viên
                </span>
              )}
              {filters.dateRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {filters.dateRange === 'today' ? 'Hôm nay' : 
                   filters.dateRange === 'yesterday' ? 'Hôm qua' :
                   filters.dateRange === 'week' ? 'Tuần này' :
                   filters.dateRange === 'month' ? 'Tháng này' :
                   filters.dateRange === 'quarter' ? 'Quý này' :
                   filters.dateRange === 'year' ? 'Năm này' : filters.dateRange}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
