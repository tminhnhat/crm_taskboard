'use client'

import { CreditAssessment } from '@/lib/supabase'
import { 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface CreditAssessmentCardProps {
  assessment: CreditAssessment
  onEdit: (assessment: CreditAssessment) => void
  onDelete: (assessmentId: number) => void
}

export default function CreditAssessmentCard({ assessment, onEdit, onDelete }: CreditAssessmentCardProps) {
  const getResultColor = (result: string | null) => {
    if (!result) return 'text-gray-500'
    switch (result.toLowerCase()) {
      case 'approved':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getResultBgColor = (result: string | null) => {
    if (!result) return 'bg-gray-100'
    switch (result.toLowerCase()) {
      case 'approved':
        return 'bg-green-100'
      case 'pending':
        return 'bg-yellow-100'
      default:
        return 'bg-gray-100'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có'
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return 'Không có'
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {assessment.customer?.full_name || `Khách hàng #${assessment.customer_id}`}
          </h3>
          <p className="text-sm text-gray-500">
            Đánh giá #{assessment.assessment_id}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(assessment)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Chỉnh sửa đánh giá"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(assessment.assessment_id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Xóa đánh giá"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="space-y-3">
        {/* Date only */}
        <div>
          <span className="text-sm text-gray-500">Ngày đánh giá:</span>
          <p className="font-medium">{formatDate(assessment.assessment_date)}</p>
        </div>

        {/* Assessment Result */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Kết quả:</span>
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getResultBgColor(
                assessment.assessment_result
              )} ${getResultColor(assessment.assessment_result)}`}
            >
              {assessment.assessment_result === 'approved' ? 'Đã phê duyệt' :
               assessment.assessment_result === 'pending' ? 'Đang chờ' :
               'Đang chờ'}
            </span>
          </div>
        </div>

        {/* Comments */}
        {assessment.comments && (
          <div>
            <span className="text-sm text-gray-500">Nhận xét:</span>
            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
              {assessment.comments}
            </p>
          </div>
        )}

        {/* Documents */}
        {assessment.documents && (
          <div className="flex items-center space-x-2">
            <DocumentArrowDownIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              {assessment.documents}
            </span>
          </div>
        )}

        {/* Metadata */}
        {assessment.metadata && Object.keys(assessment.metadata).length > 0 && (
          <div>
            <span className="text-sm text-gray-500">Thông tin bổ sung:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(assessment.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Tạo ngày {formatDate(assessment.created_at)}
        </p>
      </div>
    </div>
  )
}
