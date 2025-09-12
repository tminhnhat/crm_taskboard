'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  useTheme,
  Container,
  Paper,
  Pagination
} from '@mui/material';
import {
  Search,
  Add,
  Close,
  Assessment as AssessmentIcon,
  TrendingUp as ChartBarIcon,
  People as PeopleIcon,
  AttachMoney as BanknotesIcon
} from '@mui/icons-material';
import CreditAssessmentCard from '@/components/CreditAssessmentCard'
import CreditAssessmentForm from '@/components/CreditAssessmentForm'
import Navigation from '@/components/Navigation'
import useCreditAssessments from '@/hooks/useCreditAssessments'
import { useCustomers } from '@/hooks/useCustomers'
import { useStaff } from '@/hooks/useStaff'
import { useProducts } from '@/hooks/useProducts'
import { useTheme as useCustomTheme } from '@/theme/ThemeProvider'
import { getThemePrimaryGradient, getThemeSecondaryGradient, getThemeTextGradient, getThemeStatusGradient } from '@/lib/themeUtils'

export default function AssessmentsPage() {
  const { darkMode, themeSettings } = useCustomTheme()
  const [showForm, setShowForm] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const assessmentsPerPage = 6 // Show 6 items per page in grid layout
  const theme = useTheme()

  const {
    isLoading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment
  } = useCreditAssessments()

  const { customers } = useCustomers()
  const { staff } = useStaff()
  const { products } = useProducts()

  const [assessments, setAssessments] = useState<any[]>([])

  React.useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    const data = await fetchAssessments()
    setAssessments(data)
  }

  const handleCreateAssessment = async (data: any) => {
    await createAssessment(data)
    setShowForm(false)
    loadAssessments()
  }

  const handleUpdateAssessment = async (data: any) => {
    if (selectedAssessment) {
      await updateAssessment(selectedAssessment.assessment_id, data)
      setShowForm(false)
      setSelectedAssessment(null)
      loadAssessments()
    }
  }

  const handleDeleteAssessment = async () => {
    if (selectedAssessment) {
      await deleteAssessment(selectedAssessment.assessment_id)
      setShowDeleteDialog(false)
      setSelectedAssessment(null)
      loadAssessments()
    }
  }

  const filteredAssessments = assessments.filter(assessment => {
    const searchStr = searchTerm.toLowerCase()
    return (
      assessment.customer?.full_name?.toLowerCase().includes(searchStr) ||
      assessment.staff?.full_name?.toLowerCase().includes(searchStr) ||
      assessment.product?.product_name?.toLowerCase().includes(searchStr) ||
      assessment.department?.toLowerCase().includes(searchStr)
    )
  })

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / assessmentsPerPage))

  // Reset current page when filters change or if current page is beyond total pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Get paginated assessments
  const paginatedAssessments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * assessmentsPerPage
    const endIndex = startIndex + assessmentsPerPage
    return filteredAssessments.slice(startIndex, endIndex)
  }, [filteredAssessments, currentPage, assessmentsPerPage])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = assessments.length
    const approved = assessments.filter(a => a.status === 'approved').length
    const pending = assessments.filter(a => a.status === 'in_review').length
    return { total, approved, pending }
  }, [assessments])

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
                <AssessmentIcon sx={{ fontSize: 36, mr: 2 }} /> Thẩm Định Tín Dụng
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quản lý các thẩm định tín dụng cho khách hàng một cách chuyên nghiệp
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedAssessment(null)
                setShowForm(true)
              }}
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
              Thẩm Định Mới
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
                  <AssessmentIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#344767', mb: 0.5 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tổng Thẩm Định
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
                  <ChartBarIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#4caf50', mb: 0.5 }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Đã Duyệt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: 3,
            boxShadow: '0px 2px 8px rgba(255, 152, 0, 0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 4px 16px rgba(255, 152, 0, 0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#ff9800', mb: 0.5 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Đang Xem Xét
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm thẩm định..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: 600, 
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)'
                }
              }
            }}
          />
        </Box>

        {/* Assessment Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          {paginatedAssessments.map(assessment => (
            <CreditAssessmentCard
              key={assessment.assessment_id}
              assessment={assessment}
              onEdit={() => {
                setSelectedAssessment(assessment)
                setShowForm(true)
              }}
              onDelete={() => {
                setSelectedAssessment(assessment)
                setShowDeleteDialog(true)
              }}
            />
          ))}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 3,
            mt: 4,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Hiển thị {((currentPage - 1) * assessmentsPerPage) + 1}-{Math.min(currentPage * assessmentsPerPage, filteredAssessments.length)} trong tổng số {filteredAssessments.length} thẩm định
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              variant="outlined"
              shape="rounded"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                  '&.Mui-selected': {
                    background: getThemeTextGradient(themeSettings, darkMode),
                    color: 'white',
                    '&:hover': {
                      background: getThemeTextGradient(themeSettings, darkMode),
                      opacity: 0.9
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>

      {/* Assessment Form Dialog */}
      {showForm && (
        <CreditAssessmentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setSelectedAssessment(null)
          }}
          onSubmit={selectedAssessment ? handleUpdateAssessment : handleCreateAssessment}
          assessment={selectedAssessment}
          isLoading={isLoading}
          customers={customers}
          staff={staff}
          products={products}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Xác nhận xóa
            <IconButton onClick={() => setShowDeleteDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Bạn có chắc chắn muốn xóa thẩm định này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteAssessment}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
