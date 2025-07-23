'use client'

import { useState, useEffect } from 'react'
import { Opportunity, Customer, Product, Staff } from '@/lib/supabase'

interface OpportunityFormProps {
  opportunity?: Opportunity | null
  onSave: (opportunityData: Partial<Opportunity>) => void
  onCancel: () => void
  isLoading?: boolean
  fetchCustomers: () => Promise<Customer[]>
  fetchProducts: () => Promise<Product[]>
  fetchStaff: () => Promise<Staff[]>
}

export default function OpportunityForm({ 
  opportunity, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers,
  fetchProducts,
  fetchStaff
}: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    customer_id: opportunity?.customer_id?.toString() || '',
    product_id: opportunity?.product_id?.toString() || '',
    staff_id: opportunity?.staff_id?.toString() || '',
    status: opportunity?.status || 'new',
    expected_value: opportunity?.expected_value?.toString() || ''
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Load customers, products, and staff for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersData, productsData, staffData] = await Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchStaff()
        ])
        setCustomers(customersData)
        setProducts(productsData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers, fetchProducts, fetchStaff])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert string IDs to numbers and clean up data
    const cleanedData = {
      customer_id: parseInt(formData.customer_id),
      product_id: parseInt(formData.product_id),
      staff_id: parseInt(formData.staff_id),
      status: formData.status,
      expected_value: formData.expected_value ? parseFloat(formData.expected_value) : null
    }

    onSave(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loadingOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu form...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {opportunity ? 'Chỉnh Sửa Cơ Hội' : 'Thêm Cơ Hội Mới'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                Khách Hàng *
              </label>
              <select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
                Sản Phẩm *
              </label>
              <select
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                    {product.product_type && ` (${product.product_type})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700 mb-1">
                Người Phụ Trách *
              </label>
              <select
                id="staff_id"
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn nhân viên</option>
                {staff.map((staffMember) => (
                  <option key={staffMember.staff_id} value={staffMember.staff_id}>
                    {staffMember.full_name}
                    {staffMember.position && ` (${staffMember.position})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expected_value" className="block text-sm font-medium text-gray-700 mb-1">
                Giá Trị Dự Kiến (VND)
              </label>
              <input
                type="number"
                id="expected_value"
                name="expected_value"
                value={formData.expected_value}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập giá trị dự kiến"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng Thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">Mới</option>
                <option value="in_progress">Đang Thực Hiện</option>
                <option value="won">Thành Công</option>
                <option value="lost">Thất Bại</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.customer_id || !formData.product_id || !formData.staff_id}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang Lưu...' : (opportunity ? 'Cập Nhật Cơ Hội' : 'Tạo Cơ Hội')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
