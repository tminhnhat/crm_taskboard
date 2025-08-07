import { Contract } from '@/lib/supabase'
import { 
  DocumentTextIcon,
  UserIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ContractCardProps {
  contract: Contract
  onEdit: (contract: Contract) => void
  onDelete: (contractId: number) => void
  onStatusChange: (contractId: number, status: string) => void
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800'
}

export default function ContractCard({ contract, onEdit, onDelete, onStatusChange }: ContractCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return 'N/A'
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  const isExpired = () => {
    if (!contract.end_date) return false
    
    // Parse end date safely
    const dateMatch = contract.end_date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
      return endDate < today
    }
    
    return new Date(contract.end_date) < new Date()
  }

  const getDaysRemaining = () => {
    if (!contract.end_date) return null
    
    // Parse end date safely
    const dateMatch = contract.end_date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for consistent calculation
      endDate.setHours(0, 0, 0, 0)
      const diffTime = endDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    
    // Fallback for other date formats
    const endDate = new Date(contract.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {contract.contract_number}
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(contract.contract_credit_limit)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[contract.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
            
            {isExpired() && contract.status === 'active' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Hết Hạn
              </span>
            )}
            
            {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && contract.status === 'active' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <ClockIcon className="h-3 w-3 mr-1" />
                Còn {daysRemaining} ngày
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {contract.customer && (
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Khách hàng: {contract.customer.full_name}</span>
              </div>
            )}
            
            {contract.product && (
              <div className="flex items-center text-sm text-gray-600">
                <CubeIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Sản phẩm: {contract.product.product_name}</span>
                {contract.product.product_type && (
                  <span className="ml-1 text-gray-400">({contract.product.product_type})</span>
                )}
              </div>
            )}
            
            {contract.signed_by_staff && (
              <div className="flex items-center text-sm text-gray-600">
                <IdentificationIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>Người ký: {contract.signed_by_staff.full_name}</span>
                {contract.signed_by_staff.position && (
                  <span className="ml-1 text-gray-400">({contract.signed_by_staff.position})</span>
                )}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span>Hạn mức tín dụng: {formatCurrency(contract.contract_credit_limit)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <span>Thời hạn: {formatDate(contract.start_date)} - {formatDate(contract.end_date)}</span>
            </div>
          </div>

          {contract.metadata && Object.keys(contract.metadata).length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-2">Contract Details:</p>
              <div className="space-y-1">
                {Object.entries(contract.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="text-gray-800">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={contract.status}
            onChange={(e) => onStatusChange(contract.contract_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(contract)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(contract.contract_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
