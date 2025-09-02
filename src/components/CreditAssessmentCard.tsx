'use client'

import { formatCurrency } from '@/lib/currency'
import { toVNDate } from '@/lib/date'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface CreditAssessmentCardProps {
  assessment: any
  onView: (assessment: any) => void
  onEdit: (assessment: any) => void
  onDelete: (assessment: any) => void
}

export default function CreditAssessmentCard({
  assessment,
  onView,
  onEdit,
  onDelete,
}: CreditAssessmentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{assessment.customer?.full_name}</h3>
          <p className="text-sm text-gray-500">Ngày tạo: {toVNDate(assessment.created_at)}</p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onView(assessment)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(assessment)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(assessment)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nhân viên thẩm định</p>
          <p className="text-sm text-gray-900 font-medium">{assessment.staff?.full_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sản phẩm</p>
          <p className="text-sm text-gray-900 font-medium">{assessment.product?.product_name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phòng ban</p>
          <p className="text-sm text-gray-900 font-medium">{assessment.department}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phí thẩm định</p>
          <p className="text-sm text-gray-900 font-medium">{formatCurrency(assessment.fee_amount)}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái:</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
              ${assessment.status === 'approve' ? 'bg-green-100 text-green-800' : ''}
              ${assessment.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
              ${assessment.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
              ${assessment.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' : ''}
            `}>
              {assessment.status === 'approve' && 'Đã duyệt'}
              {assessment.status === 'rejected' && 'Từ chối'}
              {assessment.status === 'draft' && 'Bản nháp'} 
              {assessment.status === 'in_review' && 'Đang xem xét'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">
              Cập nhật: {toVNDate(assessment.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
