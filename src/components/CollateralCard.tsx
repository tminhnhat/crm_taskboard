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
  CalendarIcon
} from '@heroicons/react/24/outline'

interface CollateralCardProps {
  collateral: Collateral
  onEdit: (collateral: Collateral) => void
  onDelete: (collateralId: number) => void
}

export default function CollateralCard({ collateral, onEdit, onDelete }: CollateralCardProps) {
  const getTypeIcon = (type: string | null) => {
    if (!type) return DocumentTextIcon
    const lowerType = type.toLowerCase()
    if (lowerType.includes('real estate') || lowerType.includes('bđs') || lowerType.includes('house')) {
      return HomeIcon
    }
    if (lowerType.includes('car') || lowerType.includes('xe') || lowerType.includes('vehicle')) {
      return TruckIcon
    }
    if (lowerType.includes('savings') || lowerType.includes('tiết kiệm') || lowerType.includes('bank')) {
      return BanknotesIcon
    }
    return DocumentTextIcon
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'text-gray-500'
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('active') || lowerStatus.includes('available') || lowerStatus.includes('free')) {
      return 'text-green-600'
    }
    if (lowerStatus.includes('frozen') || lowerStatus.includes('blocked') || lowerStatus.includes('phong tỏa')) {
      return 'text-red-600'
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return 'text-yellow-600'
    }
    return 'text-gray-600'
  }

  const getStatusBgColor = (status: string | null) => {
    if (!status) return 'bg-gray-100'
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('active') || lowerStatus.includes('available') || lowerStatus.includes('free')) {
      return 'bg-green-100'
    }
    if (lowerStatus.includes('frozen') || lowerStatus.includes('blocked') || lowerStatus.includes('phong tỏa')) {
      return 'bg-red-100'
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return 'bg-yellow-100'
    }
    return 'bg-gray-100'
  }

  const formatValue = (value: number | null) => {
    if (!value) return 'Không có'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const TypeIcon = getTypeIcon(collateral.collateral_type)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TypeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {collateral.collateral_type || 'Loại không xác định'}
            </h3>
            <p className="text-sm text-gray-500">
              ID: #{collateral.collateral_id}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(collateral)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Chỉnh sửa tài sản"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(collateral.collateral_id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Xóa tài sản"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <span className="text-sm text-gray-500">Khách hàng:</span>
        <p className="font-medium text-gray-900">
          {collateral.customer?.full_name || `Khách hàng #${collateral.customer_id}`}
        </p>
      </div>

      {/* Collateral Details */}
      <div className="space-y-3">
        {/* Value */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Giá trị:</span>
          <span className="text-lg font-bold text-green-600">
            {formatValue(collateral.value)}
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span
            className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusBgColor(
              collateral.status
            )} ${getStatusColor(collateral.status)}`}
          >
            {collateral.status === 'active' ? 'Hoạt động' :
             collateral.status === 'frozen' ? 'Phong tỏa' :
             collateral.status === 'available' ? 'Có sẵn' :
             collateral.status === 'blocked' ? 'Bị chặn' :
             collateral.status === 'pending' ? 'Đang chờ' :
             collateral.status || 'Không xác định'}
          </span>
        </div>

        {/* Valuation Date */}
        {collateral.valuation_date && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Ngày định giá:</span>
            <div className="flex items-center text-gray-700">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(collateral.valuation_date)}
            </div>
          </div>
        )}

        {/* Legal Status */}
        {collateral.legal_status && (
          <div>
            <span className="text-sm text-gray-500">Tình trạng pháp lý:</span>
            <p className="text-gray-700 mt-1">{collateral.legal_status}</p>
          </div>
        )}

        {/* Location */}
        {collateral.location && (
          <div>
            <span className="text-sm text-gray-500">Địa điểm:</span>
            <div className="flex items-start text-gray-700 mt-1">
              <MapPinIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{collateral.location}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {collateral.description && (
          <div>
            <span className="text-sm text-gray-500">Mô tả:</span>
            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
              {collateral.description}
            </p>
          </div>
        )}

        {/* Owner Info */}
        {collateral.owner_info && (
          <div>
            <span className="text-sm text-gray-500">Thông tin chủ sở hữu:</span>
            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
              {collateral.owner_info}
            </p>
          </div>
        )}

        {/* Metadata */}
        {collateral.metadata && Object.keys(collateral.metadata).length > 0 && (
          <div>
            <span className="text-sm text-gray-500">Thông tin bổ sung:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(collateral.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Tạo ngày {formatDate(collateral.created_at)}
        </p>
      </div>
    </div>
  )
}
