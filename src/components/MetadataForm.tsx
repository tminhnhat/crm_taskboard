'use client'

import { useState } from 'react'
import {
  HomeIcon,
  TruckIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'

type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>

interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea'
  options?: string[]
}

interface TemplateConfig {
  title: string
  icon: IconType
  fields: MetadataField[]
}

interface MetadataFormProps {
  initialData?: Record<string, Record<string, unknown>>
  onChange: (metadata: Record<string, Record<string, unknown>>) => void
}

type MetadataTemplates = {
  [key: string]: TemplateConfig
}

const METADATA_TEMPLATES: MetadataTemplates = {
  property: {
    title: 'Thông tin bất động sản',
    icon: HomeIcon,
    fields: [
      { key: 'property_type', label: 'Loại BĐS', type: 'select', options: ['Nhà ở', 'Đất', 'Chung cư', 'Văn phòng', 'Khác'] },
      { key: 'area', label: 'Diện tích (m²)', type: 'number' },
      { key: 'address', label: 'Địa chỉ', type: 'text' },
      { key: 'ownership_type', label: 'Hình thức sở hữu', type: 'select', options: ['Sổ đỏ', 'Sổ hồng', 'HĐMB', 'Khác'] },
      { key: 'construction_status', label: 'Trạng thái xây dựng', type: 'select', options: ['Hoàn thiện', 'Đang xây', 'Chưa xây'] }
    ]
  },
  vehicle: {
    title: 'Thông tin phương tiện',
    icon: TruckIcon,
    fields: [
      { key: 'vehicle_type', label: 'Loại phương tiện', type: 'select', options: ['Ô tô', 'Xe máy', 'Xe tải', 'Khác'] },
      { key: 'brand', label: 'Thương hiệu', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'year', label: 'Năm sản xuất', type: 'number' },
      { key: 'license_plate', label: 'Biển số', type: 'text' }
    ]
  },
  financial: {
    title: 'Thông tin tài chính',
    icon: BanknotesIcon,
    fields: [
      { key: 'account_type', label: 'Loại tài khoản', type: 'select', options: ['Tiết kiệm', 'Vãng lai', 'Khác'] },
      { key: 'bank_name', label: 'Tên ngân hàng', type: 'text' },
      { key: 'account_number', label: 'Số tài khoản', type: 'text' },
      { key: 'balance', label: 'Số dư', type: 'number' },
      { key: 'currency', label: 'Loại tiền', type: 'select', options: ['VND', 'USD', 'EUR'] }
    ]
  },
  documents: {
    title: 'Tài liệu pháp lý',
    icon: DocumentTextIcon,
    fields: [
      { key: 'document_type', label: 'Loại giấy tờ', type: 'select', options: ['CMND/CCCD', 'Hộ chiếu', 'Sổ hộ khẩu', 'Khác'] },
      { key: 'document_number', label: 'Số giấy tờ', type: 'text' },
      { key: 'issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'expiry_date', label: 'Ngày hết hạn', type: 'date' }
    ]
  },
  legal: {
    title: 'Thông tin pháp lý',
    icon: ShieldCheckIcon,
    fields: [
      { key: 'ownership_status', label: 'Tình trạng sở hữu', type: 'select', options: ['Đã thanh toán', 'Đang trả góp', 'Thuê'] },
      { key: 'legal_restrictions', label: 'Hạn chế pháp lý', type: 'text' },
      { key: 'registration_date', label: 'Ngày đăng ký', type: 'date' },
      { key: 'contract_number', label: 'Số hợp đồng', type: 'text' }
    ]
  },
  assessment: {
    title: 'Thông tin định giá',
    icon: DocumentChartBarIcon,
    fields: [
      { key: 'appraised_value', label: 'Giá trị định giá', type: 'number' },
      { key: 'appraisal_date', label: 'Ngày định giá', type: 'date' },
      { key: 'appraiser', label: 'Đơn vị định giá', type: 'text' },
      { key: 'appraisal_method', label: 'Phương pháp định giá', type: 'select', options: ['So sánh', 'Thu nhập', 'Chi phí', 'Khác'] },
      { key: 'next_appraisal_date', label: 'Ngày định giá tiếp theo', type: 'date' }
    ]
  },
  communication: {
    title: 'Ghi chú & Liên hệ',
    icon: ChatBubbleLeftRightIcon,
    fields: [
      { key: 'contact_person', label: 'Người liên hệ', type: 'text' },
      { key: 'phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'notes', label: 'Ghi chú', type: 'textarea' }
    ]
  }
}

export default function MetadataForm({ initialData = {}, onChange }: MetadataFormProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, Record<string, unknown>>>(initialData)

  const handleFieldChange = (template: string, field: string, value: unknown) => {
    const newMetadata = {
      ...metadata,
      [template]: {
        ...(metadata[template] || {}),
        [field]: value
      }
    }
    setMetadata(newMetadata)
    onChange(newMetadata)
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(METADATA_TEMPLATES).map(([key, template]) => {
          const Icon = template.icon
          const isActive = activeTemplate === key
          const hasData = !!metadata[key]

          return (
            <button
              key={key}
              onClick={() => setActiveTemplate(isActive ? null : key)}
              className={`p-4 rounded-lg border ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : hasData
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } transition-colors flex flex-col items-center space-y-2`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-blue-500' : hasData ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : hasData ? 'text-green-700' : 'text-gray-600'}`}>
                {template.title}
              </span>
              {hasData && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Đã nhập
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Form Fields */}
      {activeTemplate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {METADATA_TEMPLATES[activeTemplate].title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {METADATA_TEMPLATES[activeTemplate].fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                    onChange={(e) => handleFieldChange(activeTemplate, field.key, e.target.value)}
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
                    value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                    onChange={(e) => handleFieldChange(activeTemplate, field.key, e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={metadata[activeTemplate]?.[field.key]?.toString() || ''}
                    onChange={(e) => {
                      const value = field.type === 'number' 
                        ? parseFloat(e.target.value) 
                        : e.target.value
                      handleFieldChange(activeTemplate, field.key, value)
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
