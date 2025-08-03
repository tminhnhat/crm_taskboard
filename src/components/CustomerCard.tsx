'use client'

import { useState } from 'react'
import { Customer } from '@/lib/supabase'
import { 
  UserIcon, 
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

// Interface for numerology data structure
interface NumerologyData {
  walksOfLife?: number | string
  mission?: number | string
  soul?: number | string
  connect?: number | string
  personality?: number | string
  passion?: number | string
  birthDate?: number | string
  attitude?: number | string
  missingNumbers?: number[] | string[] | string
  calculatedAt?: string
  note?: string
  [key: string]: unknown
}

// Helper function to get numerology explanations
const getNumerologyExplanation = (type: string, value: number | string): string => {
  const numValue = typeof value === 'string' ? parseInt(value) : value
  
  const explanations: Record<string, Record<number, string>> = {
    walksOfLife: {
      1: "Người lãnh đạo, độc lập, tiên phong - Con đường đúng cần lựa chọn để tận dụng nguồn lực vũ trụ",
      2: "Người hợp tác, nhạy cảm, hòa bình - Khả năng kết nối và làm việc nhóm xuất sắc", 
      3: "Người sáng tạo, giao tiếp, lạc quan - Tài năng nghệ thuật và truyền đạt ý tưởng",
      4: "Người thực tế, có tổ chức, kiên nhẫn - Khả năng xây dựng nền tảng vững chắc",
      5: "Người tự do, phiêu lưu, đa dạng - Tinh thần khám phá và thích nghi cao",
      6: "Người nuôi dưỡng, trách nhiệm, yêu thương - Tài năng chăm sóc và hỗ trợ người khác",
      7: "Người tâm linh, tư duy sâu sắc, nghiên cứu - Khả năng phân tích và tìm hiểu bản chất",
      8: "Người thành đạt, quyền lực, vật chất - Tài năng kinh doanh và quản lý",
      9: "Người nhân đạo, rộng lượng, phục vụ - Sứ mệnh cống hiến cho cộng đồng"
    },
    mission: {
      1: "Sứ mệnh dẫn dắt và đi tiên phong - Mục đích cả đời là trở thành người lãnh đạo",
      2: "Sứ mệnh hợp tác và hòa giải - Nhiệm vụ kết nối và tạo sự hài hòa",
      3: "Sứ mệnh truyền cảm hứng và sáng tạo - Mang niềm vui và nghệ thuật đến với mọi người",
      4: "Sứ mệnh xây dựng và tổ chức - Tạo ra những nền tảng vững chắc cho xã hội",
      5: "Sứ mệnh khám phá và tự do - Mở rộng biên giới và trải nghiệm mới",
      6: "Sứ mệnh chăm sóc và yêu thương - Nuôi dưỡng và bảo vệ những gì quý giá",
      7: "Sứ mệnh tìm hiểu và truyền đạt tri thức - Khám phá chân lý và chia sẻ hiểu biết",
      8: "Sứ mệnh thành đạt và quản lý - Tạo ra thành công vật chất và tinh thần",
      9: "Sứ mệnh phục vụ nhân loại - Cống hiến cho sự phát triển của toàn thể"
    },
    soul: {
      1: "Khát vọng được lãnh đạo và độc lập - Mong muốn tự chủ và dẫn dắt",
      2: "Khát vọng hòa bình và kết nối - Khao khát sự hài hòa trong mối quan hệ",
      3: "Khát vọng thể hiện bản thân và sáng tạo - Nhu cầu biểu đạt và nghệ thuật",
      4: "Khát vọng ổn định và bảo mật - Mong muốn có cuộc sống an toàn, có kế hoạch",
      5: "Khát vọng tự do và trải nghiệm - Khao khát khám phá và phiêu lưu",
      6: "Khát vọng yêu thương và được yêu thương - Nhu cầu cho đi và nhận lại tình cảm",
      7: "Khát vọng hiểu biết và tâm linh - Tìm kiếm ý nghĩa sâu sắc của cuộc sống",
      8: "Khát vọng thành công và quyền lực - Mong muốn đạt được địa vị và ảnh hưởng",
      9: "Khát vọng cống hiến cho xã hội - Ước muốn làm điều gì đó có ý nghĩa cho nhân loại"
    },
    personality: {
      1: "Thể hiện sự tự tin, quyết đoán và tinh thần lãnh đạo mạnh mẽ",
      2: "Thể hiện sự nhạy cảm, hợp tác và khả năng lắng nghe tốt",
      3: "Thể hiện sự vui vẻ, hài hước và khả năng giao tiếp xuất sắc",
      4: "Thể hiện sự đáng tin cậy, thực tế và có tổ chức cao",
      5: "Thể hiện sự năng động, linh hoạt và thích thay đổi",
      6: "Thể hiện sự ấm áp, chu đáo và tinh thần trách nhiệm",
      7: "Thể hiện sự trầm tĩnh, thông thái và thích suy ngẫm",
      8: "Thể hiện sự quyền uy, tham vọng và khả năng kinh doanh",
      9: "Thể hiện sự rộng lượng, bao dung và tinh thần phục vụ"
    },
    passion: {
      1: "Đam mê lãnh đạo, khởi nghiệp và tạo ra những điều mới mẻ",
      2: "Đam mê hợp tác, hỗ trợ và tạo ra sự hài hòa",
      3: "Đam mê nghệ thuật, sáng tạo và truyền đạt",
      4: "Đam mê xây dựng, tổ chức và hoàn thiện hệ thống",
      5: "Đam mê khám phá, du lịch và trải nghiệm mới",
      6: "Đam mê chăm sóc, giáo dục và phát triển con người",
      7: "Đam mê nghiên cứu, học hỏi và tìm hiểu chân lý",
      8: "Đam mê kinh doanh, quản lý và tạo ra thành công",
      9: "Đam mê phục vụ cộng đồng và tạo ra tác động tích cực"
    }
  }
  
  return explanations[type]?.[numValue] || `Số ${value} - Khám phá thêm về ý nghĩa đặc biệt này`
}

interface CustomerCardProps {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customerId: number) => void
  onStatusChange: (customerId: number, status: string) => void
  onRecalculateNumerology?: (customerId: number) => void
}

