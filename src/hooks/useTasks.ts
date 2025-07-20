import { useState, useEffect } from 'react'
import { supabase, Task, TaskStatusEnum } from '@/lib/supabase'

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

  // Create a new task
  const createTask = async (taskData: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [data, ...prev])
      return data
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

  // Delete a task
  const deleteTask = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', id)

      if (error) throw error
      setTasks(prev => prev.filter(task => task.task_id !== id))
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
