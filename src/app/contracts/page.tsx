'use client'

import { useState, useMemo } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { Contract } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import ContractCard from '@/components/ContractCard'
import ContractForm from '@/components/ContractForm'
import ContractFilters from '@/components/ContractFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import { 
  PlusIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

export default function ContractsPage() {
  const { 
    contracts, 
    loading, 
    error, 
    createContract, 
    updateContract, 
    deleteContract,
    fetchCustomers,
    fetchProducts,
    fetchStaff,
    checkContractNumberExists
  } = useContracts()
  const [showForm, setShowForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    customerId: '',
    productId: '',
    signedBy: '',
    dateRange: '',
    creditRange: ''
  })

  // Get available options for filter dropdowns
  const availableCustomers = useMemo(() => {
    const customers = new Map()
    contracts.forEach(contract => {
      if (contract.customer) {
        customers.set(contract.customer.customer_id, {
          customer_id: contract.customer.customer_id,
          full_name: contract.customer.full_name
        })
      }
    })
    return Array.from(customers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [contracts])

  const availableProducts = useMemo(() => {
    const products = new Map()
    contracts.forEach(contract => {
      if (contract.product) {
        products.set(contract.product.product_id, {
          product_id: contract.product.product_id,
          product_name: contract.product.product_name
        })
      }
    })
    return Array.from(products.values()).sort((a, b) => a.product_name.localeCompare(b.product_name))
  }, [contracts])

  const availableStaff = useMemo(() => {
    const staff = new Map()
    contracts.forEach(contract => {
      if (contract.signed_by_staff) {
        staff.set(contract.signed_by_staff.staff_id, {
          staff_id: contract.signed_by_staff.staff_id,
          full_name: contract.signed_by_staff.full_name
        })
      }
    })
    return Array.from(staff.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [contracts])

  // Filter contracts based on current filters
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = !filters.search || 
        contract.contract_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        (contract.customer && contract.customer.full_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (contract.product && contract.product.product_name.toLowerCase().includes(filters.search.toLowerCase()))
      
      const matchesStatus = !filters.status || contract.status === filters.status
      
      const matchesCustomer = !filters.customerId || contract.customer_id.toString() === filters.customerId
      
      const matchesProduct = !filters.productId || contract.product_id.toString() === filters.productId
      
      const matchesSigner = !filters.signedBy || contract.signed_by?.toString() === filters.signedBy

      let matchesDateRange = true
      if (filters.dateRange) {
        const today = new Date()
        const startDate = contract.start_date ? new Date(contract.start_date) : null
        const endDate = contract.end_date ? new Date(contract.end_date) : null
        
        switch (filters.dateRange) {
          case 'current':
            matchesDateRange = !!(startDate && endDate && startDate <= today && endDate >= today)
            break
          case 'starting-soon':
            if (startDate) {
              const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
              matchesDateRange = startDate >= today && startDate <= monthFromNow
            } else {
              matchesDateRange = false
            }
            break
          case 'expiring-soon':
            if (endDate) {
              const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
              matchesDateRange = endDate >= today && endDate <= monthFromNow
            } else {
              matchesDateRange = false
            }
            break
          case 'expired':
            matchesDateRange = !!(endDate && endDate < today)
            break
        }
      }

      let matchesCreditRange = true
      if (filters.creditRange && contract.contract_credit_limit !== null) {
        const credit = contract.contract_credit_limit
        switch (filters.creditRange) {
          case '0-10000':
            matchesCreditRange = credit >= 0 && credit <= 10000
            break
          case '10000-50000':
            matchesCreditRange = credit > 10000 && credit <= 50000
            break
          case '50000-100000':
            matchesCreditRange = credit > 50000 && credit <= 100000
            break
          case '100000-500000':
            matchesCreditRange = credit > 100000 && credit <= 500000
            break
          case '500000+':
            matchesCreditRange = credit > 500000
            break
        }
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesProduct && matchesSigner && matchesDateRange && matchesCreditRange
    })
  }, [contracts, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = contracts.length
    const totalCreditLimit = contracts
      .filter(c => c.contract_credit_limit !== null)
      .reduce((sum, c) => sum + (c.contract_credit_limit || 0), 0)
    
    const active = contracts.filter(c => c.status === 'active').length
    const today = new Date()
    
    const expiringSoon = contracts.filter(c => {
      if (!c.end_date) return false
      const endDate = new Date(c.end_date)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      return endDate >= today && endDate <= monthFromNow
    }).length

    return { total, totalCreditLimit, active, expiringSoon }
  }, [contracts])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleSaveContract = async (contractData: Partial<Contract>) => {
    try {
      if (editingContract) {
        await updateContract(editingContract.contract_id, contractData)
      } else {
        await createContract(contractData)
      }
      setShowForm(false)
      setEditingContract(null)
    } catch (error) {
      console.error('Error saving contract:', error)
      alert('Lưu hợp đồng thất bại. Vui lòng thử lại.')
    }
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setShowForm(true)
  }

  const handleDeleteContract = async (contractId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này không?')) {
      try {
        await deleteContract(contractId)
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Xóa hợp đồng thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleStatusChange = async (contractId: number, status: string) => {
    try {
      await updateContract(contractId, { status })
    } catch (error) {
      console.error('Error updating contract status:', error)
      alert('Cập nhật trạng thái hợp đồng thất bại. Vui lòng thử lại.')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingContract(null)
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
              <p className="text-red-800">Lỗi khi tải danh sách hợp đồng: {error}</p>
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
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hợp Đồng</h1>
                <p className="text-gray-600">Quản lý hợp đồng và thỏa thuận với khách hàng</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm Hợp Đồng
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Hợp Đồng</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Tổng Hạn Mức Tín Dụng</p>
                <p className="text-xl font-semibold text-blue-600">{formatCurrency(stats.totalCreditLimit)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Hợp Đồng Đang Hoạt Động</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Sắp Hết Hạn</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.expiringSoon}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ContractFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCustomers={availableCustomers}
          availableProducts={availableProducts}
          availableStaff={availableStaff}
          totalCount={contracts.length}
          filteredCount={filteredContracts.length}
        />

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {contracts.length === 0 ? 'Chưa có hợp đồng nào' : 'Không có hợp đồng nào phù hợp với bộ lọc'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {contracts.length === 0 
                ? 'Bắt đầu bằng cách tạo hợp đồng đầu tiên của bạn.' 
                : 'Hãy thử điều chỉnh tiêu chí tìm kiếm.'}
            </p>
            {contracts.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Tạo Hợp Đồng Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => (
              <ContractCard
                key={contract.contract_id}
                contract={contract}
                onEdit={handleEditContract}
                onDelete={handleDeleteContract}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Contract Form Modal */}
        {showForm && (
          <ContractForm
            contract={editingContract}
            onSave={handleSaveContract}
            onCancel={handleCancelForm}
            isLoading={loading}
            checkContractNumberExists={checkContractNumberExists}
            fetchCustomers={fetchCustomers}
            fetchProducts={fetchProducts}
            fetchStaff={fetchStaff}
          />
        )}
      </div>
    </div>
  )
}
