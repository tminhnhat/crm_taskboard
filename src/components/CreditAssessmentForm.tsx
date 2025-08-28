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
const CREDIT_ASSESSMENT_TEMPLATES: MetadataTemplates = {
  loan_info: {
    title: '1. Thông tin khoản vay',
    icon: BanknotesIcon,
    fields: [
      {
        key: 'loan_type.category',
        label: 'Loại khoản vay',
        type: 'select',
        options: ['business', 'consumer', 'mortgage', 'credit_card']
      },
      { key: 'loan_type.product_code', label: 'Mã sản phẩm', type: 'text' },
      { key: 'loan_type.product_name', label: 'Tên sản phẩm', type: 'text' },
      { key: 'purpose.main_purpose', label: 'Mục đích vay chính', type: 'text' },
      { key: 'purpose.sub_purpose', label: 'Mục đích vay chi tiết', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền đề nghị vay', type: 'number' },
      { key: 'amount.approved', label: 'Số tiền được duyệt', type: 'number' },
      { key: 'amount.disbursement', label: 'Số tiền giải ngân', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn đề nghị (tháng)', type: 'number' },
      { key: 'term.approved_months', label: 'Thời hạn được duyệt (tháng)', type: 'number' },
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

  financial_reports: {
    title: '3. Báo cáo tài chính',
    icon: DocumentTextIcon,
    fields: [
      // Năm 0
      { key: 'section_nam_0', label: 'Năm hiện tại', type: 'section' },
      { key: 'nam_0.title', label: 'Năm', type: 'number' },
      { key: 'nam_0.tongtaisan', label: 'Tổng tài sản', type: 'number' },
      { key: 'nam_0.taisannganhang', label: 'Tài sản ngân hàng', type: 'number' },
      { key: 'nam_0.tien', label: 'Tiền', type: 'number' },
      { key: 'nam_0.phaithu', label: 'Phải thu', type: 'number' },
      { key: 'nam_0.tonkho', label: 'Tồn kho', type: 'number' },
      { key: 'nam_0.tscd', label: 'TSCĐ', type: 'number' },
      { key: 'nam_0.tongnguonvon', label: 'Tổng nguồn vốn', type: 'number' },
      { key: 'nam_0.notranguoiban', label: 'Nợ trả người bán', type: 'number' },
      { key: 'nam_0.nonhct', label: 'Nợ NHCT', type: 'number' },
      { key: 'nam_0.notctd', label: 'Nợ TCTD', type: 'number' },
      { key: 'nam_0.nodaihan', label: 'Nợ dài hạn', type: 'number' },
      { key: 'nam_0.voncsh', label: 'Vốn CSH', type: 'number' },
      { key: 'nam_0.doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'nam_0.giavon', label: 'Giá vốn', type: 'number' },
      { key: 'nam_0.loinhuantruocthue', label: 'Lợi nhuận trước thuế', type: 'number' },
      { key: 'nam_0.loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' },

      // Năm 1
      { key: 'section_nam_1', label: 'Năm trước', type: 'section' },
      { key: 'nam_1.title', label: 'Năm', type: 'number' },
      { key: 'nam_1.tongtaisan', label: 'Tổng tài sản', type: 'number' },
      { key: 'nam_1.doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'nam_1.loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' },

      // Năm 2
      { key: 'section_nam_2', label: 'Năm trước nữa', type: 'section' },
      { key: 'nam_2.title', label: 'Năm', type: 'number' },
      { key: 'nam_2.tongtaisan', label: 'Tổng tài sản', type: 'number' },
      { key: 'nam_2.doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'nam_2.loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' }
    ]
  },

  assessment_details: {
    title: '4. Đánh giá chi tiết',
    icon: ClipboardDocumentCheckIcon,
    fields: [
      { key: 'section_taichinh', label: 'Đánh giá tài chính', type: 'section' },
      { key: 'danhgiathongtintaichinh.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'danhgiathongtintaichinh.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'danhgiathongtintaichinh.content', label: 'Nội dung', type: 'textarea' },

      { key: 'section_pakd', label: 'Đánh giá PAKD', type: 'section' },
      { key: 'danhgiapakd.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'danhgiapakd.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'danhgiapakd.content', label: 'Nội dung', type: 'textarea' },

      { key: 'section_kinhnghiem', label: 'Kinh nghiệm SXKD', type: 'section' },
      { key: 'linhvuc_kinhnghiemsxkd.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'linhvuc_kinhnghiemsxkd.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'linhvuc_kinhnghiemsxkd.content', label: 'Nội dung', type: 'textarea' }
    ]
  },

  borrower_info: {
    title: '5. Thông tin người vay',
    icon: UserIcon,
    fields: [
      { key: 'borrower.full_name', label: 'Họ tên', type: 'text' },
      { key: 'borrower.birth_date', label: 'Ngày sinh', type: 'date' },
      { key: 'borrower.id_number', label: 'Số CMND/CCCD', type: 'text' },
      { key: 'borrower.id_issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'borrower.id_issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'borrower.phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'borrower.email', label: 'Email', type: 'email' },
      { key: 'borrower.occupation', label: 'Nghề nghiệp', type: 'text' },
      { key: 'borrower.workplace', label: 'Nơi làm việc', type: 'text' },
      { key: 'borrower.position', label: 'Chức vụ', type: 'text' },
      { key: 'borrower.income_monthly', label: 'Thu nhập hàng tháng', type: 'number' },
      { key: 'borrower.current_address', label: 'Địa chỉ hiện tại', type: 'text' },
      { key: 'borrower.permanent_address', label: 'Địa chỉ thường trú', type: 'text' },
      { key: 'borrower.residence_status', label: 'Tình trạng cư trú', type: 'text' },
      { key: 'borrower.residence_time_years', label: 'Thời gian cư trú (năm)', type: 'number' }
    ]
  },

  spouse_info: {
    title: '6. Thông tin vợ/chồng',
    icon: UserGroupIcon,
    fields: [
      { key: 'spouse.full_name', label: 'Họ tên', type: 'text' },
      { key: 'spouse.birth_date', label: 'Ngày sinh', type: 'date' },
      { key: 'spouse.id_number', label: 'Số CMND/CCCD', type: 'text' },
      { key: 'spouse.id_issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'spouse.id_issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'spouse.phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'spouse.current_address', label: 'Địa chỉ hiện tại', type: 'text' },
      { key: 'spouse.permanent_address', label: 'Địa chỉ thường trú', type: 'text' },
      { key: 'spouse.occupation', label: 'Nghề nghiệp', type: 'text' },
      { key: 'spouse.workplace', label: 'Nơi làm việc', type: 'text' },
      { key: 'spouse.position', label: 'Chức vụ', type: 'text' },
      { key: 'spouse.income_monthly', label: 'Thu nhập hàng tháng', type: 'number' }
    ]
  },

  credit_history: {
    title: '7. Lịch sử tín dụng',
    icon: BuildingOfficeIcon,
    fields: [
      { key: 'borrower.credit_history.credit_score', label: 'Điểm tín dụng', type: 'number' },
      { key: 'section_loans', label: 'Các khoản vay hiện có', type: 'section' },
      { key: 'borrower.credit_history.existing_loans[].bank', label: 'Ngân hàng', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].product', label: 'Sản phẩm', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].original_amount', label: 'Số tiền vay', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].current_balance', label: 'Dư nợ hiện tại', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].monthly_payment', label: 'Trả góp hàng tháng', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].start_date', label: 'Ngày bắt đầu', type: 'date' },
      { key: 'borrower.credit_history.existing_loans[].end_date', label: 'Ngày kết thúc', type: 'date' },
      { key: 'borrower.credit_history.existing_loans[].collateral', label: 'Tài sản đảm bảo', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].status', label: 'Trạng thái', type: 'text' }
    ]
  }
}

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

  // Update form state when assessment changes
  useEffect(() => {
    if (assessment) {
      setFormState({
        customer_id: assessment.customer_id?.toString() || '',
        staff_id: assessment.staff_id?.toString() || '',
        product_id: assessment.product_id?.toString() || '',
        department: assessment.department || '',
        department_head: assessment.department_head || '',
        fee_amount: assessment.fee_amount?.toString() || '',
        approval_decision: assessment.approval_decision || '',
        status: assessment.status || 'draft',
        loan_info: assessment.loan_info || {},
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

  const handleSectionDataChange = (section: string, data: Record<string, unknown>) => {
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

            {/* Unified Metadata Sections */}
            <div className="space-y-6">
              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.loan_info.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.loan_info.icon}
                initialData={formState.loan_info}
                fields={CREDIT_ASSESSMENT_TEMPLATES.loan_info.fields}
                onChange={(data) => handleSectionDataChange('loan_info', data)}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.business_plan.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.business_plan.icon}
                initialData={formState.business_plan}
                fields={CREDIT_ASSESSMENT_TEMPLATES.business_plan.fields}
                onChange={(data) => handleSectionDataChange('business_plan', data)}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.financial_reports.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.financial_reports.icon}
                initialData={formState.financial_reports}
                fields={CREDIT_ASSESSMENT_TEMPLATES.financial_reports.fields}
                onChange={(data) => handleSectionDataChange('financial_reports', data)}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.assessment_details.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.assessment_details.icon}
                initialData={formState.assessment_details}
                fields={CREDIT_ASSESSMENT_TEMPLATES.assessment_details.fields}
                onChange={(data) => handleSectionDataChange('assessment_details', data)}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.borrower_info.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.borrower_info.icon}
                initialData={formState.metadata.borrower_info || {}}
                fields={CREDIT_ASSESSMENT_TEMPLATES.borrower_info.fields}
                onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, borrower_info: data })}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.spouse_info.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.spouse_info.icon}
                initialData={formState.metadata.spouse_info || {}}
                fields={CREDIT_ASSESSMENT_TEMPLATES.spouse_info.fields}
                onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, spouse_info: data })}
              />

              <MetadataSection
                title={CREDIT_ASSESSMENT_TEMPLATES.credit_history.title}
                icon={CREDIT_ASSESSMENT_TEMPLATES.credit_history.icon}
                initialData={formState.metadata.credit_history || {}}
                fields={CREDIT_ASSESSMENT_TEMPLATES.credit_history.fields}
                onChange={(data) => handleSectionDataChange('metadata', { ...formState.metadata, credit_history: data })}
              />
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
