'use client'

import { useState, useEffect } from 'react'
import { Collateral, Customer } from '@/lib/supabase'

interface CollateralFormProps {
  collateral?: Collateral | null
  onSave: (collateralData: Partial<Collateral>) => void
  onCancel: () => void
  isLoading?: boolean
  fetchCustomers: () => Promise<Customer[]>
}

export default function CollateralForm({ 
  collateral, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers
}: CollateralFormProps) {
  // Helper functions for date format conversion
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return ''
    
    // If already in dd/mm/yyyy format, return as is
    if (dateString.includes('/')) return dateString
    
    // Convert from yyyy-mm-dd to dd/mm/yyyy
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return ''
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  const formatDateForSubmission = (displayDate: string): string | null => {
    if (!displayDate) return null
    
    // If already in yyyy-mm-dd format, return as is
    if (displayDate.includes('-') && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) return displayDate
    
    // Convert from dd/mm/yyyy to yyyy-mm-dd
    const parts = displayDate.split('/')
    if (parts.length !== 3) return null
    
    const [day, month, year] = parts
    
    // Validate the parts before creating the date string
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null
    
    // Ensure proper zero-padding for single digit days and months
    const paddedDay = day.padStart(2, '0')
    const paddedMonth = month.padStart(2, '0')
    
    // Return the date in yyyy-mm-dd format (ISO date string format)
    return `${year}-${paddedMonth}-${paddedDay}`
  }

  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true // Empty is valid
    
    const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = dateString.match(ddmmyyyyPattern)
    
    if (!match) return false
    
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    
    // Basic validation
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false
    if (year < 1900 || year > new Date().getFullYear() + 10) return false
    
    // More precise date validation - check if the date actually exists
    // Create date using local timezone to avoid timezone shift issues
    const testDate = new Date(year, month - 1, day)
    return testDate.getDate() === day && 
           testDate.getMonth() === month - 1 && 
           testDate.getFullYear() === year
  }
  const [formData, setFormData] = useState({
    customer_id: collateral?.customer_id?.toString() || '',
    collateral_type: collateral?.collateral_type || '',
    description: collateral?.description || '',
    value: collateral?.value?.toString() || '',
    valuation_date: formatDateForDisplay(collateral?.valuation_date || ''),
    legal_status: collateral?.legal_status || '',
    location: collateral?.location || '',
    owner_info: collateral?.owner_info || '',
    status: collateral?.status || 'active',
    metadata: collateral?.metadata || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [metadataInput, setMetadataInput] = useState('')

  // Predefined collateral types
  const collateralTypes = [
    { value: 'Real Estate', label: 'Bất Động Sản' },
    { value: 'Vehicle/Car', label: 'Xe Cộ' },
    { value: 'Savings Account', label: 'Tài Khoản Tiết Kiệm' },
    { value: 'Equipment', label: 'Thiết Bị' },
    { value: 'Jewelry', label: 'Trang Sức' },
    { value: 'Securities', label: 'Chứng Khoán' },
    { value: 'Land', label: 'Đất Đai' },
    { value: 'Building', label: 'Công Trình' },
    { value: 'Other', label: 'Khác' }
  ]

  // Predefined status options
  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'inactive', label: 'Không Hoạt Động' }
  ]

  // Load customers for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const customersData = await fetchCustomers()
        setCustomers(customersData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers])

  // Initialize metadata input from existing data
  useEffect(() => {
    if (collateral?.metadata) {
      setMetadataInput(JSON.stringify(collateral.metadata, null, 2))
    }
  }, [collateral])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date format if provided
    if (formData.valuation_date && !validateDateFormat(formData.valuation_date)) {
      alert('Ngày thẩm định không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch {
        alert('Dữ liệu JSON không hợp lệ trong trường thông tin bổ sung')
        return
      }
    }

    const collateralData: Partial<Collateral> = {
      customer_id: parseInt(formData.customer_id),
      collateral_type: formData.collateral_type || null,
      description: formData.description || null,
      value: formData.value ? parseFloat(formData.value) : null,
      valuation_date: formatDateForSubmission(formData.valuation_date),
      legal_status: formData.legal_status || null,
      location: formData.location || null,
      owner_info: formData.owner_info || null,
      status: formData.status || null,
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSave(collateralData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(numValue)) return ''
    return new Intl.NumberFormat('vi-VN').format(numValue)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {collateral ? 'Chỉnh Sửa Tài Sản Đảm Bảo' : 'Tài Sản Đảm Bảo Mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khách Hàng *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              required
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn khách hàng...</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} - {customer.account_number}
                </option>
              ))}
            </select>
          </div>

          {/* Collateral Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại Tài Sản
            </label>
            <select
              value={formData.collateral_type}
              onChange={(e) => handleInputChange('collateral_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn loại tài sản...</option>
              {collateralTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá Trị Ước Tính (VND)
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.value && (
              <div className="text-sm text-gray-500 mt-1">
                Định dạng: {formatCurrency(formData.value)} VND
              </div>
            )}
          </div>

          {/* Valuation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày Thẩm Định
            </label>
            <input
              type="text"
              value={formData.valuation_date}
              onChange={(e) => {
                let value = e.target.value
                // Auto-format as user types (add slashes)
                value = value.replace(/\D/g, '') // Remove non-digits
                if (value.length >= 3) {
                  value = value.slice(0, 2) + '/' + value.slice(2)
                }
                if (value.length >= 6) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9)
                }
                handleInputChange('valuation_date', value)
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formData.valuation_date && !validateDateFormat(formData.valuation_date) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {formData.valuation_date && !validateDateFormat(formData.valuation_date) && (
              <div className="text-sm text-red-600 mt-1">
                Định dạng ngày không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
              </div>
            )}
            {formData.valuation_date && validateDateFormat(formData.valuation_date) && (
              <div className="text-sm text-green-600 mt-1">
                ✓ Định dạng ngày hợp lệ
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Legal Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tình Trạng Pháp Lý
            </label>
            <input
              type="text"
              value={formData.legal_status}
              onChange={(e) => handleInputChange('legal_status', e.target.value)}
              placeholder="VD: Sổ đỏ chính chủ, Đang tranh chấp, v.v."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị Trí/Địa Chỉ
            </label>
            <textarea
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Địa chỉ đầy đủ hoặc chi tiết vị trí"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Owner Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông Tin Chủ Sở Hữu
            </label>
            <textarea
              value={formData.owner_info}
              onChange={(e) => handleInputChange('owner_info', e.target.value)}
              placeholder="Chi tiết chủ sở hữu, mối quan hệ với khách hàng, v.v."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về tài sản đảm bảo"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông Tin Bổ Sung (JSON)
            </label>
            <textarea
              value={metadataInput}
              onChange={(e) => setMetadataInput(e.target.value)}
              placeholder='{"so_giay_to": "123456", "bao_hiem": "ABC789", "tinh_trang": "tot"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              Tùy chọn: Thêm các trường tùy chỉnh theo định dạng JSON (số giấy tờ, thông tin bảo hiểm, v.v.)
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang lưu...' : (collateral ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
