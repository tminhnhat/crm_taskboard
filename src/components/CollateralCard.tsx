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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {collateral.collateral_type ? (
                  <span>{getCollateralTypeInVietnamese(collateral.collateral_type)}</span>
                ) : (
                  'Tài sản thế chấp'
                )}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Loại tài sản thế chấp</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(collateral)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(collateral)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Customer Information */}
        {collateral.customer && (
          <div className="flex items-start">
            <div className="flex-grow">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Khách hàng:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {collateral.customer.full_name}
                </span>
              </div>
              {collateral.customer.phone && (
                <div className="text-sm text-gray-600">
                  SĐT: {collateral.customer.phone}
                </div>
              )}
              {collateral.customer.address && (
                <div className="text-sm text-gray-600">
                  Địa chỉ: {collateral.customer.address}
                </div>
              )}
              {collateral.customer.cif_number && (
                <div className="text-sm text-gray-500 mt-1">
                  Số CIF: {collateral.customer.cif_number}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Value */}
        <div className="flex items-center">
          <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">Giá trị:</span>
          <span className="ml-2 text-lg font-semibold text-gray-900">
            {collateral.value !== null ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(collateral.value) : 'Chưa có giá trị'}
          </span>
        </div>

        {/* Valuation Date */}
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">Ngày định giá:</span>
          <span className="ml-2 text-gray-700">
            {collateral.valuation_date ? new Date(collateral.valuation_date).toLocaleDateString('vi-VN') : 'Chưa định giá'}
          </span>
        </div>

        {/* Description */}
        {collateral.description && (
          <div>
            <span className="text-sm text-gray-500">Mô tả:</span>
            <p className="text-gray-700 mt-1">{collateral.description}</p>
          </div>
        )}

        {/* Location */}
        {collateral.location && (
          <div>
            <span className="text-sm text-gray-500">Địa điểm:</span>
            <div className="flex items-start mt-1">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{collateral.location}</p>
            </div>
          </div>
        )}

        {/* Metadata Sections */}
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
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {getMetadataTitle(key)}
                    </span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-2 bg-white rounded-lg border border-gray-100">
                    {Object.entries(data).map(([fieldKey, value], index) => (
                      <div 
                        key={fieldKey} 
                        className={`flex items-start p-3 ${
                          index !== Object.entries(data).length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="w-1/3">
                          <span className="text-sm font-medium text-gray-600">
                            {formatFieldLabel(fieldKey)}
                          </span>
                        </div>
                        <div className="flex-1 pl-4">
                          {typeof value === 'boolean' ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {value ? 'Có' : 'Không'}
                            </span>
                          ) : typeof value === 'number' ? (
                            <span className="text-sm text-gray-800">
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
                                    <span className="text-sm text-gray-800">
                                      {formattedDate}
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
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {value}
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
