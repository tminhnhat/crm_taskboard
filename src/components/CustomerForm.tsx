import { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Customer, CustomerType } from '@/lib/supabase';
import { calculateNumerologyData } from '@/lib/numerology';
import { toVNDate, toISODate, isValidDate } from '@/lib/date';
import { useCustomers } from '@/hooks/useCustomers';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Partial<Customer>) => void;
  customer?: Customer | null;
}

export default function CustomerForm({ isOpen, onClose, onSubmit, customer }: CustomerFormProps) {
  const { customers } = useCustomers();
  const [showQRScanner, setShowQRScanner] = useState(false);
  // Handle QR scan result from QRScanner
  const handleQRResult = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      id_number: data.id_number || prev.id_number,
      id_issue_date: data.id_issue_date ?
        (data.id_issue_date.length === 8 ? `${data.id_issue_date.slice(0,2)}/${data.id_issue_date.slice(2,4)}/${data.id_issue_date.slice(4)}` : data.id_issue_date)
        : prev.id_issue_date,
      full_name: data.full_name || prev.full_name,
      date_of_birth: data.date_of_birth ?
        (data.date_of_birth.length === 8 ? `${data.date_of_birth.slice(0,2)}/${data.date_of_birth.slice(2,4)}/${data.date_of_birth.slice(4)}` : data.date_of_birth)
        : prev.date_of_birth,
      gender: data.gender && (data.gender.toLowerCase() === 'nam' ? 'male' : data.gender.toLowerCase() === 'nữ' ? 'female' : prev.gender),
      address: data.address || prev.address,
    }));
    setShowQRScanner(false);
  };
  const [formData, setFormData] = useState<Partial<Customer> & { relationship_other?: string, spouse_id?: number, spouse_info?: any }>({
    customer_type: 'individual' as CustomerType,
    full_name: '',
    date_of_birth: '',
    gender: '',
    id_number: '',
    id_issue_date: '',
    id_issue_authority: 'Cục CS QLHC về TTXH',
    phone: '',
    email: '',
    address: '',
    hobby: '',
    status: 'active',
    account_number: '',
    cif_number: '',
    numerology_data: {} as Record<string, unknown>,
    relationship: '',
    relationship_other: '',
    // Business registration fields for both individual and corporate
    business_registration_number: '',
    registration_date: '',
    business_registration_authority: '',
    // Corporate specific fields
    company_name: '',
    legal_representative: '',
    legal_representative_cif_number: '',
    business_sector: '',
    spouse_id: undefined,
    spouse_info: {},
  })

  const [showNumerologyInfo, setShowNumerologyInfo] = useState(false)
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false)

  // Quick preview calculation helper (simplified)
  const getQuickPreview = (): { walksOfLife: string, mission: string, soul: string, birthDate: string } | null => {
    if (!formData.full_name || !formData.date_of_birth) return null;
    
    try {
      const [day, month, year] = formData.date_of_birth.split('/');
      if (!day || !month || !year) return null;
      
      if (!validateDateFormat(formData.date_of_birth)) return null;
      
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const numerologyData = calculateNumerologyData(formData.full_name, birthDate);
      
      return {
        walksOfLife: String(numerologyData.walksOfLife || numerologyData.duongdoi || 'N/A'),
        mission: String(numerologyData.mission || numerologyData.sumeng || 'N/A'),
        soul: String(numerologyData.soul || numerologyData.linhhon || 'N/A'),
        birthDate: String(numerologyData.birthDate || numerologyData.ngaysinh || 'N/A')
      };
    } catch {
      return null;
    }
  }

  const autoCalculateNumerology = async () => {
    if (!formData.full_name || !formData.date_of_birth) {
      alert('Vui lòng nhập đầy đủ Họ Tên và Ngày Sinh để tính toán thần số học')
      return
    }

    setIsCalculatingNumerology(true)
    
    try {
      // Convert dd/mm/yyyy to ISO date format for the numerology function
      const [day, month, year] = formData.date_of_birth.split('/')
      if (!day || !month || !year) {
        throw new Error('Invalid date format')
      }
      
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use the real numerology calculation function
      const numerologyData = calculateNumerologyData(formData.full_name, birthDate)
      
      // Transform the data to a more user-friendly format
      const simplifiedData = {
        walksOfLife: numerologyData.walksOfLife || numerologyData.duongdoi,
        mission: numerologyData.mission || numerologyData.sumeng,
        soul: numerologyData.soul || numerologyData.linhhon,
        personality: numerologyData.personality || numerologyData.nhancach,
        passion: numerologyData.passion || numerologyData.damme,
        connect: numerologyData.connect || numerologyData.cauno,
        balance: numerologyData.balance || numerologyData.canbangtrongkhokhan,
        birthDate: numerologyData.birthDate || numerologyData.ngaysinh,
        attitude: numerologyData.attitude || numerologyData.thaido,
        maturity: numerologyData.maturity || numerologyData.truongthanh,
        missingNumbers: numerologyData.missingNumbers || numerologyData.sothieu || [],
        yearIndividual: numerologyData.yearIndividual || numerologyData.namcanhan,
        monthIndividual: numerologyData.monthIndividual || numerologyData.thangcanhan,
        calculatedAt: new Date().toISOString(),
        note: `Tính toán tự động cho ${formData.full_name} sinh ngày ${formData.date_of_birth}`,
        _fullData: numerologyData // Keep original data for reference
      }
      
      setFormData({ 
        ...formData, 
        numerology_data: simplifiedData as Record<string, unknown>
      })
      
      alert('✅ Đã tính toán thành công dữ liệu thần số học!')
    } catch (error) {
      console.error('Error calculating numerology:', error)
      alert('❌ Có lỗi xảy ra khi tính toán thần số học. Vui lòng kiểm tra lại định dạng ngày sinh.')
    } finally {
      setIsCalculatingNumerology(false)
    }
  }

  // Helper functions for date format conversion using utility functions
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      return toVNDate(dateString);
    } catch {
      return '';
    }
  }

  const formatDateForSubmission = (displayDate: string): string | null => {
    if (!displayDate) return null;
    try {
      return toISODate(displayDate);
    } catch {
      // If the utility function fails, try manual conversion
      try {
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
      } catch {
        return null
      }
    }
  }

  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true // Empty is valid
    return isValidDate(dateString)
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
        numerology_data: customer.numerology_data || {} as Record<string, unknown>,
        relationship: customer.relationship || '',
        relationship_other: '',
        // Business registration fields
        business_registration_number: customer.business_registration_number || '',
        business_registration_authority: customer.business_registration_authority || '',
        registration_date: formatDateForDisplay(customer.registration_date),
        // Corporate fields
        company_name: customer.company_name || '',
        legal_representative: customer.legal_representative || '',
        legal_representative_cif_number: customer.legal_representative_cif_number || '',
        business_sector: customer.business_sector || '',
        spouse_id: undefined,
        spouse_info: {},
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
        numerology_data: {} as Record<string, unknown>,
        relationship: '',
        relationship_other: '',
        business_registration_number: '',
        business_registration_authority: '',
        registration_date: '',
        company_name: '',
        legal_representative: '',
        legal_representative_cif_number: '',
        business_sector: '',
        spouse_id: undefined,
        spouse_info: {},
      })
    }
  }, [customer, isOpen])

  const handleDateChange = (field: 'date_of_birth' | 'id_issue_date' | 'registration_date', e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert('Định dạng ngày cấp CCCD không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    if (formData.registration_date && !validateDateFormat(formData.registration_date)) {
      alert('Định dạng ngày đăng ký không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    let numerologyData = null
    if (formData.numerology_data && Object.keys(formData.numerology_data).length > 0) {
      numerologyData = formData.numerology_data
    }

      // Remove spouse_id and spouse_info from the submitted object to fix type error
      onSubmit({
        ...formData,
        date_of_birth: formData.date_of_birth ? formatDateForSubmission(formData.date_of_birth) : null,
        id_issue_date: formData.id_issue_date ? formatDateForSubmission(formData.id_issue_date) : null,
        gender: formData.gender || null,
        id_number: formData.id_number || null,
        id_issue_authority: formData.id_issue_authority || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        hobby: formData.hobby || null,
        cif_number: formData.cif_number || null,
        numerology_data: numerologyData,
        relationship: formData.relationship === 'Khác' ? (formData.relationship_other || 'Khác') : (formData.relationship || null),
        // Business registration fields
        business_registration_number: formData.business_registration_number || null,
        business_registration_authority: formData.business_registration_authority || null,
        // Corporate fields
        company_name: formData.company_name || null,
        legal_representative: formData.legal_representative || null,
        business_sector: formData.business_sector || null,
    // Only submit fields defined in Partial<Customer>
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {customer ? 'Sửa Khách Hàng' : 'Tạo Khách Hàng Mới'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  className="mb-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                  onClick={() => setShowQRScanner(true)}
                >
                  📷 Quét QR CCCD (Camera/Ảnh)
                </button>
              </div>
      {/* QRScanner Modal */}
      {showQRScanner && (
        <Dialog open={showQRScanner} onClose={() => setShowQRScanner(false)} className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto z-10 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Quét mã QR CCCD</h3>
            <QRScanner onResult={handleQRResult} />
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
              onClick={() => setShowQRScanner(false)}
            >
              Đóng
            </button>
          </div>
        </Dialog>
      )}
              <div>
                <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Khách Hàng *
                </label>
                <select
                  id="customer_type"
                  required
                  value={formData.customer_type}
                  onChange={(e) => {
                    const newType = e.target.value as CustomerType;
                    setFormData(prev => ({
                      ...prev,
                      customer_type: newType
                    }))
                  }}
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

                        {/* Customer Type Specific Fields */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.customer_type === 'corporate' ? 'Người Đại Diện *' : 'Họ Và Tên *'}
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
              />
            </div>

            {formData.customer_type !== 'individual' && (
            <div>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Doanh Nghiệp *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  required
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên doanh nghiệp"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Số Đăng Ký Kinh Doanh *
                  </label>
                  <input
                    type="text"
                    id="business_registration_number"
                    name="business_registration_number"
                    required
                    value={formData.business_registration_number || ''}
                    onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số đăng ký kinh doanh"
                  />
                </div>
                
                <div>
                  <label htmlFor="legal_representative" className="block text-sm font-medium text-gray-700 mb-1">
                    Người Đại Diện Pháp Luật *
                  </label>
                  <input
                    type="text"
                    id="legal_representative"
                    name="legal_representative"
                    required
                    value={formData.legal_representative || ''}
                    onChange={(e) => setFormData({ ...formData, legal_representative: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên người đại diện"
                  />
                </div>

                <div>
                  <label htmlFor="legal_representative_cif_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Số CIF Người Đại Diện
                  </label>
                  <input
                    type="text"
                    id="legal_representative_cif_number"
                    name="legal_representative_cif_number"
                    value={formData.legal_representative_cif_number || ''}
                    onChange={(e) => setFormData({ ...formData, legal_representative_cif_number: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số CIF của người đại diện"
                  />
                </div>

                <div>
                  <label htmlFor="business_sector" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngành Nghề Kinh Doanh
                  </label>
                  <input
                    type="text"
                    id="business_sector"
                    name="business_sector"
                    value={formData.business_sector || ''}
                    onChange={(e) => setFormData({ ...formData, business_sector: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập ngành nghề kinh doanh"
                  />
                </div>
              </div>
            </div>
            )}

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                Mã Tài Khoản
                <span className="text-xs text-blue-600 ml-2">📱 (dùng cho QR thanh toán)</span>
              </label>
              <input
                type="text"
                id="account_number"
                value={formData.account_number || ''}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số tài khoản Vietinbank (VD: 123456789)"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Số tài khoản này sẽ được sử dụng tự động khi tạo mã QR thanh toán cho khách hàng
              </p>
            </div>

            <div>
              <label htmlFor="cif_number" className="block text-sm font-medium text-gray-700 mb-1">
                Số CIF
              </label>
              <input
                type="text"
                id="cif_number"
                value={formData.cif_number || ''}
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
                  value={formData.phone || ''}
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
                  value={formData.email || ''}
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
                  value={formData.date_of_birth || ''}
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
                  value={formData.gender || ''}
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
                  Số CCCD
                </label>
                <input
                  type="text"
                  id="id_number"
                  value={formData.id_number || ''}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số CCCD"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="id_issue_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Cấp CCCD
                </label>
                <input
                  type="text"
                  id="id_issue_date"
                  value={formData.id_issue_date || ''}
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
                  Nơi Cấp
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="sm:w-48 w-full rounded-md border border-gray-300 px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={['Cục CS QLHC về TTXH', 'Bộ Công An'].includes(formData.id_issue_authority || '') ? (formData.id_issue_authority || '') : ''}
                    onChange={e => {
                      if (e.target.value) setFormData({ ...formData, id_issue_authority: e.target.value });
                    }}
                  >
                    <option value="">Chọn nhanh</option>
                    <option value="Cục CS QLHC về TTXH">Cục CS QLHC về TTXH</option>
                    <option value="Bộ Công An">Bộ Công An</option>
                  </select>
                  <input
                    type="text"
                    id="id_issue_authority"
                    value={formData.id_issue_authority || ''}
                    onChange={(e) => setFormData({ ...formData, id_issue_authority: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                    placeholder="Nhập nơi cấp CCCD"
                  />
                </div>
              </div>

              {/* Business Registration Fields for Individual */}
              <div>
                <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Số Đăng Ký Kinh Doanh
                </label>
                <input
                  type="text"
                  id="business_registration_number"
                  value={formData.business_registration_number || ''}
                  onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số đăng ký kinh doanh (nếu có)"
                />
              </div>

                            <div>
                <label htmlFor="registration_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Đăng Ký
                </label>
                <input
                  type="text"
                  id="registration_date"
                  value={formData.registration_date || ''}
                  onChange={(e) => handleDateChange('registration_date', e)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  title="Vui lòng nhập ngày theo định dạng dd/mm/yyyy"
                />
                {formData.registration_date && !validateDateFormat(formData.registration_date) && (
                  <p className="text-red-500 text-xs mt-1">
                    Định dạng không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="business_registration_authority" className="block text-sm font-medium text-gray-700 mb-1">
                  Nơi Cấp ĐKKD
                </label>
                <input
                  type="text"
                  id="business_registration_authority"
                  value={formData.business_registration_authority || ''}
                  onChange={(e) => setFormData({ ...formData, business_registration_authority: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nơi cấp đăng ký kinh doanh"
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
                value={formData.address || ''}
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
                value={formData.hobby || ''}
                onChange={(e) => setFormData({ ...formData, hobby: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Đọc sách, du lịch, thể thao, âm nhạc..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="numerology_data" className="block text-sm font-medium text-gray-700">
                  Dữ Liệu Thần Số Học (JSON)
                  <button
                    type="button"
                    onClick={() => setShowNumerologyInfo(!showNumerologyInfo)}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    📚 Tìm hiểu về Thần Số Học
                  </button>
                </label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={autoCalculateNumerology}
                    disabled={isCalculatingNumerology || !formData.full_name || !formData.date_of_birth}
                    className="px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-1"
                  >
                    {isCalculatingNumerology ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang tính...
                      </>
                    ) : (
                      <>
                        🔮 Tự động tính toán
                      </>
                    )}
                  </button>
                  
                  {formData.numerology_data && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, numerology_data: {} as Record<string, unknown> })}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>
              
              {showNumerologyInfo && (
                <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">📖 22 Định Nghĩa Cơ Bản Trong Thần Số Học</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-blue-700">🧭 A. HIỂU VỀ CHÍNH MÌNH</h5>
                        <div className="space-y-1 text-xs pl-2">
                          <div><strong>1. Số Lặp:</strong> Những số xuất hiện lặp lại trong 6 số lõi, tạo ra tần số năng lượng cao</div>
                          <div><strong>2. Số Ngày Sinh:</strong> Tiết lộ tài năng bạn đang sở hữu một cách rõ ràng nhất</div>
                          <div><strong>3. Số Tính Cách:</strong> Cách người khác nhìn thấy bạn qua lời nói, cử chỉ, hành động</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-green-700">❤️ B. KHAO KHÁT VỀ HẠNH PHÚC</h5>
                        <div className="space-y-1 text-xs pl-2">
                          <div><strong>1. Số Nội Tâm:</strong> Khát vọng tiềm ẩn, mong muốn của trái tim</div>
                          <div><strong>2. Số Đam Mê Tiềm Ẩn:</strong> Tài năng đặc biệt cần rèn luyện và trải nghiệm</div>
                          <div><strong>3. Nguyên Âm Đầu:</strong> Cửa sổ nhỏ để người khác nhìn thấy sâu hơn về bạn</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-purple-700">🧠 C. TƯ DUY & GIẢI QUYẾT VẤN ĐỀ</h5>
                        <div className="space-y-1 text-xs pl-2">
                          <div><strong>1. Số Thái Độ:</strong> Ấn tượng đầu tiên qua cử chỉ, lời nói</div>
                          <div><strong>2. Số Bản Thể Tiềm Thức:</strong> Khả năng giải quyết tình huống bất ngờ</div>
                          <div><strong>3. Phương Tiện Nhận Thức:</strong> 4 cấp độ trải nghiệm cuộc sống</div>
                          <div><strong>4. Số Cân Bằng:</strong> Cách lấy lại cân bằng khi khó khăn</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-orange-700">🌟 D. RÈN LUYỆN & PHÁT TRIỂN</h5>
                        <div className="space-y-1 text-xs pl-2">
                          <div><strong>1. Số Bổ Sung:</strong> Lĩnh vực cần nỗ lực để hoàn thiện</div>
                          <div><strong>2. Số Cầu Nối:</strong> Kết nối các số lõi với nhau</div>
                          <div><strong>3. Số Trưởng Thành:</strong> Mục tiêu cuối cùng của cuộc đời</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                      <h5 className="font-medium text-indigo-700 mb-2">🌅 HÀNH TRÌNH CUỘC ĐỜI & DỰ BÁO TƯƠNG LAI</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div><strong>Số Sứ Mệnh:</strong> Mục đích cả đời, nhiệm vụ cần hoàn thành</div>
                        <div><strong>Số Đường Đời:</strong> Số quan trọng nhất, con đường đúng cần chọn</div>
                        <div><strong>Số Chu Kỳ Giai Đoạn:</strong> 3 giai đoạn lớn của cuộc đời</div>
                        <div><strong>Số Đỉnh Cao:</strong> 4 đỉnh cao với năng lượng mạnh nhất</div>
                        <div><strong>Số Thử Thách:</strong> 4 thử thách để phát triển bản thân</div>
                        <div><strong>Năm Cá Nhân:</strong> Xu hướng và tình huống sẽ trải qua</div>
                        <div><strong>Ký Tự Chuyển Đổi:</strong> Dự đoán những năm sắp tới</div>
                        <div><strong>Số Bản Chất:</strong> Thế giới bên trong: tư duy, nhu cầu, mong muốn</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                      <p className="text-xs text-yellow-800">
                        💡 <strong>Mẹo:</strong> Các số này giúp hiểu rõ bản thân, tìm ra tài năng và hướng phát triển phù hợp. 
                        Hệ thống sẽ tự động tính toán dựa trên tên và ngày sinh của khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-purple-700">
                      💡 <strong>Tự động tính toán:</strong> Khi bạn cung cấp đầy đủ <strong>Họ Tên</strong> và <strong>Ngày Sinh</strong>, 
                      nhấn nút &quot;🔮 Tự động tính toán&quot; để hệ thống tạo dữ liệu thần số học hoàn chỉnh.
                    </p>
                    
                    {formData.full_name && formData.date_of_birth && (() => {
                      const preview = getQuickPreview()
                      return preview ? (
                        <div className="mt-2 p-2 bg-white rounded border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium mb-1">🔍 Xem trước tính toán:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>🛤️ Số Đường Đời: <strong>{preview.walksOfLife}</strong></div>
                            <div>🎯 Số Sứ Mệnh: <strong>{preview.mission}</strong></div>
                            <div>💜 Số Nội Tâm: <strong>{preview.soul}</strong></div>
                            <div>🎂 Số Ngày Sinh: <strong>{preview.birthDate}</strong></div>
                          </div>
                          <p className="text-xs text-purple-500 mt-1 italic">
                            ↑ Đây là bản xem trước. Nhấn &quot;Tự động tính toán&quot; để có dữ liệu đầy đủ.
                          </p>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>
                            <textarea
                id="numerology_data"
                rows={4}
                value={JSON.stringify(formData.numerology_data, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, numerology_data: parsed });
                  } catch {
                    // If invalid JSON, just store as empty object
                    setFormData({ ...formData, numerology_data: {} as Record<string, unknown> });
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder='Dữ liệu thần số học sẽ được tự động tạo hoặc nhập thủ công dạng JSON'
              />
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Mối Quan Hệ
              </label>
              <select
                id="relationship"
                value={formData.relationship || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    relationship: value,
                    relationship_other: value === 'Khác' ? prev.relationship_other : ''
                  }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn mối quan hệ</option>
                <option value="Chủ sở hữu">Chủ sở hữu</option>
                <option value="Vợ/Chồng">Vợ/Chồng</option>
                <option value="Cha">Cha</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Con">Con</option>
                <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                <option value="Bạn bè">Bạn bè</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
                <option value="Khác">Khác</option>
              </select>
              {formData.relationship === 'Khác' && (
                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mối quan hệ khác"
                  value={formData.relationship_other || ''}
                  onChange={e => setFormData(prev => ({ ...prev, relationship_other: e.target.value }))}
                />
              )}
            </div>

            {/* Spouse Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vợ/Chồng (nếu có)
              </label>
              <select
                id="spouse_id"
                value={formData.spouse_id || ''}
                onChange={e => {
                  const selectedId = Number(e.target.value);
                  const selected = customers.find(c => c.customer_id === selectedId);
                  setFormData(prev => ({
                    ...prev,
                    spouse_id: selectedId,
                    spouse_info: selected ? {
                      full_name: selected.full_name,
                      id_number: selected.id_number,
                      id_issue_date: selected.id_issue_date,
                      id_issue_authority: selected.id_issue_authority,
                      address: selected.address,
                      phone: selected.phone
                    } : {}
                  }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn vợ/chồng</option>
                {customers.filter(c => !customer || c.customer_id !== customer.customer_id).map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
                ))}
              </select>
              {formData.spouse_id && formData.spouse_info && (
                <div className="mt-2 grid grid-cols-1 gap-1">
                  <input type="text" className="border rounded px-2 py-1 text-sm mb-1" value={formData.spouse_info.id_number || ''} readOnly placeholder="Số CMND/CCCD (Vợ/Chồng)" />
                  <input type="text" className="border rounded px-2 py-1 text-sm mb-1" value={formData.spouse_info.id_issue_date || ''} readOnly placeholder="Ngày cấp (Vợ/Chồng)" />
                  <input type="text" className="border rounded px-2 py-1 text-sm mb-1" value={formData.spouse_info.id_issue_authority || ''} readOnly placeholder="Nơi cấp (Vợ/Chồng)" />
                  <input type="text" className="border rounded px-2 py-1 text-sm mb-1" value={formData.spouse_info.address || ''} readOnly placeholder="Địa chỉ (Vợ/Chồng)" />
                  <input type="text" className="border rounded px-2 py-1 text-sm" value={formData.spouse_info.phone || ''} readOnly placeholder="Số điện thoại (Vợ/Chồng)" />
                </div>
              )}
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
