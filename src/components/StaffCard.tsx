import { Staff } from '@/lib/supabase'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface StaffCardProps {
  staff: Staff
  onEdit: (staff: Staff) => void
  onDelete: (staffId: number) => void
  onStatusChange: (staffId: number, status: string) => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  terminated: 'bg-red-100 text-red-800'
}

export default function StaffCard({ staff, onEdit, onDelete, onStatusChange }: StaffCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{staff.full_name}</h3>
              {staff.position && (
                <p className="text-sm text-gray-600">{staff.position}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[staff.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
            </span>
            {staff.department && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                {staff.department}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {staff.email && (
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <a 
                  href={`mailto:${staff.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {staff.email}
                </a>
              </div>
            )}
            
            {staff.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <a 
                  href={`tel:${staff.phone}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {staff.phone}
                </a>
              </div>
            )}
            
            {staff.position && (
              <div className="flex items-center text-sm text-gray-600">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>{staff.position}</span>
              </div>
            )}
            
            {staff.department && (
              <div className="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span>{staff.department}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={staff.status}
            onChange={(e) => onStatusChange(staff.staff_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="suspended">Tạm Đình Chỉ</option>
            <option value="terminated">Nghỉ Việc</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(staff)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(staff.staff_id)}
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
