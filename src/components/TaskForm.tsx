import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material'
import { 
  Close as CloseIcon, 
  ExpandMore as ExpandMoreIcon,
  Repeat as RepeatIcon 
} from '@mui/icons-material'
import { Task, TaskStatusEnum, TaskPriority, RecurrenceType } from '@/lib/supabase'
import { toVNDate, toISODate, isValidDate } from '@/lib/date'
import { validateRecurrenceConfig } from '@/lib/recurringTasks'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  task?: Task | null
}

export default function TaskForm({ isOpen, onClose, onSubmit, task }: TaskFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
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
    timezone: 'Asia/Ho_Chi_Minh',
    // Recurring task fields
    recurrence_type: 'none' as RecurrenceType,
    recurrence_interval: 1,
    recurrence_end_date: '',
    recurrence_duration_months: null as number | null,
    is_recurring: false,
    parent_task_id: null as number | null
  })

  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false)
  const [recurrenceError, setRecurrenceError] = useState<string | null>(null)

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

  const handleDateChange = (field: 'task_date_start' | 'task_due_date' | 'recurrence_end_date', value: string): void => {
    let formattedValue = value.replace(/\D/g, '')
    
    if (formattedValue.length >= 2) {
      formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2)
    }
    if (formattedValue.length >= 5) {
      formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9)
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }))
  }

  const handleRecurrenceToggle = (enabled: boolean): void => {
    setIsRecurringEnabled(enabled)
    if (!enabled) {
      setFormData(prev => ({
        ...prev,
        recurrence_type: 'none',
        recurrence_interval: 1,
        recurrence_end_date: '',
        recurrence_duration_months: null
      }))
      setRecurrenceError(null)
    } else {
      setFormData(prev => ({
        ...prev,
        recurrence_type: 'daily'
      }))
    }
  }

  useEffect(() => {
    if (task) {
      const hasRecurrence = task.recurrence_type && task.recurrence_type !== 'none'
      setIsRecurringEnabled(hasRecurrence)
      
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
        timezone: task.timezone,
        // Recurring task fields
        recurrence_type: task.recurrence_type || 'none',
        recurrence_interval: task.recurrence_interval || 1,
        recurrence_end_date: task.recurrence_end_date ? toVNDate(task.recurrence_end_date) : '',
        recurrence_duration_months: task.recurrence_duration_months,
        is_recurring: task.is_recurring || false,
        parent_task_id: task.parent_task_id
      })
    } else {
      setIsRecurringEnabled(false)
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
        timezone: 'Asia/Ho_Chi_Minh',
        // Recurring task fields
        recurrence_type: 'none',
        recurrence_interval: 1,
        recurrence_end_date: '',
        recurrence_duration_months: null,
        is_recurring: false,
        parent_task_id: null
      })
    }
    setRecurrenceError(null)
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

    if (formData.recurrence_end_date && !isValidDate(formData.recurrence_end_date)) {
      alert('Định dạng ngày kết thúc lặp lại không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    // Validate recurrence if enabled
    if (isRecurringEnabled) {
      const validation = validateRecurrenceConfig(
        formData.recurrence_type,
        formData.recurrence_interval,
        formData.recurrence_end_date ? toISODate(formData.recurrence_end_date) : null,
        formData.recurrence_duration_months,
        formData.task_date_start ? toISODate(formData.task_date_start) : null
      )
      
      if (!validation.isValid) {
        setRecurrenceError(validation.error || 'Cấu hình lặp lại không hợp lệ')
        return
      }
    }

    const submitData = {
      ...Object.fromEntries(
        Object.entries(formData).filter(([key]) => key !== 'task_time_process_display')
      ),
      task_type: formData.task_type || null,
      task_priority: formData.task_priority || null,
      task_note: formData.task_note || null,
      task_time_process: formData.task_time_process || null,
      task_due_date: formData.task_due_date ? toISODate(formData.task_due_date) : null,
      task_date_start: formData.task_date_start ? toISODate(formData.task_date_start) : null,
      task_start_time: formData.task_start_time || null,
      // Recurring task fields
      recurrence_type: isRecurringEnabled ? formData.recurrence_type : 'none',
      recurrence_interval: isRecurringEnabled ? formData.recurrence_interval : 1,
      recurrence_end_date: isRecurringEnabled && formData.recurrence_end_date ? toISODate(formData.recurrence_end_date) : null,
      recurrence_duration_months: isRecurringEnabled ? formData.recurrence_duration_months : null,
      is_recurring: isRecurringEnabled,
      parent_task_id: null
    }

    onSubmit(submitData)
    onClose()
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="span">
          {task ? 'Sửa công việc' : 'Tạo công việc mới'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Tên công việc"
              value={formData.task_name}
              onChange={(e) => setFormData(prev => ({ ...prev, task_name: e.target.value }))}
              required
              variant="outlined"
              size="small"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại công việc</InputLabel>
                <Select
                  value={formData.task_type}
                  label="Loại công việc"
                  onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
                >
                  <MenuItem value="">Chọn loại công việc</MenuItem>
                  <MenuItem value="disbursement">Giải ngân</MenuItem>
                  <MenuItem value="guarantee issuance">Phát hành bảo lãnh</MenuItem>
                  <MenuItem value="credit assessment">Thẩm định tín dụng</MenuItem>
                  <MenuItem value="asset appraisal">Thẩm định tài sản</MenuItem>
                  <MenuItem value="document preparation">Soạn hồ sơ</MenuItem>
                  <MenuItem value="customer development">Phát triển khách hàng</MenuItem>
                  <MenuItem value="customer care">Chăm sóc khách hàng</MenuItem>
                  <MenuItem value="meeting">Cuộc họp</MenuItem>
                  <MenuItem value="project">Dự án</MenuItem>
                  <MenuItem value="reminder">Nhắc nhở</MenuItem>
                  <MenuItem value="call">Gọi điện</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="training">Đào tạo</MenuItem>
                  <MenuItem value="research">Nghiên cứu</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={formData.task_priority}
                  label="Độ ưu tiên"
                  onChange={(e) => setFormData(prev => ({ ...prev, task_priority: e.target.value as TaskPriority }))}
                >
                  <MenuItem value="">Chọn độ ưu tiên</MenuItem>
                  <MenuItem value="Do first">Làm ngay</MenuItem>
                  <MenuItem value="Schedule">Lên lịch</MenuItem>
                  <MenuItem value="Delegate">Phân công</MenuItem>
                  <MenuItem value="Eliminate">Loại bỏ</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Thời gian xử lý"
                  value={formData.task_time_process_display}
                  onChange={(e) => handleTimeProcessChange(e.target.value)}
                  placeholder="Ví dụ: 2 giờ 30 phút"
                  size="small"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {['30 phút', '1 giờ', '2 giờ', '4 giờ'].map((time) => (
                    <Chip
                      key={time}
                      label={time}
                      size="small"
                      variant="outlined"
                      onClick={() => handleTimeProcessChange(time)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Giờ bắt đầu"
                  value={formData.task_start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_start_time: e.target.value }))}
                  placeholder="HH:mm"
                  size="small"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {['08:00', '09:00', '13:30', '14:00'].map((time) => (
                    <Chip
                      key={time}
                      label={time}
                      size="small"
                      variant="outlined"
                      onClick={() => setFormData(prev => ({ ...prev, task_start_time: time }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Ngày bắt đầu"
                  value={formData.task_date_start}
                  onChange={(e) => handleDateChange('task_date_start', e.target.value)}
                  placeholder="dd/mm/yyyy"
                  size="small"
                  error={Boolean(formData.task_date_start && !isValidDate(formData.task_date_start))}
                  helperText={formData.task_date_start && !isValidDate(formData.task_date_start) ? 'Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy' : ''}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {[
                    { label: 'Hôm nay', days: 0 },
                    { label: 'Ngày mai', days: 1 },
                    { label: '3 ngày', days: 3 },
                    { label: '4 ngày', days: 4 },
                    { label: '5 ngày', days: 5 }
                  ].map((item) => (
                    <Chip
                      key={item.label}
                      label={item.label}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const date = new Date()
                        date.setDate(date.getDate() + item.days)
                        setFormData(prev => ({
                          ...prev,
                          task_date_start: toVNDate(date.toISOString().split('T')[0])
                        }))
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Ngày hết hạn"
                  value={formData.task_due_date}
                  onChange={(e) => handleDateChange('task_due_date', e.target.value)}
                  placeholder="dd/mm/yyyy"
                  size="small"
                  error={Boolean(formData.task_due_date && !isValidDate(formData.task_due_date))}
                  helperText={formData.task_due_date && !isValidDate(formData.task_due_date) ? 'Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy' : ''}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {[
                    { label: 'Hôm nay', days: 0 },
                    { label: 'Ngày mai', days: 1 },
                    { label: '3 ngày', days: 3 },
                    { label: '4 ngày', days: 4 },
                    { label: '5 ngày', days: 5 }
                  ].map((item) => (
                    <Chip
                      key={item.label}
                      label={item.label}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const date = new Date()
                        date.setDate(date.getDate() + item.days)
                        setFormData(prev => ({
                          ...prev,
                          task_due_date: toVNDate(date.toISOString().split('T')[0])
                        }))
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={formData.task_note}
              onChange={(e) => setFormData(prev => ({ ...prev, task_note: e.target.value }))}
              size="small"
            />

            {/* Recurring Task Section */}
            {!task?.parent_task_id && ( // Don't show recurring options for child tasks
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RepeatIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Lặp Lại Công Việc
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isRecurringEnabled}
                          onChange={(e) => handleRecurrenceToggle(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Tạo công việc lặp lại"
                    />

                    {isRecurringEnabled && (
                      <>
                        {recurrenceError && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {recurrenceError}
                          </Alert>
                        )}

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Chu kỳ lặp lại</InputLabel>
                            <Select
                              value={formData.recurrence_type}
                              label="Chu kỳ lặp lại"
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                recurrence_type: e.target.value as RecurrenceType 
                              }))}
                            >
                              <MenuItem value="daily">Hàng ngày</MenuItem>
                              <MenuItem value="weekly">Hàng tuần</MenuItem>
                              <MenuItem value="monthly">Hàng tháng</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            fullWidth
                            label={`Mỗi ${formData.recurrence_type === 'daily' ? 'ngày' : 
                                          formData.recurrence_type === 'weekly' ? 'tuần' : 'tháng'}`}
                            value={formData.recurrence_interval}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1
                              setFormData(prev => ({ ...prev, recurrence_interval: Math.max(1, value) }))
                            }}
                            type="number"
                            size="small"
                            inputProps={{ min: 1, max: 12 }}
                          />
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Thời gian kết thúc lặp lại (chọn một trong hai)
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                          <Box>
                            <TextField
                              fullWidth
                              label="Ngày kết thúc"
                              value={formData.recurrence_end_date}
                              onChange={(e) => {
                                handleDateChange('recurrence_end_date', e.target.value)
                                if (e.target.value) {
                                  setFormData(prev => ({ ...prev, recurrence_duration_months: null }))
                                }
                              }}
                              placeholder="dd/mm/yyyy"
                              size="small"
                              error={Boolean(formData.recurrence_end_date && !isValidDate(formData.recurrence_end_date))}
                              helperText={formData.recurrence_end_date && !isValidDate(formData.recurrence_end_date) ? 
                                'Định dạng không hợp lệ' : 'Hoặc chọn số tháng bên phải'}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              {[
                                { label: '3 tháng', months: 3 },
                                { label: '6 tháng', months: 6 },
                                { label: '1 năm', months: 12 }
                              ].map((item) => (
                                <Chip
                                  key={item.label}
                                  label={item.label}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    // Use start date if available and valid, otherwise use current date
                                    let baseDate: Date
                                    if (formData.task_date_start && isValidDate(formData.task_date_start)) {
                                      baseDate = new Date(toISODate(formData.task_date_start))
                                    } else {
                                      baseDate = new Date()
                                    }
                                    baseDate.setMonth(baseDate.getMonth() + item.months)
                                    setFormData(prev => ({
                                      ...prev,
                                      recurrence_end_date: toVNDate(baseDate.toISOString().split('T')[0]),
                                      recurrence_duration_months: null
                                    }))
                                  }}
                                  sx={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Stack>
                          </Box>

                          <Box>
                            <TextField
                              fullWidth
                              label="Số tháng lặp lại"
                              value={formData.recurrence_duration_months || ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || null
                                setFormData(prev => ({ 
                                  ...prev, 
                                  recurrence_duration_months: value,
                                  recurrence_end_date: value ? '' : prev.recurrence_end_date
                                }))
                              }}
                              type="number"
                              size="small"
                              inputProps={{ min: 1, max: 60 }}
                              helperText="Hoặc chọn ngày kết thúc bên trái"
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              {[1, 3, 6, 12].map((months) => (
                                <Chip
                                  key={months}
                                  label={`${months} tháng`}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setFormData(prev => ({ 
                                    ...prev, 
                                    recurrence_duration_months: months,
                                    recurrence_end_date: ''
                                  }))}
                                  sx={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Box>

                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Lưu ý:</strong> Công việc lặp lại sẽ được tạo tự động từ ngày bắt đầu đến ngày kết thúc. 
                            {formData.recurrence_type === 'daily' && ` Mỗi ${formData.recurrence_interval} ngày.`}
                            {formData.recurrence_type === 'weekly' && ` Mỗi ${formData.recurrence_interval} tuần.`}
                            {formData.recurrence_type === 'monthly' && ` Mỗi ${formData.recurrence_interval} tháng.`}
                          </Typography>
                        </Alert>
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {task ? 'Cập nhật công việc' : 'Tạo công việc'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
