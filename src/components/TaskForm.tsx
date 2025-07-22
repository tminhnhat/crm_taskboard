import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Task, TaskStatusEnum, TaskPriority } from '@/lib/supabase'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  task?: Task | null
}

export default function TaskForm({ isOpen, onClose, onSubmit, task }: TaskFormProps) {
  const [formData, setFormData] = useState({
    task_name: '',
    task_type: '',
    task_note: '',
    task_status: 'needsAction' as TaskStatusEnum,
    task_priority: '' as TaskPriority | '',
    task_category: '',
    task_time_process: '',
    task_due_date: '',
    task_date_start: '',
    task_start_time: '',
    sync_status: 'pending',
    timezone_offset: 7,
    timezone: 'Asia/Ho_Chi_Minh'
  })

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name,
        task_type: task.task_type || '',
        task_note: task.task_note || '',
        task_status: task.task_status,
        task_priority: task.task_priority || '',
        task_category: task.task_category || '',
        task_time_process: task.task_time_process || '',
        task_due_date: task.task_due_date || '',
        task_date_start: task.task_date_start || '',
        task_start_time: task.task_start_time || '',
        sync_status: task.sync_status,
        timezone_offset: task.timezone_offset,
        timezone: task.timezone
      })
    } else {
      setFormData({
        task_name: '',
        task_type: '',
        task_note: '',
        task_status: 'needsAction',
        task_priority: '',
        task_category: '',
        task_time_process: '',
        task_due_date: '',
        task_date_start: '',
        task_start_time: '',
        sync_status: 'pending',
        timezone_offset: 7,
        timezone: 'Asia/Ho_Chi_Minh'
      })
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      task_type: formData.task_type || null,
      task_priority: formData.task_priority || null,
      task_category: formData.task_category || null,
      task_note: formData.task_note || null,
      task_time_process: formData.task_time_process || null,
      task_due_date: formData.task_due_date || null,
      task_date_start: formData.task_date_start || null,
      task_start_time: formData.task_start_time || null
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {task ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên công việc *
              </label>
              <input
                type="text"
                id="task_name"
                required
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên công việc"
              />
            </div>

            <div>
              <label htmlFor="task_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại công việc
              </label>
              <select
                id="task_type"
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn loại công việc</option>
                <option value="personal">Cá nhân</option>
                <option value="work">Công việc</option>
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

            <div>
              <label htmlFor="task_note" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                id="task_note"
                rows={3}
                value={formData.task_note}
                onChange={(e) => setFormData({ ...formData, task_note: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập ghi chú công việc"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="task_status"
                  value={formData.task_status}
                  onChange={(e) => setFormData({ ...formData, task_status: e.target.value as TaskStatusEnum })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="needsAction">Cần thực hiện</option>
                  <option value="inProgress">Đang thực hiện</option>
                  <option value="onHold">Tạm dừng</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Hủy bỏ</option>
                </select>
              </div>

              <div>
                <label htmlFor="task_priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  id="task_priority"
                  value={formData.task_priority}
                  onChange={(e) => setFormData({ ...formData, task_priority: e.target.value as TaskPriority | '' })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn độ ưu tiên</option>
                  <option value="Do first">Làm ngay</option>
                  <option value="Schedule">Lên lịch</option>
                  <option value="Delegate">Phân công</option>
                  <option value="Eliminate">Loại bỏ</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="task_category" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
              </label>
              <select
              id="task_category"
              value={formData.task_category}
              onChange={(e) => setFormData({ ...formData, task_category: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <option value="">Chọn danh mục công việc</option>
              <option value="disbursement">Giải ngân</option>
              <option value="guarantee issuance">Phát hành bảo lãnh</option>
              <option value="credit assessment">Thẩm định tín dụng</option>
              <option value="asset appraisal">Thẩm định tài sản</option>
              <option value="document preparation">Soạn hồ sơ</option>
              <option value="customer development">Phát triển khách hàng</option>
              <option value="customer care">Chăm sóc khách hàng</option>
              <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label htmlFor="task_time_process" className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian thực hiện
              </label>
              <input
                type="text"
                id="task_time_process"
                value={formData.task_time_process}
                onChange={(e) => setFormData({ ...formData, task_time_process: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 2 giờ 30 phút, 1 ngày, 3 hours"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập thời gian dự kiến (VD: 2 giờ 30 phút, 1 ngày, 45 phút)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task_date_start" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  id="task_date_start"
                  value={formData.task_date_start}
                  onChange={(e) => setFormData({ ...formData, task_date_start: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="task_start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  id="task_start_time"
                  value={formData.task_start_time}
                  onChange={(e) => setFormData({ ...formData, task_start_time: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="task_due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn
              </label>
              <input
                type="date"
                id="task_due_date"
                value={formData.task_due_date}
                onChange={(e) => setFormData({ ...formData, task_due_date: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {task ? 'Cập nhật công việc' : 'Tạo công việc'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
