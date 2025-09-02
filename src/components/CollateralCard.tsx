'use client'

import { Collateral } from '@/lib/supabase'
import { 
  PencilIcon, 
  TrashIcon,
  HomeIcon,
  TruckIcon,
  BanknotesIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

interface CollateralCardProps {
  collateral: Collateral
  onEdit: (collateral: Collateral) => void
  onDelete: (collateral: Collateral) => void
}

const getMetadataIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case 'property':
      return HomeIcon
    case 'vehicle':
      return TruckIcon
    case 'financial':
      return BanknotesIcon
    case 'documents':
      return DocumentTextIcon
    case 'legal':
      return ShieldCheckIcon
    case 'assessment':
      return DocumentChartBarIcon
    case 'communication':
      return ChatBubbleLeftRightIcon
    default:
      return DocumentDuplicateIcon
  }
}

const getMetadataTitle = (key: string): string => {
  const templateTitles: Record<string, string> = {
    // Templates cho bất động sản
    'property': 'Thông tin bất động sản',
    'property_residential': 'Thông tin nhà ở',
    'property_commercial': 'Thông tin BĐS thương mại',
    'property_industrial': 'Thông tin BĐS công nghiệp',
    'property_land_only': 'Thông tin đất',

    // Templates cho phương tiện
    'vehicle': 'Thông tin phương tiện',
    'vehicle_car': 'Thông tin ô tô',
    'vehicle_motorcycle': 'Thông tin xe máy',
    'vehicle_truck': 'Thông tin xe tải',
    'vehicle_special': 'Thông tin xe đặc biệt',

    // Templates cho máy móc thiết bị
    'machinery': 'Thông tin máy móc',
    'machinery_production': 'Máy móc sản xuất',
    'machinery_construction': 'Máy móc xây dựng',
    'machinery_special': 'Máy móc chuyên dụng',

    // Templates cho hàng hóa
    'inventory': 'Thông tin hàng hóa',
    'inventory_goods': 'Hàng hóa thành phẩm',
    'inventory_materials': 'Nguyên vật liệu',
    'inventory_wip': 'Hàng đang sản xuất',

    // Templates tài chính
    'financial': 'Thông tin tài chính',
    'financial_deposit': 'Tiền gửi',
    'financial_bond': 'Trái phiếu',
    'financial_stock': 'Cổ phiếu',

    // Templates pháp lý
    'legal': 'Thông tin pháp lý',
    'legal_property': 'Pháp lý BĐS',
    'legal_vehicle': 'Pháp lý phương tiện',
    'legal_business': 'Pháp lý doanh nghiệp',

    // Templates đánh giá
    'assessment': 'Đánh giá',
    'assessment_property': 'Đánh giá BĐS',
    'assessment_vehicle': 'Đánh giá phương tiện',
    'assessment_machinery': 'Đánh giá máy móc',

    // Templates khác
    'documents': 'Tài liệu',
    'communication': 'Giao tiếp',
    'business_assets': 'Tài sản doanh nghiệp',
    'intellectual_property': 'Tài sản trí tuệ',
    'receivables': 'Khoản phải thu'
  }

  // Trả về tiêu đề tiếng Việt nếu có, nếu không thì format key gốc
  return templateTitles[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1)
}

