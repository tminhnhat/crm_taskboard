import { Task, TaskStatusEnum } from '@/lib/supabase'
import { 
  CalendarIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onStatusChange: (taskId: number, status: TaskStatusEnum) => void
}

const priorityColors = {
  'Do first': 'bg-red-100 text-red-800',
  'Schedule': 'bg-yellow-100 text-yellow-800',
  'Delegate': 'bg-blue-100 text-blue-800',
  'Eliminate': 'bg-gray-100 text-gray-800'
}

const priorityLabels = {
  'Do first': 'Làm ngay',
  'Schedule': 'Lên lịch',
  'Delegate': 'Phân công',
  'Eliminate': 'Loại bỏ'
}

const statusColors = {
  needsAction: 'bg-gray-100 text-gray-800',
  inProgress: 'bg-blue-100 text-blue-800',
  onHold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  deleted: 'bg-red-200 text-red-900'
}

const statusIcons = {
  needsAction: ClockIcon,
  inProgress: PlayIcon,
  onHold: PauseIcon,
  completed: CheckCircleIcon,
  cancelled: XCircleIcon,
  deleted: XCircleIcon
}

const statusLabels = {
  needsAction: 'Cần thực hiện',
  inProgress: 'Đang thực hiện',
  onHold: 'Tạm dừng',
  completed: 'Hoàn thành',
  cancelled: 'Hủy bỏ',
  deleted: 'Đã xóa'
}

const taskTypeLabels: { [key: string]: string } = {
  'personal': 'Cá nhân',
  'work': 'Công việc',
  'meeting': 'Cuộc họp',
  'project': 'Dự án',
  'reminder': 'Nhắc nhở',
  'call': 'Gọi điện',
  'email': 'Email',
  'training': 'Đào tạo',
  'research': 'Nghiên cứu',
  'maintenance': 'Bảo trì',
  'other': 'Khác'
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const StatusIcon = statusIcons[task.task_status]
  const isOverdue = task.task_due_date && new Date(task.task_due_date) < new Date() && task.task_status !== 'completed'

  // Helper function to format date consistently, avoiding timezone issues
  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return ''
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return ''
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.task_name}</h3>
            {isOverdue && (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          {task.task_note && (
            <p className="text-gray-600 text-sm mb-3">{task.task_note}</p>
          )}
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.task_status]}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[task.task_status]}
            </span>
            {task.task_priority && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.task_priority]}`}>
                {priorityLabels[task.task_priority]}
              </span>
            )}
            {task.task_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {taskTypeLabels[task.task_type] || task.task_type}
              </span>
            )}
            {task.task_category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {task.task_category}
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-500">
            {task.task_due_date && (
              <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Hạn: {formatDateDisplay(task.task_due_date)}
              </div>
            )}
            {task.task_date_start && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Bắt đầu: {formatDateDisplay(task.task_date_start)}
                {task.task_start_time && ` lúc ${task.task_start_time}`}
              </div>
            )}
            {task.task_date_finish && (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Hoàn thành: {formatDateDisplay(task.task_date_finish)}
                {task.task_time_finish && ` lúc ${task.task_time_finish}`}
              </div>
            )}
            {task.task_time_process && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Thời gian dự kiến: {task.task_time_process}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={task.task_status}
            onChange={(e) => onStatusChange(task.task_id, e.target.value as TaskStatusEnum)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="needsAction">Cần thực hiện</option>
            <option value="inProgress">Đang thực hiện</option>
            <option value="onHold">Tạm dừng</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Hủy bỏ</option>
            <option value="deleted">Đã xóa</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(task.task_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
