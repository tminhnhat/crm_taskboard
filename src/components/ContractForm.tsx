'use client'

import { useState, useEffect } from 'react'
import { Contract, Customer, Product, Staff } from '@/lib/supabase'

interface ContractFormProps {
  contract?: Contract | null
  onSave: (contractData: Partial<Contract>) => void
  onCancel: () => void
  isLoading?: boolean
  checkContractNumberExists: (contractNumber: string, excludeId?: number) => Promise<boolean>
  fetchCustomers: () => Promise<Customer[]>
  fetchProducts: () => Promise<Product[]>
  fetchStaff: () => Promise<Staff[]>
}

export default function ContractForm({ 
  contract, 
  onSave, 
  onCancel, 
  isLoading,
  checkContractNumberExists,
  fetchCustomers,
  fetchProducts,
  fetchStaff
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    customer_id: contract?.customer_id?.toString() || '',
    product_id: contract?.product_id?.toString() || '',
    contract_number: contract?.contract_number || '',
    contract_credit_limit: contract?.contract_credit_limit?.toString() || '0',
    start_date: contract?.start_date || '',
    end_date: contract?.end_date || '',
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

  // Initialize metadata input when component mounts or contract changes
  useEffect(() => {
    if (contract?.metadata) {
      setMetadataInput(JSON.stringify(contract.metadata, null, 2))
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

    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch (error) {
        
        return
          alert('Định dạng JSON không hợp lệ trong trường metadata')
      }
    }

    // Convert string values to appropriate types
    const cleanedData = {
      customer_id: parseInt(formData.customer_id),
      product_id: parseInt(formData.product_id),
      contract_number: formData.contract_number.trim(),
      contract_credit_limit: parseFloat(formData.contract_credit_limit) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
      signed_by: parseInt(formData.signed_by),
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSave(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear contract number error when user types
    if (name === 'contract_number') {
      setContractNumberError('')
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {contract ? 'Chỉnh Sửa Hợp Đồng' : 'Thêm Hợp Đồng Mới'}
          </h2>
          
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
                  Hạn Mức Tín Dụng (USD)
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
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Kết Thúc
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  <option value="terminated">Đã Chấm Dứt</option>
                  <option value="suspended">Tạm Ngưng</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
                Siêu Dữ Liệu Hợp Đồng (Định dạng JSON)
              </label>
              <textarea
                id="metadata"
                value={metadataInput}
                onChange={(e) => setMetadataInput(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder='{"terms": "Net 30", "renewal": "Auto", "commission": 5}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Tùy chọn: Nhập JSON hợp lệ cho siêu dữ liệu hợp đồng bổ sung
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.customer_id || !formData.product_id || !formData.contract_number.trim() || !formData.signed_by || contractNumberError}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang Lưu...' : (contract ? 'Cập Nhật Hợp Đồng' : 'Tạo Hợp Đồng')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