const formatFieldLabel = (key: string): string => {
  // Mapping specific field names to Vietnamese labels
  const vietnameseLabels: Record<string, string> = {
    // Thông tin bất động sản
    property_certificate: 'Giấy chứng nhận',
    property_land: 'Thông tin đất',
    property_building: 'Thông tin công trình',
    property_value: 'Giá trị BĐS',
    property_assessment: 'Đánh giá BĐS',
    property_address: 'Địa chỉ BĐS',
    property_purpose: 'Mục đích sử dụng',
    property_ownership: 'Chủ sở hữu',
    property_restrictions: 'Hạn chế/Thế chấp',

    // Thông tin phương tiện
    vehicle_type: 'Loại phương tiện',
    vehicle_brand: 'Nhãn hiệu',
    vehicle_model: 'Model',
    vehicle_year: 'Năm sản xuất',
    vehicle_color: 'Màu sắc',
    vehicle_registration: 'Đăng ký xe',
    vehicle_chassis: 'Số khung',
    vehicle_engine: 'Số máy',
    vehicle_condition: 'Tình trạng',
    vehicle_mileage: 'Số km đã đi',

    // Thông tin tài chính
    financial_value: 'Giá trị',
    financial_currency: 'Loại tiền',
    financial_institution: 'Tổ chức tài chính',
    financial_account: 'Số tài khoản',
    financial_type: 'Loại tài sản tài chính',
    financial_maturity: 'Ngày đáo hạn',
    financial_interest: 'Lãi suất',
    
    // Tài liệu
    document_type: 'Loại tài liệu',
    document_number: 'Số tài liệu',
    document_date: 'Ngày tài liệu',
    document_issuer: 'Nơi cấp',
    document_status: 'Trạng thái',
    document_location: 'Nơi lưu trữ',
    
    // Thông tin pháp lý
    legal_status: 'Tình trạng pháp lý',
    legal_restrictions: 'Hạn chế pháp lý',
    legal_disputes: 'Tranh chấp',
    legal_registration: 'Đăng ký pháp lý',
    legal_owner: 'Chủ sở hữu pháp lý',
    legal_representative: 'Người đại diện',
    
    // Đánh giá
    assessment_date: 'Ngày đánh giá',
    assessment_method: 'Phương pháp đánh giá',
    assessment_appraiser: 'Đơn vị thẩm định',
    assessment_value: 'Giá trị thẩm định',
    assessment_notes: 'Ghi chú đánh giá',
    assessment_expiry: 'Ngày hết hạn',
    
    // Giao tiếp
    communication_contact: 'Người liên hệ',
    communication_phone: 'Số điện thoại',
    communication_email: 'Email',
    communication_address: 'Địa chỉ liên hệ',
    communication_preferred: 'Phương thức ưu tiên',
    communication_notes: 'Ghi chú liên hệ'
  }

  // Return Vietnamese label if it exists, otherwise format the key as before
  return vietnameseLabels[key] || key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getCollateralTypeInVietnamese = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'real_estate':
      return 'Bất động sản'
    case 'vehicle':
      return 'Phương tiện'
    case 'machinery':
      return 'Máy móc thiết bị'
    case 'inventory':
      return 'Hàng hóa tồn kho'
    case 'receivables':
      return 'Khoản phải thu'
    case 'securities':
      return 'Chứng khoán'
    case 'business_assets':
      return 'Tài sản doanh nghiệp'
    case 'intellectual_property':
      return 'Tài sản trí tuệ'
    case 'personal_property':
      return 'Tài sản cá nhân'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

export default function CollateralCard({ collateral, onEdit, onDelete }: CollateralCardProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden h-full flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
            <DocumentChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {collateral.collateral_type ? (
                <span>💎 {getCollateralTypeInVietnamese(collateral.collateral_type)}</span>
              ) : (
                '💎 Tài sản thế chấp'
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">ID: #{collateral.collateral_id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(collateral)}
            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group"
          >
            <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(collateral)}
            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-md group"
          >
            <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="space-y-4 flex-grow">
        {/* Customer Information */}
        {collateral.customer && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">👤 Khách hàng</p>
            <p className="text-sm text-gray-900 font-bold truncate" title={collateral.customer.full_name}>
              {collateral.customer.full_name}
            </p>
            {collateral.customer.phone && (
              <p className="text-xs text-gray-600 mt-1">📞 {collateral.customer.phone}</p>
            )}
            {collateral.customer.cif_number && (
              <p className="text-xs text-gray-500 mt-1">🆔 CIF: {collateral.customer.cif_number}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Value */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💰 Giá trị</p>
            <p className="text-sm text-gray-900 font-bold truncate" title={collateral.value !== null ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(collateral.value) : 'Chưa có giá trị'}>
              {collateral.value !== null ? new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(collateral.value) : 'Chưa có giá trị'}
            </p>
          </div>

          {/* Valuation Date */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📅 Định giá</p>
            <p className="text-sm text-gray-900 font-bold truncate" title={collateral.valuation_date ? new Date(collateral.valuation_date).toLocaleDateString('vi-VN') : 'Chưa định giá'}>
              {collateral.valuation_date ? new Date(collateral.valuation_date).toLocaleDateString('vi-VN') : 'Chưa định giá'}
            </p>
          </div>
        </div>

        {/* Description */}
        {collateral.description && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">📋 Mô tả</p>
            <p className="text-sm text-gray-700 line-clamp-2">{collateral.description}</p>
          </div>
        )}

        {/* Location */}
        {collateral.location && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">📍 Địa điểm</p>
            <p className="text-sm text-gray-700 line-clamp-2">{collateral.location}</p>
          </div>
        )}

        {/* Enhanced Metadata Sections */}
        {collateral.metadata && typeof collateral.metadata === 'object' && 
          Object.entries(collateral.metadata as Record<string, Record<string, unknown>>).map(([key, data]) => {
            const IconComponent = getMetadataIcon(key);
            const isExpanded = expandedSections.includes(key);
            
            return (
              <div key={key} className="mt-4">
                <button
                  onClick={() => setExpandedSections(prev => 
                    isExpanded ? prev.filter(k => k !== key) : [...prev, key]
                  )}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200 hover:border-blue-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-700">
                      {formatFieldLabel(key)}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {Object.keys(data).length} mục
                    </span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-3 bg-white rounded-lg border border-gray-200 shadow-inner">
                    {Object.entries(data).map(([fieldKey, value], index) => (
                      <div 
                        key={fieldKey} 
                        className={`flex items-start p-4 ${
                          index !== Object.entries(data).length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="w-1/3 pr-4">
                          <span className="text-sm font-bold text-gray-600">
                            {formatFieldLabel(fieldKey)}
                          </span>
                        </div>
                        <div className="flex-1">
                          {typeof value === 'boolean' ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {value ? '✅ Có' : '❌ Không'}
                            </span>
                          ) : typeof value === 'number' ? (
                            <span className="text-sm text-gray-800 font-medium">
                              {value.toLocaleString('vi-VN')}
                            </span>
                          ) : typeof value === 'string' ? (
                            (() => {
                              // Check if it's a date field
                              const isDateField = fieldKey.toLowerCase().includes('date') || 
                                                fieldKey.toLowerCase().includes('ngay') ||
                                                fieldKey.toLowerCase().includes('birthday') ||
                                                fieldKey.toLowerCase().includes('expiry')
                              
                              // Try to parse as date if it's a date field
                              if (isDateField) {
                                const date = new Date(value)
                                if (!isNaN(date.getTime())) {
                                  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
                                  return (
                                    <span className="text-sm text-gray-800 bg-blue-50 px-2 py-1 rounded font-medium">
                                      📅 {formattedDate}
                                    </span>
                                  )
                                }
                              }
                              
                              // If it's a URL, render as link
                              if (value.startsWith('http')) {
                                return (
                                  <a 
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
                                  >
                                    🔗 {value}
                                  </a>
                                )
                              }
                              
                              // Regular string display
                              return (
                                <span className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {value}
                                </span>
                              )
                            })()
                          ) : (
                            <pre className="text-sm text-gray-800 bg-gray-50 rounded p-2 overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  )
}
