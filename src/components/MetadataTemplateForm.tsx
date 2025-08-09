'use client'

import React from 'react'
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

type TemplateData = Record<string, string | number>

interface MetadataTemplateFormProps {
  title: string
  template: TemplateData
  data: TemplateData
  onChange: (newData: TemplateData) => void
  templateKey: string
}

const getFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    // Giấy tờ pháp lý
    so_giay_to: 'Số giấy tờ',
    loai_giay_to: 'Loại giấy tờ',
    so_dang_ky: 'Số đăng ký',
    ngay_cap: 'Ngày cấp',
    noi_cap: 'Nơi cấp',
    ngay_het_han: 'Ngày hết hạn',
    ghi_chu: 'Ghi chú',

    // Bảo hiểm
    cong_ty_bao_hiem: 'Công ty bảo hiểm',
    so_hop_dong_bh: 'Số hợp đồng BH',
    loai_bao_hiem: 'Loại bảo hiểm',
    ngay_hieu_luc: 'Ngày hiệu lực',
    ngay_ket_thuc: 'Ngày kết thúc',
    phi_bao_hiem: 'Phí bảo hiểm',
    gia_tri_bao_hiem: 'Giá trị bảo hiểm',

    // Tình trạng tài sản
    trang_thai: 'Trạng thái',
    chi_tiet_trang_thai: 'Chi tiết trạng thái',
    lan_kiem_tra_cuoi: 'Lần kiểm tra cuối',
    nguoi_kiem_tra: 'Người kiểm tra',
    ghi_chu_kiem_tra: 'Ghi chú kiểm tra',
    danh_gia_rui_ro: 'Đánh giá rủi ro',
    de_xuat_bao_tri: 'Đề xuất bảo trì',

    // Định giá
    don_vi_dinh_gia: 'Đơn vị định giá',
    dinh_gia_vien: 'Định giá viên',
    phuong_phap_dinh_gia: 'Phương pháp định giá',
    ngay_dinh_gia: 'Ngày định giá',
    gia_tri_uoc_tinh: 'Giá trị ước tính',
    do_tin_cay: 'Độ tin cậy',
    ghi_chu_dinh_gia: 'Ghi chú định giá',

    // Ghi chú bổ sung
    dac_diem_noi_bat: 'Đặc điểm nổi bật',
    han_che: 'Hạn chế',
    lich_su_su_dung: 'Lịch sử sử dụng',
    ghi_chu_khac: 'Ghi chú khác'
  }
  return labels[key] || key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getIcon = (templateKey: string) => {
  switch (templateKey) {
    case 'thong_tin_giay_to':
      return <DocumentTextIcon className="h-6 w-6 text-blue-500" />
    case 'thong_tin_bao_hiem':
      return <ShieldCheckIcon className="h-6 w-6 text-green-500" />
    case 'tinh_trang_tai_san':
      return <ClipboardDocumentCheckIcon className="h-6 w-6 text-yellow-500" />
    case 'thong_tin_dinh_gia':
      return <DocumentChartBarIcon className="h-6 w-6 text-purple-500" />
    case 'ghi_chu_bo_sung':
      return <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500" />
    default:
      return <DocumentTextIcon className="h-6 w-6 text-gray-500" />
  }
}

const getFieldType = (key: string, value: string | number): string => {
  if (typeof value === 'number') return 'number'
  if (key.includes('ngay')) return 'date'
  if (key.includes('ghi_chu') || key.includes('chi_tiet') || key.includes('dac_diem') || key.includes('lich_su')) return 'textarea'
  return 'text'
}

export default function MetadataTemplateForm({ 
  title, 
  template, 
  data, 
  onChange,
  templateKey
}: MetadataTemplateFormProps) {
  const handleFieldChange = (key: string, value: string) => {
    onChange({
      ...data,
      [key]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        {getIcon(templateKey)}
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(template).map(([key, defaultValue]) => {
          const fieldType = getFieldType(key, defaultValue)
          const value = data[key] || ''
          const label = getFieldLabel(key)

          return (
            <div key={key} className={fieldType === 'textarea' ? 'md:col-span-2' : ''}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              
              {fieldType === 'textarea' ? (
                <textarea
                  id={key}
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none h-24"
                  placeholder={`Nhập ${label.toLowerCase()}...`}
                />
              ) : fieldType === 'date' ? (
                <input
                  type="date"
                  id={key}
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              ) : (
                <input
                  type={fieldType}
                  id={key}
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={`Nhập ${label.toLowerCase()}...`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
