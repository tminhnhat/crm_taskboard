'use client'

import { useState, useMemo } from 'react'
import { useCreditAssessments } from '@/hooks/useCreditAssessments'
import { CreditAssessment } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import CreditAssessmentCard from '@/components/CreditAssessmentCard'
import CreditAssessmentForm from '@/components/CreditAssessmentForm'
import CreditAssessmentFilters from '@/components/CreditAssessmentFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  DocumentChartBarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function CreditAssessmentsPage() {
  const { 
    assessments, 
    loading, 
    error, 
    createAssessment, 
    updateAssessment, 
    deleteAssessment,
    fetchCustomers,
    fetchStaff,
    getAssessmentStats
  } = useCreditAssessments()

  const [showForm, setShowForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<CreditAssessment | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    result: '',
    customerId: '',
    staffId: '',
    dateRange: ''
  })

  const stats = getAssessmentStats()

  // Extract unique customers and staff for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    assessments.forEach(assessment => {
      if (assessment.customer) {
        customers.set(assessment.customer.customer_id, {
          customer_id: assessment.customer.customer_id,
          full_name: assessment.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [assessments])

  const availableStaff = useMemo(() => {
    const staff = new Map()
    assessments.forEach(assessment => {
      if (assessment.staff) {
        staff.set(assessment.staff.staff_id, {
          staff_id: assessment.staff.staff_id,
          full_name: assessment.staff.full_name
        })
      }
    })
    return Array.from(staff.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [assessments])

  // Filter assessments based on current filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = !filters.search || 
        (assessment.customer && assessment.customer.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (assessment.staff && assessment.staff.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (assessment.comments && assessment.comments.toLowerCase().includes(filters.search.toLowerCase())) ||
        assessment.assessment_id.toString().includes(filters.search)
      
      const matchesResult = !filters.result || 
        (assessment.assessment_result && assessment.assessment_result.toLowerCase() === filters.result.toLowerCase())
      
      const matchesCustomer = !filters.customerId || 
        assessment.customer_id.toString() === filters.customerId
      
      const matchesStaff = !filters.staffId || 
        assessment.staff_id.toString() === filters.staffId

      let matchesDateRange = true
      if (filters.dateRange) {
        const assessmentDate = new Date(assessment.assessment_date)
        const today = new Date()
        
        switch (filters.dateRange) {
          case 'today':
            matchesDateRange = assessmentDate.toDateString() === today.toDateString()
            break
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDateRange = assessmentDate >= weekAgo && assessmentDate <= today
            break
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            matchesDateRange = assessmentDate >= monthAgo && assessmentDate <= today
            break
          case 'quarter':
            const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
            matchesDateRange = assessmentDate >= quarterAgo && assessmentDate <= today
            break
          case 'year':
            const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            matchesDateRange = assessmentDate >= yearAgo && assessmentDate <= today
            break
        }
      }

      return matchesSearch && matchesResult && matchesCustomer && matchesStaff && matchesDateRange
    })
  }, [assessments, filters])

  const handleNewAssessment = () => {
    setEditingAssessment(null)
    setShowForm(true)
  }

  const handleEditAssessment = (assessment: CreditAssessment) => {
    setEditingAssessment(assessment)
    setShowForm(true)
  }

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá tín dụng này không?')) {
      try {
        await deleteAssessment(assessmentId)
      } catch (error) {
        console.error('Error deleting assessment:', error)
      }
    }
  }

  const handleSaveAssessment = async (assessmentData: Partial<CreditAssessment>) => {
    try {
      if (editingAssessment) {
        await updateAssessment(editingAssessment.assessment_id, assessmentData)
      } else {
        await createAssessment(assessmentData)
      }
      setShowForm(false)
      setEditingAssessment(null)
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingAssessment(null)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">Lỗi: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đánh Giá Tín Dụng</h1>
            <p className="text-gray-600 mt-1">Quản lý đánh giá và điểm tín dụng khách hàng</p>
          </div>
          <button
            onClick={handleNewAssessment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Đánh Giá Mới
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Đánh Giá</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã Phê Duyệt</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã Từ Chối</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang Chờ</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CreditAssessmentFilters
          onFiltersChange={handleFiltersChange}
          availableCustomers={availableCustomers}
          availableStaff={availableStaff}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị {filteredAssessments.length} trong tổng số {assessments.length} đánh giá
          </p>
          <div className="flex items-center space-x-4">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredAssessments.length > 0 
                ? `${Math.round((filteredAssessments.filter(a => a.assessment_result?.toLowerCase() === 'approved').length / filteredAssessments.length) * 100)}% tỷ lệ phê duyệt`
                : 'Không có dữ liệu'
              }
            </span>
          </div>
        </div>

        {/* Assessments Grid */}
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đánh giá nào</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.result || filters.customerId || filters.staffId || filters.dateRange
                ? 'Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.'
                : 'Bắt đầu bằng cách tạo đánh giá tín dụng đầu tiên của bạn.'
              }
            </p>
            <button
              onClick={handleNewAssessment}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Đánh Giá Mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <CreditAssessmentCard
                key={assessment.assessment_id}
                assessment={assessment}
                onEdit={handleEditAssessment}
                onDelete={handleDeleteAssessment}
              />
            ))}
          </div>
        )}

        {/* Assessment Form Modal */}
        {showForm && (
          <CreditAssessmentForm
            assessment={editingAssessment}
            onSave={handleSaveAssessment}
            onCancel={handleCancelForm}
            isLoading={loading}
            fetchCustomers={fetchCustomers}
            fetchStaff={fetchStaff}
          />
        )}
      </div>
    </div>
  )
}
