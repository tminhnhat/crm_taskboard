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
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">
            Thẩm định cho {assessment.customer?.full_name}
          </h3>
          <p className="text-sm text-gray-500">
            {toVNDate(assessment.created_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(assessment)}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(assessment)}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(assessment)}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Nhân viên thẩm định</p>
          <p className="font-medium">{assessment.staff?.full_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sản phẩm</p>
          <p className="font-medium">{assessment.product?.product_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phòng ban</p>
          <p className="font-medium">{assessment.department}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phí thẩm định</p>
          <p className="font-medium">{formatCurrency(assessment.fee_amount)}</p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">Trạng thái:</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
