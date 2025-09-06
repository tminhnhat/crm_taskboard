'use client'

import { useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Paper,
  Button,
  useTheme
} from '@mui/material'
import { 
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useTasks } from '@/hooks/useTasks'
import { useCustomers } from '@/hooks/useCustomers'
import { useContracts } from '@/hooks/useContracts'

export default function HomePage() {
  const theme = useTheme()
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks()
  const { customers, loading: customersLoading, error: customersError } = useCustomers()
  const { contracts, loading: contractsLoading, error: contractsError } = useContracts()

  // Task statistics
  const taskStats = useMemo(() => {
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

  // Customer statistics
  const customerStats = useMemo(() => {
    const total = customers.length
    const individual = customers.filter(c => c.customer_type === 'individual').length
    const corporate = customers.filter(c => c.customer_type === 'corporate').length
    
    // Recent customers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = customers.filter(c => new Date(c.created_at) > thirtyDaysAgo).length

    return { total, individual, corporate, recent }
  }, [customers])

  // Contract statistics  
  const contractStats = useMemo(() => {
    const total = contracts.length
    const active = contracts.filter(c => c.status === 'active').length
    const pending = contracts.filter(c => c.status === 'pending').length
    const completed = contracts.filter(c => c.status === 'completed').length
    const cancelled = contracts.filter(c => c.status === 'cancelled').length

    return { total, active, pending, completed, cancelled }
  }, [contracts])

  const loading = tasksLoading || customersLoading || contractsLoading
  const error = tasksError || customersError || contractsError

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Lỗi khi tải dữ liệu: {error}
          </Alert>
          <Typography color="text.secondary">
            Vui lòng kiểm tra cấu hình Supabase trong file .env.local
          </Typography>
        </Container>
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
            py: 6 
          }}>
            <Box>
              <Typography variant="h2" component="h1" fontWeight="800" sx={{ 
                mb: 2, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <BusinessIcon sx={{ fontSize: 36 }} /> Trang Chủ CRM
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Tổng quan thống kê và quản lý hệ thống
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Task Statistics Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssignmentIcon color="primary" fontSize="large" />
              Thống Kê Công Việc
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              href="/tasks"
              sx={{ borderRadius: 3 }}
            >
              Xem Chi Tiết
            </Button>
          </Box>
          
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
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(52, 71, 103, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {taskStats.total}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Tổng Công Việc
                </Typography>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(251, 133, 0, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {taskStats.pending}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Chờ Xử Lý
                </Typography>
              </CardContent>
            </Card>

            {/* In Progress Tasks */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(73, 163, 241, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {taskStats.inProgress}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Đang Thực Hiện
                </Typography>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(130, 214, 22, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {taskStats.completed}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Hoàn Thành
                </Typography>
              </CardContent>
            </Card>

            {/* Overdue Tasks */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(234, 6, 6, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {taskStats.overdue}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Quá Hạn
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Customer Statistics Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon color="primary" fontSize="large" />
              Thống Kê Khách Hàng
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              href="/customers"
              sx={{ borderRadius: 3 }}
            >
              Xem Chi Tiết
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            }, 
            gap: 3
          }}>
            {/* Total Customers */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(52, 71, 103, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <PeopleIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {customerStats.total}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Tổng Khách Hàng
                </Typography>
              </CardContent>
            </Card>

            {/* Individual Customers */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(102, 126, 234, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #5ee7df 0%, #66a6ff 100%)',
                    color: 'white'
                  }}>
                    <PersonAddIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {customerStats.individual}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Cá Nhân
                </Typography>
              </CardContent>
            </Card>

            {/* Corporate Customers */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(118, 75, 162, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    color: 'white'
                  }}>
                    <BusinessIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {customerStats.corporate}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Doanh Nghiệp
                </Typography>
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(94, 231, 223, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {customerStats.recent}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Mới (30 Ngày)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Contract Statistics Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon color="primary" fontSize="large" />
              Thống Kê Hợp Đồng
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              href="/contracts"
              sx={{ borderRadius: 3 }}
            >
              Xem Chi Tiết
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            }, 
            gap: 3
          }}>
            {/* Total Contracts */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(52, 71, 103, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                    <DescriptionIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {contractStats.total}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Tổng Hợp Đồng
                </Typography>
              </CardContent>
            </Card>

            {/* Active Contracts */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(130, 214, 22, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {contractStats.active}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Đang Hoạt Động
                </Typography>
              </CardContent>
            </Card>

            {/* Pending Contracts */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(251, 133, 0, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                  {contractStats.pending}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Chờ Duyệt
                </Typography>
              </CardContent>
            </Card>

            {/* Completed Contracts */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 3,
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0px 8px 24px rgba(73, 163, 241, 0.15)' 
              },
              transition: 'all 0.3s ease-in-out'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                    <AssessmentIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                  {contractStats.completed}
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: 'text.secondary' }}>
                  Hoàn Thành
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Box sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h4" fontWeight="700" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              color: 'primary.main'
            }}>
              <AssessmentIcon color="primary" fontSize="large" />
              Truy Cập Nhanh
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            }, 
            gap: 3
          }}>
            <Button
              variant="contained"
              size="large"
              href="/tasks"
              sx={{ 
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #344767 0%, #3867d6 100%)',
                color: '#fff',
                '& .MuiTypography-root': { color: '#fff' },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 6px 16px rgba(52, 71, 103, 0.3)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Quản Lý Công Việc
                </Typography>
              </Box>
            </Button>

            <Button
              variant="contained"
              size="large"
              href="/customers"
              sx={{ 
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                '& .MuiTypography-root': { color: '#fff' },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 6px 16px rgba(102, 126, 234, 0.3)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Quản Lý Khách Hàng
                </Typography>
              </Box>
            </Button>

            <Button
              variant="contained"
              size="large"
              href="/contracts"
              sx={{ 
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff',
                '& .MuiTypography-root': { color: '#fff' },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 6px 16px rgba(240, 147, 251, 0.3)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Quản Lý Hợp Đồng
                </Typography>
              </Box>
            </Button>

            <Button
              variant="contained"
              size="large"
              href="/products"
              sx={{ 
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #5ee7df 0%, #66a6ff 100%)',
                color: '#344767',
                '& .MuiTypography-root': { color: '#344767' },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 6px 16px rgba(94, 231, 223, 0.3)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Quản Lý Sản Phẩm
                </Typography>
              </Box>
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
