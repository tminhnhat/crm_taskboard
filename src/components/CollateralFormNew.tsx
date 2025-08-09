'use client'

import { useState, useEffect } from 'react'
import { Collateral, Customer } from '@/lib/supabase'

// Template definitions
const METADATA_TEMPLATES = {
  thong_tin_giay_to: {
    title: 'Thông tin giấy tờ pháp lý',
    template: {
      so_giay_to: '',
      loai_giay_to: '',
      so_dang_ky: '',
      ngay_cap: '',
      noi_cap: '',
      ngay_het_han: '',
      ghi_chu: ''
    }
  },
  thong_tin_bao_hiem: {
    title: 'Thông tin bảo hiểm',
    template: {
      cong_ty_bao_hiem: '',
      so_hop_dong_bh: '',
      loai_bao_hiem: '',
      ngay_hieu_luc: '',
      ngay_ket_thuc: '',
      phi_bao_hiem: '',
      gia_tri_bao_hiem: ''
    }
  },
  tinh_trang_tai_san: {
    title: 'Đánh giá tình trạng tài sản',
    template: {
      trang_thai: 'tot',
      chi_tiet_trang_thai: '',
      lan_kiem_tra_cuoi: '',
      nguoi_kiem_tra: '',
      ghi_chu_kiem_tra: '',
      danh_gia_rui_ro: '',
      de_xuat_bao_tri: ''
    }
  },
  thong_tin_dinh_gia: {
    title: 'Thông tin định giá chi tiết',
    template: {
      don_vi_dinh_gia: '',
      dinh_gia_vien: '',
      phuong_phap_dinh_gia: '',
      ngay_dinh_gia: '',
      gia_tri_uoc_tinh: '',
      do_tin_cay: '',
      ghi_chu_dinh_gia: ''
    }
  },
  ghi_chu_bo_sung: {
    title: 'Ghi chú bổ sung',
    template: {
      dac_diem_noi_bat: '',
      han_che: '',
      lich_su_su_dung: '',
      ghi_chu_khac: ''
    }
  }
} as const;

type MetadataTemplateType = typeof METADATA_TEMPLATES;
type TemplateKeys = keyof MetadataTemplateType;
type MetadataTemplate = {
  [K in TemplateKeys]?: (typeof METADATA_TEMPLATES)[K]["template"];
};

interface CollateralFormProps {
  collateral?: Collateral | null;
  onSave: (collateralData: Partial<Collateral>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  fetchCustomers: () => Promise<Customer[]>;
}

export default function CollateralForm({ 
  collateral, 
  onSave, 
  onCancel, 
  isLoading,
  fetchCustomers
}: CollateralFormProps) {
  // Helper functions for date format conversion
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return '';
    
    const [, year, month, day] = dateMatch;
    return `${day}/${month}/${year}`;
  };

  const formatDateForSubmission = (displayDate: string): string | null => {
    if (!displayDate) return null;
    if (displayDate.includes('-') && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) return displayDate;
    
    const parts = displayDate.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null;
    
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  };

  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true;
    
    const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(ddmmyyyyPattern);
    
