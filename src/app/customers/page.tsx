'use client'

import { useState, useMemo } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import CustomerCard from '@/components/CustomerCard'
import CustomerForm from '@/components/CustomerForm'
import CustomerFilters from '@/components/CustomerFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/lib/supabase'

export default function CustomersPage() {
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, updateCustomerStatus, recalculateNumerology } = useCustomers()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [filters, setFilters] = useState({
    customerType: '',
    status: 'active',
    search: '',
    sortBy: 'created_at'
  })

  // Filter and sort customers based on current filters
  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(customer => {
      const matchesType = !filters.customerType || customer.customer_type === filters.customerType
      const matchesStatus = !filters.status || customer.status === filters.status
      const matchesSearch = !filters.search || 
        customer.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.account_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.cif_number?.toLowerCase().includes(filters.search.toLowerCase())
      
      return matchesType && matchesStatus && matchesSearch
    })

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const sortBy = filters.sortBy as keyof Customer
      
      // Handle date fields
      if (sortBy === 'created_at' || sortBy === 'updated_at' || sortBy === 'date_of_birth') {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        if (!aValue && !bValue) return 0
        if (!aValue) return 1
        if (!bValue) return -1
        return new Date(aValue).getTime() - new Date(bValue).getTime()
      }
      
      // Handle customer type sorting
      if (sortBy === 'customer_type') {
        const typeOrder = { 'individual': 1, 'corporate': 2 }
        return typeOrder[a.customer_type] - typeOrder[b.customer_type]
      }
      
      // Handle status sorting
      if (sortBy === 'status') {
        const statusOrder = { 'active': 1, 'inactive': 2 }
        const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 3
        const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 3
        return aStatus - bStatus
      }
      
      // Handle string fields
      const aValue = String(a[sortBy] || '')
      const bValue = String(b[sortBy] || '')
      return aValue.localeCompare(bValue)
    })
  }, [customers, filters])

  const handleCreateCustomer = async (customerData: Partial<Customer>) => {
    try {
      await createCustomer(customerData as Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to create customer:', err)
      alert('Tạo khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!editingCustomer) return
    
    try {
      await updateCustomer(editingCustomer.customer_id, customerData)
      setEditingCustomer(null)
      setIsFormOpen(false)
    } catch (err) {
      console.error('Failed to update customer:', err)
      alert('Cập nhật khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      try {
        await deleteCustomer(customerId)
      } catch (err) {
        console.error('Failed to delete customer:', err)
        alert('Xóa khách hàng thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleStatusChange = async (customerId: number, status: string) => {
    try {
      await updateCustomerStatus(customerId, status)
    } catch (err) {
      console.error('Failed to update customer status:', err)
      alert('Cập nhật trạng thái khách hàng thất bại. Vui lòng thử lại.')
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCustomer(null)
  }

  const handleRecalculateNumerology = async (customerId: number) => {
    try {
      await recalculateNumerology(customerId)
      alert('Đã tính toán lại dữ liệu thần số học thành công!')
    } catch (err) {
      console.error('Failed to recalculate numerology:', err)
      alert('Tính toán thần số học thất bại. Vui lòng thử lại.')
    }
  }

  // Customer statistics
  const stats = useMemo(() => {
    const total = customers.length
    const active = customers.filter(c => c.status === 'active').length
    const inactive = customers.filter(c => c.status === 'inactive').length
    const individual = customers.filter(c => c.customer_type === 'individual').length
    const corporate = customers.filter(c => c.customer_type === 'corporate').length

    return { total, active, inactive, individual, corporate }
  }, [customers])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải danh sách khách hàng: {error}</p>
          <p className="text-gray-600">Vui lòng kiểm tra cấu hình Supabase của bạn</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Khách Hàng Mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng Cộng</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Đang Hoạt Động</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Không Hoạt Động</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.individual}</div>
            <div className="text-sm text-gray-600">Cá Nhân</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.corporate}</div>
            <div className="text-sm text-gray-600">Doanh Nghiệp</div>
          </div>
        </div>

        {/* Filters */}
        <CustomerFilters filters={filters} onFiltersChange={setFilters} />

        {/* Customers List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {customers.length === 0 ? 'Chưa có khách hàng nào. Tạo khách hàng đầu tiên của bạn!' : 'Không có khách hàng nào phù hợp với bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.customer_id}
                customer={customer}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onStatusChange={handleStatusChange}
                onRecalculateNumerology={handleRecalculateNumerology}
              />
            ))}
          </div>
        )}
      </main>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        customer={editingCustomer}
      />
    </div>
  )
}
