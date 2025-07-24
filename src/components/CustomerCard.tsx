'use client'

import { useState } from 'react'
import { Customer } from '@/lib/supabase'
import { 
  UserIcon, 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

// Interface for numerology data structure
interface NumerologyData {
  walksOfLife?: number | string
  mission?: number | string
  soul?: number | string
  connect?: number | string
  personality?: number | string
  passion?: number | string
  missingNumbers?: number[] | string[] | string
  [key: string]: unknown
}

interface CustomerCardProps {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customerId: number) => void
  onStatusChange: (customerId: number, status: string) => void
  onRecalculateNumerology?: (customerId: number) => void
}

const customerTypeColors = {
  individual: 'bg-blue-100 text-blue-800',
  corporate: 'bg-purple-100 text-purple-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

const customerTypeIcons = {
  individual: UserIcon,
  corporate: BuildingOfficeIcon
}

export default function CustomerCard({ customer, onEdit, onDelete, onStatusChange, onRecalculateNumerology }: CustomerCardProps) {
  const TypeIcon = customerTypeIcons[customer.customer_type]
  const [showNumerology, setShowNumerology] = useState(false)

  // Helper function to format dates safely, avoiding timezone issues
  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return ''
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return ''
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <TypeIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{customer.full_name}</h3>
              <p className="text-sm text-gray-600">Tài khoản: {customer.account_number}</p>
              {customer.cif_number && (
                <p className="text-sm text-gray-600">CIF: {customer.cif_number}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerTypeColors[customer.customer_type]}`}>
              {customer.customer_type === 'individual' ? 'Cá Nhân' : 'Doanh Nghiệp'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {customer.status === 'active' ? 'Đang Hoạt Động' : 
               customer.status === 'inactive' ? 'Không Hoạt Động' : 
               customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            {customer.phone && (
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
            )}
            {customer.address && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {customer.address}
              </div>
            )}
            {customer.hobby && (
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Sở thích: {customer.hobby}
              </div>
            )}
            {customer.id_number && (
              <div className="flex items-center">
                <IdentificationIcon className="h-4 w-4 mr-2" />
                <div>
                  <span>CMND/CCCD: {customer.id_number}</span>
                  {customer.id_issue_date && (
                    <span className="text-gray-500 ml-2">
                      (Cấp ngày: {formatDateDisplay(customer.id_issue_date)})
                    </span>
                  )}
                  {customer.id_issue_authority && (
                    <div className="text-gray-500 text-xs ml-4">
                      Nơi cấp: {customer.id_issue_authority}
                    </div>
                  )}
                </div>
              </div>
            )}
            {customer.date_of_birth && (
              <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Ngày sinh: {formatDateDisplay(customer.date_of_birth)}
              </div>
            )}
          </div>

          {customer.numerology_data && (
            <div className="mt-3">
              <button
                onClick={() => setShowNumerology(!showNumerology)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 -ml-1"
              >
                {showNumerology ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                Dữ Liệu Thần Số Học
                <span className="text-xs text-gray-500 ml-1">
                  ({showNumerology ? 'Ẩn' : 'Hiện'})
                </span>
              </button>
              
              {showNumerology && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {(() => {
                      const numerology = customer.numerology_data as NumerologyData;
                      
                      return (
                        <>
                          {/* Path of Life */}
                          {numerology?.walksOfLife && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Đường đời:</span>
                              <span className="font-bold text-blue-600">{numerology.walksOfLife}</span>
                            </div>
                          )}
                          
                          {/* Mission */}
                          {numerology?.mission && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Sứ mệnh:</span>
                              <span className="font-bold text-green-600">{numerology.mission}</span>
                            </div>
                          )}
                          
                          {/* Soul */}
                          {numerology?.soul && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Linh hồn:</span>
                              <span className="font-bold text-purple-600">{numerology.soul}</span>
                            </div>
                          )}
                          
                          {/* Connection */}
                          {numerology?.connect && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Kết nối:</span>
                              <span className="font-bold text-orange-600">{numerology.connect}</span>
                            </div>
                          )}
                          
                          {/* Personality */}
                          {numerology?.personality && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Nhân cách:</span>
                              <span className="font-bold text-indigo-600">{numerology.personality}</span>
                            </div>
                          )}
                          
                          {/* Passion */}
                          {numerology?.passion && (
                            <div className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Đam mê:</span>
                              <span className="font-bold text-red-600">{numerology.passion}</span>
                            </div>
                          )}
                          
                          {/* Missing Numbers */}
                          {numerology?.missingNumbers && (
                            <div className="col-span-1 md:col-span-2 p-2 bg-white rounded border">
                              <span className="font-medium text-gray-700">Số thiếu:</span>
                              <div className="mt-1">
                                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-mono">
                                  {Array.isArray(numerology.missingNumbers) 
                                    ? numerology.missingNumbers.join(', ')
                                    : String(numerology.missingNumbers)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Additional info if no specific fields are available */}
                          {!numerology?.walksOfLife && 
                           !numerology?.mission && 
                           !numerology?.soul && 
                           !numerology?.connect && 
                           !numerology?.personality && 
                           !numerology?.passion && 
                           !numerology?.missingNumbers && (
                            <div className="col-span-1 md:col-span-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-yellow-800 text-xs">
                                Dữ liệu thần số học có thể cần được tính toán lại. Nhấn nút 🔢 để cập nhật.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={customer.status}
            onChange={(e) => onStatusChange(customer.customer_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(customer)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            {onRecalculateNumerology && customer.full_name && customer.date_of_birth && (
              <button
                onClick={() => onRecalculateNumerology(customer.customer_id)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium ml-2"
                title="Tính lại thần số học"
              >
                🔢
              </button>
            )}
            <button
              onClick={() => onDelete(customer.customer_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
