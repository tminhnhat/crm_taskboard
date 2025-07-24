import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Customer, CustomerType } from '@/lib/supabase'

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customer: Partial<Customer>) => void
  customer?: Customer | null
}

export default function CustomerForm({ isOpen, onClose, onSubmit, customer }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    customer_type: 'individual' as CustomerType,
    full_name: '',
    date_of_birth: '',
    gender: '',
    id_number: '',
    id_issue_date: '',
    id_issue_authority: '',
    phone: '',
    email: '',
    address: '',
    hobby: '',
    status: 'active',
    account_number: '',
    cif_number: '',
    numerology_data: ''
  })

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

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_type: customer.customer_type,
        full_name: customer.full_name,
        date_of_birth: formatDateForDisplay(customer.date_of_birth),
        gender: customer.gender || '',
        id_number: customer.id_number || '',
        id_issue_date: formatDateForDisplay(customer.id_issue_date),
        id_issue_authority: customer.id_issue_authority || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        hobby: customer.hobby || '',
        status: customer.status,
        account_number: customer.account_number,
        cif_number: customer.cif_number || '',
        numerology_data: customer.numerology_data ? JSON.stringify(customer.numerology_data, null, 2) : ''
      })
    } else {
      setFormData({
        customer_type: 'individual',
        full_name: '',
        date_of_birth: '',
        gender: '',
        id_number: '',
        id_issue_date: '',
        id_issue_authority: '',
        phone: '',
        email: '',
        address: '',
        hobby: '',
        status: 'active',
        account_number: '',
        cif_number: '',
        numerology_data: ''
      })
    }
  }, [customer, isOpen])

  const handleDateChange = (field: 'date_of_birth' | 'id_issue_date', e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove all non-digits
    
    // Format as user types: dd/mm/yyyy
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9)
    }
    
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date formats
    if (formData.date_of_birth && !validateDateFormat(formData.date_of_birth)) {
      alert('Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    if (formData.id_issue_date && !validateDateFormat(formData.id_issue_date)) {
      alert('Định dạng ngày cấp CMND/CCCD không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    let numerologyData = null
    if (formData.numerology_data.trim()) {
      try {
        numerologyData = JSON.parse(formData.numerology_data)
      } catch {
        alert('Định dạng JSON không hợp lệ trong dữ liệu thần số học')
        return
      }
    }

    onSubmit({
      ...formData,
      date_of_birth: formatDateForSubmission(formData.date_of_birth),
      id_issue_date: formatDateForSubmission(formData.id_issue_date),
      gender: formData.gender || null,
      id_number: formData.id_number || null,
      id_issue_authority: formData.id_issue_authority || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      hobby: formData.hobby || null,
      cif_number: formData.cif_number || null,
      numerology_data: numerologyData
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-2xl w-full rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {customer ? 'Sửa Khách Hàng' : 'Tạo Khách Hàng Mới'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Khách Hàng *
                </label>
                <select
                  id="customer_type"
                  required
                  value={formData.customer_type}
                  onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Cá Nhân</option>
                  <option value="corporate">Doanh Nghiệp</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng Thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Đang Hoạt Động</option>
                  <option value="inactive">Không Hoạt Động</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ Và Tên *
              </label>
              <input
                type="text"
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                Mã Tài Khoản *
              </label>
              <input
                type="text"
                id="account_number"
                required
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mã tài khoản duy nhất"
              />
            </div>

            <div>
              <label htmlFor="cif_number" className="block text-sm font-medium text-gray-700 mb-1">
                Số CIF
              </label>
              <input
                type="text"
                id="cif_number"
                value={formData.cif_number}
                onChange={(e) => setFormData({ ...formData, cif_number: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số CIF (Customer Information File)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Sinh
                </label>
                <input
                  type="text"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => handleDateChange('date_of_birth', e)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  title="Vui lòng nhập ngày theo định dạng dd/mm/yyyy"
                />
                {formData.date_of_birth && !validateDateFormat(formData.date_of_birth) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Giới Tính
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Số CMND/CCCD
                </label>
                <input
                  type="text"
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số CMND/CCCD"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="id_issue_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Cấp CMND/CCCD
                </label>
                <input
                  type="text"
                  id="id_issue_date"
                  value={formData.id_issue_date}
                  onChange={(e) => handleDateChange('id_issue_date', e)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  title="Vui lòng nhập ngày theo định dạng dd/mm/yyyy"
                />
                {formData.id_issue_date && !validateDateFormat(formData.id_issue_date) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="id_issue_authority" className="block text-sm font-medium text-gray-700 mb-1">
                  Nơi Cấp CMND/CCCD
                </label>
                <input
                  type="text"
                  id="id_issue_authority"
                  value={formData.id_issue_authority}
                  onChange={(e) => setFormData({ ...formData, id_issue_authority: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Công an TP. Hồ Chí Minh"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa Chỉ
              </label>
              <textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div>
              <label htmlFor="hobby" className="block text-sm font-medium text-gray-700 mb-1">
                Sở Thích
              </label>
              <textarea
                id="hobby"
                rows={2}
                value={formData.hobby}
                onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Đọc sách, du lịch, thể thao, âm nhạc..."
              />
            </div>

            <div>
              <label htmlFor="numerology_data" className="block text-sm font-medium text-gray-700 mb-1">
                Dữ Liệu Thần Số Học (JSON)
              </label>
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tự động tính toán:</strong> Khi bạn cung cấp đầy đủ <strong>Họ Tên</strong> và <strong>Ngày Sinh</strong>, 
                  hệ thống sẽ tự động tính toán và cập nhật dữ liệu thần số học. Bạn cũng có thể nhập thủ công nếu muốn.
                </p>
              </div>
              <textarea
                id="numerology_data"
                rows={4}
                value={formData.numerology_data}
                onChange={(e) => setFormData({ ...formData, numerology_data: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='Dữ liệu thần số học sẽ được tự động tạo hoặc nhập thủ công dạng JSON'
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {customer ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
