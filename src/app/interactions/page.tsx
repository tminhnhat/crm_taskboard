'use client'

import { useState, useMemo } from 'react'
import { useInteractions } from '@/hooks/useInteractions'
import { Interaction } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import InteractionCard from '@/components/InteractionCard'
import InteractionForm from '@/components/InteractionForm'
import InteractionFilters from '@/components/InteractionFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function InteractionsPage() {
  const { 
    interactions, 
    loading, 
    error, 
    createInteraction, 
    updateInteraction, 
    deleteInteraction,
    fetchCustomers,
    fetchStaff
  } = useInteractions()
  const [showForm, setShowForm] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    interactionType: '',
    customerId: '',
    staffId: '',
    dateRange: ''
  })

  // Get available customers and staff for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    interactions.forEach(interaction => {
      if (interaction.customer) {
        customers.set(interaction.customer.customer_id, {
          customer_id: interaction.customer.customer_id,
          full_name: interaction.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [interactions])

  const availableStaff = useMemo(() => {
    const staff = new Map()
    interactions.forEach(interaction => {
      if (interaction.staff) {
        staff.set(interaction.staff.staff_id, {
          staff_id: interaction.staff.staff_id,
          full_name: interaction.staff.full_name
        })
      }
    })
    return Array.from(staff.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [interactions])

  // Filter interactions based on current filters
  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      const matchesSearch = !filters.search || 
        (interaction.notes && interaction.notes.toLowerCase().includes(filters.search.toLowerCase())) ||
        interaction.customer?.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        interaction.staff?.full_name.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesType = !filters.interactionType || interaction.interaction_type === filters.interactionType
      
      const matchesCustomer = !filters.customerId || interaction.customer_id.toString() === filters.customerId
      
      const matchesStaff = !filters.staffId || interaction.staff_id.toString() === filters.staffId

      const matchesDateRange = !filters.dateRange || checkDateRange(interaction.interaction_date, filters.dateRange)

      return matchesSearch && matchesType && matchesCustomer && matchesStaff && matchesDateRange
    })
  }, [interactions, filters])

  // Date range filter helper
  const checkDateRange = (dateString: string, range: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString()
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        return date.toDateString() === yesterday.toDateString()
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return date >= weekAgo
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return date >= monthAgo
      case 'quarter':
        const quarterAgo = new Date(now)
        quarterAgo.setMonth(quarterAgo.getMonth() - 3)
        return date >= quarterAgo
      case 'year':
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return date >= yearAgo
      default:
        return true
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = interactions.length
    const today = interactions.filter(i => {
      const date = new Date(i.interaction_date)
      const now = new Date()
      return date.toDateString() === now.toDateString()
    }).length
    
    const thisWeek = interactions.filter(i => {
      const date = new Date(i.interaction_date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length

    const typeStats = interactions.reduce((acc, interaction) => {
      const type = interaction.interaction_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, today, thisWeek, typeStats }
  }, [interactions])

  const handleSaveInteraction = async (interactionData: Partial<Interaction>) => {
    try {
      if (editingInteraction) {
        await updateInteraction(editingInteraction.interaction_id, interactionData)
      } else {
        await createInteraction(interactionData)
      }
      setShowForm(false)
      setEditingInteraction(null)
    } catch (error) {
      console.error('Error saving interaction:', error)
      alert('Lưu tương tác thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setShowForm(true)
  }

  const handleDeleteInteraction = async (interactionId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tương tác này không?')) {
      try {
        await deleteInteraction(interactionId)
      } catch (error) {
        console.error('Error deleting interaction:', error)
        alert('Xóa tương tác thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingInteraction(null)
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
              <p className="text-red-800">Lỗi khi tải danh sách tương tác: {error}</p>
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
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tương Tác Khách Hàng</h1>
                <p className="text-gray-600">Theo dõi chăm sóc và giao tiếp khách hàng</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm Tương Tác
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Tương Tác</p>
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
                <p className="text-sm font-medium text-gray-500">Hôm Nay</p>
                <p className="text-2xl font-semibold text-green-600">{stats.today}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tuần Này</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.thisWeek}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Phổ Biến Nhất</p>
                <p className="text-lg font-semibold text-purple-600">
                  {Object.entries(stats.typeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Chưa có'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <InteractionFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCustomers={availableCustomers}
          availableStaff={availableStaff}
          totalCount={interactions.length}
          filteredCount={filteredInteractions.length}
        />

        {/* Interactions List */}
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {interactions.length === 0 ? 'Chưa có tương tác nào' : 'Không có tương tác nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {interactions.length === 0 
                ? 'Bắt đầu theo dõi tương tác khách hàng bằng cách tạo bản ghi đầu tiên.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </p>
            {interactions.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Thêm Tương Tác Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => (
              <InteractionCard
                key={interaction.interaction_id}
                interaction={interaction}
                onEdit={handleEditInteraction}
                onDelete={handleDeleteInteraction}
              />
            ))}
          </div>
        )}

        {/* Interaction Form Modal */}
        {showForm && (
          <InteractionForm
            interaction={editingInteraction}
            onSave={handleSaveInteraction}
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
