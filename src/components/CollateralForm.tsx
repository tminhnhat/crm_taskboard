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
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-8 border border-gray-100 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-5 rounded-tr-full"></div>
          
          <div className="absolute top-0 right-0 pt-6 pr-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0l2-2m-2 2l-2-2m-14 0l2-2m0 0l-2-2m2 2h14" />
                  </svg>
                </div>
                <div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    💎 {collateral ? 'Cập Nhật Tài Sản' : 'Thêm Tài Sản Mới'}
                  </Dialog.Title>
                  <p className="text-gray-600 mt-1">
                    {collateral ? 'Cập nhật thông tin tài sản đảm bảo' : 'Tạo mới tài sản đảm bảo cho khách hàng'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 mr-3">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    📋 Thông Tin Cơ Bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            👤 Khách hàng
          </label>
          <select
            name="customer_id"
            value={formState.customer_id}
            onChange={handleInputChange}
            required
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 transition-all duration-200 hover:border-blue-300"
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
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            💎 Loại tài sản
          </label>
          <select
            name="collateral_type"
            value={formState.collateral_type}
            onChange={handleInputChange}
            required
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 transition-all duration-200 hover:border-blue-300"
          >
            <option value="">Chọn loại tài sản</option>
            <option value="real_estate">🏠 Bất động sản</option>
            <option value="vehicle">🚗 Phương tiện</option>
            <option value="savings">💰 Sổ tiết kiệm</option>
            <option value="stocks">📈 Cổ phiếu</option>
            <option value="bonds">📊 Trái phiếu</option>
            <option value="machinery">⚙️ Máy móc thiết bị</option>
            <option value="other">📦 Khác</option>
          </select>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            💰 Giá trị (VNĐ)
          </label>
          <input
            type="number"
            name="value"
            value={formState.value}
            onChange={handleInputChange}
            required
            min="0"
            step="1000000"
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 transition-all duration-200 hover:border-blue-300"
          />
          <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            {formState.value && (
              <>
                💵 Định dạng: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(parseFloat(formState.value))}
              </>
            )}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            📊 Trạng thái
          </label>
          <select
            name="status"
            value={formState.status}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 transition-all duration-200 hover:border-blue-300"
          >
            <option value="active">✅ Đang hoạt động</option>
            <option value="released">🔓 Đã giải chấp</option>
          </select>
        </div>
      </div>
                </div>

                {/* Valuation & Details Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg p-2 mr-3">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 6v1a2 2 0 002 2h4a2 2 0 002-2v-1m-6 0V9a2 2 0 012-2h4a2 2 0 012 2v2M3 15a6 6 0 1012 0v-1M9 15h6" />
                      </svg>
                    </div>
                    🗓️ Định Giá & Chi Tiết
                  </h4>

                  {/* Valuation Date */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      📅 Ngày định giá
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
                className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 transition-all duration-200 hover:border-emerald-300"
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
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📅 Hôm nay
              </button>
            </div>
          </div>
          {formState.valuation_date && !formState.valuation_date.match(/^\d{4}-\d{2}-\d{2}$/) && (
            <p className="mt-2 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              ⚠️ Vui lòng chọn ngày hợp lệ
            </p>
          )}
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            📍 Địa điểm
          </label>
          <input
            type="text"
            name="location"
            value={formState.location}
            onChange={handleInputChange}
            placeholder="Địa chỉ/vị trí của tài sản"
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 transition-all duration-200 hover:border-emerald-300"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            📋 Mô tả
          </label>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Mô tả chi tiết về tài sản"
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-4 py-3 transition-all duration-200 hover:border-emerald-300"
          />
        </div>
                </div>

      {/* Owner Info Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg p-2 mr-3">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          👥 Thông Tin Chủ Sở Hữu
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Primary Owner Info */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              👤 Chủ sở hữu chính
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
                    primary_owner_name: selectedCustomer?.full_name || '',
                    id_number: selectedCustomer?.id_number || '',
                    id_issue_date: selectedCustomer?.id_issue_date || '',
                    id_issue_authority: selectedCustomer?.id_issue_authority || '',
                    address: selectedCustomer?.address || '',
                    phone: selectedCustomer?.phone || ''
                  })
                }))
              }}
              className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-3 transition-all duration-200 hover:border-purple-300"
            >
              <option value="">Chọn chủ sở hữu chính</option>
              {customers.map((customer: Customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
            {/* Enhanced info display */}
            {(() => { const info = JSON.parse(formState.owner_info || '{}'); return (
              <div className="mt-3 space-y-2">
                {info.id_number && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🆔 CMND/CCCD:</span> <span className="text-gray-800">{info.id_number}</span></div>}
                {info.id_issue_date && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">📅 Ngày cấp:</span> <span className="text-gray-800">{info.id_issue_date}</span></div>}
                {info.id_issue_authority && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🏢 Nơi cấp:</span> <span className="text-gray-800">{info.id_issue_authority}</span></div>}
                {info.address && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🏠 Địa chỉ:</span> <span className="text-gray-800">{info.address}</span></div>}
                {info.phone && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">📞 SĐT:</span> <span className="text-gray-800">{info.phone}</span></div>}
              </div>
            )})()}
          </div>

          {/* Spouse Info */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              💑 Vợ/Chồng đồng sở hữu
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
                    spouse_name: selectedCustomer?.full_name || '',
                    spouse_id_number: selectedCustomer?.id_number || '',
                    spouse_id_issue_date: selectedCustomer?.id_issue_date || '',
                    spouse_id_issue_authority: selectedCustomer?.id_issue_authority || '',
                    spouse_address: selectedCustomer?.address || '',
                    spouse_phone: selectedCustomer?.phone || ''
                  })
                }))
              }}
              className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-3 transition-all duration-200 hover:border-purple-300"
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
            {/* Enhanced spouse info display */}
            {(() => {
              const info = JSON.parse(formState.owner_info || '{}');
              return info.spouse_id && (
                <div className="mt-3 space-y-2">
                  {info.spouse_id_number && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🆔 CMND/CCCD:</span> <span className="text-gray-800">{info.spouse_id_number}</span></div>}
                  {info.spouse_id_issue_date && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">📅 Ngày cấp:</span> <span className="text-gray-800">{info.spouse_id_issue_date}</span></div>}
                  {info.spouse_id_issue_authority && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🏢 Nơi cấp:</span> <span className="text-gray-800">{info.spouse_id_issue_authority}</span></div>}
                  {info.spouse_address && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">🏠 Địa chỉ:</span> <span className="text-gray-800">{info.spouse_address}</span></div>}
                  {info.spouse_phone && <div className="bg-white rounded-lg border px-3 py-2 text-sm"><span className="font-medium text-gray-600">📞 SĐT:</span> <span className="text-gray-800">{info.spouse_phone}</span></div>}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Additional Owner Info */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
            📝 Thông tin bổ sung
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
            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-4 py-3 transition-all duration-200 hover:border-purple-300"
          />
        </div>
      </div>

      {/* Metadata Form Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-2 mr-3">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          📄 Thông Tin Chi Tiết
        </h4>
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

      {/* Custom JSON Input Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-2 mr-3">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          ⚙️ Thông Tin Tùy Chỉnh
        </h4>
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
          <p className="text-sm text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
            💡 Thêm các trường thông tin tùy chỉnh theo nhu cầu
          </p>
        </div>
      </div>

                {/* Enhanced Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ❌ Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '⏳ Đang lưu...' : collateral ? '✅ Cập nhật' : '✨ Tạo mới'}
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
