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
    <div className="bg-white rounded-3xl shadow-2xl p-7 border-2 border-transparent hover:border-blue-400 transition-all duration-300 group relative overflow-hidden hover:scale-[1.02]" style={{boxShadow:'0 8px 32px 0 rgba(60,130,220,0.12)'}}>
      <div className="absolute inset-0 pointer-events-none group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-blue-100 opacity-60 transition-all duration-300 z-0" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-1 drop-shadow">{assessment.customer?.full_name}</h3>
          <p className="text-sm text-gray-500">Ngày tạo: {toVNDate(assessment.created_at)}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(assessment)}
            className="p-2 text-blue-400 hover:text-blue-600 bg-blue-50 rounded-full shadow"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(assessment)}
            className="p-2 text-yellow-400 hover:text-yellow-600 bg-yellow-50 rounded-full shadow"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(assessment)}
            className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-full shadow"
            title="Xóa"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 relative z-10">
        <div>
          <p className="text-sm text-gray-500">Nhân viên thẩm định</p>
          <p className="font-semibold text-blue-700">{assessment.staff?.full_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sản phẩm</p>
          <p className="font-semibold text-blue-700">{assessment.product?.product_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phòng ban</p>
          <p className="font-semibold text-blue-700">{assessment.department}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phí thẩm định</p>
          <p className="font-semibold text-blue-700">{formatCurrency(assessment.fee_amount)}</p>
        </div>
      </div>

      <div className="pt-5 border-t mt-5 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">Trạng thái:</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow
              ${assessment.status === 'approved' && 'bg-green-100 text-green-800'}
              ${assessment.status === 'rejected' && 'bg-red-100 text-red-800'}
              ${assessment.status === 'draft' && 'bg-gray-100 text-gray-800'}
              ${assessment.status === 'in_review' && 'bg-yellow-100 text-yellow-800'}
            `}>
              {assessment.status === 'approved' && 'Đã duyệt'}
              {assessment.status === 'rejected' && 'Từ chối'}
              {assessment.status === 'draft' && 'Bản nháp'} 
              {assessment.status === 'in_review' && 'Đang xem xét'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Cập nhật: {toVNDate(assessment.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
