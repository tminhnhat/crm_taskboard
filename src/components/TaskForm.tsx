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
  // Helper functions for time duration formatting
  const formatTimeDurationForDisplay = (dbDuration: string | null): string => {
    if (!dbDuration) return ''
    
    // Parse duration in format HH:mm:ss
    const match = dbDuration.match(/^(\d{2}):(\d{2}):(\d{2})$/)
    if (!match) return ''
    
    const [, hours, minutes] = match // Chỉ lấy giờ và phút, bỏ qua giây
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
    
    // Format as HH:mm:ss
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`
  }

  const parseUserInput = (input: string): string => {
    // Xử lý input từ người dùng
    const hourMatch = input.match(/(\d+)\s*(?:giờ|h|hour|hours)/)
    const minuteMatch = input.match(/(\d+)\s*(?:phút|p|minute|minutes|m)/)
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    
    const totalMinutes = hours * 60 + minutes
    return totalMinutes > 0 ? formatTimeDurationForDB(totalMinutes) : ''
  }

  const [formData, setFormData] = useState({
    task_name: '',
    task_type: '',
    task_note: '',
    task_status: 'needsAction' as TaskStatusEnum,
    task_priority: '' as TaskPriority | '',
    task_category: '',
    task_time_process: '',
    task_time_process_display: '',
    task_due_date: '',
    task_date_start: '',
    task_start_time: '',
    sync_status: 'pending',
    timezone_offset: 7,
    timezone: 'Asia/Ho_Chi_Minh'
  })

  const handleTimeProcessChange = (value: string) => {
    const dbFormat = parseUserInput(value)
    setFormData(prev => ({ 
      ...prev, 
      task_time_process: dbFormat,
      task_time_process_display: value
    }))
  }

  // Date format conversion using utility functions
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      return toVNDate(dateString);
    } catch {
      return '';
    }
  }

  const formatDateForSubmission = (displayDate: string): string | null => {
    if (!displayDate) return null;
    try {
      return toISODate(displayDate);
    } catch {
      return null;
    }
  }

  const handleDateChange = (field: 'task_date_start' | 'task_due_date', value: string) => {
    let formattedValue = value.replace(/\D/g, '') // Remove all non-digits
    
    // Format as user types: dd/mm/yyyy
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
        task_category: task.task_category || '',
        task_time_process: task.task_time_process || '',
        task_time_process_display: formatTimeDurationForDisplay(task.task_time_process),
        task_due_date: formatDateForDisplay(task.task_due_date),
        task_date_start: formatDateForDisplay(task.task_date_start),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date formats using utility function
    if (formData.task_date_start && !isValidDate(formData.task_date_start)) {
      alert('Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    if (formData.task_due_date && !isValidDate(formData.task_due_date)) {
      alert('Định dạng ngày hết hạn không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    // Tạo object mới bỏ qua task_time_process_display
    onSubmit({
      ...Object.fromEntries(
        Object.entries(formData).filter(([key]) => key !== 'task_time_process_display')
      ),
      task_type: formData.task_type || null,
      task_priority: formData.task_priority || null,
      task_category: formData.task_category || null,
      task_note: formData.task_note || null,
      task_time_process: formData.task_time_process || null,
      task_due_date: formatDateForSubmission(formData.task_due_date),
      task_date_start: formatDateForSubmission(formData.task_date_start),
      task_start_time: formData.task_start_time || null
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Dialog content */}
    </Dialog>
  )
}
