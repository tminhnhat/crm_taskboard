'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Grid,
  Autocomplete
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { Contract, Customer, Product, Staff } from '@/lib/supabase'
import JsonInputHelper from './JsonInputHelper'

interface ContractFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (contractData: Partial<Contract>) => void
  contract?: Contract | null
  isLoading?: boolean
  checkContractNumberExists: (contractNumber: string, excludeId?: number) => Promise<boolean>
  fetchCustomers: () => Promise<Customer[]>
  fetchProducts: () => Promise<Product[]>
  fetchStaff: () => Promise<Staff[]>
}

export default function ContractForm({ 
  isOpen,
  onClose,
  onSubmit,
  contract, 
  isLoading,
  checkContractNumberExists,
  fetchCustomers,
  fetchProducts,
  fetchStaff
}: ContractFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    if (year < 1900 || year > new Date().getFullYear() + 50) return false
    
    // More precise date validation - check if the date actually exists
    // Create date using local timezone to avoid timezone shift issues
    const testDate = new Date(year, month - 1, day)
    return testDate.getDate() === day && 
           testDate.getMonth() === month - 1 && 
           testDate.getFullYear() === year
  }
  const [formData, setFormData] = useState({
    customer_id: contract?.customer_id?.toString() || '',
    product_id: contract?.product_id?.toString() || '',
    contract_number: contract?.contract_number || '',
    contract_credit_limit: contract?.contract_credit_limit?.toString() || '0',
    start_date: formatDateForDisplay(contract?.start_date || null),
    end_date: formatDateForDisplay(contract?.end_date || null),
    status: contract?.status || 'draft',
    signed_by: contract?.signed_by?.toString() || '',
    metadata: contract?.metadata || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [metadataInput, setMetadataInput] = useState('')
  const [contractNumberError, setContractNumberError] = useState('')

  // Load customers, products, and staff for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersData, productsData, staffData] = await Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchStaff()
        ])
        setCustomers(customersData)
        setProducts(productsData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers, fetchProducts, fetchStaff])

  // Initialize form data and metadata input when component mounts or contract changes
  useEffect(() => {
    if (contract) {
      setFormData({
        customer_id: contract.customer_id?.toString() || '',
        product_id: contract.product_id?.toString() || '',
        contract_number: contract.contract_number || '',
        contract_credit_limit: contract.contract_credit_limit?.toString() || '0',
        start_date: formatDateForDisplay(contract.start_date || null),
        end_date: formatDateForDisplay(contract.end_date || null),
        status: contract.status || 'draft',
        signed_by: contract.signed_by?.toString() || '',
        metadata: contract.metadata || {}
      })
      
      if (contract.metadata) {
        setMetadataInput(JSON.stringify(contract.metadata, null, 2))
      }
    }
  }, [contract])

  // Validate contract number
  const validateContractNumber = async (contractNumber: string) => {
    if (!contractNumber.trim()) {
      setContractNumberError('Số hợp đồng là bắt buộc')
      return false
    }

    const exists = await checkContractNumberExists(contractNumber, contract?.contract_id)
    if (exists) {
      setContractNumberError('Số hợp đồng đã tồn tại')
      return false
    }

    setContractNumberError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate contract number
    const isValidContractNumber = await validateContractNumber(formData.contract_number)
    if (!isValidContractNumber) {
      return
    }

    // Validate date formats
    if (formData.start_date && !validateDateFormat(formData.start_date)) {
      alert('Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    if (formData.end_date && !validateDateFormat(formData.end_date)) {
      alert('Định dạng ngày kết thúc không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch {
        alert('Định dạng JSON không hợp lệ trong trường metadata')
        return
      }
    }

    // Convert string values to appropriate types
    const cleanedData = {
      customer_id: parseInt(formData.customer_id),
      product_id: parseInt(formData.product_id),
      contract_number: formData.contract_number.trim(),
      contract_credit_limit: parseFloat(formData.contract_credit_limit) || 0,
      start_date: formatDateForSubmission(formData.start_date),
      end_date: formatDateForSubmission(formData.end_date),
      status: formData.status,
      signed_by: parseInt(formData.signed_by),
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSubmit(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear contract number error when user types
    if (name === 'contract_number') {
      setContractNumberError('')
    }
  }

  const handleDateChange = (field: 'start_date' | 'end_date', e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove all non-digits
    
    // Format as user types: dd/mm/yyyy
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9)
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContractNumberBlur = async () => {
    if (formData.contract_number.trim()) {
      await validateContractNumber(formData.contract_number)
    }
  }

  if (loadingOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu form...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '100vh' : '90vh',
          m: isMobile ? 0 : 1,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div">
          {contract ? 'Sửa Hợp Đồng' : 'Tạo Hợp Đồng Mới'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {contract ? 'Chỉnh Sửa Hợp Đồng' : 'Thêm Hợp Đồng Mới'}
              </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Khách Hàng *
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Sản Phẩm *
                </label>
                <select
                  id="product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name}
                      {product.product_type && ` (${product.product_type})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contract_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Số Hợp Đồng *
                </label>
                <input
                  type="text"
                  id="contract_number"
                  name="contract_number"
                  value={formData.contract_number}
                  onChange={handleChange}
                  onBlur={handleContractNumberBlur}
                  required
                  className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${contractNumberError ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Nhập số hợp đồng duy nhất"
                />
                {contractNumberError && (
                  <p className="text-sm text-red-600 mt-1">{contractNumberError}</p>
                )}
              </div>

              <div>
                <label htmlFor="contract_credit_limit" className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn Mức Tín Dụng (VND)
                </label>
                <input
                  type="number"
                  id="contract_credit_limit"
                  name="contract_credit_limit"
                  value={formData.contract_credit_limit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập hạn mức tín dụng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Bắt Đầu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => handleDateChange('start_date', e)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    title="Vui lòng nhập ngày theo định dạng dd/mm/yyyy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                      setFormData(prev => ({ ...prev, start_date: formattedDate }));
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm whitespace-nowrap"
                  >
                    Hôm nay
                  </button>
                </div>
                {formData.start_date && !validateDateFormat(formData.start_date) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Kết Thúc
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => handleDateChange('end_date', e)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    title="Vui lòng nhập ngày theo định dạng dd/mm/yyyy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextYear = new Date();
                      nextYear.setFullYear(nextYear.getFullYear() + 1);
                      const formattedDate = `${nextYear.getDate().toString().padStart(2, '0')}/${(nextYear.getMonth() + 1).toString().padStart(2, '0')}/${nextYear.getFullYear()}`;
                      setFormData(prev => ({ ...prev, end_date: formattedDate }));
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm whitespace-nowrap"
                  >
                    Năm sau
                  </button>
                </div>
                {formData.end_date && !validateDateFormat(formData.end_date) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="signed_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Người Ký *
                </label>
                <select
                  id="signed_by"
                  name="signed_by"
                  value={formData.signed_by}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn nhân viên</option>
                  {staff.map((staffMember) => (
                    <option key={staffMember.staff_id} value={staffMember.staff_id}>
                      {staffMember.full_name}
                      {staffMember.position && ` (${staffMember.position})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng Thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Bản Nháp</option>
                  <option value="active">Đang Hoạt Động</option>
                  <option value="expired">Hết Hạn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siêu Dữ Liệu Hợp Đồng
              </label>
              <div className="space-y-4">
                <JsonInputHelper value={metadataInput} onChange={setMetadataInput} />
                <details className="text-sm">
                  <summary className="text-blue-600 hover:text-blue-800 cursor-pointer">Xem/Chỉnh sửa JSON trực tiếp</summary>
                  <div className="mt-2">
                    <textarea
                      id="metadata"
                      value={metadataInput}
                      onChange={(e) => setMetadataInput(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                      placeholder='{"terms": "Net 30", "renewal": "Auto", "commission": 5}'
                    />
                  </div>
                </details>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tùy chọn: Nhập JSON hợp lệ cho siêu dữ liệu hợp đồng bổ sung
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.customer_id || !formData.product_id || !formData.contract_number.trim() || !formData.signed_by || !!contractNumberError}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang Lưu...' : (contract ? 'Cập Nhật Hợp Đồng' : 'Tạo Hợp Đồng')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Hủy
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
