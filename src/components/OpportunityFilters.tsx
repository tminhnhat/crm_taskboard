'use client'

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface OpportunityFiltersProps {
  filters: {
    search: string
    status: string
    customerId: string
    productId: string
    staffId: string
    valueRange: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    customerId: string
    productId: string
    staffId: string
    valueRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
  availableProducts: Array<{ product_id: number; product_name: string }>
  availableStaff: Array<{ staff_id: number; full_name: string }>
  totalCount: number
  filteredCount: number
}

export default function OpportunityFilters({
  filters,
  onFiltersChange,
  availableCustomers,
  availableProducts,
  availableStaff,
  totalCount,
  filteredCount
}: OpportunityFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      customerId: '',
      productId: '',
      staffId: '',
      valueRange: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.customerId || 
                          filters.productId || filters.staffId || filters.valueRange

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
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Search Filter */}
        <div className="lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm Kiếm Cơ Hội
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm theo khách hàng, sản phẩm..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Trạng Thái
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="new">Mới</option>
            <option value="in_progress">Đang Thực Hiện</option>
            <option value="won">Thành Công</option>
            <option value="lost">Thất Bại</option>
          </select>
        </div>

        {/* Value Range Filter */}
        <div>
          <label htmlFor="valueRange" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng Giá Trị
          </label>
          <select
            id="valueRange"
            value={filters.valueRange}
            onChange={(e) => handleFilterChange('valueRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Giá Trị</option>
            <option value="0-1000">$0 - $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="10000-50000">$10,000 - $50,000</option>
            <option value="50000+">$50,000+</option>
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

        {/* Product Filter */}
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
            Sản Phẩm
          </label>
          <select
            id="productId"
            value={filters.productId}
            onChange={(e) => handleFilterChange('productId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Sản Phẩm</option>
            {availableProducts.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Filter */}
        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
            Người Phụ Trách
          </label>
          <select
            id="staffId"
            value={filters.staffId}
            onChange={(e) => handleFilterChange('staffId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Nhân Viên</option>
            {availableStaff.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span>
          Hiển thị {filteredCount} trong số {totalCount} cơ hội
          {hasActiveFilters && (
            <span className="text-blue-600 ml-1">
              (đã lọc)
            </span>
          )}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Bộ lọc đang áp dụng:</span>
            <div className="flex gap-1 flex-wrap">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Trạng thái: {filters.status}
                </span>
              )}
              {filters.valueRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Giá trị: ${filters.valueRange}
                </span>
              )}
              {filters.customerId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Khách hàng
                </span>
              )}
              {filters.productId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  Sản phẩm
                </span>
              )}
              {filters.staffId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Người phụ trách
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
