'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useCustomers } from '@/hooks/useCustomers'

interface QRPaymentGeneratorProps {
  isOpen: boolean
  onClose: () => void
  prefilledCustomerId?: number
}

interface QRPaymentData {
  accountNumber: string
  accountName: string
  amount?: number
  description?: string
  useCustomerData: boolean
  selectedCustomerId?: number
}

export default function QRPaymentGenerator({
  isOpen,
  onClose,
  prefilledCustomerId
}: QRPaymentGeneratorProps) {
  const { customers } = useCustomers()
  const [formData, setFormData] = useState<QRPaymentData>({
    accountNumber: '',
    accountName: '',
    amount: undefined,
    description: '',
    useCustomerData: true,
    selectedCustomerId: prefilledCustomerId
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Update form when customer is selected
  useEffect(() => {
    if (formData.useCustomerData && formData.selectedCustomerId) {
      const customer = customers.find(c => c.customer_id === formData.selectedCustomerId)
      if (customer) {
        setFormData(prev => ({
          ...prev,
          accountName: customer.full_name,
          // Use customer's account_number field if available
          accountNumber: customer.account_number || prev.accountNumber || ''
        }))
      }
    }
  }, [formData.useCustomerData, formData.selectedCustomerId, customers])

  // Set prefilled customer on dialog open
  useEffect(() => {
    if (prefilledCustomerId && customers.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedCustomerId: prefilledCustomerId,
        useCustomerData: true
      }))
    }
  }, [prefilledCustomerId, customers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const generateQRCode = async () => {
    if (!formData.accountNumber || !formData.accountName) {
      alert('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản')
      return
    }

    setIsGenerating(true)
    setPreviewUrl(null)

    try {
      const response = await fetch('/api/qr-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          amount: formData.amount,
          description: formData.description,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } else {
        const error = await response.json()
        alert(`Lỗi: ${error.error || 'Không thể tạo mã QR'}`)
      }
    } catch (error) {
      console.error('Error generating QR:', error)
      alert('Lỗi kết nối khi tạo mã QR')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `qr-payment-${formData.accountNumber}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setFormData({
      accountNumber: '',
      accountName: '',
      amount: undefined,
      description: '',
      useCustomerData: true,
      selectedCustomerId: undefined
    })
    onClose()
  }

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      open={isOpen}
      onClose={handleClose}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-4xl my-8 p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center">
              <QrCodeIcon className="h-6 w-6 mr-2" />
              Tạo Mã QR Thanh Toán Vietinbank
            </Dialog.Title>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin tài khoản</h4>
                
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="useCustomerData"
                    name="useCustomerData"
                    checked={formData.useCustomerData}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useCustomerData" className="ml-2 text-sm text-blue-700">
                    Sử dụng thông tin từ khách hàng
                  </label>
                </div>

                {formData.useCustomerData && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn khách hàng
                    </label>
                    <select
                      name="selectedCustomerId"
                      value={formData.selectedCustomerId || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        selectedCustomerId: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Chọn khách hàng...</option>
                      {customers.map((customer) => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.full_name} - {customer.phone}
                          {customer.account_number && ` (STK: ${customer.account_number})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản <span className="text-red-500">*</span>
                  {formData.useCustomerData && !!formData.selectedCustomerId && (
                    <span className="text-xs text-green-600 ml-2">(từ thông tin khách hàng)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số tài khoản Vietinbank"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    formData.useCustomerData && !!formData.selectedCustomerId && formData.accountNumber 
                      ? 'bg-green-50 border-green-300' 
                      : ''
                  }`}
                  required
                  readOnly={formData.useCustomerData && !!formData.selectedCustomerId && !!formData.accountNumber}
                />
                {formData.useCustomerData && !!formData.selectedCustomerId && !formData.accountNumber && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Khách hàng chưa có số tài khoản. Vui lòng nhập thủ công hoặc cập nhật thông tin khách hàng.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên chủ tài khoản"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  readOnly={formData.useCustomerData && !!formData.selectedCustomerId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập số tiền (tùy chọn)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung chuyển khoản
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung chuyển khoản (tùy chọn)"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={generateQRCode}
                  disabled={isGenerating || !formData.accountNumber || !formData.accountName}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  {isGenerating ? 'Đang tạo...' : 'Tạo mã QR'}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Xem trước</h4>
              
              {previewUrl ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto border-2 border-gray-200 rounded-lg shadow-lg" style={{ maxHeight: '500px', maxWidth: '500px' }}>
                    <Image
                      src={previewUrl}
                      alt="QR Payment Code"
                      width={500}
                      height={500}
                      className="w-full h-auto"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={downloadQRCode}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Tải xuống
                    </button>
                    <button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Xem toàn màn hình
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-20">
                  <QrCodeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Mã QR sẽ hiển thị tại đây sau khi tạo</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-800 mb-2">Lưu ý:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Mã QR được tạo có kích thước khổ giấy A6 (105 x 148 mm)</li>
              <li>• Hình ảnh có độ phân giải cao phù hợp để in ấn</li>
              <li>• Mã QR tương thích với các ứng dụng banking của Vietinbank</li>
              <li>• Nếu không nhập số tiền, khách hàng có thể nhập số tiền khi quét mã</li>
            </ul>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