const customerTypeColors = {
  individual: 'bg-blue-100 text-blue-800',
  corporate: 'bg-purple-100 text-purple-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

const customerTypeIcons = {
  individual: UserIcon,
  corporate: BuildingOfficeIcon
}

export default function CustomerCard({ customer, onEdit, onDelete, onStatusChange, onRecalculateNumerology }: CustomerCardProps) {
  const TypeIcon = customerTypeIcons[customer.customer_type]
  const [showNumerology, setShowNumerology] = useState(false)

  // Helper function to format dates safely, avoiding timezone issues
  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return ''
    
    // Parse the date string directly as local date components to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return ''
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <TypeIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {customer.customer_type === 'corporate' ? customer.company_name : customer.full_name}
              </h3>
              {customer.customer_type === 'corporate' && (
                <p className="text-sm text-gray-600">Người đại diện: {customer.legal_representative || 'Chưa cập nhật'}</p>
              )}
              <p className="text-sm text-gray-600">Tài khoản: {customer.account_number}</p>
              {customer.cif_number && (
                <p className="text-sm text-gray-600">CIF: {customer.cif_number}</p>
              )}
              {customer.customer_type === 'corporate' && customer.legal_representative_cif_number && (
                <p className="text-sm text-gray-600">CIF người đại diện: {customer.legal_representative_cif_number}</p>
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
            {customer.hobby && (
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Sở thích: {customer.hobby}
              </div>
            )}
            <div className="flex items-center">
                <IdentificationIcon className="h-4 w-4 mr-2" />
                <div>
                  {customer.customer_type === 'corporate' ? (
                    <>
                      <span>
                        Mã số doanh nghiệp: {customer.business_registration_number || 'Chưa cập nhật'}
                      </span>
                      {customer.registration_date && (
                        <span className="text-gray-500 ml-2">
                          (Ngày đăng ký: {customer.registration_date})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>
                        CMND/CCCD: {customer.id_number || 'Chưa cập nhật'}
                      </span>
                      {customer.id_issue_date && (
                        <span className="text-gray-500 ml-2">
                          (Cấp ngày: {formatDateDisplay(customer.id_issue_date)})
                        </span>
                      )}
                      {customer.id_issue_authority && (
                        <div className="text-gray-500 text-xs ml-4">
                          Nơi cấp: {customer.id_issue_authority}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            {customer.date_of_birth && (
              <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Ngày sinh: {formatDateDisplay(customer.date_of_birth)}
              </div>
            )}
          </div>

          {customer.numerology_data && (
            <div className="mt-3">
              <button
                onClick={() => setShowNumerology(!showNumerology)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 -ml-1"
              >
                {showNumerology ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                Dữ Liệu Thần Số Học
                <span className="text-xs text-gray-500 ml-1">
                  ({showNumerology ? 'Ẩn' : 'Hiện'})
                </span>
              </button>
              
              {showNumerology && (
                <div className="mt-2 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <div className="space-y-4 text-sm">
                    {(() => {
                      const numerology = customer.numerology_data as NumerologyData;
                      
                      return (
                        <>
                          <div className="text-center mb-3">
                            <h4 className="font-semibold text-gray-800 text-base">🔮 Bản Đồ Thần Số Học</h4>
                            <p className="text-xs text-gray-600 mt-1">Khám phá bản thân qua con số của bạn</p>
                          </div>
                          
                          {/* Path of Life */}
                          {numerology?.walksOfLife && (
                            <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🛤️ Số Đường Đời:</span>
                                <span className="font-bold text-2xl text-blue-600">{numerology.walksOfLife}</span>
                              </div>
                              <p className="text-xs text-gray-600 italic">
                                {getNumerologyExplanation('walksOfLife', numerology.walksOfLife)}
                              </p>
                              <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                <strong>Ý nghĩa:</strong> Con đường đúng bạn cần lựa chọn để tận dụng nguồn lực vũ trụ hậu thuẫn
                              </div>
                            </div>
                          )}
                          
                          {/* Mission */}
                          {numerology?.mission && (
                            <div className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">🎯 Số Sứ Mệnh:</span>
                                <span className="font-bold text-2xl text-green-600">{numerology.mission}</span>
                              </div>
                              <p className="text-xs text-gray-600 italic">
                                {getNumerologyExplanation('mission', numerology.mission)}
                              </p>
                              <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                                <strong>Ý nghĩa:</strong> Mục đích cả đời và nhiệm vụ cần hoàn thành khi đến với cuộc đời này
                              </div>
                            </div>
                          )}
                          
                          {/* Soul */}
                          {numerology?.soul && (
                            <div className="p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">💜 Số Nội Tâm:</span>
                                <span className="font-bold text-2xl text-purple-600">{numerology.soul}</span>
                              </div>
                              <p className="text-xs text-gray-600 italic">
                                {getNumerologyExplanation('soul', numerology.soul)}
                              </p>
                              <div className="mt-2 text-xs text-purple-700 bg-purple-50 p-2 rounded">
                                <strong>Ý nghĩa:</strong> Khát vọng tiềm ẩn bên trong, kim chỉ nam cho quyết định cuộc sống
                              </div>
                            </div>
                          )}
                          
                          {/* Other numerology data */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Personality */}
                            {numerology?.personality && (
                              <div className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">🎭 Số Tính Cách:</span>
                                  <span className="font-bold text-2xl text-orange-600">{numerology.personality}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  {getNumerologyExplanation('personality', numerology.personality)}
                                </p>
                                <div className="mt-2 text-xs text-orange-700 bg-orange-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Cách thể hiện ra thế giới bên ngoài và ấn tượng với người khác
                                </div>
                              </div>
                            )}
                            
                            {/* Passion */}
                            {numerology?.passion && (
                              <div className="p-3 bg-white rounded-lg border border-red-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">🔥 Số Đam Mê:</span>
                                  <span className="font-bold text-2xl text-red-600">{numerology.passion}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  {getNumerologyExplanation('passion', numerology.passion)}
                                </p>
                                <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Tài năng đặc biệt tiềm ẩn cần rèn luyện và phát triển
                                </div>
                              </div>
                            )}
                            
                            {/* Connection */}
                            {numerology?.connect && (
                              <div className="p-3 bg-white rounded-lg border border-teal-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">🔗 Số Cầu Nối:</span>
                                  <span className="font-bold text-2xl text-teal-600">{numerology.connect}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  Kết nối các số lõi để tạo sự nhất quán
                                </p>
                                <div className="mt-2 text-xs text-teal-700 bg-teal-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Thu hẹp khoảng cách giữa số Đường đời và Sứ mệnh
                                </div>
                              </div>
                            )}
                            
                            {/* Missing Numbers */}
                            {numerology?.missingNumbers && (
                              <div className="p-3 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">❌ Số Thiếu:</span>
                                  <span className="font-bold text-gray-600">
                                    {Array.isArray(numerology.missingNumbers) 
                                      ? numerology.missingNumbers.join(', ') 
                                      : numerology.missingNumbers}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  Những khía cạnh cần phát triển thêm
                                </p>
                                <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Lĩnh vực cần nỗ lực học tập để hoàn thiện bản thân
                                </div>
                              </div>
                            )}
                            
                            {/* Birth Date Number */}
                            {numerology?.birthDate && (
                              <div className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">🎂 Số Ngày Sinh:</span>
                                  <span className="font-bold text-2xl text-yellow-600">{numerology.birthDate}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  Tài năng tự nhiên từ khi sinh ra
                                </p>
                                <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Tiết lộ tài năng rõ ràng và cụ thể nhất của bạn
                                </div>
                              </div>
                            )}
                            
                            {/* Attitude Number */}
                            {numerology?.attitude && (
                              <div className="p-3 bg-white rounded-lg border border-pink-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-700">🎯 Số Thái Độ:</span>
                                  <span className="font-bold text-2xl text-pink-600">{numerology.attitude}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">
                                  Ấn tượng đầu tiên với người khác
                                </p>
                                <div className="mt-2 text-xs text-pink-700 bg-pink-50 p-2 rounded">
                                  <strong>Ý nghĩa:</strong> Thái độ trong công việc và phản ứng với tình huống
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800 text-center">
                              <strong>💡 Lưu ý:</strong> Thần số học chỉ là công cụ tham khảo để hiểu bản thân. 
                              Hãy sử dụng một cách khôn ngoan và phát triển bản thân tích cực.
                            </p>
                          </div>
                          
                          {/* Additional info if no specific fields are available */}
                          {!numerology?.walksOfLife && 
                           !numerology?.mission && 
                           !numerology?.soul && 
                           !numerology?.connect && 
                           !numerology?.personality && 
                           !numerology?.passion && 
                           !numerology?.missingNumbers && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-yellow-800 text-xs text-center">
                                📊 Dữ liệu thần số học có thể cần được tính toán lại. Nhấn nút 🔢 để cập nhật.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
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
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(customer)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            {onRecalculateNumerology && customer.full_name && customer.date_of_birth && (
              <button
                onClick={() => onRecalculateNumerology(customer.customer_id)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium ml-2"
                title="Tính lại thần số học"
              >
                🔢
              </button>
            )}
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
