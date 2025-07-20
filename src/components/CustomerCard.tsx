import { Customer, CustomerType } from '@/lib/supabase'
import { 
  UserIcon, 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

interface CustomerCardProps {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customerId: number) => void
  onStatusChange: (customerId: number, status: string) => void
}

const customerTypeColors = {
  individual: 'bg-blue-100 text-blue-800',
  corporate: 'bg-purple-100 text-purple-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800'
}

const customerTypeIcons = {
  individual: UserIcon,
  corporate: BuildingOfficeIcon
}

export default function CustomerCard({ customer, onEdit, onDelete, onStatusChange }: CustomerCardProps) {
  const TypeIcon = customerTypeIcons[customer.customer_type]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <TypeIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{customer.full_name}</h3>
              <p className="text-sm text-gray-600">Tài khoản: {customer.account_number}</p>
              {customer.cif_number && (
                <p className="text-sm text-gray-600">CIF: {customer.cif_number}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerTypeColors[customer.customer_type]}`}>
              {customer.customer_type === 'individual' ? 'Cá Nhân' : 'Doanh Nghiệp'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {customer.status === 'active' ? 'Đang Hoạt Động' : 
               customer.status === 'inactive' ? 'Không Hoạt Động' : 
               customer.status === 'suspended' ? 'Tạm Dừng' : 
               customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            {customer.phone && (
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
            )}
            {customer.address && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {customer.address}
              </div>
            )}
            {customer.id_number && (
              <div className="flex items-center">
                <IdentificationIcon className="h-4 w-4 mr-2" />
                CMND/CCCD: {customer.id_number}
              </div>
            )}
            {customer.date_of_birth && (
              <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Ngày sinh: {new Date(customer.date_of_birth).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>

          {customer.numerology_data && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-1">Dữ Liệu Thần Số Học:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(customer.numerology_data, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={customer.status}
            onChange={(e) => onStatusChange(customer.customer_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="suspended">Tạm Dừng</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(customer)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(customer.customer_id)}
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
