'use client'

import { useState, useMemo } from 'react'
import { useStaff } from '@/hooks/useStaff'
import { Staff } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import StaffCard from '@/components/StaffCard'
import StaffForm from '@/components/StaffForm'
import StaffFilters from '@/components/StaffFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  UserIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function StaffPage() {
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
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">Lỗi khi tải danh sách nhân viên: {error}</p>
            </div>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nhân Viên</h1>
                <p className="text-gray-600">Quản lý thành viên nhóm của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm Nhân Viên
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Nhân Viên</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Đang Hoạt Động</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Không Hoạt Động</p>
                <p className="text-2xl font-semibold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <StaffFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableDepartments={availableDepartments}
          availablePositions={availablePositions}
          totalCount={staff.length}
          filteredCount={filteredStaff.length}
        />

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {staff.length === 0 ? 'Chưa có nhân viên nào' : 'Không có nhân viên nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {staff.length === 0 
                ? 'Hãy bắt đầu bằng cách thêm nhân viên đầu tiên.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </p>
            {staff.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Thêm Nhân Viên Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <StaffCard
                key={member.staff_id}
                staff={member}
                onEdit={handleEditStaff}
                onDelete={handleDeleteStaff}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Staff Form Modal */}
        <StaffForm
          staff={editingStaff}
          onSave={handleSaveStaff}
          onCancel={handleCancelForm}
          isLoading={loading}
          open={showForm}
        />
      </div>
    </div>
  )
}
