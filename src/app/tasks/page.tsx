'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Pagination,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material'
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  AssignmentOutlined as AssignmentOutlinedIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import TaskFilters from '@/components/TaskFilters'
import { TaskCardSkeleton } from '@/components/LoadingSpinner'
import { useTasks } from '@/hooks/useTasks'
import { Task, TaskStatusEnum } from '@/lib/supabase'

export default function TaskDashboard() {
  const theme = useTheme()
  const { tasks, loading, error, createTask, updateTask, deleteTask, updateTaskStatus, refetch } = useTasks()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    status: 'needsAction',
    priority: '',
    search: '',
    sortBy: 'task_date_start',
    taskType: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 10

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

  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTasks.length / tasksPerPage)), [filteredTasks.length, tasksPerPage])

  // Reset current page when filters change or if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Lỗi khi tải danh sách công việc: {error}
              </Alert>
              <Typography color="text.secondary">
                Vui lòng kiểm tra cấu hình Supabase trong file .env.local
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <Paper elevation={0} sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            py: 4 
          }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="700" sx={{ 
                mb: 1, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <AssignmentOutlinedIcon sx={{ fontSize: 36 }} /> Bảng Điều Khiển Công Việc
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý và theo dõi tất cả công việc của bạn một cách hiệu quả
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton 
                  onClick={() => refetch?.()}
                  disabled={loading}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': { 
                      boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)',
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                  boxShadow: '0px 4px 8px rgba(52, 71, 103, 0.2)',
                  '&:hover': {
                    boxShadow: '0px 6px 16px rgba(52, 71, 103, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Công Việc Mới
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Thống Kê Tổng Quan
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(5, 1fr)' 
            }, 
            gap: 3
          }}>
            {/* Total Tasks */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(52, 71, 103, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #3867d6 0%, #8854d0 100%)',
                    color: 'white'
                  }}>
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Tổng Công Việc
                </Typography>
              </CardContent>
            </Card>
            
            {/* Pending Tasks */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(251, 133, 0, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #fb8500 0%, #ffb347 100%)',
                    color: 'white'
                  }}>
                    <ScheduleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Chờ Xử Lý
                </Typography>
              </CardContent>
            </Card>
            
            {/* In Progress Tasks */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(73, 163, 241, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #49a3f1 0%, #5dade2 100%)',
                    color: 'white'
                  }}>
                    <WarningIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Đang Thực Hiện
                </Typography>
              </CardContent>
            </Card>
            
            {/* Completed Tasks */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(130, 214, 22, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #82d616 0%, #a8e6cf 100%)',
                    color: 'white'
                  }}>
                    <CheckCircleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Hoàn Thành
                </Typography>
              </CardContent>
            </Card>
            
            {/* Overdue Tasks */}
            <Card elevation={0} sx={{ 
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 4px 16px rgba(234, 6, 6, 0.1)' 
              },
              transition: 'all 0.2s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #ea0606 0%, #ff6b6b 100%)',
                    color: 'white'
                  }}>
                    <ErrorIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {stats.overdue}
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: 'text.secondary' }}>
                  Quá Hạn
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          {/* Progress Bar */}
          {stats.total > 0 && (
            <Card elevation={0} sx={{ 
              mt: 4, 
              p: 4, 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                  Tiến Độ Hoàn Thành Tổng Thể
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3867d6 0%, #8854d0 100%)',
                  color: 'white'
                }}>
                  <Typography variant="body2" fontWeight="700">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.completed / stats.total) * 100}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #3867d6 0%, #8854d0 100%)'
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  <strong>{stats.completed}</strong> / {stats.total} công việc hoàn thành
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  <strong>{stats.total - stats.completed}</strong> công việc còn lại
                </Typography>
              </Box>
            </Card>
          )}
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
        </Paper>

        {/* Tasks List */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'grey.100', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {tasks.length === 0 ? 'Chưa có công việc nào' : 'Không có kết quả phù hợp'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {tasks.length === 0 ? 'Tạo công việc đầu tiên của bạn để bắt đầu!' : 'Thử điều chỉnh bộ lọc để tìm thấy công việc bạn cần.'}
              </Typography>
              {tasks.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsFormOpen(true)}
                  size="large"
                >
                  Tạo Công Việc Đầu Tiên
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Danh sách công việc ({filteredTasks.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {((currentPage - 1) * tasksPerPage) + 1}-{Math.min(currentPage * tasksPerPage, filteredTasks.length)} trong tổng số {filteredTasks.length} công việc
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredTasks
                  .slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage)
                  .map((task) => (
                    <TaskCard
                      key={task.task_id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
              </Box>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </Box>
  )
}