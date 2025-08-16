import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Task, TaskStatusEnum, TaskPriority } from '@/lib/supabase'
import { toVNDate, toISODate, isValidDate } from '@/lib/date'

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
    task_time_process: '',
    task_time_process_display: '',
    task_due_date: '',
    task_date_start: '',
    task_start_time: '',
    sync_status: 'pending',
    timezone_offset: 7,
    timezone: 'Asia/Ho_Chi_Minh'
  })

  const formatTimeDurationForDisplay = (dbDuration: string | null): string => {
    if (!dbDuration) return ''
    const match = dbDuration.match(/^(\d{2}):(\d{2}):(\d{2})$/)
    if (!match) return ''
    
    const [, hours, minutes] = match
    const h = parseInt(hours)
    const m = parseInt(minutes)
    
    if (h === 0 && m === 0) return ''
    if (h === 0) return `${m} phút`
    if (m === 0) return h === 1 ? '1 giờ' : `${h} giờ`
    return `${h} giờ ${m} phút`
  }

  const formatTimeDurationForDB = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`
  }

  const parseUserInput = (input: string): string => {
    const hourMatch = input.match(/(\d+)\s*(?:giờ|h|hour|hours)/)
    const minuteMatch = input.match(/(\d+)\s*(?:phút|p|minute|minutes|m)/)
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    
    const totalMinutes = hours * 60 + minutes
    return totalMinutes > 0 ? formatTimeDurationForDB(totalMinutes) : ''
  }

  const handleTimeProcessChange = (value: string): void => {
    const dbFormat = parseUserInput(value)
    setFormData(prev => ({ 
      ...prev, 
      task_time_process: dbFormat,
      task_time_process_display: value
    }))
  }

  const handleDateChange = (field: 'task_date_start' | 'task_due_date', value: string): void => {
    let formattedValue = value.replace(/\D/g, '')
    
    if (formattedValue.length >= 2) {
      formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2)
    }
    if (formattedValue.length >= 5) {
      formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9)
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }))
  }

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name,
        task_type: task.task_type || '',
        task_note: task.task_note || '',
        task_status: task.task_status,
        task_priority: task.task_priority || '',
        task_time_process: task.task_time_process || '',
        task_time_process_display: formatTimeDurationForDisplay(task.task_time_process),
        task_due_date: task.task_due_date ? toVNDate(task.task_due_date) : '',
        task_date_start: task.task_date_start ? toVNDate(task.task_date_start) : '',
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
        task_time_process: '',
        task_time_process_display: '',
        task_due_date: '',
        task_date_start: '',
        task_start_time: '',
        sync_status: 'pending',
        timezone_offset: 7,
        timezone: 'Asia/Ho_Chi_Minh'
      })
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    
    if (formData.task_date_start && !isValidDate(formData.task_date_start)) {
      alert('Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    if (formData.task_due_date && !isValidDate(formData.task_due_date)) {
      alert('Định dạng ngày hết hạn không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    onSubmit({
      ...Object.fromEntries(
        Object.entries(formData).filter(([key]) => key !== 'task_time_process_display')
      ),
      task_type: formData.task_type || null,
      task_priority: formData.task_priority || null,
      task_note: formData.task_note || null,
      task_time_process: formData.task_time_process || null,
      task_due_date: formData.task_due_date ? toISODate(formData.task_due_date) : null,
      task_date_start: formData.task_date_start ? toISODate(formData.task_date_start) : null,
      task_start_time: formData.task_start_time || null
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {task ? 'Sửa công việc' : 'Tạo công việc mới'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="task_name" className="block text-sm font-medium text-gray-700">
                  Tên công việc
                </label>
                <input
                  type="text"
                  id="task_name"
                  value={formData.task_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">
                  Loại công việc
                </label>
                <select
                  id="task_type"
                  value={formData.task_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Chọn loại công việc</option>
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

              <div>
                <label htmlFor="task_priority" className="block text-sm font-medium text-gray-700">
                  Độ ưu tiên
                </label>
                <select
                  id="task_priority"
                  value={formData.task_priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_priority: e.target.value as TaskPriority }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Chọn độ ưu tiên</option>
                  <option value="Do first">Làm ngay</option>
                  <option value="Schedule">Lên lịch</option>
                  <option value="Delegate">Phân công</option>
                  <option value="Eliminate">Loại bỏ</option>
                </select>
              </div>

              <div>
                <label htmlFor="task_time_process" className="block text-sm font-medium text-gray-700">
                  Thời gian xử lý
                </label>
                <input
                  type="text"
                  id="task_time_process"
                  value={formData.task_time_process_display}
                  onChange={(e) => handleTimeProcessChange(e.target.value)}
                  placeholder="Ví dụ: 2 giờ 30 phút"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleTimeProcessChange("30 phút")}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    30 phút
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeProcessChange("1 giờ")}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    1 giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeProcessChange("2 giờ")}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    2 giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeProcessChange("4 giờ")}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    4 giờ
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="task_start_time" className="block text-sm font-medium text-gray-700">
                  Giờ bắt đầu
                </label>
                <input
                  type="text"
                  id="task_start_time"
                  value={formData.task_start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_start_time: e.target.value }))}
                  placeholder="HH:mm"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, task_start_time: '08:00' }))}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    8:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, task_start_time: '09:00' }))}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    9:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, task_start_time: '13:30' }))}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    13:30
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, task_start_time: '14:00' }))}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    14:00
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="task_date_start" className="block text-sm font-medium text-gray-700">
                  Ngày bắt đầu
                </label>
                <input
                  type="text"
                  id="task_date_start"
                  value={formData.task_date_start}
                  onChange={(e) => handleDateChange('task_date_start', e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      setFormData(prev => ({
                        ...prev,
                        task_date_start: toVNDate(today.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setFormData(prev => ({
                        ...prev,
                        task_date_start: toVNDate(tomorrow.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 3)
                      setFormData(prev => ({
                        ...prev,
                        task_date_start: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    3 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 4)
                      setFormData(prev => ({
                        ...prev,
                        task_date_start: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    4 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 5)
                      setFormData(prev => ({
                        ...prev,
                        task_date_start: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    5 ngày
                  </button>
                </div>
                {formData.task_date_start && !isValidDate(formData.task_date_start) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="task_due_date" className="block text-sm font-medium text-gray-700">
                  Ngày hết hạn
                </label>
                <input
                  type="text"
                  id="task_due_date"
                  value={formData.task_due_date}
                  onChange={(e) => handleDateChange('task_due_date', e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      setFormData(prev => ({
                        ...prev,
                        task_due_date: toVNDate(today.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setFormData(prev => ({
                        ...prev,
                        task_due_date: toVNDate(tomorrow.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 3)
                      setFormData(prev => ({
                        ...prev,
                        task_due_date: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    3 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 4)
                      setFormData(prev => ({
                        ...prev,
                        task_due_date: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    4 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date()
                      date.setDate(date.getDate() + 5)
                      setFormData(prev => ({
                        ...prev,
                        task_due_date: toVNDate(date.toISOString().split('T')[0])
                      }))
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    5 ngày
                  </button>
                </div>
                {formData.task_due_date && !isValidDate(formData.task_due_date) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="task_note" className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  id="task_note"
                  rows={3}
                  value={formData.task_note}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_note: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
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
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
