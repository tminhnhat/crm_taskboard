// Cleaned and refactored CreditAssessmentForm
'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { toVNDate } from '@/lib/date'
import {
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

// --- Types ---
interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section' | 'boolean'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: any
  fields: MetadataField[]
}

interface MetadataTemplates {
  [key: string]: TemplateConfig
}

interface CreditAssessmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  assessment?: any
  isLoading?: boolean
  customers: any[]
  staff: any[]
  products: any[]
}

// --- Templates ---
const SPOUSE_TEMPLATE: TemplateConfig = {
  title: 'Thông tin vợ/chồng',
  icon: UserGroupIcon,
  fields: [
    { key: 'full_name', label: 'Họ và tên', type: 'text' },
    { key: 'date_of_birth', label: 'Ngày sinh', type: 'date' },
    { key: 'gender', label: 'Giới tính', type: 'select', options: ['Nam', 'Nữ', 'Khác'] },
    { key: 'id_number', label: 'Số CMND/CCCD', type: 'text' },
    { key: 'id_issue_date', label: 'Ngày cấp', type: 'date' },
    { key: 'id_issue_authority', label: 'Nơi cấp', type: 'text' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel' },
    { key: 'address', label: 'Địa chỉ', type: 'text' },
    { key: 'account_number', label: 'Số tài khoản', type: 'text' },
    { key: 'cif_number', label: 'Số CIF', type: 'text' },
  ]
}

const TEMPLATES_KINH_DOANH: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Kinh doanh)',
    icon: BanknotesIcon,
    fields: [
      { key: 'purpose.main_purpose', label: 'Mục đích vay', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền vay', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn vay (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },
  business_plan: {
    title: '2. Phương án kinh doanh',
    icon: ChartBarIcon,
    fields: [
      { key: 'pakd_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'pakd_giavon', label: 'Giá vốn', type: 'number' },
      { key: 'pakd_nhancong', label: 'Chi phí nhân công', type: 'number' },
      { key: 'pakd_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'pakd_laivay', label: 'Lãi vay', type: 'number' },
      { key: 'pakd_thue', label: 'Thuế', type: 'number' },
      { key: 'pakd_loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' },
      { key: 'pakd_tongchiphi', label: 'Tổng chi phí', type: 'number' },
      { key: 'pakd_vongquay', label: 'Vòng quay', type: 'number' },
      { key: 'pakd_nhucauvon', label: 'Nhu cầu vốn', type: 'number' },
      { key: 'pakd_vontuco', label: 'Vốn tự có', type: 'number' },
      { key: 'pakd_vaytctdkhac', label: 'Vay TCTD khác', type: 'number' },
      { key: 'pakd_vaynhct', label: 'Vay NHCT', type: 'number' }
    ]
  }
  // ...add more sections as needed
}

// ...add TEMPLATES_TIEU_DUNG, TEMPLATES_THE_TIN_DUNG if needed

// --- Metadata Section ---
function MetadataSection({ title, icon: Icon, initialData, fields, onChange }: {
  title: string
  icon: any
  initialData: Record<string, any>
  fields: MetadataField[]
  onChange: (data: Record<string, any>) => void
}) {
  const [metadata, setMetadata] = useState<Record<string, any>>(initialData)
  useEffect(() => { setMetadata(initialData) }, [initialData])
  const handleFieldChange = (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value }
    setMetadata(newMetadata)
    onChange(newMetadata)
  }
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 mr-2 text-blue-600" />
        <h4 className="text-lg font-medium">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={metadata[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Chọn {field.label}</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={metadata[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            ) : field.type === 'boolean' ? (
              <input
                type="checkbox"
                checked={!!metadata[field.key]}
                onChange={e => handleFieldChange(field.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            ) : (
              <input
                type={field.type}
                value={metadata[field.key] || ''}
                onChange={e => handleFieldChange(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                readOnly={field.readOnly}
                className={`block w-full rounded-md border-gray-300 shadow-sm ${field.readOnly ? 'bg-gray-50 text-gray-500' : ''}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Form ---
export default function CreditAssessmentForm({
  isOpen, onClose, onSubmit, assessment, isLoading, customers, staff, products
}: CreditAssessmentFormProps) {
  // --- State ---
  const [formState, setFormState] = useState(() => {
    const details = assessment?.assessment_details || {}
    return {
      customer_id: assessment?.customer_id?.toString() || '',
      staff_id: assessment?.staff_id?.toString() || '',
      product_id: assessment?.product_id?.toString() || '',
      department: assessment?.department || '',
      department_head: assessment?.department_head || '',
      fee_amount: assessment?.fee_amount?.toString() || '',
      status: assessment?.status || 'draft',
      assessment_details: {
        ...details,
        spouse_info: details.spouse_info || {},
        loan_info: details.loan_info || {},
        business_plan: details.business_plan || {},
        // ...add more as needed
      }
    }
  })

  // --- Update state on assessment change ---
  useEffect(() => {
    if (assessment) {
      const details = assessment.assessment_details || {}
      setFormState({
        customer_id: assessment.customer_id?.toString() || '',
        staff_id: assessment.staff_id?.toString() || '',
        product_id: assessment.product_id?.toString() || '',
        department: assessment.department || '',
        department_head: assessment.department_head || '',
        fee_amount: assessment.fee_amount?.toString() || '',
        status: assessment.status || 'draft',
        assessment_details: {
          ...details,
          spouse_info: details.spouse_info || {},
          loan_info: details.loan_info || {},
          business_plan: details.business_plan || {},
        }
      })
    } else {
      setFormState({
        customer_id: '',
        staff_id: '',
        product_id: '',
        department: '',
        department_head: '',
        fee_amount: '',
        status: 'draft',
        assessment_details: {
          spouse_info: {},
          loan_info: {},
          business_plan: {},
        }
      })
    }
  }, [assessment])

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState(prev => {
      if (name === 'staff_id') {
        const selectedStaff = staff.find(s => s.staff_id.toString() === value)
        return { ...prev, staff_id: value, department: selectedStaff?.department || '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSectionDataChange = (section: string, data: Record<string, any>) => {
    setFormState(prev => ({
      ...prev,
      assessment_details: {
        ...prev.assessment_details,
        [section]: data
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      customer_id: parseInt(formState.customer_id),
      staff_id: parseInt(formState.staff_id),
      product_id: parseInt(formState.product_id),
      department: formState.department,
      department_head: formState.department_head,
      fee_amount: parseFloat(formState.fee_amount) || 0,
      status: formState.status,
      assessment_details: formState.assessment_details
    }
    onSubmit(data)
  }

  // --- Render ---
  return (
    <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={onClose}>
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="inline-block w-full max-w-4xl my-8 p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
              {assessment ? 'Chỉnh sửa thẩm định' : 'Thẩm định mới'}
            </Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  name="status"
                  value={formState.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="draft">Nháp</option>
                  <option value="approve">Phê duyệt</option>
                </select>
              </div>
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
                    <option key={s.staff_id} value={s.staff_id}>{s.full_name}</option>
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
                    <option key={product.product_id} value={product.product_id}>{product.product_name}</option>
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
                <select
                  name="department_head"
                  value={formState.department_head}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Chọn lãnh đạo phòng</option>
                  {staff.map(s => (
                    <option key={s.staff_id} value={s.full_name}>{s.full_name}</option>
                  ))}
                </select>
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
            {/* Spouse select and metadata section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Chọn vợ/chồng từ khách hàng</label>
              <select
                value={formState.assessment_details.spouse_info?.customer_id || ''}
                onChange={e => {
                  const selectedId = e.target.value
                  const selectedCustomer = customers.find(c => c.customer_id.toString() === selectedId)
                  if (selectedCustomer) {
                    const mapped = {
                      customer_id: selectedCustomer.customer_id,
                      full_name: selectedCustomer.full_name,
                      date_of_birth: selectedCustomer.date_of_birth,
                      gender: selectedCustomer.gender,
                      id_number: selectedCustomer.id_number,
                      id_issue_date: selectedCustomer.id_issue_date,
                      id_issue_authority: selectedCustomer.id_issue_authority,
                      phone: selectedCustomer.phone,
                      address: selectedCustomer.address,
                      account_number: selectedCustomer.account_number,
                      cif_number: selectedCustomer.cif_number
                    }
                    handleSectionDataChange('spouse_info', mapped)
                  } else {
                    handleSectionDataChange('spouse_info', {})
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Chọn khách hàng làm vợ/chồng</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <MetadataSection
              title={SPOUSE_TEMPLATE.title}
              icon={SPOUSE_TEMPLATE.icon}
              initialData={{
                ...formState.assessment_details.spouse_info,
                date_of_birth: formState.assessment_details.spouse_info?.date_of_birth ? toVNDate(formState.assessment_details.spouse_info.date_of_birth) : '',
                id_issue_date: formState.assessment_details.spouse_info?.id_issue_date ? toVNDate(formState.assessment_details.spouse_info.id_issue_date) : ''
              }}
              fields={SPOUSE_TEMPLATE.fields}
              onChange={data => handleSectionDataChange('spouse_info', data)}
            />
            {/* Loan Info */}
            <MetadataSection
              title={TEMPLATES_KINH_DOANH.loan_info.title}
              icon={TEMPLATES_KINH_DOANH.loan_info.icon}
              initialData={formState.assessment_details.loan_info}
              fields={TEMPLATES_KINH_DOANH.loan_info.fields}
              onChange={data => handleSectionDataChange('loan_info', data)}
            />
            {/* Business Plan */}
            <MetadataSection
              title={TEMPLATES_KINH_DOANH.business_plan.title}
              icon={TEMPLATES_KINH_DOANH.business_plan.icon}
              initialData={formState.assessment_details.business_plan}
              fields={TEMPLATES_KINH_DOANH.business_plan.fields}
              onChange={data => handleSectionDataChange('business_plan', data)}
            />
            {/* ...add more MetadataSection for other templates as needed... */}
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Hủy</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
                {isLoading ? 'Đang xử lý...' : assessment ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
