import { Opportunity } from '@/lib/supabase'
import { 
  CurrencyDollarIcon,
  UserIcon,
  CubeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface OpportunityCardProps {
  opportunity: Opportunity
  onEdit: (opportunity: Opportunity) => void
  onDelete: (opportunityId: number) => void
  onStatusChange: (opportunityId: number, status: string) => void
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
}

const statusLabels = {
  new: 'Mới',
  in_progress: 'Đang Thực Hiện',
  won: 'Thành Công',
  lost: 'Thất Bại'
}

export default function OpportunityCard({ opportunity, onEdit, onDelete, onStatusChange }: OpportunityCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {opportunity.customer?.full_name} - {opportunity.product?.product_name}
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(opportunity.expected_value)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[opportunity.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[opportunity.status as keyof typeof statusLabels] || opportunity.status}
            </span>
          </div>
          
          <div className="space-y-2">
            {opportunity.customer && (
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Khách hàng: {opportunity.customer.full_name}</span>
              </div>
            )}
            
            {opportunity.product && (
              <div className="flex items-center text-sm text-gray-600">
                <CubeIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Sản phẩm: {opportunity.product.product_name}</span>
                {opportunity.product.product_type && (
                  <span className="ml-1 text-gray-400">({opportunity.product.product_type})</span>
                )}
              </div>
            )}
            
            {opportunity.staff && (
              <div className="flex items-center text-sm text-gray-600">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Người phụ trách: {opportunity.staff.full_name}</span>
                {opportunity.staff.position && (
                  <span className="ml-1 text-gray-400">({opportunity.staff.position})</span>
                )}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span>Ngày tạo: {formatDate(opportunity.created_at)}</span>
            </div>
            
            {opportunity.closed_at && (
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Ngày đóng: {formatDate(opportunity.closed_at)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={opportunity.status}
            onChange={(e) => onStatusChange(opportunity.opportunity_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="new">Mới</option>
            <option value="in_progress">Đang Thực Hiện</option>
            <option value="won">Thành Công</option>
            <option value="lost">Thất Bại</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(opportunity)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(opportunity.opportunity_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
