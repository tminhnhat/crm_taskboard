'use client'

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface StaffFiltersProps {
  filters: {
    search: string
    status: string
    department: string
    position: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    department: string
    position: string
  }) => void
  availableDepartments: string[]
  availablePositions: string[]
  totalCount: number
  filteredCount: number
}

export default function StaffFilters({
  filters,
  onFiltersChange,
  availableDepartments,
  availablePositions,
  totalCount,
  filteredCount
}: StaffFiltersProps) {
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
      department: '',
      position: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.department || filters.position

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Filter */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm Kiếm Nhân Viên
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email..."
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
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Phòng Ban
          </label>
          <select
            id="department"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Phòng Ban</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Position Filter */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            Vị Trí
          </label>
          <select
            id="position"
            value={filters.position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Vị Trí</option>
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span>
          Hiển thị {filteredCount} trong tổng số {totalCount} nhân viên
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
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Trạng thái: {filters.status}
                </span>
              )}
              {filters.department && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Phòng ban: {filters.department}
                </span>
              )}
              {filters.position && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Vị trí: {filters.position}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
