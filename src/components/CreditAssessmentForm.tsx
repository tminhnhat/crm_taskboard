'use client'

import { useState, useEffect } from 'react'
import { CreditAssessment, Customer, Staff, Product } from '@/lib/supabase'
import MetadataForm from './MetadataForm'
import JsonInputHelper from './JsonInputHelper'

interface Product {
  product_id: number;
  name: string;
  type: string;
  description: string;
  features: Record<string, unknown>;
  status: string;
}

interface CreditAssessmentFormProps {
  assessment?: CreditAssessment | null
  onSave: (assessmentData: Partial<CreditAssessment>) => void
  onCancel: () => void
  isLoading?: boolean
  fetchCustomers: () => Promise<Customer[]>
  fetchStaff: () => Promise<Staff[]>
  fetchProducts: () => Promise<Product[]>
}

export default function CreditAssessmentForm({ 
  assessment, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers,
  fetchStaff,
  fetchProducts
}: CreditAssessmentFormProps) {
  // Helper functions for date format conversion
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
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

  // Get today's date in dd/mm/yyyy format as default
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear().toString()
    return `${day}/${month}/${year}`
  }

  const [formData, setFormData] = useState({
    customer_id: assessment?.customer_id?.toString() || '',
    staff_id: assessment?.staff_id?.toString() || '',
    assessment_date: formatDateForDisplay(assessment?.assessment_date) || getTodayFormatted(),
    assessment_result: assessment?.assessment_result || 'pending',
    comments: assessment?.comments || '',
    documents: assessment?.documents || '',
    product_id: assessment?.metadata?.product_id?.toString() || '',
    metadata: (assessment?.metadata as Record<string, Record<string, unknown>>) || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load customers and staff for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersData, staffData] = await Promise.all([
          fetchCustomers(),
          fetchStaff()
        ])
        setCustomers(customersData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers, fetchStaff])

  // Load products and update selected product when product_id changes
  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      
      if (formData.product_id) {
        const product = fetchedProducts.find(p => p.product_id.toString() === formData.product_id);
        setSelectedProduct(product || null);
      }
    };
    
    loadProducts();
  }, [fetchProducts, formData.product_id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date format if provided
    if (formData.assessment_date && !validateDateFormat(formData.assessment_date)) {
      alert('Ngày đánh giá không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    const parsedMetadata = {
      ...formData.metadata,
      product_id: formData.product_id,
      product_type: selectedProduct?.type
    }

    const assessmentData: Partial<CreditAssessment> = {
      customer_id: parseInt(formData.customer_id),
      staff_id: parseInt(formData.staff_id),
      assessment_date: formatDateForSubmission(formData.assessment_date) || undefined,
      assessment_result: formData.assessment_result || null,
      comments: formData.comments || null,
      documents: formData.documents || null,
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSave(assessmentData)
  }

  const handleInputChange = (field: string, value: string | Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng *
          </label>
          <select
            value={formData.customer_id}
            onChange={(e) => handleInputChange('customer_id', e.target.value)}
            required
            disabled={loadingOptions}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn khách hàng...</option>
            {customers.map(customer => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.full_name} - {customer.account_number}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sản phẩm *
          </label>
          <select
            value={formData.product_id}
            onChange={(e) => {
              const productId = e.target.value;
              handleInputChange('product_id', productId);
              const product = products.find(p => p.product_id.toString() === productId);
              setSelectedProduct(product || null);
            }}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn sản phẩm...</option>
            {products.map(product => (
              <option key={product.product_id} value={product.product_id}>
                {product.name} - {product.type}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người đánh giá *
          </label>
          <select
            value={formData.staff_id}
            onChange={(e) => handleInputChange('staff_id', e.target.value)}
            required
            disabled={loadingOptions}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn nhân viên...</option>
            {staff.map(staffMember => (
              <option key={staffMember.staff_id} value={staffMember.staff_id}>
                {staffMember.full_name} - {staffMember.position || staffMember.department}
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày đánh giá *
          </label>
          <input
            type="text"
            value={formData.assessment_date}
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
              handleInputChange('assessment_date', value)
            }}
            placeholder="dd/mm/yyyy"
            maxLength={10}
            required
            className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              formData.assessment_date && !validateDateFormat(formData.assessment_date) 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          />
          {formData.assessment_date && !validateDateFormat(formData.assessment_date) && (
            <div className="text-sm text-red-600 mt-1">
              Định dạng ngày không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
            </div>
          )}
          {formData.assessment_date && validateDateFormat(formData.assessment_date) && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Định dạng ngày hợp lệ
            </div>
          )}
        </div>

        {/* Assessment Result */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kết quả đánh giá
          </label>
          <select
            value={formData.assessment_result}
            onChange={(e) => handleInputChange('assessment_result', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="pending">Đang chờ</option>
            <option value="approved">Đã phê duyệt</option>
          </select>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nhận xét
        </label>
        <textarea
          value={formData.comments}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          placeholder="Ghi chú đánh giá, quan sát, khuyến nghị..."
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tài liệu
        </label>
        <input
          type="text"
          value={formData.documents}
          onChange={(e) => handleInputChange('documents', e.target.value)}
          placeholder="Tên file hoặc liên kết đến tài liệu hỗ trợ"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">
          Nhập tên file hoặc URL, cách nhau bằng dấu phẩy
        </div>
      </div>

      {/* Metadata Form */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin chi tiết
        </h3>
        <MetadataForm
          initialData={formData.metadata}
          onChange={(metadata) => handleInputChange('metadata', metadata)}
          suggestedTemplates={(() => {
            // Base templates that are always included
            const baseTemplates = ['customer_profile', 'financial_statement'];
            
            // Product-specific templates
            switch (selectedProduct?.type) {
              case 'business_loan':
                return [
                  ...baseTemplates,
                  'business_analysis',
                  'cash_flow',
                  'collateral',
                  'industry_analysis'
                ];
              case 'consumer_loan':
                return [
                  ...baseTemplates,
                  'employment',
                  'income_verification',
                  'credit_history'
                ];
              case 'mortgage':
                return [
                  ...baseTemplates,
                  'property_valuation',
                  'income_verification',
                  'collateral',
                  'insurance'
                ];
              case 'credit_card':
                return [
                  ...baseTemplates,
                  'credit_history',
                  'income_verification',
                  'spending_patterns'
                ];
              case 'overdraft':
                return [
                  ...baseTemplates,
                  'account_history',
                  'cash_flow',
                  'credit_limit'
                ];
              case 'investment_loan':
                return [
                  ...baseTemplates,
                  'investment_analysis',
                  'risk_assessment',
                  'market_analysis',
                  'collateral'
                ];
              default:
                return baseTemplates;
            }
          })()}
        />
      </div>

      {/* Custom JSON Input */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin tùy chỉnh
        </h3>
        <div className="space-y-2">
          <JsonInputHelper
            value={JSON.stringify(formData.metadata.custom || {}, null, 2)}
            onChange={(jsonString) => {
              try {
                const customData = JSON.parse(jsonString);
                handleInputChange('metadata', {
                  ...formData.metadata,
                  custom: customData
                });
              } catch (error) {
                // If JSON is invalid, don't update the state
                console.error('Invalid JSON:', error);
              }
            }}
          />
          <p className="text-sm text-gray-500">
            Thêm các trường thông tin tùy chỉnh theo nhu cầu
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Đang lưu...' : assessment ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  )
}
