'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import MetadataForm from './MetadataForm'
import JsonInputHelper from './JsonInputHelper'
import { toVNDate } from '@/lib/date'
import CREDIT_ASSESSMENT_TEMPLATES from './metadata/CreditAssessmentTemplates'

interface CreditAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  assessment?: any;
  isLoading?: boolean;
  customers: any[];
  staff: any[];
  products: any[];
}

export default function CreditAssessmentForm({
  isOpen,
  onClose,
  onSubmit,
  assessment,
  isLoading,
  customers,
  staff,
  products
}: CreditAssessmentFormProps) {

  const [formState, setFormState] = useState({
    customer_id: assessment?.customer_id?.toString() || '',
    staff_id: assessment?.staff_id?.toString() || '',
    product_id: assessment?.product_id?.toString() || '',
    department: assessment?.department || '',
    department_head: assessment?.department_head || '',
    fee_amount: assessment?.fee_amount?.toString() || '',
    approval_decision: assessment?.approval_decision || '',
    status: assessment?.status || 'draft',
    loan_info: assessment?.loan_info || {},
    business_plan: assessment?.business_plan || {},
    financial_reports: assessment?.financial_reports || {},
    assessment_details: assessment?.assessment_details || {},
    metadata: assessment?.metadata || {}
  })



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const assessmentData = {
      customer_id: parseInt(formState.customer_id),
      staff_id: parseInt(formState.staff_id),
      product_id: parseInt(formState.product_id),
      department: formState.department,
      department_head: formState.department_head,
      fee_amount: parseFloat(formState.fee_amount) || 0,
      approval_decision: formState.approval_decision,
      status: formState.status,
      loan_info: formState.loan_info,
      business_plan: formState.business_plan,
      financial_reports: formState.financial_reports,
      assessment_details: formState.assessment_details,
      metadata: formState.metadata
    }

    onSubmit(assessmentData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleJsonDataChange = (section: string, data: any) => {
    setFormState(prev => ({
      ...prev,
      [section]: data
    }))
  }

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      open={isOpen}
      onClose={onClose}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="inline-block w-full max-w-7xl my-8 p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
              {assessment ? 'Chỉnh sửa thẩm định' : 'Thẩm định mới'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                <select
                  name="customer_id"
                  value={formState.customer_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nhân viên</label>
                <select
                  name="staff_id"
                  value={formState.staff_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Chọn nhân viên</option>
                  {staff.map(s => (
                    <option key={s.staff_id} value={s.staff_id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sản phẩm</label>
                <select
                  name="product_id"
                  value={formState.product_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                <input
                  type="text"
                  name="department"
                  value={formState.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lãnh đạo phòng</label>
                <input
                  type="text"
                  name="department_head"
                  value={formState.department_head}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phí thẩm định</label>
                <input
                  type="number"
                  name="fee_amount"
                  value={formState.fee_amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* JSON Data Forms */}
            <div className="grid grid-cols-1 gap-6">
              {/* Loan Information */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Thông tin khoản vay</h4>
                <MetadataForm
                  initialData={{ loan_info: formState.loan_info }}
                  onChange={(data) => handleJsonDataChange('loan_info', data.loan_info || {})}
                  suggestedTemplates={['loan_info']}
                  customTemplates={CREDIT_ASSESSMENT_TEMPLATES}
                />
              </div>

              {/* Business Plan */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Phương án kinh doanh</h4>
                <MetadataForm
                  initialData={{ business_plan: formState.business_plan }}
                  onChange={(data) => handleJsonDataChange('business_plan', data.business_plan || {})}
                  suggestedTemplates={['business_plan']}
                  customTemplates={CREDIT_ASSESSMENT_TEMPLATES}
                />
              </div>

              {/* Financial Reports */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Báo cáo tài chính</h4>
                <MetadataForm
                  initialData={{ financial_reports: formState.financial_reports }}
                  onChange={(data) => handleJsonDataChange('financial_reports', data.financial_reports || {})}
                  suggestedTemplates={['financial_reports']}
                  customTemplates={CREDIT_ASSESSMENT_TEMPLATES}
                />
              </div>

              {/* Assessment Details */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Chi tiết đánh giá</h4>
                <MetadataForm
                  initialData={{ assessment_details: formState.assessment_details }}
                  onChange={(data) => handleJsonDataChange('assessment_details', data.assessment_details || {})}
                  suggestedTemplates={['assessment_details']}
                  customTemplates={CREDIT_ASSESSMENT_TEMPLATES}
                />
              </div>

              {/* Borrower Information */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Thông tin người vay</h4>
                <MetadataForm
                  initialData={{ borrower_info: formState.metadata.borrower_info || {}, spouse_info: formState.metadata.spouse_info || {}, credit_history: formState.metadata.credit_history || {} }}
                  onChange={(data) => handleJsonDataChange('metadata', data)}
                  suggestedTemplates={['borrower_info', 'spouse_info', 'credit_history']}
                  customTemplates={CREDIT_ASSESSMENT_TEMPLATES}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : assessment ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
