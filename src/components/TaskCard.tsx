import React from 'react';
import { Task, TaskStatusEnum } from '@/lib/supabase'
import { toVNDate } from '@/lib/date'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { 
  Schedule,
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Delete,
  Warning,
  Event,
  AccessTime,
  Edit,
  DeleteOutline
} from '@mui/icons-material'
import {
  StyledCard,
  PriorityChip,
  StatusChip,
  ActionButton,
  InfoBox,
  CardHeader,
  CardActions,
  StyledSelect
} from './StyledComponents'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onStatusChange: (taskId: number, status: TaskStatusEnum) => void
}

const priorityLabels = {
  'Do first': 'Làm ngay',
  'Schedule': 'Lên lịch',
  'Delegate': 'Phân công',
  'Eliminate': 'Loại bỏ'
}

const statusIcons = {
  needsAction: Schedule,
  inProgress: PlayArrow,
  onHold: Pause,
  completed: CheckCircle,
  cancelled: Cancel,
  deleted: Delete
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
    <StyledCard>
      <CardContent>
        <CardHeader>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {task.task_name}
              </Typography>
              {isOverdue && (
                <Warning color="error" fontSize="small" />
              )}
            </Box>
            
            {task.task_note && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {task.task_note}
              </Typography>
            )}
            
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <StatusChip 
                icon={<StatusIcon />} 
                label={statusLabels[task.task_status]}
                status={task.task_status}
                size="small"
              />
              {task.task_priority && (
                <PriorityChip 
                  label={priorityLabels[task.task_priority]}
                  priority={task.task_priority}
                  size="small"
                />
              )}
              {task.task_type && (
                <PriorityChip 
                  label={taskTypeLabels[task.task_type] || task.task_type}
                  size="small"
                />
              )}
            </Stack>
            
            <Stack spacing={1}>
              {task.task_due_date && (
                <InfoBox sx={{ color: isOverdue ? 'error.main' : 'text.secondary' }}>
                  <Event fontSize="small" />
                  <Typography variant="body2">
                    Hạn: {formatDateDisplay(task.task_due_date)}
                  </Typography>
                </InfoBox>
              )}
              {task.task_date_start && (
                <InfoBox>
                  <Event fontSize="small" />
                  <Typography variant="body2">
                    Bắt đầu: {formatDateDisplay(task.task_date_start)}
                    {task.task_start_time && ` lúc ${task.task_start_time}`}
                  </Typography>
                </InfoBox>
              )}
              {task.task_date_finish && (
                <InfoBox sx={{ color: 'success.main' }}>
                  <CheckCircle fontSize="small" />
                  <Typography variant="body2">
                    Hoàn thành: {formatDateDisplay(task.task_date_finish)}
                    {task.task_time_finish && ` lúc ${task.task_time_finish}`}
                  </Typography>
                </InfoBox>
              )}
              {task.task_time_process && (
                <InfoBox>
                  <AccessTime fontSize="small" />
                  <Typography variant="body2">
                    Thời gian dự kiến: {task.task_time_process}
                  </Typography>
                </InfoBox>
              )}
            </Stack>
          </Box>
          
          <Box sx={{ ml: 2, minWidth: 140 }}>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <StyledSelect
                value={task.task_status}
                onChange={(e) => onStatusChange(task.task_id, e.target.value as TaskStatusEnum)}
              >
                <MenuItem value="needsAction">Cần thực hiện</MenuItem>
                <MenuItem value="inProgress">Đang thực hiện</MenuItem>
                <MenuItem value="onHold">Tạm dừng</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="cancelled">Hủy bỏ</MenuItem>
                <MenuItem value="deleted">Đã xóa</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
        </CardHeader>
        
        <CardActions>
          <Box>
            <ActionButton
              startIcon={<Edit />}
              onClick={() => onEdit(task)}
              color="primary"
              variant="outlined"
              size="small"
            >
              Sửa
            </ActionButton>
          </Box>
          <ActionButton
            startIcon={<DeleteOutline />}
            onClick={() => onDelete(task.task_id)}
            color="error"
            variant="outlined"
            size="small"
          >
            Xóa
          </ActionButton>
        </CardActions>
      </CardContent>
    </StyledCard>
  )
}
