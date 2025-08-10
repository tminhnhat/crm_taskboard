'use client'

import { useState, useEffect } from 'react'
import { Interaction, Customer, Staff } from '@/lib/supabase'

interface InteractionFormProps {
  interaction?: Interaction | null
  onSave: (interactionData: Partial<Interaction>) => void
  onCancel: () => void
  isLoading?: boolean
  fetchCustomers: () => Promise<Pick<Customer, 'customer_id' | 'full_name' | 'email' | 'phone' | 'customer_type' | 'status'>[]>
  fetchStaff: () => Promise<Pick<Staff, 'staff_id' | 'full_name' | 'email' | 'position' | 'department' | 'status'>[]>
}

export default function InteractionForm({ 
  interaction, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers,
  fetchStaff
}: InteractionFormProps) {
  const [formData, setFormData] = useState({
    customer_id: interaction?.customer_id || '',
    staff_id: interaction?.staff_id || '',
    interaction_type: interaction?.interaction_type || 'call',
    notes: interaction?.notes || ''
  })

  const [customers, setCustomers] = useState<Pick<Customer, 'customer_id' | 'full_name' | 'email' | 'phone' | 'customer_type' | 'status'>[]>([])
  const [staff, setStaff] = useState<Pick<Staff, 'staff_id' | 'full_name' | 'email' | 'position' | 'department' | 'status'>[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Load customers and staff for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersData, staffData] = await Promise.all([
          fetchCustomers(),
          fetchStaff()
        ])
        setCustomers(customersData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers, fetchStaff])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert string IDs to numbers
    const cleanedData = {
      ...formData,
      customer_id: Number(formData.customer_id),
      staff_id: Number(formData.staff_id),
      notes: formData.notes.trim() || null
    }

    onSave(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loadingOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải tùy chọn biểu mẫu...</span>
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
            {interaction ? 'Sửa Tương Tác' : 'Thêm Tương Tác Mới'}
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
                    {customer.full_name} ({customer.customer_type})
                    {customer.email && ` - ${customer.email}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700 mb-1">
                Nhân Viên *
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
                {staff.map((member) => (
                  <option key={member.staff_id} value={member.staff_id}>
                    {member.full_name}
                    {member.position && ` - ${member.position}`}
                    {member.department && ` (${member.department})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="interaction_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại Tương Tác *
              </label>
              <select
                id="interaction_type"
                name="interaction_type"
                value={formData.interaction_type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="call">Gọi Điện</option>
                <option value="email">Email</option>
                <option value="meeting">Cuộc Họp</option>
                <option value="chat">Trò Chuyện/Tin Nhắn</option>
                <option value="visit">Thăm Trực Tiếp</option>
                <option value="support">Phiếu Hỗ Trợ</option>
                <option value="follow-up">Theo Dõi</option>
                <option value="complaint">Khiếu Nại</option>
                <option value="inquiry">Yêu Cầu Thông Tin</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi Chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập chi tiết về tương tác..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.customer_id || !formData.staff_id}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang lưu...' : (interaction ? 'Cập Nhật Tương Tác' : 'Tạo Tương Tác')}
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