    if (!match) return false;
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear() + 10) return false;
    
    const testDate = new Date(year, month - 1, day);
    return testDate.getDate() === day && 
           testDate.getMonth() === month - 1 && 
           testDate.getFullYear() === year;
  };

  // Form data state
  const [formData, setFormData] = useState({
    customer_id: collateral?.customer_id?.toString() || '',
    collateral_type: collateral?.collateral_type || '',
    description: collateral?.description || '',
    value: collateral?.value?.toString() || '',
    valuation_date: formatDateForDisplay(collateral?.valuation_date || ''),
    legal_status: collateral?.legal_status || '',
    location: collateral?.location || '',
    owner_info: collateral?.owner_info || '',
    status: collateral?.status || 'active'
  });

  // Customer data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Metadata state with validation and parsing
  const [activeMetadata, setActiveMetadata] = useState<{
    input: string;
    parsed: MetadataTemplate | null;
    error: string | null;
    selectedTemplate: TemplateKeys | null;
    jsonData: string;
    isValid: boolean;
  }>({
    input: collateral?.metadata ? JSON.stringify(collateral.metadata, null, 2) : '',
    parsed: collateral?.metadata as MetadataTemplate || null,
    error: null,
    selectedTemplate: null,
    jsonData: '',
    isValid: true
  });

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingOptions(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadCustomers();
  }, [fetchCustomers]);

  // Initialize metadata if collateral has existing metadata
  useEffect(() => {
    if (collateral?.metadata) {
      setActiveMetadata(prev => ({
        ...prev,
        input: JSON.stringify(collateral.metadata, null, 2),
        parsed: collateral.metadata as MetadataTemplate,
        isValid: true
      }));
    }
  }, [collateral]);

  // Metadata template handling
  const handleTemplateChange = (template: TemplateKeys) => {
    const templateData = METADATA_TEMPLATES[template].template;
    const formattedJson = JSON.stringify(templateData, null, 2);
    
    setActiveMetadata(prev => ({
      ...prev,
      selectedTemplate: template,
      jsonData: formattedJson,
      input: JSON.stringify({ [template]: templateData }, null, 2),
      parsed: { [template]: templateData },
      error: null,
      isValid: true
    }));
  };

  // JSON validation and handling
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    setActiveMetadata(prev => {
      const update = { ...prev, jsonData: newValue };
      
      if (!newValue.trim()) {
        return { ...update, isValid: true, error: null };
      }
      
      try {
        const parsedData = JSON.parse(newValue);
        return {
          ...update,
          parsed: prev.selectedTemplate 
            ? { ...prev.parsed, [prev.selectedTemplate]: parsedData }
            : parsedData,
          error: null,
          isValid: true
        };
      } catch (err) {
        return {
          ...update,
          error: "Lỗi cấu trúc JSON",
          isValid: false
        };
      }
    });
  };

  // Form submission handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date format
    if (formData.valuation_date && !validateDateFormat(formData.valuation_date)) {
      alert('Ngày thẩm định không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy');
      return;
    }
    
    // Validate metadata
    let metadata = null;
    if (activeMetadata.input.trim() && !activeMetadata.isValid) {
      alert('Dữ liệu JSON không hợp lệ trong trường thông tin bổ sung');
      return;
    } else if (activeMetadata.parsed) {
      metadata = activeMetadata.parsed;
    }

    // Submit form data
    const collateralData: Partial<Collateral> = {
      customer_id: parseInt(formData.customer_id),
      collateral_type: formData.collateral_type || null,
      description: formData.description || null,
      value: formData.value ? parseFloat(formData.value) : null,
      valuation_date: formatDateForSubmission(formData.valuation_date),
      legal_status: formData.legal_status || null,
      location: formData.location || null,
      owner_info: formData.owner_info || null,
      status: formData.status || null,
      metadata
    };

    onSave(collateralData);
  };

  // Helper function for form input handling
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Currency formatting helper
  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d]/g, ''));
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('vi-VN').format(numValue);
  };

  // Predefined options
  const collateralTypes = [
    { value: 'Real Estate', label: 'Bất Động Sản' },
    { value: 'Vehicle/Car', label: 'Xe Cộ' },
    { value: 'Savings Account', label: 'Tài Khoản Tiết Kiệm' },
    { value: 'Equipment', label: 'Thiết Bị' },
    { value: 'Jewelry', label: 'Trang Sức' },
    { value: 'Securities', label: 'Chứng Khoán' },
    { value: 'Land', label: 'Đất Đai' },
    { value: 'Building', label: 'Công Trình' },
    { value: 'Other', label: 'Khác' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'inactive', label: 'Không Hoạt Động' }
  ];

  // Render form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {collateral ? 'Chỉnh Sửa Tài Sản Đảm Bảo' : 'Tài Sản Đảm Bảo Mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khách Hàng *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              required
              disabled={loadingOptions}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn khách hàng...</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name} - {customer.account_number}
                </option>
              ))}
            </select>
          </div>

          {/* Collateral Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại Tài Sản
            </label>
            <select
              value={formData.collateral_type}
              onChange={(e) => handleInputChange('collateral_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn loại tài sản...</option>
              {collateralTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá Trị Ước Tính (VND)
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.value && (
              <div className="text-sm text-gray-500 mt-1">
                Định dạng: {formatCurrency(formData.value)} VND
              </div>
            )}
          </div>

          {/* Valuation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày Thẩm Định
            </label>
            <input
              type="text"
              value={formData.valuation_date}
              onChange={(e) => {
                let value = e.target.value;
                // Auto-format as user types (add slashes)
                value = value.replace(/\D/g, ''); // Remove non-digits
                if (value.length >= 3) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length >= 6) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9);
                }
                handleInputChange('valuation_date', value);
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                ${formData.valuation_date && !validateDateFormat(formData.valuation_date)
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {formData.valuation_date && !validateDateFormat(formData.valuation_date) && (
              <div className="text-sm text-red-600 mt-1">
                Định dạng ngày không hợp lệ. Vui lòng sử dụng dd/mm/yyyy
              </div>
            )}
            {formData.valuation_date && validateDateFormat(formData.valuation_date) && (
              <div className="text-sm text-green-600 mt-1">
                ✓ Định dạng ngày hợp lệ
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Legal Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tình Trạng Pháp Lý
            </label>
            <input
              type="text"
              value={formData.legal_status}
              onChange={(e) => handleInputChange('legal_status', e.target.value)}
              placeholder="VD: Sổ đỏ chính chủ, Đang tranh chấp, v.v."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị Trí/Địa Chỉ
            </label>
            <textarea
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Địa chỉ đầy đủ hoặc chi tiết vị trí"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Owner Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông Tin Chủ Sở Hữu
            </label>
            <textarea
              value={formData.owner_info}
              onChange={(e) => handleInputChange('owner_info', e.target.value)}
              placeholder="Chi tiết chủ sở hữu, mối quan hệ với khách hàng, v.v."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về tài sản đảm bảo"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Metadata */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông Tin Bổ Sung
              </label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    onChange={(e) => {
                      const template = e.target.value as TemplateKeys;
                      if (template) {
                        handleTemplateChange(template);
                      }
                    }}
                    value={activeMetadata.selectedTemplate || ''}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                      ${activeMetadata.error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  >
                    <option value="">Chọn loại thông tin bổ sung...</option>
                    {Object.entries(METADATA_TEMPLATES).map(([key, { title }]) => (
                      <option key={key} value={key}>
                        {title}
                      </option>
                    ))}
                  </select>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Chọn mẫu từ danh sách để thêm thông tin
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Thông Tin Chi Tiết</h5>
                    <div className="relative">
                      <textarea
                        value={activeMetadata.jsonData}
                        onChange={handleJsonChange}
                        placeholder="Chọn mẫu thông tin từ danh sách trên để bắt đầu..."
                        className={`w-full h-[200px] text-xs font-mono bg-white p-2 rounded border
                          ${activeMetadata.error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
                        style={{ resize: 'vertical', minHeight: '100px' }}
                      />
                      {activeMetadata.error && (
                        <div className="absolute bottom-2 right-2 text-xs text-red-500 bg-white px-2 py-1 rounded-md border border-red-200">
                          ⚠️ {activeMetadata.error}
                        </div>
                      )}
                      {!activeMetadata.error && activeMetadata.parsed && (
                        <div className="absolute bottom-2 right-2 text-xs text-green-500 bg-white px-2 py-1 rounded-md border border-green-200">
                          ✓ Dữ liệu hợp lệ
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {activeMetadata.selectedTemplate 
                        ? `Đang chỉnh sửa mẫu: ${METADATA_TEMPLATES[activeMetadata.selectedTemplate].title}`
                        : 'Chọn mẫu thông tin từ danh sách trên để bắt đầu'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : (collateral ? 'Cập Nhật' : 'Tạo Mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
