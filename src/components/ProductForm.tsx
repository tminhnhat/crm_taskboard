'use client'

import { useState } from 'react'
import { Product } from '@/lib/supabase'

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
      ...formData,
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div>
              <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-1">
                Loại Sản Phẩm
              </label>
              <input
                type="text"
                id="product_type"
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ví dụ: Phần mềm, Phần cứng, Dịch vụ"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập mô tả sản phẩm"
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
                <option value="inactive">Không Hoạt Động</option>
              </select>
            </div>

            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
                Metadata (định dạng JSON)
              </label>
              <textarea
                id="metadata"
                value={metadataInput}
                onChange={(e) => setMetadataInput(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder='{"key": "value", "price": 100, "category": "electronics"}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Tùy chọn: Nhập JSON hợp lệ cho metadata bổ sung của sản phẩm
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
