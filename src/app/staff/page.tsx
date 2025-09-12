'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  useTheme
} from '@mui/material'
import { 
  Add as AddIcon,
  Person as UserIcon,
  TrendingUp as ChartBarIcon,
  Warning as ExclamationTriangleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { useStaff } from '@/hooks/useStaff'
import { Staff } from '@/lib/supabase'
import { useTheme as useCustomTheme } from "@/theme/ThemeProvider"
import { getThemePrimaryGradient, getThemeSecondaryGradient, getThemeTextGradient, getThemeStatusGradient } from "@/lib/themeUtils"
import Navigation from '@/components/Navigation'
import StaffCard from '@/components/StaffCard'
import StaffForm from '@/components/StaffForm'
import StaffFilters from '@/components/StaffFilters'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function StaffPage() {
  const { darkMode, themeSettings } = useCustomTheme()
  const { staff, loading, error, createStaff, updateStaff, deleteStaff } = useStaff()
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    position: ''
  })

  // Get available departments and positions for filter dropdowns
  const availableDepartments = useMemo(() => {
    const departments = new Set<string>()
    staff.forEach(member => {
      if (member.department) {
        departments.add(member.department)
      }
    })
    return Array.from(departments).sort()
  }, [staff])

  const availablePositions = useMemo(() => {
    const positions = new Set<string>()
    staff.forEach(member => {
      if (member.position) {
        positions.add(member.position)
      }
    })
    return Array.from(positions).sort()
  }, [staff])

  // Filter staff based on current filters
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = !filters.search || 
        member.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || member.status === filters.status
      
      const matchesDepartment = !filters.department || member.department === filters.department
      
      const matchesPosition = !filters.position || member.position === filters.position

      return matchesSearch && matchesStatus && matchesDepartment && matchesPosition
    })
  }, [staff, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = staff.length
    const active = staff.filter(s => s.status === 'active').length
    const inactive = staff.filter(s => s.status === 'inactive').length

    return { total, active, inactive }
  }, [staff])

  const handleSaveStaff = async (staffData: Partial<Staff>) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staff_id, staffData)
      } else {
        await createStaff(staffData)
      }
      setShowForm(false)
      setEditingStaff(null)
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Lưu thông tin nhân viên thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff)
    setShowForm(true)
  }

  const handleDeleteStaff = async (staffId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      try {
        await deleteStaff(staffId)
      } catch (error) {
        console.error('Error deleting staff:', error)
        alert('Xóa nhân viên thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleStatusChange = async (staffId: number, status: string) => {
    try {
      await updateStaff(staffId, { status })
    } catch (error) {
      console.error('Error updating staff status:', error)
      alert('Cập nhật trạng thái nhân viên thất bại. Vui lòng thử lại.')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingStaff(null)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <LoadingSpinner />
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mt: 2 }}>
            Lỗi khi tải danh sách nhân viên: {error}
          </Alert>
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
            py: 4 
          }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="700" sx={{ 
                mb: 1, 
                color: 'text.primary',
                background: getThemeTextGradient(themeSettings, darkMode),
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <UserIcon sx={{ fontSize: 36, mr: 2 }} /> Quản Lý Nhân Viên
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý thành viên nhóm của bạn một cách chuyên nghiệp
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              size="large"
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                background: getThemeTextGradient(themeSettings, darkMode),
                boxShadow: '0px 4px 8px rgba(52, 71, 103, 0.2)',
                '&:hover': {
                  boxShadow: '0px 6px 16px rgba(52, 71, 103, 0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Thêm Nhân Viên
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(52, 71, 103, 0.1) 0%, rgba(56, 103, 214, 0.1) 100%)',
            border: '1px solid rgba(52, 71, 103, 0.1)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(52, 71, 103, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(52, 71, 103, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: getThemeTextGradient(themeSettings, darkMode),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GroupIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#344767', mb: 0.5 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tổng Nhân Viên
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(76, 175, 80, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(76, 175, 80, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#4caf50', mb: 0.5 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Đang Hoạt Động
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(189, 189, 189, 0.1) 100%)',
            border: '1px solid rgba(158, 158, 158, 0.2)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(158, 158, 158, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(158, 158, 158, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CancelIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#9e9e9e', mb: 0.5 }}>
                    {stats.inactive}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Không Hoạt Động
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2, 
          border: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <StaffFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableDepartments={availableDepartments}
            availablePositions={availablePositions}
            totalCount={staff.length}
            filteredCount={filteredStaff.length}
          />
        </Paper>

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <Paper elevation={0} sx={{ 
            textAlign: 'center', 
            py: 8, 
            borderRadius: 3, 
            border: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <UserIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
              {staff.length === 0 ? 'Chưa có nhân viên nào' : 'Không có nhân viên nào phù hợp với bộ lọc'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              {staff.length === 0 
                ? 'Hãy bắt đầu bằng cách thêm nhân viên đầu tiên.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </Typography>
            {staff.length === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  background: getThemeTextGradient(themeSettings, darkMode),
                  boxShadow: '0px 4px 8px rgba(52, 71, 103, 0.2)',
                  '&:hover': {
                    boxShadow: '0px 6px 16px rgba(52, 71, 103, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Thêm Nhân Viên Đầu Tiên
              </Button>
            )}
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            }, 
            gap: 3
          }}>
            {filteredStaff.map((member) => (
              <StaffCard
                key={member.staff_id}
                staff={member}
                onEdit={handleEditStaff}
                onDelete={handleDeleteStaff}
                onStatusChange={handleStatusChange}
              />
            ))}
          </Box>
        )}

        {/* Staff Form Modal */}
        <StaffForm
          staff={editingStaff}
          onSave={handleSaveStaff}
          onCancel={handleCancelForm}
          isLoading={loading}
          open={showForm}
        />
      </Container>
    </Box>
  )
}
