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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{assessment.customer?.full_name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <span className="text-sm text-gray-500 font-medium">Ngày tạo: {toVNDate(assessment.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(assessment)}
            className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onEdit(assessment)}
            className="p-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-md group"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(assessment)}
            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-md group"
            title="Xóa"
          >
            <TrashIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">👨‍💼 Nhân viên thẩm định</p>
          <p className="text-sm text-gray-900 font-bold">{assessment.staff?.full_name}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🏦 Sản phẩm</p>
          <p className="text-sm text-gray-900 font-bold">{assessment.product?.product_name}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🏢 Phòng ban</p>
          <p className="text-sm text-gray-900 font-bold">{assessment.department}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💰 Phí thẩm định</p>
          <p className="text-sm text-gray-900 font-bold">{formatCurrency(assessment.fee_amount)}</p>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái:</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
              assessment.status === 'approve' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg' 
                : assessment.status === 'rejected' 
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400 shadow-lg'
                : assessment.status === 'draft' 
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300 shadow-lg'
                : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-yellow-300 shadow-lg'
            }`}>
              {assessment.status === 'approve' && '✅ Đã duyệt'}
              {assessment.status === 'rejected' && '❌ Từ chối'}
              {assessment.status === 'draft' && '📝 Bản nháp'} 
              {assessment.status === 'in_review' && '⏳ Đang xem xét'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Cập nhật</p>
            <p className="text-xs text-gray-700 font-bold">{toVNDate(assessment.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
