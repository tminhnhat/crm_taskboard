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
  completed: CheckCircle,
  deleted: Delete
}

const statusLabels = {
  needsAction: 'Cần thực hiện',
  inProgress: 'Đang thực hiện',
  completed: 'Hoàn thành',
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
    <StyledCard sx={{ 
      borderRadius: 3, 
      boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.08)',
      overflow: 'visible'
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with title and status dropdown */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.1rem',
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.3
              }}
            >
              {task.task_name}
              {isOverdue && (
                <Warning color="error" fontSize="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            {task.task_type && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {taskTypeLabels[task.task_type] || task.task_type}
              </Typography>
            )}
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <StyledSelect
              value={task.task_status}
              onChange={(e) => onStatusChange(task.task_id, e.target.value as TaskStatusEnum)}
              sx={{
                '& .MuiSelect-select': {
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 500
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: 2,
                  borderColor: 'rgba(0,0,0,0.12)'
                }
              }}
            >
              <MenuItem value="needsAction">Cần thực hiện</MenuItem>
              <MenuItem value="inProgress">Đang thực hiện</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="deleted">Đã xóa</MenuItem>
            </StyledSelect>
          </FormControl>
        </Box>

        {/* Task Details */}
        {task.task_note && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary', 
              mb: 2,
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}
          >
            {task.task_note}
          </Typography>
        )}

        {/* Priority and Status Indicators */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <StatusChip 
              icon={<StatusIcon />} 
              label={statusLabels[task.task_status]}
              status={task.task_status}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
            {task.task_priority && (
              <PriorityChip 
                label={priorityLabels[task.task_priority]}
                priority={task.task_priority}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </Box>

        {/* Date and Time Information */}
        <Box sx={{ mb: 2 }}>
          {task.task_due_date && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              color: isOverdue ? 'error.main' : 'text.secondary'
            }}>
              <Event fontSize="small" />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Hạn: {formatDateDisplay(task.task_due_date)}
              </Typography>
            </Box>
          )}
          {task.task_date_start && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Event fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Bắt đầu: {formatDateDisplay(task.task_date_start)}
                {task.task_start_time && ` lúc ${task.task_start_time}`}
              </Typography>
            </Box>
          )}
          {task.task_date_finish && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'success.main' }}>
                Hoàn thành: {formatDateDisplay(task.task_date_finish)}
                {task.task_time_finish && ` lúc ${task.task_time_finish}`}
              </Typography>
            </Box>
          )}
          {task.task_time_process && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Thời gian dự kiến: {task.task_time_process}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          pt: 2, 
          borderTop: '1px solid rgba(0,0,0,0.08)' 
        }}>
          <ActionButton
            startIcon={<Edit />}
            onClick={() => onEdit(task)}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'none'
              }
            }}
          >
            Sửa
          </ActionButton>
          <ActionButton
            startIcon={<DeleteOutline />}
            onClick={() => onDelete(task.task_id)}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
                transform: 'none'
              }
            }}
          >
            Xóa
          </ActionButton>
        </Box>
      </CardContent>
    </StyledCard>
  )
}
