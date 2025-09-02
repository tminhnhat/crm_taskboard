'use client'

import { useState } from 'react'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import { Task, TaskStatusEnum } from '@/lib/supabase'
import { Box, Button, Container, Typography } from '@mui/material'

// Sample task data for testing
const sampleTask: Task = {
  task_id: 1,
  task_name: 'Thẩm định hồ sơ tín dụng khách hàng ABC',
  task_note: 'Cần kiểm tra tài liệu thu nhập và tài sản đảm bảo của khách hàng',
  task_status: 'inProgress' as TaskStatusEnum,
  task_priority: 'Do first',
  task_type: 'credit assessment',
  task_due_date: '2024-02-15',
  task_date_start: '2024-02-10',
  task_start_time: '09:00',
  task_time_process: '04:00:00',
  task_time_finish: null,
  task_date_finish: null,
  calendar_event_id: null,
  google_task_id: null,
  created_at: '2024-02-10T09:00:00.000Z',
  updated_at: '2024-02-10T09:00:00.000Z',
  sync_status: 'synced',
  timezone_offset: 7,
  timezone: 'Asia/Ho_Chi_Minh'
}

const overdueTask: Task = {
  task_id: 2,
  task_name: 'Hoàn thiện hợp đồng vay vốn',
  task_note: 'Soạn thảo và hoàn thiện hợp đồng sau khi thẩm định được phê duyệt',
  task_status: 'needsAction' as TaskStatusEnum,
  task_priority: 'Schedule',
  task_type: 'document preparation',
  task_due_date: '2024-02-05', // Overdue
  task_date_start: '2024-02-08',
  task_start_time: '14:00',
  task_time_process: '02:30:00',
  task_time_finish: null,
  task_date_finish: null,
  calendar_event_id: null,
  google_task_id: null,
  created_at: '2024-02-08T14:00:00.000Z',
  updated_at: '2024-02-08T14:00:00.000Z',
  sync_status: 'synced',
  timezone_offset: 7,
  timezone: 'Asia/Ho_Chi_Minh'
}

const completedTask: Task = {
  task_id: 3,
  task_name: 'Gọi điện xác nhận thông tin khách hàng',
  task_note: 'Đã liên hệ và xác nhận thông tin cơ bản với khách hàng',
  task_status: 'completed' as TaskStatusEnum,
  task_priority: 'Delegate',
  task_type: 'call',
  task_due_date: '2024-02-12',
  task_date_start: '2024-02-11',
  task_start_time: '10:30',
  task_date_finish: '2024-02-11',
  task_time_finish: '11:15',
  task_time_process: '00:45:00',
  calendar_event_id: null,
  google_task_id: null,
  created_at: '2024-02-11T10:30:00.000Z',
  updated_at: '2024-02-11T11:15:00.000Z',
  sync_status: 'synced',
  timezone_offset: 7,
  timezone: 'Asia/Ho_Chi_Minh'
}

export default function TestUIPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([sampleTask, overdueTask, completedTask])

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = (taskId: number) => {
    setTasks(tasks.filter(task => task.task_id !== taskId))
  }

  const handleStatusChange = (taskId: number, status: TaskStatusEnum) => {
    setTasks(tasks.map(task => 
      task.task_id === taskId ? { ...task, task_status: status } : task
    ))
  }

  const handleFormSubmit = (taskData: Partial<Task>) => {
    console.log('Form submitted:', taskData)
    setIsFormOpen(false)
    setEditingTask(null)
    // In real app, this would save to database
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Material UI Task Components Test
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        This page demonstrates the updated Task components using Material UI
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setIsFormOpen(true)}
          sx={{ mr: 2 }}
        >
          New Task (Material UI Form)
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => {
            setEditingTask(sampleTask)
            setIsFormOpen(true)
          }}
        >
          Edit Sample Task
        </Button>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Task Cards (Material UI)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </Box>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </Container>
  )
}