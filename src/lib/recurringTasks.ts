import { Task, RecurrenceType, TaskStatusEnum, TaskPriority } from '@/lib/supabase'
import { toISODate, toVNDate } from '@/lib/date'

export interface RecurringTaskData {
  task_name: string
  task_type: string | null
  task_priority: TaskPriority | null
  task_time_process: string | null
  task_date_start: string | null
  task_start_time: string | null
  task_note: string | null
  task_due_date: string | null
  task_time_finish: string | null
  task_date_finish: string | null
  task_status: TaskStatusEnum
  calendar_event_id: string | null
  sync_status: string
  timezone_offset: number
  timezone: string
  google_task_id: string | null
  recurrence_type: RecurrenceType
  recurrence_interval: number
  recurrence_end_date?: string | null
  recurrence_duration_months?: number | null
}

/**
 * Generates recurring task instances based on the recurrence pattern
 */
export function generateRecurringTasks(
  masterTask: RecurringTaskData,
  masterTaskId: number
): Omit<Task, 'task_id' | 'created_at' | 'updated_at'>[] {
  const tasks: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>[] = []
  
  if (masterTask.recurrence_type === 'none' || !masterTask.task_date_start) {
    return tasks
  }

  const startDate = new Date(masterTask.task_date_start)
  const today = new Date()
  
  // Calculate end date
  let endDate: Date
  if (masterTask.recurrence_end_date) {
    endDate = new Date(masterTask.recurrence_end_date)
  } else if (masterTask.recurrence_duration_months) {
    endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + masterTask.recurrence_duration_months)
  } else {
    // Default to 3 months if no end date specified
    endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 3)
  }

  let currentDate = new Date(startDate)
  let iterationCount = 0
  const maxIterations = 365 // Safety limit to prevent infinite loops

  while (currentDate <= endDate && iterationCount < maxIterations) {
    // Don't create tasks for past dates (except the first one if it's the original start date)
    if (currentDate >= today || currentDate.getTime() === startDate.getTime()) {
      // Calculate due date for this instance
      let dueDateForInstance: string | null = null
      if (masterTask.task_due_date) {
        const originalDueDate = new Date(masterTask.task_due_date)
        const originalStartDate = new Date(masterTask.task_date_start)
        const daysDifference = Math.floor((originalDueDate.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60 * 24))
        
        const instanceDueDate = new Date(currentDate)
        instanceDueDate.setDate(instanceDueDate.getDate() + daysDifference)
        dueDateForInstance = instanceDueDate.toISOString().split('T')[0]
      }

      const taskInstance: Omit<Task, 'task_id' | 'created_at' | 'updated_at'> = {
        ...masterTask,
        task_name: `${masterTask.task_name} (${formatRecurrenceLabel(currentDate, masterTask.recurrence_type)})`,
        task_date_start: currentDate.toISOString().split('T')[0],
        task_due_date: dueDateForInstance,
        parent_task_id: masterTaskId,
        is_recurring: false,
        // Reset the recurrence fields for child tasks
        recurrence_type: 'none',
        recurrence_interval: 1,
        recurrence_end_date: null,
        recurrence_duration_months: null
      }

      tasks.push(taskInstance)
    }

    // Calculate next occurrence
    switch (masterTask.recurrence_type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + masterTask.recurrence_interval)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * masterTask.recurrence_interval))
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + masterTask.recurrence_interval)
        break
    }

    iterationCount++
  }

  return tasks
}

/**
 * Formats a date label for recurring tasks
 */
function formatRecurrenceLabel(date: Date, recurrenceType: RecurrenceType): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  switch (recurrenceType) {
    case 'daily':
      return `${day}/${month}/${year}`
    case 'weekly':
      const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      return `${weekdays[date.getDay()]} ${day}/${month}`
    case 'monthly':
      return `Tháng ${month}/${year}`
    default:
      return `${day}/${month}/${year}`
  }
}

/**
 * Calculates the end date based on duration in months
 */
export function calculateEndDateFromDuration(startDate: string, durationMonths: number): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + durationMonths)
  return date.toISOString().split('T')[0]
}

/**
 * Validates recurrence configuration
 */
export function validateRecurrenceConfig(
  recurrenceType: RecurrenceType,
  recurrenceInterval: number,
  recurrenceEndDate?: string | null,
  recurrenceDurationMonths?: number | null,
  startDate?: string | null
): { isValid: boolean; error?: string } {
  if (recurrenceType === 'none') {
    return { isValid: true }
  }

  if (!startDate) {
    return { isValid: false, error: 'Ngày bắt đầu là bắt buộc cho công việc lặp lại' }
  }

  if (recurrenceInterval < 1) {
    return { isValid: false, error: 'Khoảng cách lặp lại phải lớn hơn 0' }
  }

  if (!recurrenceEndDate && !recurrenceDurationMonths) {
    return { isValid: false, error: 'Vui lòng chọn ngày kết thúc hoặc thời gian lặp lại' }
  }

  if (recurrenceEndDate && startDate) {
    const start = new Date(startDate)
    const end = new Date(recurrenceEndDate)
    if (end <= start) {
      return { isValid: false, error: 'Ngày kết thúc phải sau ngày bắt đầu' }
    }
  }

  if (recurrenceDurationMonths && recurrenceDurationMonths < 1) {
    return { isValid: false, error: 'Thời gian lặp lại phải ít nhất 1 tháng' }
  }

  return { isValid: true }
}