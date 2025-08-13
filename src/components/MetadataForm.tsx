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
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { formatMoneyToWords } from '@/lib/currency'
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'

type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>

interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: IconType
  fields: MetadataField[]
}

interface MetadataFormProps {
  initialData?: Record<string, Record<string, unknown>>
  onChange: (metadata: Record<string, Record<string, unknown>>) => void
  suggestedTemplates?: string[]
}

type MetadataTemplates = {
  [key: string]: TemplateConfig
}

const METADATA_TEMPLATES: MetadataTemplates = {
  property_certificate: {
    title: '1. Thông tin giấy chứng nhận',
    icon: DocumentTextIcon,
    fields: [
      { 
        key: 'loai_gcn', 
        label: 'Loại giấy chứng nhận', 
        type: 'select', 
        options: [
          'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất',
          'Giấy chứng nhận quyền sử dụng đất',
          'Giấy chứng nhận quyền sở hữu nhà ở và quyền sử dụng đất ở',
          'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất'
        ]
      },
      { key: 'so_gcn', label: 'Số giấy chứng nhận', type: 'text' },
      { key: 'so_vao_so_gcn', label: 'Số vào sổ GCN', type: 'text' },
      { key: 'ngay_cap_gcn', label: 'Ngày cấp GCN', type: 'date' },
      { key: 'noi_cap_gcn', label: 'Nơi cấp GCN', type: 'text' }
    ]
  },
  
  property_land: {
    title: '2. Thông tin thửa đất',
    icon: MapPinIcon,
    fields: [
      // Thông tin cơ bản thửa đất
      { key: 'so_thua', label: 'Số thửa', type: 'text' },
      { key: 'to_ban_do', label: 'Tờ bản đồ số', type: 'text' },
      { key: 'dia_chi_dat', label: 'Địa chỉ thửa đất', type: 'text' },
      { key: 'vitri_thua_dat', label: 'Vị trí thửa đất', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { key: 'muc_dich_su_dung_dat', label: 'Mục đích sử dụng đất', type: 'text' },
      { key: 'thoi_gian_su_dung', label: 'Thời hạn sử dụng', type: 'text' },
      { key: 'nguon_goc_dat', label: 'Nguồn gốc sử dụng', type: 'text' },
      { key: 'hinh_thuc_su_dung', label: 'Hình thức sử dụng', type: 'text' },
      
      // Thông tin diện tích
      { key: 'dien_tich', label: 'Tổng diện tích (m²)', type: 'number' },
      { key: 'dien_tich_bang_chu', label: 'Diện tích bằng chữ', type: 'text' },
      { key: 'dien_tich_dat_o', label: 'Diện tích đất ở (m²)', type: 'number' },
      { key: 'dien_tich_dat_trong_cay', label: 'Diện tích đất trồng cây (m²)', type: 'number' },
      { key: 'dien_tich_dat_khac', label: 'Diện tích đất khác (m²)', type: 'number' }
    ]
  },

  property_building: {
    title: '3. Thông tin nhà ở/tài sản gắn liền với đất',
    icon: HomeIcon,
    fields: [
      { key: 'loai_ts_tren_dat', label: 'Loại tài sản', type: 'text' },
      { key: 'dia_chi_nha', label: 'Địa chỉ', type: 'text' },
      { key: 'dien_tich_xay_dung', label: 'Diện tích xây dựng (m²)', type: 'number' },
      { key: 'dien_tich_san', label: 'Diện tích sàn (m²)', type: 'number' },
      { key: 'ket_cau', label: 'Kết cấu', type: 'text' },
      { key: 'cap_hang', label: 'Cấp hạng', type: 'text' },
      { key: 'so_tang', label: 'Số tầng', type: 'number' },
      { key: 'nam_hoan_thanh_xd', label: 'Năm hoàn thành', type: 'number' },
      { key: 'thoi_han_so_huu', label: 'Thời hạn sở hữu', type: 'text' },
      { key: 'hinh_thuc_so_huu_nha', label: 'Hình thức sở hữu', type: 'text' }
    ]
  },

  property_value: {
    title: '4. Thông tin giá trị tài sản',
    icon: BanknotesIcon,
    fields: [
      { key: 'tong_gia_tri_tsbd', label: 'Tổng giá trị TSBĐ (VNĐ)', type: 'number' },
      { key: 'tong_gia_tri_tsbd_bang_chu', label: 'Tổng giá trị bằng chữ', type: 'text', readOnly: true },
      { key: 'tong_gia_tri_dat', label: 'Giá trị đất (VNĐ)', type: 'number' },
      { key: 'don_gia_dat_o', label: 'Đơn giá đất ở (VNĐ/m²)', type: 'number' },
      { key: 'don_gia_dat_trong_cay', label: 'Đơn giá đất trồng cây (VNĐ/m²)', type: 'number' },
      { key: 'don_gia_dat_khac', label: 'Đơn giá đất khác (VNĐ/m²)', type: 'number' },
      { key: 'tong_gia_tri_nha', label: 'Giá trị nhà (VNĐ)', type: 'number' },
      { key: 'don_gia_nha', label: 'Đơn giá nhà (VNĐ/m²)', type: 'number' },
      { key: 'ty_le_khau_hao_nha_o', label: 'Tỷ lệ khấu hao (%)', type: 'number' }
    ]
  },

  property_assessment: {
    title: '5. Thông tin thẩm định',
    icon: ShieldCheckIcon,
    fields: [
      { key: 'so_cif_chu_ts', label: 'Số CIF chủ tài sản', type: 'text' },
      { key: 'muc_cho_vay_toi_da', label: 'Mức cho vay tối đa (VNĐ)', type: 'number' },
      { key: 'ngay_dinh_gia_tsbd', label: 'Ngày định giá', type: 'date' },
      { key: 'danhgiatsbd', label: 'Nhận xét đánh giá', type: 'textarea' },
      { key: 'so_hdtc_tsbd', label: 'Số HĐTC TSBĐ', type: 'text' },
      { key: 'van_phong_dktc', label: 'Văn phòng ĐKTC', type: 'text' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'textarea' }
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

export default function MetadataForm({ 
  initialData = {}, 
  onChange,
  suggestedTemplates 
}: MetadataFormProps) {
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

    // Automatically update tong_gia_tri_tsbd_bang_chu when tong_gia_tri_tsbd changes
    if (template === 'property_value' && field === 'tong_gia_tri_tsbd' && typeof value === 'number') {
      newMetadata[template] = {
        ...newMetadata[template],
        tong_gia_tri_tsbd_bang_chu: formatMoneyToWords(value)
      }
    }

    setMetadata(newMetadata)
    onChange(newMetadata)
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(METADATA_TEMPLATES)
          .filter(([key]) => !suggestedTemplates || suggestedTemplates.includes(key))
          .map(([key, template]) => {
          const Icon = template.icon
          const isActive = activeTemplate === key
          const hasData = !!metadata[key]

          return (
            <button
              type="button"
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
                    readOnly={field.readOnly}
                    className={`block w-full rounded-md border-gray-300 shadow-sm ${
                      field.readOnly 
                        ? 'bg-gray-50 text-gray-500'
                        : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
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
