'use client'

import { useState, useEffect } from 'react'
import { CreditAssessment, Customer, Staff } from '@/lib/supabase'

interface CreditAssessmentFormProps {
  assessment?: CreditAssessment | null
  onSave: (assessmentData: Partial<CreditAssessment>) => void
  onCancel: () => void
  isLoading?: boolean
  fetchCustomers: () => Promise<Customer[]>
  fetchStaff: () => Promise<Staff[]>
}

export default function CreditAssessmentForm({ 
  assessment, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers,
  fetchStaff
}: CreditAssessmentFormProps) {
  const [formData, setFormData] = useState({
    customer_id: assessment?.customer_id?.toString() || '',
    staff_id: assessment?.staff_id?.toString() || '',
    assessment_date: assessment?.assessment_date || new Date().toISOString().split('T')[0],
    credit_score: assessment?.credit_score?.toString() || '',
    assessment_result: assessment?.assessment_result || 'pending',
    comments: assessment?.comments || '',
    documents: assessment?.documents || '',
    metadata: assessment?.metadata || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [metadataInput, setMetadataInput] = useState('')

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

  // Initialize metadata input from existing data
  useEffect(() => {
    if (assessment?.metadata) {
      setMetadataInput(JSON.stringify(assessment.metadata, null, 2))
    }
  }, [assessment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch (error) {
        
        return
          alert('Dữ liệu JSON không hợp lệ trong trường thông tin bổ sung')
      }
    }

    const assessmentData: Partial<CreditAssessment> = {
      customer_id: parseInt(formData.customer_id),
      staff_id: parseInt(formData.staff_id),
      assessment_date: formData.assessment_date,
      credit_score: formData.credit_score ? parseInt(formData.credit_score) : null,
      assessment_result: formData.assessment_result || null,
      comments: formData.comments || null,
      documents: formData.documents || null,
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSave(assessmentData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getCreditScoreColor = (score: string) => {
    const numScore = parseInt(score)
    if (!numScore) return 'text-gray-500'
    if (numScore >= 700) return 'text-green-600'
    if (numScore >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {assessment ? 'Chỉnh Sửa Đánh Giá Tín Dụng' : 'Đánh Giá Tín Dụng Mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khách hàng *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              required
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn khách hàng...</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} - {customer.account_number}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người đánh giá *
            </label>
            <select
              value={formData.staff_id}
              onChange={(e) => handleInputChange('staff_id', e.target.value)}
              required
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn nhân viên...</option>
              {staff.map(staffMember => (
                <option key={staffMember.staff_id} value={staffMember.staff_id}>
                  {staffMember.full_name} - {staffMember.position || staffMember.department}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày đánh giá *
            </label>
            <input
              type="date"
              value={formData.assessment_date}
              onChange={(e) => handleInputChange('assessment_date', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Credit Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Điểm tín dụng
            </label>
            <div className="relative">
              <input
                type="number"
                min="300"
                max="850"
                value={formData.credit_score}
                onChange={(e) => handleInputChange('credit_score', e.target.value)}
                placeholder="vd: 750"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getCreditScoreColor(formData.credit_score)}`}
              />
              {formData.credit_score && (
                <div className="text-xs text-gray-500 mt-1">
                  Thang điểm: 300-850 (Càng cao càng tốt)
                </div>
              )}
            </div>
          </div>

          {/* Assessment Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kết quả đánh giá
            </label>
            <select
              value={formData.assessment_result}
              onChange={(e) => handleInputChange('assessment_result', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Đang chờ</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="conditional">Có điều kiện</option>
              <option value="under_review">Đang xem xét</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhận xét
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="Ghi chú đánh giá, quan sát, khuyến nghị..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tài liệu
            </label>
            <input
              type="text"
              value={formData.documents}
              onChange={(e) => handleInputChange('documents', e.target.value)}
              placeholder="Tên file hoặc liên kết đến tài liệu hỗ trợ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Nhập tên file hoặc URL, cách nhau bằng dấu phẩy
            </div>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông tin bổ sung (JSON)
            </label>
            <textarea
              value={metadataInput}
              onChange={(e) => setMetadataInput(e.target.value)}
              placeholder='{"phuong_phap_danh_gia": "tu_dong", "nguon_du_lieu": "trung_tam_tin_dung", "phan_loai_rui_ro": "thap"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              Tùy chọn: Thêm các trường tùy chỉnh ở định dạng JSON
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang lưu...' : (assessment ? 'Cập nhật' : 'Tạo') + ' Đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
