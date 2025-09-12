import { useState, useEffect } from 'react'
import { supabase, Task, TaskStatusEnum, RecurrenceType } from '@/lib/supabase'
import { generateRecurringTasks, validateRecurrenceConfig, RecurringTaskData } from '@/lib/recurringTasks'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Create a new task (with recurring support)
  const createTask = async (taskData: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Validate recurrence configuration if it's a recurring task
      if (taskData.recurrence_type && taskData.recurrence_type !== 'none') {
        const validation = validateRecurrenceConfig(
          taskData.recurrence_type,
          taskData.recurrence_interval,
          taskData.recurrence_end_date,
          taskData.recurrence_duration_months,
          taskData.task_date_start
        )
        
        if (!validation.isValid) {
          throw new Error(validation.error)
        }
      }

      // Create the master task
      const masterTaskData = {
        ...taskData,
        is_recurring: taskData.recurrence_type !== 'none'
      }

      const { data: masterTask, error: masterError } = await supabase
        .from('tasks')
        .insert([masterTaskData])
        .select()
        .single()

      if (masterError) throw masterError

      // Generate recurring tasks if applicable
      if (taskData.recurrence_type && taskData.recurrence_type !== 'none') {
        const recurringTaskInstances = generateRecurringTasks(
          taskData as RecurringTaskData,
          masterTask.task_id
        )

        if (recurringTaskInstances.length > 0) {
          const { error: batchError } = await supabase
            .from('tasks')
            .insert(recurringTaskInstances)

          if (batchError) {
            console.error('Error creating recurring task instances:', batchError)
            // Don't throw here - master task was created successfully
          }
        }
      }

      // Refresh the task list to show all new tasks
      await fetchTasks()
      return masterTask
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  // Update a task
  const updateTask = async (id: number, updates: Partial<Omit<Task, 'task_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('task_id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(prev => prev.map(task => task.task_id === id ? data : task))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  // Delete a task (with recurring support)
  const deleteTask = async (id: number, deleteRecurring: boolean = false) => {
    try {
      if (deleteRecurring) {
        // Find the master task (either this task or its parent)
        const task = tasks.find(t => t.task_id === id)
        if (!task) throw new Error('Task not found')

        const masterTaskId = task.parent_task_id || (task.is_recurring ? id : null)
        
        if (masterTaskId) {
          // Delete all related tasks (master + all children)
          const { error } = await supabase
            .from('tasks')
            .delete()
            .or(`task_id.eq.${masterTaskId},parent_task_id.eq.${masterTaskId}`)

          if (error) throw error
          setTasks(prev => prev.filter(task => 
            task.task_id !== masterTaskId && task.parent_task_id !== masterTaskId
          ))
        } else {
          // Single task deletion
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('task_id', id)

          if (error) throw error
          setTasks(prev => prev.filter(task => task.task_id !== id))
        }
      } else {
        // Delete only this specific task instance
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('task_id', id)

        if (error) throw error
        setTasks(prev => prev.filter(task => task.task_id !== id))
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  // Update task status
  const updateTaskStatus = async (id: number, status: TaskStatusEnum) => {
    return updateTask(id, { task_status: status })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refetch: fetchTasks
  }
}
