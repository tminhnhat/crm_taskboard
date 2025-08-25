'use client'

import React, { useState, useEffect } from 'react'
import { Collateral, Customer } from '@/lib/supabase'
import MetadataForm from './MetadataForm'
import JsonInputHelper from './JsonInputHelper'
import { toVNDate } from '@/lib/date'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CollateralFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (collateralData: Partial<Collateral>) => void;
  collateral?: Collateral | null;
  isLoading?: boolean;
  fetchCustomers: () => Promise<Customer[]>;
}

export default function CollateralForm({
  isOpen,
  onClose,
  onSubmit,
  collateral,
  isLoading,
  fetchCustomers
}: CollateralFormProps) {
  // No helper functions needed as we're using the date functions directly

  const [formState, setFormState] = useState<{
    collateral_type: string;
    value: string;
    customer_id: string;
    valuation_date: string;
    status: string;
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
    location: collateral?.location || '',
    description: collateral?.description || '',
    owner_info: collateral?.owner_info || JSON.stringify({
      primary_owner_id: '',
      primary_owner_name: '',
      spouse_id: '',
      spouse_name: '',
      notes: ''
    }),
    metadata: (collateral?.metadata as Record<string, Record<string, unknown>>) || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers()
        setCustomers(data)
      } catch {
        // Error loading customers
      }
    }
    loadCustomers()
  }, [fetchCustomers])

  // Update form state when collateral prop changes
  useEffect(() => {
    if (collateral) {
      setFormState({
        collateral_type: collateral.collateral_type || '',
        value: collateral.value?.toString() || '',
        customer_id: collateral.customer_id?.toString() || '',
        valuation_date: collateral.valuation_date || '',
        status: collateral.status || 'active',
        location: collateral.location || '',
        description: collateral.description || '',
        owner_info: collateral.owner_info || JSON.stringify({
          primary_owner_id: '',
          primary_owner_name: '',
          spouse_id: '',
          spouse_name: '',
          notes: ''
        }),
        metadata: (collateral.metadata as Record<string, Record<string, unknown>>) || {}
      })
    } else {
      // Reset form for new collateral
      setFormState({
        collateral_type: '',
        value: '',
        customer_id: '',
        valuation_date: '',
        status: 'active',
        location: '',
        description: '',
        owner_info: JSON.stringify({
          primary_owner_id: '',
          primary_owner_name: '',
          spouse_id: '',
          spouse_name: '',
          notes: ''
        }),
        metadata: {}
      })
    }
  }, [collateral])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const collateralData: Partial<Collateral> = {
      collateral_type: formState.collateral_type,
      value: parseFloat(formState.value) || 0,
      customer_id: parseInt(formState.customer_id),
      valuation_date: formState.valuation_date,
      status: formState.status,
      location: formState.location,
      description: formState.description,
      owner_info: formState.owner_info,
      metadata: formState.metadata
    }

    onSubmit(collateralData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'valuation_date') {
      // Convert input date format for display
      setFormState((prev) => ({
        ...prev,
        [name]: value // Keep the original yyyy-mm-dd format in state
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleMetadataChange = (metadata: Record<string, Record<string, unknown>>) => {
    setFormState((prev) => ({
      ...prev,
      metadata
    }))
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {collateral ? 'Cập Nhật Tài Sản' : 'Thêm Tài Sản Mới'}
              </Dialog.Title>

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
            {customers.map((customer: Customer) => (
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
          <div className="relative">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                name="valuation_date"
                value={formState.valuation_date ? toVNDate(formState.valuation_date) : ''}
                onChange={(e) => {
                  let inputValue = e.target.value;
                  
                  // Remove any non-digit characters except slashes
                  inputValue = inputValue.replace(/[^\d/]/g, '');
                  
                  // Don't process if longer than 10 characters
                  if (inputValue.length > 10) return;
                  
                  // Auto-format as user types
                  const digits = inputValue.replace(/\D/g, '');
                  
                  // Format with slashes
                  if (digits.length > 4) {
                    inputValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
                  } else if (digits.length > 2) {
                    inputValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  } else {
                    inputValue = digits;
                  }

                  // For incomplete input, just show what they're typing
                  if (!inputValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    setFormState(prev => ({
                      ...prev,
                      valuation_date: '' // Clear ISO date if input is incomplete
                    }));
                    e.target.value = inputValue; // Show what they're typing
                    return;
                  }

                  // Convert to ISO format when input is complete
                  try {
                    const [day, month, year] = inputValue.split('/').map(Number);
                    // Validate date parts
                    if (month < 1 || month > 12) return;
                    if (day < 1 || day > 31) return;
                    if (year < 1900 || year > 2100) return;
                    
                    // Create ISO date string
                    const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    
                    // Validate the resulting date
                    const date = new Date(isoDate);
                    if (date.toString() === 'Invalid Date') return;
                    
                    setFormState(prev => ({
                      ...prev,
                      valuation_date: isoDate
                    }));
                  } catch {
                    // Invalid date - do nothing
                  }
                }}
                placeholder="dd/mm/yyyy"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                maxLength={10}
              />
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  const isoDate = `${year}-${month}-${day}`;
                  
                  setFormState(prev => ({
                    ...prev,
                    valuation_date: isoDate
                  }));
                }}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hôm nay
              </button>
            </div>
          </div>
          {formState.valuation_date && !formState.valuation_date.match(/^\d{4}-\d{2}-\d{2}$/) && (
            <p className="mt-1 text-sm text-red-500">
              Vui lòng chọn ngày hợp lệ
            </p>
          )}
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
            <option value="released">Đã giải chấp</option>
          </select>
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
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Thông tin chủ sở hữu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Owner Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chủ sở hữu chính
            </label>
            <select
              name="owner_info_primary"
              value={JSON.parse(formState.owner_info || '{}').primary_owner_id || ''}
              onChange={(e) => {
                const selectedCustomer = customers.find((c: Customer) => c.customer_id.toString() === e.target.value)
                const currentInfo = JSON.parse(formState.owner_info || '{}')
                setFormState((prev) => ({
                  ...prev,
                  owner_info: JSON.stringify({
                    ...currentInfo,
                    primary_owner_id: e.target.value,
                    primary_owner_name: selectedCustomer?.full_name || ''
                  })
                }))
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Chọn chủ sở hữu chính</option>
              {customers.map((customer: Customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Spouse Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vợ/Chồng đồng sở hữu
            </label>
            <select
              name="owner_info_spouse"
              value={JSON.parse(formState.owner_info || '{}').spouse_id || ''}
              onChange={(e) => {
                const selectedCustomer = customers.find((c: Customer) => c.customer_id.toString() === e.target.value)
                const currentInfo = JSON.parse(formState.owner_info || '{}')
                setFormState((prev) => ({
                  ...prev,
                  owner_info: JSON.stringify({
                    ...currentInfo,
                    spouse_id: e.target.value,
                    spouse_name: selectedCustomer?.full_name || ''
                  })
                }))
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Chọn vợ/chồng (nếu có)</option>
              {customers
                .filter((customer: Customer) => customer.customer_id.toString() !== JSON.parse(formState.owner_info || '{}').primary_owner_id)
                .map((customer: Customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.full_name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Additional Owner Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thông tin bổ sung
          </label>
          <textarea
            name="owner_info_notes"
            value={JSON.parse(formState.owner_info || '{}').notes || ''}
            onChange={(e) => {
              const currentInfo = JSON.parse(formState.owner_info || '{}')
              setFormState((prev) => ({
                ...prev,
                owner_info: JSON.stringify({
                  ...currentInfo,
                  notes: e.target.value
                })
              }))
            }}
            rows={2}
            placeholder="Thông tin bổ sung về chủ sở hữu (nếu có)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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
                ? ['property_certificate', 'property_land', 'property_building', 'property_value', 'property_assessment'] 
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
        )}
      </div>

      {/* Custom JSON Input */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin tùy chỉnh
        </h3>
        <div className="space-y-2">
          <JsonInputHelper
            value={JSON.stringify(formState.metadata.custom || {}, null, 2)}
            onChange={(jsonString: string) => {
              try {
                const customData = JSON.parse(jsonString)
                handleMetadataChange({
                  ...formState.metadata,
                  custom: customData
                })
              } catch (error) {
                // If JSON is invalid, don't update the state
                console.error('Invalid JSON:', error)
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
                    onClick={onClose}
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
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
