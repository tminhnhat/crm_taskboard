import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

interface TaskFiltersProps {
  filters: {
    status: string
    priority: string
    search: string
    sortBy: string
    taskType: string
  }
  onFiltersChange: (filters: { status: string; priority: string; search: string; sortBy: string; taskType: string }) => void
}

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
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
            placeholder="Tìm kiếm công việc..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-600">Trạng thái:</label>
          <select
            id="status-filter"
            value={filters.status || "needsAction"}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="needsAction">Cần thực hiện</option>
            <option value="inProgress">Đang thực hiện</option>
            <option value="onHold">Tạm dừng</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Hủy bỏ</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="priority-filter" className="text-sm text-gray-600">Độ ưu tiên:</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="Do first">Làm ngay</option>
            <option value="Schedule">Lên lịch</option>
            <option value="Delegate">Phân công</option>
            <option value="Eliminate">Loại bỏ</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="task-type-filter" className="text-sm text-gray-600">Loại công việc:</label>
          <select
            id="task-type-filter"
            value={filters.taskType}
            onChange={(e) => updateFilter('taskType', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="disbursement">Giải ngân</option>
            <option value="guarantee issuance">Phát hành bảo lãnh</option>
            <option value="credit assessment">Thẩm định tín dụng</option>
            <option value="asset appraisal">Thẩm định tài sản</option>
            <option value="document preparation">Soạn hồ sơ</option>
            <option value="customer development">Phát triển khách hàng</option>
            <option value="customer care">Chăm sóc khách hàng</option>
            <option value="meeting">Cuộc họp</option>
            <option value="project">Dự án</option>
            <option value="reminder">Nhắc nhở</option>
            <option value="call">Gọi điện</option>
            <option value="email">Email</option>
            <option value="training">Đào tạo</option>
            <option value="research">Nghiên cứu</option>
            <option value="maintenance">Bảo trì</option>
            <option value="other">Khác</option>
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
            <option value="created_at">Ngày tạo</option>
            <option value="task_date_start">Ngày bắt đầu</option>
            <option value="task_due_date">Ngày hết hạn</option>
            <option value="task_name">Tên công việc</option>
            <option value="task_priority">Độ ưu tiên</option>
            <option value="task_status">Trạng thái</option>
          </select>
        </div>
        
        <button
          onClick={() => onFiltersChange({ status: '', priority: '', search: '', sortBy: 'task_date_start', taskType: '' })}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>
    </div>
  )
}
