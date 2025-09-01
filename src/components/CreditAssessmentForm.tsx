// CreditAssessmentFormFull.tsx - Phiên bản đầy đủ thông tin, hỗ trợ nhiều loại khoản vay và metadata section động
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
  },
  financial_reports: {
    title: '3. Báo cáo tài chính',
    icon: DocumentTextIcon,
    fields: [
      { key: 'bc_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'bc_loinhuan', label: 'Lợi nhuận', type: 'number' },
      { key: 'bc_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'bc_tongchiphi', label: 'Tổng chi phí', type: 'number' }
    ]
  },
  assessment_details: {
    title: '4. Đánh giá thẩm định',
    icon: ClipboardDocumentCheckIcon,
    fields: [
      { key: 'danhgia_khachhang', label: 'Đánh giá khách hàng', type: 'textarea' },
      { key: 'danhgia_taisan', label: 'Đánh giá tài sản', type: 'textarea' },
      { key: 'danhgia_khac', label: 'Đánh giá khác', type: 'textarea' }
    ]
  }
}

const TEMPLATES_TIEU_DUNG: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Tiêu dùng)',
    icon: BanknotesIcon,
    fields: [
      { key: 'purpose.main_purpose', label: 'Mục đích vay', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền vay', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn vay (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },
  repayment_sources: {
    title: '2. Nguồn trả nợ',
    icon: ClipboardDocumentCheckIcon,
    fields: [
      { key: 'from_customer_salary', label: 'Từ lương của khách hàng', type: 'number' },
      { key: 'from_customer_salary_desc', label: 'Mô tả nguồn lương của khách hàng', type: 'textarea' },
      { key: 'from_spouse_salary', label: 'Từ lương của vợ/chồng', type: 'number' },
      { key: 'from_spouse_salary_desc', label: 'Mô tả nguồn lương của vợ/chồng', type: 'textarea' },
      { key: 'from_asset_rental', label: 'Từ cho thuê tài sản', type: 'number' },
      { key: 'from_asset_rental_desc', label: 'Mô tả nguồn cho thuê tài sản', type: 'textarea' },
      { key: 'from_business', label: 'Từ hoạt động kinh doanh', type: 'number' },
      { key: 'from_business_desc', label: 'Mô tả nguồn hoạt động kinh doanh', type: 'textarea' },
      { key: 'from_other', label: 'Từ nguồn khác', type: 'number' },
      { key: 'from_other_desc', label: 'Mô tả nguồn khác', type: 'textarea' },
      { key: 'total_repayment_sources', label: 'Tổng nguồn trả nợ', type: 'number', readOnly: true }
    ]
  },
  liabilities: {
    title: '3. Thông tin nợ phải trả',
    icon: DocumentTextIcon,
    fields: [
      { key: 'expected_loan_liability', label: 'Nợ phải trả cho khoản vay dự kiến', type: 'number' },
      { key: 'expected_loan_liability_desc', label: 'Mô tả nợ phải trả cho khoản vay dự kiến', type: 'textarea' },
      { key: 'other_bank_liability', label: 'Nợ phải trả tại TCTD khác', type: 'number' },
      { key: 'other_bank_liability_desc', label: 'Mô tả nợ phải trả tại TCTD khác', type: 'textarea' },
      { key: 'credit_card_liability', label: 'Nợ phải trả thẻ TD', type: 'number' },
      { key: 'credit_card_liability_desc', label: 'Mô tả nợ phải trả thẻ TD', type: 'textarea' },
      { key: 'other_liability', label: 'Nợ phải trả khác', type: 'number' },
      { key: 'other_liability_desc', label: 'Mô tả nợ phải trả khác', type: 'textarea' },
      { key: 'total_liability', label: 'Tổng nợ phải trả', type: 'number', readOnly: true }
    ]
  },
  monthly_expenses: {
    title: '4. Chi phí sinh hoạt hàng tháng',
    icon: ChartBarIcon,
    fields: [
      { key: 'food_expense', label: 'Chi phí ăn uống', type: 'number' },
      { key: 'medical_expense', label: 'Chi phí y tế', type: 'number' },
      { key: 'other_expense', label: 'Chi phí khác', type: 'number' },
      { key: 'total_expenses', label: 'Tổng chi phí', type: 'number', readOnly: true }
    ]
  },
  residual_income: {
    title: '5. Thu nhập còn lại',
    icon: ChartBarIcon,
    fields: [
      { key: 'total_residual_income', label: 'Thu nhập còn lại', type: 'number', readOnly: true }
    ]
  }
}

const TEMPLATES_THE_TIN_DUNG: MetadataTemplates = {
  spouse_info: SPOUSE_TEMPLATE,
  loan_info: {
    title: '1. Thông tin khoản vay (Thẻ tín dụng)',
    icon: BanknotesIcon,
    fields: [
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Hạn mức thẻ', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn thẻ (tháng)', type: 'number' }
    ]
  },
  repayment_sources: TEMPLATES_TIEU_DUNG.repayment_sources,
  liabilities: TEMPLATES_TIEU_DUNG.liabilities
}

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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
      <div className="flex items-center mb-4">
        <div className="bg-blue-50 rounded-full p-2 mr-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <h4 className="text-xl font-semibold text-blue-700 tracking-tight">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.key} className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={metadata[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn {field.label}</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={metadata[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${field.readOnly ? 'bg-blue-50 text-blue-700 font-bold border-blue-300' : ''}`}
                style={field.readOnly ? { fontSize: '1.1rem' } : {}}
              />
            )}
            {/* Highlight for total fields */}
            {field.readOnly && (
              <span className="text-xs text-blue-500 font-semibold">Tự động tính</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Form ---
export default function CreditAssessmentFormFull({
  isOpen, onClose, onSubmit, assessment, isLoading, customers, staff, products
}: CreditAssessmentFormProps) {
  // --- State ---
  const [formState, setFormState] = useState(() => {
    const details = assessment?.assessment_details || {}
    let loan_type = details.loan_info?.['loan_type.category'] || details.loan_info?.loan_type?.category || ''
    return {
      customer_id: assessment?.customer_id?.toString() || '',
      staff_id: assessment?.staff_id?.toString() || '',
      product_id: assessment?.product_id?.toString() || '',
      department: assessment?.department || '',
      department_head: assessment?.department_head || '',
      fee_amount: assessment?.fee_amount?.toString() || '',
      status: assessment?.status || 'draft',
      loan_type,
      assessment_details: {
        ...details,
        spouse_info: details.spouse_info || {},
        loan_info: details.loan_info || {},
        business_plan: details.business_plan || {},
        financial_reports: details.financial_reports || {},
        assessment_details: details.assessment_details || {},
        repayment_sources: details.repayment_sources || {},
        liabilities: details.liabilities || {}
      }
    }
  })

  // --- Template selection ---
  let selectedTemplates: MetadataTemplates = TEMPLATES_KINH_DOANH
  if (formState.loan_type === 'Tiêu dùng') selectedTemplates = TEMPLATES_TIEU_DUNG
  else if (formState.loan_type === 'Thẻ tín dụng' || formState.loan_type === 'Thẻ Tín Dụng') selectedTemplates = TEMPLATES_THE_TIN_DUNG

  // --- Update state on assessment change ---
  useEffect(() => {
    if (assessment) {
      const details = assessment.assessment_details || {}
      let loan_type = details.loan_info?.['loan_type.category'] || details.loan_info?.loan_type?.category || ''
      setFormState({
        customer_id: assessment.customer_id?.toString() || '',
        staff_id: assessment.staff_id?.toString() || '',
        product_id: assessment.product_id?.toString() || '',
        department: assessment.department || '',
        department_head: assessment.department_head || '',
        fee_amount: assessment.fee_amount?.toString() || '',
        status: assessment.status || 'draft',
        loan_type,
        assessment_details: {
          ...details,
          spouse_info: details.spouse_info || {},
          loan_info: details.loan_info || {},
          business_plan: details.business_plan || {},
          financial_reports: details.financial_reports || {},
          assessment_details: details.assessment_details || {},
          repayment_sources: details.repayment_sources || {},
          liabilities: details.liabilities || {}
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
        loan_type: '',
        assessment_details: {
          spouse_info: {},
          loan_info: {},
          business_plan: {},
          financial_reports: {},
          assessment_details: {},
          repayment_sources: {},
          liabilities: {}
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
      if (name === 'loan_type') {
        return {
          ...prev,
          loan_type: value,
          assessment_details: {
            ...prev.assessment_details,
            loan_info: {
              ...prev.assessment_details.loan_info,
              ['loan_type.category']: value
            }
          }
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSectionDataChange = (section: string, data: Record<string, any>) => {
    let newData = { ...data };
    // Tính tổng chi phí sinh hoạt
    if (section === 'monthly_expenses') {
      const food = parseFloat(newData.food_expense) || 0;
      const medical = parseFloat(newData.medical_expense) || 0;
      const other = parseFloat(newData.other_expense) || 0;
      newData.total_expenses = food + medical + other;
    }

    // Tính tổng nguồn trả nợ
    if (section === 'repayment_sources') {
      const fromCustomer = parseFloat(newData.from_customer_salary) || 0;
      const fromSpouse = parseFloat(newData.from_spouse_salary) || 0;
      const fromAsset = parseFloat(newData.from_asset_rental) || 0;
      const fromBusiness = parseFloat(newData.from_business) || 0;
      const fromOther = parseFloat(newData.from_other) || 0;
      newData.total_repayment_sources = fromCustomer + fromSpouse + fromAsset + fromBusiness + fromOther;
    }

    // Tính tổng nợ phải trả
    if (section === 'liabilities') {
      const expectedLoan = parseFloat(newData.expected_loan_liability) || 0;
      const otherBank = parseFloat(newData.other_bank_liability) || 0;
      const creditCard = parseFloat(newData.credit_card_liability) || 0;
      const otherLiability = parseFloat(newData.other_liability) || 0;
      newData.total_liability = expectedLoan + otherBank + creditCard + otherLiability;
    }

    // Cập nhật section hiện tại
    setFormState(prev => {
      // Lấy dữ liệu mới nhất từ các section liên quan
      const repayment = section === 'repayment_sources' ? newData : prev.assessment_details.repayment_sources || {};
      const liabilities = section === 'liabilities' ? newData : prev.assessment_details.liabilities || {};
      const expenses = section === 'monthly_expenses' ? newData : prev.assessment_details.monthly_expenses || {};

      const total_repayment_sources = parseFloat(repayment.total_repayment_sources) || 0;
      const total_liability = parseFloat(liabilities.total_liability) || 0;
      const total_expenses = parseFloat(expenses.total_expenses) || 0;

      const total_residual_income = total_repayment_sources - total_liability - total_expenses;

      return {
        ...prev,
        assessment_details: {
          ...prev.assessment_details,
          [section]: newData,
          residual_income: {
            total_residual_income
          }
        }
      }
    })
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
  <div className="inline-block w-full max-w-5xl my-8 p-0 text-left align-middle transition-all transform">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
              {assessment ? 'Chỉnh sửa thẩm định' : 'Thẩm định mới'}
            </Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
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
            {/* Loan Type Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Loại khoản vay</label>
              <select
                name="loan_type"
                value={formState.loan_type}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Chọn loại khoản vay</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Tiêu dùng">Tiêu dùng</option>
                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
              </select>
            </div>
            {/* Spouse select and metadata section */}
            <div className="mb-6">
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
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn khách hàng làm vợ/chồng</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            {/* Render all metadata sections dynamically */}
            {Object.entries(selectedTemplates).map(([sectionKey, section]) => {
              let initialData = formState.assessment_details[sectionKey] || {};
              // Format date fields for spouse_info
              if (sectionKey === 'spouse_info') {
                initialData = {
                  ...initialData,
                  date_of_birth: initialData.date_of_birth ? toVNDate(initialData.date_of_birth) : '',
                  id_issue_date: initialData.id_issue_date ? toVNDate(initialData.id_issue_date) : ''
                };
              }
              return (
                <MetadataSection
                  key={sectionKey}
                  title={section.title}
                  icon={section.icon}
                  initialData={initialData}
                  fields={section.fields}
                  onChange={data => handleSectionDataChange(sectionKey, data)}
                />
              );
            })}
            <div className="flex justify-end space-x-4 mt-8">
              <button type="button" onClick={onClose} className="px-5 py-2 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl shadow">Hủy</button>
              <button type="submit" disabled={isLoading} className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow disabled:opacity-50 flex items-center gap-2">
                {isLoading && <span className="animate-spin h-5 w-5 border-2 border-white border-t-blue-400 rounded-full inline-block"></span>}
                {isLoading ? 'Đang xử lý...' : assessment ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
