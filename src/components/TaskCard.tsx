import { Task, TaskStatusEnum } from '@/lib/supabase'
import { toVNDate } from '@/lib/date'
import { 
  CalendarIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import {
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onStatusChange: (taskId: number, status: TaskStatusEnum) => void
}

const priorityColors = {
  'Do first': 'error' as const,
  'Schedule': 'warning' as const,
  'Delegate': 'info' as const,
  'Eliminate': 'default' as const
}

const priorityLabels = {
  'Do first': 'Làm ngay',
  'Schedule': 'Lên lịch',
  'Delegate': 'Phân công',
  'Eliminate': 'Loại bỏ'
}

const statusColors = {
  needsAction: 'default' as const,
  inProgress: 'primary' as const,
  onHold: 'warning' as const,
  completed: 'success' as const,
  cancelled: 'error' as const,
  deleted: 'error' as const
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
  'disbursement': 'Giải ngân',
  'guarantee issuance': 'Phát hành bảo lãnh',
  'credit assessment': 'Thẩm định tín dụng',
  'asset appraisal': 'Thẩm định tài sản',
  'document preparation': 'Soạn hồ sơ',
  'customer development': 'Phát triển khách hàng',
  'customer care': 'Chăm sóc khách hàng',
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
  // Check if task is overdue by comparing ISO dates to avoid timezone issues
  const isOverdue = task.task_due_date && 
    new Date(task.task_due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) && 
    task.task_status !== 'completed'

  // Helper function to format date using utility function
  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      return toVNDate(dateString);
    } catch {
      return '';
    }
  }

  return (
    <Card sx={{ '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="h3" color="text.primary">
                {task.task_name}
              </Typography>
              {isOverdue && (
                <WarningIcon color="error" fontSize="small" />
              )}
            </Box>
            
            {task.task_note && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {task.task_note}
              </Typography>
            )}
            
            <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
              <Chip 
                icon={<StatusIcon style={{ fontSize: '1rem' }} />}
                label={statusLabels[task.task_status]}
                color={statusColors[task.task_status]}
                size="small"
              />
              {task.task_priority && (
                <Chip
                  label={priorityLabels[task.task_priority]}
                  color={priorityColors[task.task_priority]}
                  size="small"
                />
              )}
              {task.task_type && (
                <Chip
                  label={taskTypeLabels[task.task_type] || task.task_type}
                  color="secondary"
                  size="small"
                />
              )}
            </Box>
            
            <Box sx={{ '& > *': { mb: 0.5 } }}>
              {task.task_due_date && (
                <Box display="flex" alignItems="center" color={isOverdue ? 'error.main' : 'text.secondary'}>
                  <CalendarIcon style={{ fontSize: '1rem', marginRight: 4 }} />
                  <Typography variant="body2" color="inherit">
                    Hạn: {formatDateDisplay(task.task_due_date)}
                  </Typography>
                </Box>
              )}
              {task.task_date_start && (
                <Box display="flex" alignItems="center" color="text.secondary">
                  <CalendarIcon style={{ fontSize: '1rem', marginRight: 4 }} />
                  <Typography variant="body2" color="inherit">
                    Bắt đầu: {formatDateDisplay(task.task_date_start)}
                    {task.task_start_time && ` lúc ${task.task_start_time}`}
                  </Typography>
                </Box>
              )}
              {task.task_date_finish && (
                <Box display="flex" alignItems="center" color="success.main">
                  <CheckCircleIcon style={{ fontSize: '1rem', marginRight: 4 }} />
                  <Typography variant="body2" color="inherit">
                    Hoàn thành: {formatDateDisplay(task.task_date_finish)}
                    {task.task_time_finish && ` lúc ${task.task_time_finish}`}
                  </Typography>
                </Box>
              )}
              {task.task_time_process && (
                <Box display="flex" alignItems="center" color="text.secondary">
                  <ClockIcon style={{ fontSize: '1rem', marginRight: 4 }} />
                  <Typography variant="body2" color="inherit">
                    Thời gian dự kiến: {task.task_time_process}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box display="flex" flexDirection="column" gap={1} ml={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={task.task_status}
                onChange={(e) => onStatusChange(task.task_id, e.target.value as TaskStatusEnum)}
                variant="outlined"
                size="small"
              >
                <MenuItem value="needsAction">Cần thực hiện</MenuItem>
                <MenuItem value="inProgress">Đang thực hiện</MenuItem>
                <MenuItem value="onHold">Tạm dừng</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="cancelled">Hủy bỏ</MenuItem>
                <MenuItem value="deleted">Đã xóa</MenuItem>
              </Select>
            </FormControl>
            
            <Box display="flex" gap={0.5}>
              <Button
                onClick={() => onEdit(task)}
                startIcon={<EditIcon />}
                size="small"
                variant="text"
                color="primary"
              >
                Sửa
              </Button>
              <Button
                onClick={() => onDelete(task.task_id)}
                startIcon={<DeleteIcon />}
                size="small"
                variant="text"
                color="error"
              >
                Xóa
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
