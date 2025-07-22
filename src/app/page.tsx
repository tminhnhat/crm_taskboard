'use client'

import { useState, useMemo } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import TaskFilters from '@/components/TaskFilters'
import { TaskCardSkeleton } from '@/components/LoadingSpinner'
import { useTasks } from '@/hooks/useTasks'
import { Task, TaskStatusEnum } from '@/lib/supabase'

export default function TaskDashboard() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    status: 'needsAction',
    priority: '',
    search: '',
    sortBy: 'task_date_start',
    taskType: ''
  })

  // Filter and sort tasks based on current filters
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesStatus = !filters.status || task.task_status === filters.status
      const matchesPriority = !filters.priority || task.task_priority === filters.priority
      const matchesTaskType = !filters.taskType || task.task_type === filters.taskType
      const matchesSearch = !filters.search || 
        task.task_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.task_note?.toLowerCase().includes(filters.search.toLowerCase())
      
      return matchesStatus && matchesPriority && matchesTaskType && matchesSearch
    })

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const sortBy = filters.sortBy as keyof Task
      
      // Handle sorting by start date first (prioritize tasks with start dates)
      if (sortBy === 'task_date_start') {
        // Tasks with start dates come first, sorted by start date
        // Tasks without start dates come last, sorted by created date
        if (a.task_date_start && !b.task_date_start) return -1
        if (!a.task_date_start && b.task_date_start) return 1
        if (a.task_date_start && b.task_date_start) {
          return new Date(a.task_date_start).getTime() - new Date(b.task_date_start).getTime()
        }
        // Both don't have start dates, sort by created date
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      
      // Handle other date fields
      if (sortBy === 'task_due_date' || sortBy === 'created_at' || sortBy === 'updated_at') {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        if (!aValue && !bValue) return 0
        if (!aValue) return 1
        if (!bValue) return -1
        return new Date(aValue).getTime() - new Date(bValue).getTime()
      }
      
      // Handle priority sorting (custom order)
      if (sortBy === 'task_priority') {
        const priorityOrder = { 'Do first': 1, 'Schedule': 2, 'Delegate': 3, 'Eliminate': 4 }
        const aPriority = a.task_priority ? priorityOrder[a.task_priority] || 5 : 5
        const bPriority = b.task_priority ? priorityOrder[b.task_priority] || 5 : 5
        return aPriority - bPriority
      }
      
      // Handle status sorting (custom order)
      if (sortBy === 'task_status') {
        const statusOrder = { 
          'needsAction': 1, 
          'inProgress': 2, 
          'onHold': 3, 
          'completed': 4, 
          'cancelled': 5, 
          'deleted': 6 
        }
        return statusOrder[a.task_status] - statusOrder[b.task_status]
      }
      
      // Handle string fields
      const aValue = String(a[sortBy] || '')
      const bValue = String(b[sortBy] || '')
      return aValue.localeCompare(bValue)
    })
  }, [tasks, filters])

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await createTask(taskData as Omit<Task, 'task_id' | 'created_at' | 'updated_at'>)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to create task:', err)
      // You could show a toast notification here
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return
    
    try {
      await updateTask(editingTask.task_id, taskData)
      setEditingTask(null)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to update task:', err)
      // You could show a toast notification here
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      try {
        await deleteTask(taskId)
      } catch (err) {
        console.error('Failed to delete task:', err)
        // You could show a toast notification here
      }
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleStatusChange = async (taskId: number, status: TaskStatusEnum) => {
    try {
      await updateTaskStatus(taskId, status)
    } catch (err) {
      console.error('Failed to update task status:', err)
      // You could show a toast notification here
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  // Task statistics
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.task_status === 'completed').length
    const inProgress = tasks.filter(t => t.task_status === 'inProgress').length
    const pending = tasks.filter(t => t.task_status === 'needsAction').length
    const overdue = tasks.filter(t => 
      t.task_due_date && 
      new Date(t.task_due_date) < new Date() && 
      t.task_status !== 'completed'
    ).length

    return { total, completed, inProgress, pending, overdue }
  }, [tasks])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải danh sách công việc: {error}</p>
          <p className="text-gray-600">Vui lòng kiểm tra cấu hình Supabase trong file .env.local</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Công Việc</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Công Việc Mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng Công Việc</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ Xử Lý</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">Đang Thực Hiện</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Hoàn Thành</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Quá Hạn</div>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        {/* Tasks List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {tasks.length === 0 ? 'Chưa có công việc nào. Tạo công việc đầu tiên của bạn!' : 'Không có công việc nào phù hợp với bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  )
}
