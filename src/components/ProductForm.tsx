'use client'

import { useState } from 'react'
import { Product } from '@/lib/supabase'
import JsonInputHelper from './JsonInputHelper'

interface ProductFormProps {
  product?: Product | null
  onSave: (productData: Partial<Product>) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductForm({ product, onSave, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    product_type: product?.product_type || '',
    description: product?.description || '',
    status: product?.status || 'active',
    interest_rate: product?.interest_rate?.toString() || '',
    minimum_amount: product?.minimum_amount?.toString() || '',
    maximum_amount: product?.maximum_amount?.toString() || '',
    currency: product?.currency || 'VND',
    terms_months: product?.terms_months?.toString() || '',
    fees: product?.fees?.toString() || '',
    requirements: product?.requirements || '',
    benefits: product?.benefits || '',
    metadata: product?.metadata || {}
  })

  const [metadataInput, setMetadataInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch {
        alert('Định dạng JSON không hợp lệ trong trường metadata')
        return
      }
    }

    onSave({
      product_name: formData.product_name,
      product_type: formData.product_type || null,
      description: formData.description || null,
      status: formData.status,
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : null,
      maximum_amount: formData.maximum_amount ? parseFloat(formData.maximum_amount) : null,
      currency: formData.currency || null,
      terms_months: formData.terms_months ? parseInt(formData.terms_months) : null,
      fees: formData.fees ? parseFloat(formData.fees) : null,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Initialize metadata input when component mounts or product changes
  useState(() => {
    if (product?.metadata) {
      setMetadataInput(JSON.stringify(product.metadata, null, 2))
    }
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {product ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên Sản Phẩm *
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Gói Tiết Kiệm Sinh Lợi, Vay Thế Chấp Nhà Đất"
              />
            </div>

            <div>
              <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại Sản Phẩm
              </label>
              <select
                id="product_type"
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn loại sản phẩm</option>
                <option value="Savings Account">Tài Khoản Tiết Kiệm</option>
                <option value="Current Account">Tài Khoản Vãng Lai</option>
                <option value="Term Deposit">Gửi Tiết Kiệm Có Kỳ Hạn</option>
                <option value="Personal Loan">Vay Cá Nhân</option>
                <option value="Home Loan">Vay Thế Chấp Nhà Đất</option>
                <option value="Auto Loan">Vay Mua Xe</option>
                <option value="Business Loan">Vay Kinh Doanh</option>
                <option value="Credit Card">Thẻ Tín Dụng</option>
                <option value="Debit Card">Thẻ Ghi Nợ</option>
                <option value="Life Insurance">Bảo Hiểm Nhân Thọ</option>
                <option value="Health Insurance">Bảo Hiểm Sức Khỏe</option>
                <option value="Property Insurance">Bảo Hiểm Tài Sản</option>
                <option value="Auto Insurance">Bảo Hiểm Ô Tô</option>
                <option value="Investment">Đầu Tư</option>
                <option value="Foreign Exchange">Ngoại Hối</option>
                <option value="Money Transfer">Chuyển Tiền</option>
                <option value="Cash Management">Quản Lý Tiền Mặt</option>
                <option value="Trade Finance">Tài Chính Thương Mại</option>
                <option value="Payment Services">Dịch Vụ Thanh Toán</option>
                <option value="Safe Deposit Box">Két An Toàn</option>
                <option value="Financial Advisory">Tư Vấn Tài Chính</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Lãi Suất (%/năm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="interest_rate"
                  name="interest_rate"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 6.5"
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn Vị Tiền Tệ
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minimum_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Số Tiền Tối Thiểu
                </label>
                <input
                  type="number"
                  id="minimum_amount"
                  name="minimum_amount"
                  value={formData.minimum_amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 100000"
                />
              </div>
              
              <div>
                <label htmlFor="maximum_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Số Tiền Tối Đa
                </label>
                <input
                  type="number"
                  id="maximum_amount"
                  name="maximum_amount"
                  value={formData.maximum_amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 5000000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="terms_months" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời Hạn (tháng)
                </label>
                <input
                  type="number"
                  id="terms_months"
                  name="terms_months"
                  value={formData.terms_months}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 12"
                />
              </div>
              
              <div>
                <label htmlFor="fees" className="block text-sm font-medium text-gray-700 mb-1">
                  Phí Dịch Vụ
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="fees"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 50000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả Sản Phẩm
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Mô tả chi tiết về sản phẩm, tính năng và ưu điểm"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Điều Kiện Áp Dụng
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="VD: Tuổi từ 18-65, thu nhập tối thiểu 10 triệu/tháng"
              />
            </div>

            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
                Quyền Lợi & Ưu Đãi
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="VD: Miễn phí chuyển khoản, tặng thẻ quà tặng, bảo hiểm miễn phí"
              />
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
                <option value="active">Đang Hoạt Động</option>
                <option value="inactive">Tạm Ngưng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông Tin Bổ Sung
              </label>
              <JsonInputHelper
                value={metadataInput}
                onChange={setMetadataInput}
              />
              <p className="text-xs text-gray-500 mt-1">
                Thêm thông tin bổ sung với giao diện thân thiện
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.product_name.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang lưu...' : (product ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm')}
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
