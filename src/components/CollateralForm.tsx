'use client'

import React, { useState, useEffect } from 'react'
import { Collateral, Customer } from '@/lib/supabase'
import MetadataForm from './MetadataForm'

interface CollateralFormProps {
  collateral?: Collateral | null;
  onSave: (collateralData: Partial<Collateral>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  fetchCustomers: () => Promise<Customer[]>;
}

export default function CollateralFormEnhanced({
  collateral,
  onSave,
  onCancel,
  isLoading,
  fetchCustomers
}: CollateralFormProps): React.JSX.Element {
  const [formState, setFormState] = useState<{
    collateral_type: string;
    value: string;
    customer_id: string;
    valuation_date: string;
    status: string;
    legal_status: string;
    location: string;
    description: string;
    owner_info: string;
    metadata: Record<string, Record<string, unknown>>;
  }>({
    collateral_type: collateral?.collateral_type || '',
    value: collateral?.value?.toString() || '',
    customer_id: collateral?.customer_id?.toString() || '',
    valuation_date: collateral?.valuation_date || '',
    status: collateral?.status || 'active',
    legal_status: collateral?.legal_status || '',
    location: collateral?.location || '',
    description: collateral?.description || '',
    owner_info: collateral?.owner_info || '',
    metadata: (collateral?.metadata as Record<string, Record<string, unknown>>) || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (error) {
        console.error('Error loading customers:', error)
      }
    }
    loadCustomers()
  }, [fetchCustomers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const collateralData: Partial<Collateral> = {
      collateral_type: formState.collateral_type,
      value: parseFloat(formState.value) || 0,
      customer_id: parseInt(formState.customer_id),
      valuation_date: formState.valuation_date,
      status: formState.status,
      legal_status: formState.legal_status,
      location: formState.location,
      description: formState.description,
      owner_info: formState.owner_info,
      metadata: formState.metadata
    }

    onSave(collateralData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMetadataChange = (metadata: Record<string, Record<string, unknown>>) => {
    setFormState(prev => ({
      ...prev,
      metadata
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng
          </label>
          <select
            name="customer_id"
            value={formState.customer_id}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn khách hàng</option>
            {customers.map(customer => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Collateral Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại tài sản
          </label>
          <select
            name="collateral_type"
            value={formState.collateral_type}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Chọn loại tài sản</option>
            <option value="real_estate">Bất động sản</option>
            <option value="vehicle">Phương tiện</option>
            <option value="savings">Sổ tiết kiệm</option>
            <option value="stocks">Cổ phiếu</option>
            <option value="bonds">Trái phiếu</option>
            <option value="machinery">Máy móc thiết bị</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá trị (VNĐ)
          </label>
          <input
            type="number"
            name="value"
            value={formState.value}
            onChange={handleInputChange}
            required
            min="0"
            step="1000000"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formState.value && (
              <>
                Định dạng: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(parseFloat(formState.value))}
              </>
            )}
          </p>
        </div>

        {/* Valuation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày định giá
          </label>
          <input
            type="date"
            name="valuation_date"
            value={formState.valuation_date}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            name="status"
            value={formState.status}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Đang hoạt động</option>
            <option value="pending">Đang xử lý</option>
            <option value="frozen">Phong tỏa</option>
            <option value="released">Đã giải chấp</option>
          </select>
        </div>

        {/* Legal Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng pháp lý
          </label>
          <input
            type="text"
            name="legal_status"
            value={formState.legal_status}
            onChange={handleInputChange}
            placeholder="VD: Đã công chứng, Đang thế chấp..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa điểm
        </label>
        <input
          type="text"
          name="location"
          value={formState.location}
          onChange={handleInputChange}
          placeholder="Địa chỉ/vị trí của tài sản"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Mô tả chi tiết về tài sản"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Owner Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thông tin chủ sở hữu
        </label>
        <textarea
          name="owner_info"
          value={formState.owner_info}
          onChange={handleInputChange}
          rows={2}
          placeholder="Thông tin về chủ sở hữu tài sản"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Metadata Form */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin chi tiết
        </h3>
        {formState.collateral_type && (
          <MetadataForm
            initialData={formState.metadata}
            onChange={handleMetadataChange}
            suggestedTemplates={
              formState.collateral_type === 'real_estate' 
                ? ['property', 'legal', 'assessment', 'documents'] 
              : formState.collateral_type === 'vehicle'
                ? ['vehicle', 'legal', 'assessment', 'documents']
              : formState.collateral_type === 'savings'
                ? ['financial', 'legal', 'documents']
              : formState.collateral_type === 'stocks' || formState.collateral_type === 'bonds'
                ? ['financial', 'legal', 'documents']
              : formState.collateral_type === 'machinery'
                ? ['assessment', 'legal', 'documents']
              : ['documents', 'communication']
            }
          />
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
          {isLoading ? 'Đang lưu...' : collateral ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  )
}
