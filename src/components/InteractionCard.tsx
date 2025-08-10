import { Interaction } from '@/lib/supabase'
import { 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface InteractionCardProps {
  interaction: Interaction
  onEdit: (interaction: Interaction) => void
  onDelete: (interactionId: number) => void
}

const typeIcons = {
  call: PhoneIcon,
  email: EnvelopeIcon,
  meeting: VideoCameraIcon,
  chat: ChatBubbleLeftRightIcon,
  visit: UserIcon,
  default: ChatBubbleLeftRightIcon
}

const typeColors = {
  call: 'bg-green-100 text-green-800',
  email: 'bg-blue-100 text-blue-800',
  meeting: 'bg-purple-100 text-purple-800',
  chat: 'bg-yellow-100 text-yellow-800',
  visit: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800'
}

export default function InteractionCard({ interaction, onEdit, onDelete }: InteractionCardProps) {
  const IconComponent = typeIcons[interaction.interaction_type as keyof typeof typeIcons] || typeIcons.default
  const colorClass = typeColors[interaction.interaction_type as keyof typeof typeColors] || typeColors.default
  
  const formatDate = (dateString: string) => {
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) {
      const date = new Date(dateString)
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
    
    const [, year, month, day] = dateMatch
    const date = new Date(dateString)
    return {
      date: `${day}/${month}/${year}`,
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const { date, time } = formatDate(interaction.interaction_date)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <IconComponent className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                  {interaction.interaction_type ? (interaction.interaction_type.charAt(0).toUpperCase() + interaction.interaction_type.slice(1)) : 'Chưa xác định'}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  {date}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {time}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Khách hàng:</span>
                <p className="text-gray-900">{interaction.customer?.full_name || 'Khách hàng chưa xác định'}</p>
                {interaction.customer?.email && (
                  <p className="text-gray-600">{interaction.customer.email}</p>
                )}
              </div>
              <div>
                <span className="font-medium text-gray-700">Nhân viên:</span>
                <p className="text-gray-900">{interaction.staff?.full_name || 'Nhân viên chưa xác định'}</p>
                {interaction.staff?.position && (
                  <p className="text-gray-600">{interaction.staff.position}</p>
                )}
              </div>
            </div>
          </div>
          
          {interaction.notes && (
            <div className="mb-4">
              <span className="font-medium text-gray-700 text-sm">Ghi chú:</span>
              <p className="text-gray-900 mt-1 text-sm leading-relaxed">
                {interaction.notes}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => onEdit(interaction)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
          >
            Sửa
          </button>
          <button
            onClick={() => onDelete(interaction.interaction_id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
