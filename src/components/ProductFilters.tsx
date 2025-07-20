'use client'

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ProductFiltersProps {
  filters: {
    search: string
    status: string
    productType: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    productType: string
  }) => void
  availableProductTypes: string[]
  totalCount: number
  filteredCount: number
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  availableProductTypes,
  totalCount,
  filteredCount
}: ProductFiltersProps) {
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
      productType: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.productType

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search Filter */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm Kiếm Sản Phẩm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm theo tên hoặc mô tả..."
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
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="discontinued">Ngừng Sản Xuất</option>
            <option value="draft">Bản Nháp</option>
          </select>
        </div>

        {/* Product Type Filter */}
        <div>
          <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
            Loại Sản Phẩm
          </label>
          <select
            id="productType"
            value={filters.productType}
            onChange={(e) => handleFilterChange('productType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Loại</option>
            {availableProductTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span>
          Hiển thị {filteredCount} trong tổng số {totalCount} sản phẩm
          {hasActiveFilters && (
            <span className="text-blue-600 ml-1">
              (đã lọc)
            </span>
          )}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Bộ lọc đang hoạt động:</span>
            <div className="flex gap-1">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Trạng thái: {filters.status === 'active' ? 'Đang Hoạt Động' :
                              filters.status === 'inactive' ? 'Không Hoạt Động' :
                              filters.status === 'discontinued' ? 'Ngừng Sản Xuất' :
                              filters.status === 'draft' ? 'Bản Nháp' : filters.status}
                </span>
              )}
              {filters.productType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Loại: {filters.productType}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
