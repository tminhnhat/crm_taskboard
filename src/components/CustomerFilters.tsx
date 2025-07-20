import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

interface CustomerFiltersProps {
  filters: {
    customerType: string
    status: string
    search: string
    sortBy: string
  }
  onFiltersChange: (filters: { customerType: string; status: string; search: string; sortBy: string }) => void
}

export default function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="search" className="text-sm text-gray-600">Tìm kiếm:</label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Tìm kiếm khách hàng..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="customer-type-filter" className="text-sm text-gray-600">Loại:</label>
          <select
            id="customer-type-filter"
            value={filters.customerType}
            onChange={(e) => updateFilter('customerType', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Loại</option>
            <option value="individual">Cá Nhân</option>
            <option value="corporate">Doanh Nghiệp</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600">Trạng thái:</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="suspended">Tạm Dừng</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
          <label htmlFor="sort-filter" className="text-sm text-gray-600">Sắp xếp theo:</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Ngày Tạo</option>
            <option value="full_name">Tên</option>
            <option value="account_number">Mã Tài Khoản</option>
            <option value="cif_number">Số CIF</option>
            <option value="customer_type">Loại Khách Hàng</option>
            <option value="status">Trạng Thái</option>
            <option value="date_of_birth">Ngày Sinh</option>
          </select>
        </div>
        
        <button
          onClick={() => onFiltersChange({ customerType: '', status: '', search: '', sortBy: 'created_at' })}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  )
}
