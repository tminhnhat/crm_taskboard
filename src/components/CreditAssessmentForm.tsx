'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { toVNDate } from '@/lib/date'
import { formatMoneyToWords, formatAreaToWords } from '@/lib/currency'
import {
  BanknotesIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'

type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>

interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section' | 'boolean'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: IconType
  fields: MetadataField[]
}

type MetadataTemplates = {
  [key: string]: TemplateConfig
}

// Unified Credit Assessment Templates
// CREDIT_ASSESSMENT_TEMPLATES phân chia theo loại khoản vay
const CREDIT_ASSESSMENT_TEMPLATES_KINH_DOANH: MetadataTemplates = {
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
  },
  // ...existing code for financial_reports, assessment_details, borrower_info, spouse_info...
};

const CREDIT_ASSESSMENT_TEMPLATES_TIEU_DUNG: MetadataTemplates = {
  loan_info: {
    title: '1. Thông tin khoản vay (Tiêu Dùng)',
    icon: BanknotesIcon,
    fields: [
      { key: 'purpose.main_purpose', label: 'Mục đích vay', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền vay', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn vay (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },
  // ...existing code for business_plan, financial_reports, assessment_details, borrower_info, spouse_info...
};

const CREDIT_ASSESSMENT_TEMPLATES_THE_TIN_DUNG: MetadataTemplates = {
  loan_info: {
    title: '1. Thông tin khoản vay (Thẻ tín dụng)',
    icon: BanknotesIcon,
    fields: [
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Hạn mức thẻ', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn thẻ (tháng)', type: 'number' },
    ]
  },
  // ...existing code for business_plan, financial_reports, assessment_details, borrower_info, spouse_info...
};

// Unified Metadata Section Component
interface MetadataSectionProps {
  title: string
  icon: IconType
  initialData: Record<string, unknown>
  fields: MetadataField[]
  onChange: (data: Record<string, unknown>) => void
}

function MetadataSection({ title, icon: Icon, initialData, fields, onChange }: MetadataSectionProps) {
  const [activeTemplate, setActiveTemplate] = useState<boolean>(false)
  const [metadata, setMetadata] = useState<Record<string, unknown>>(initialData)

  useEffect(() => {
    setMetadata(initialData)
  }, [initialData])

  const handleFieldChange = (field: string, value: unknown) => {
    const newMetadata = {
      ...metadata,
      [field]: value
    }

    // Automatically update text representations of numbers
    if (typeof value === 'number') {
      // Update currency in words
      if (field === 'tong_gia_tri_tsbd') {
        newMetadata.tong_gia_tri_tsbd_bang_chu = formatMoneyToWords(value)
      }
      
      // Update area in words
      if (field === 'dien_tich') {
        newMetadata.dien_tich_bang_chu = formatAreaToWords(value)
      }
    }

    setMetadata(newMetadata)
    onChange(newMetadata)
  }

  const hasData = Object.keys(metadata).length > 0 && Object.values(metadata).some(val => val !== '' && val !== null && val !== undefined)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium flex items-center">
          <Icon className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h4>
        <div className="flex items-center space-x-2">
          {hasData && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              Đã nhập
            </span>
          )}
          <button
            type="button"
            onClick={() => setActiveTemplate(!activeTemplate)}
            className={`px-3 py-1 text-sm rounded-md ${
              activeTemplate
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {activeTemplate ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {activeTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            field.type === 'section' ? (
              <div key={field.key} className="col-span-full">
                <h5 className="text-md font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200">
                  {field.label}
                </h5>
              </div>
            ) : (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={metadata[field.key]?.toString() || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Chọn {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={metadata[field.key]?.toString() || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : field.type === 'boolean' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(metadata[field.key])}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {Boolean(metadata[field.key]) ? 'Có' : 'Không'}
                    </span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={metadata[field.key]?.toString() || ''}
                    onChange={(e) => {
                      const value = field.type === 'number' 
                        ? parseFloat(e.target.value) 
                        : e.target.value
                      handleFieldChange(field.key, value)
                    }}
                    readOnly={field.readOnly}
                    className={`block w-full rounded-md border-gray-300 shadow-sm ${
                      field.readOnly 
                        ? 'bg-gray-50 text-gray-500'
                        : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

// Main Form Interface
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

  const [formState, setFormState] = useState(() => {
    // Đồng bộ loan_type và loan_info.loan_type.category nếu có
    let loan_type = typeof assessment?.loan_type === 'string' ? assessment.loan_type : '';
    let loan_info = assessment?.loan_info || {};
    if (loan_type && (!loan_info['loan_type.category'] || loan_info['loan_type.category'] !== loan_type)) {
      loan_info = { ...loan_info, ['loan_type.category']: loan_type };
    } else if (loan_info['loan_type.category'] && !loan_type) {
      loan_type = loan_info['loan_type.category'];
    }
    return {
      customer_id: assessment?.customer_id?.toString() || '',
      staff_id: assessment?.staff_id?.toString() || '',
      product_id: assessment?.product_id?.toString() || '',
      department: assessment?.department || '',
      department_head: assessment?.department_head || '',
      fee_amount: assessment?.fee_amount?.toString() || '',
      approval_decision: assessment?.approval_decision || '',
      status: assessment?.status || 'draft',
      loan_type,
      loan_info,
      business_plan: assessment?.business_plan || {},
      financial_reports: assessment?.financial_reports || {},
      assessment_details: assessment?.assessment_details || {},
      metadata: assessment?.metadata || {}
    }
  })

  // Chọn template theo loại khoản vay
  let selectedTemplates = CREDIT_ASSESSMENT_TEMPLATES_KINH_DOANH;
  const category = formState.loan_info?.['loan_type.category'] || formState.loan_info?.loan_type?.category;
  if (category === 'Tiêu Dùng') {
    selectedTemplates = CREDIT_ASSESSMENT_TEMPLATES_TIEU_DUNG;
  } else if (category === 'Thẻ tín dụng') {
    selectedTemplates = CREDIT_ASSESSMENT_TEMPLATES_THE_TIN_DUNG;
  }

  // Update form state when assessment changes
  useEffect(() => {
    if (assessment) {
      let loan_type = typeof assessment.loan_type === 'string' ? assessment.loan_type : '';
      let loan_info = assessment.loan_info || {};
      if (loan_type && (!loan_info['loan_type.category'] || loan_info['loan_type.category'] !== loan_type)) {
        loan_info = { ...loan_info, ['loan_type.category']: loan_type };
      } else if (loan_info['loan_type.category'] && !loan_type) {
        loan_type = loan_info['loan_type.category'];
      }
      setFormState({
        customer_id: assessment.customer_id?.toString() || '',
        staff_id: assessment.staff_id?.toString() || '',
        product_id: assessment.product_id?.toString() || '',
        department: assessment.department || '',
        department_head: assessment.department_head || '',
        fee_amount: assessment.fee_amount?.toString() || '',
        approval_decision: assessment.approval_decision || '',
        status: assessment.status || 'draft',
        loan_type,
        loan_info,
        business_plan: assessment.business_plan || {},
        financial_reports: assessment.financial_reports || {},
        assessment_details: assessment.assessment_details || {},
        metadata: assessment.metadata || {}
      })
    } else {
      setFormState({
        customer_id: '',
        staff_id: '',
        product_id: '',
        department: '',
        department_head: '',
        fee_amount: '',
        approval_decision: '',
        status: 'draft',
        loan_type: '',
        loan_info: {},
        business_plan: {},
        financial_reports: {},
        assessment_details: {},
        metadata: {}
      })
    }
  }, [assessment])

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
      loan_type: formState.loan_type,
      loan_info: formState.loan_info,
      business_plan: formState.business_plan,
      financial_reports: formState.financial_reports,
      assessment_details: formState.assessment_details,
      metadata: formState.metadata
    }
    onSubmit(assessmentData)
  }

  // Khi thay đổi loan_type thì đồng bộ loan_info.loan_type.category
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => {
      // Nếu chọn staff_id thì tự động lấy department từ staff
      if (name === 'staff_id') {
        const selectedStaff = staff.find(s => s.staff_id.toString() === value);
        return {
          ...prev,
          staff_id: value,
          department: selectedStaff?.department || '',
        };
      }
      if (name === 'loan_type') {
        return {
          ...prev,
          loan_type: value,
          loan_info: {
            ...prev.loan_info,
            ['loan_type.category']: value
          }
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  }

  // Khi thay đổi loan_info.loan_type.category thì đồng bộ loan_type
  const handleSectionDataChange = (section: string, data: Record<string, unknown>) => {
    setFormState(prev => {
      if (section === 'loan_info' && data['loan_type.category'] && data['loan_type.category'] !== prev.loan_type) {
        return {
          ...prev,
          loan_info: data,
          loan_type: data['loan_type.category']
        };
      }
      return {
        ...prev,
        [section]: data
      };
    });
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
                <select
                  name="department_head"
                  value={formState.department_head}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Chọn lãnh đạo phòng</option>
                  {staff.map(s => (
                    <option key={s.staff_id} value={s.full_name}>
                      {s.full_name}
                    </option>
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

            {/* Loan Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại khoản vay</label>
              <select
                name="loan_type"
                value={formState.loan_type}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Chọn loại khoản vay</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Tiêu dùng">Tiêu dùng</option>
                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
              </select>
            </div>
            {/* Unified Metadata Sections */}
            <div className="space-y-6">
              <MetadataSection
                  title={selectedTemplates.loan_info.title}
                  icon={selectedTemplates.loan_info.icon}
                  initialData={formState.loan_info}
                  fields={selectedTemplates.loan_info.fields}
                  onChange={(data) => handleSectionDataChange('loan_info', data)}
                />

                {selectedTemplates.business_plan && (
                  <MetadataSection
                    title={selectedTemplates.business_plan.title}
                    icon={selectedTemplates.business_plan.icon}
                    initialData={formState.business_plan}
                    fields={selectedTemplates.business_plan.fields}
                    onChange={(data) => handleSectionDataChange('business_plan', data)}
                  />
                )}

                {selectedTemplates.financial_reports && (
                  <MetadataSection
                    title={selectedTemplates.financial_reports.title}
                    icon={selectedTemplates.financial_reports.icon}
                    initialData={formState.financial_reports}
                    fields={selectedTemplates.financial_reports.fields}
                    onChange={(data) => handleSectionDataChange('financial_reports', data)}
                  />
                )}

                {selectedTemplates.assessment_details && (
                  <MetadataSection
                    title={selectedTemplates.assessment_details.title}
                    icon={selectedTemplates.assessment_details.icon}
                    initialData={formState.assessment_details}
                    fields={selectedTemplates.assessment_details.fields}
                    onChange={(data) => handleSectionDataChange('assessment_details', data)}
                  />
                )}

                {selectedTemplates.borrower_info && (
                  <MetadataSection
                    title={selectedTemplates.borrower_info.title}
                    icon={selectedTemplates.borrower_info.icon}
                    initialData={formState.metadata.borrower_info || {}}
                    fields={selectedTemplates.borrower_info.fields}
                    onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, borrower_info: data })}
                  />
                )}

                {selectedTemplates.spouse_info && (
                  <MetadataSection
                    title={selectedTemplates.spouse_info.title}
                    icon={selectedTemplates.spouse_info.icon}
                    initialData={formState.metadata.spouse_info || {}}
                    fields={selectedTemplates.spouse_info.fields}
                    onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, spouse_info: data })}
                  />
                )}

                {selectedTemplates.credit_history && (
                  <MetadataSection
                    title={selectedTemplates.credit_history.title}
                    icon={selectedTemplates.credit_history.icon}
                    initialData={formState.metadata.credit_history || {}}
                    fields={selectedTemplates.credit_history.fields}
                    onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, credit_history: data })}
                  />
                )}
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
