'use client'

import React, { useState } from 'react'
import { Customer } from '@/lib/supabase'
import { toVNDate } from '@/lib/date'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material'
import { 
  Person,
  Business,
  Phone,
  Email,
  LocationOn,
  Badge,
  CalendarToday,
  ExpandMore,
  ExpandLess,
  Edit,
  DeleteOutline,
  Calculate,
  QrCode,
  Psychology,
  Star,
  TrendingUp
} from '@mui/icons-material'
import {
  StyledCard,
  ActionButton,
  InfoBox,
  CardHeader,
  CardActions
} from './StyledComponents'
import { formatCurrency } from '@/lib/profitCalculation'

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
  onGenerateQR?: (customer: Customer) => void
  profitData?: {
    totalProfit: number
    totalLendingProfit: number
    totalCapitalMobilizationProfit: number
    totalFeeProfit: number
    contractCount: number
  } | null
}

const customerTypeIcons = {
  individual: Person,
  business_individual: Person,
  corporate: Business
}

const NumerologyCard = ({ title, value, explanation, meaning, color, icon }: {
  title: string
  value: string | number
  explanation: string
  meaning: string
  color: string
  icon: string
}) => (
  <Box
    sx={{
      p: { xs: 1.5, sm: 2 },
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: `1px solid ${color}`,
      boxShadow: 1,
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 1,
      flexDirection: { xs: 'column', sm: 'row' },
      textAlign: { xs: 'center', sm: 'left' }
    }}>
      <Typography variant="subtitle2" sx={{ 
        fontWeight: 600, 
        color: 'text.primary',
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        mb: { xs: 0.5, sm: 0 }
      }}>
        {icon} {title}
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          color,
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2.125rem' }
        }}
      >
        {value}
      </Typography>
    </Box>
    <Typography variant="caption" sx={{ 
      color: 'text.secondary', 
      fontStyle: 'italic', 
      mb: 1, 
      display: 'block',
      fontSize: { xs: '0.7rem', sm: '0.75rem' }
    }}>
      {explanation}
    </Typography>
    <Box 
      sx={{ 
        p: 1, 
        bgcolor: `${color}15`, 
        borderRadius: 1, 
        border: `1px solid ${color}30` 
      }}
    >
      <Typography variant="caption" sx={{ 
        color, 
        fontWeight: 500,
        fontSize: { xs: '0.7rem', sm: '0.75rem' }
      }}>
        <strong>Ý nghĩa:</strong> {meaning}
      </Typography>
    </Box>
  </Box>
)

export default function CustomerCard({ customer, onEdit, onDelete, onStatusChange, onRecalculateNumerology, onGenerateQR, profitData }: CustomerCardProps) {
  const TypeIcon = customerTypeIcons[customer.customer_type]
  const [showNumerology, setShowNumerology] = useState(false)

  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return ''
    return toVNDate(dateString)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      default: return 'default'
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'primary'
      case 'business_individual': return 'secondary'
      case 'corporate': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <StyledCard>
      <CardContent>
        <CardHeader>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <TypeIcon color="action" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                  {customer.customer_type === 'corporate' ? customer.company_name : customer.full_name}
                </Typography>
                {customer.customer_type === 'corporate' && (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Người đại diện: {customer.legal_representative || 'Chưa cập nhật'}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  Tài khoản: {customer.account_number}
                </Typography>
                {customer.cif_number && (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    CIF: {customer.cif_number}
                  </Typography>
                )}
                {customer.customer_type === 'corporate' && customer.legal_representative_cif_number && (
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    CIF người đại diện: {customer.legal_representative_cif_number}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                mb: 2, 
                flexWrap: 'wrap',
                gap: { xs: 0.5, sm: 1 }
              }}
            >
              <Chip 
                label={customer.customer_type === 'individual' ? 'Cá Nhân' : 'Doanh Nghiệp'}
                color={getCustomerTypeColor(customer.customer_type) as any}
                size="small"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
              <Chip 
                label={customer.status === 'active' ? 'Đang Hoạt Động' : 
                       customer.status === 'inactive' ? 'Không Hoạt Động' : 
                       customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                color={getStatusColor(customer.status) as any}
                size="small"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
              {profitData && profitData.totalProfit > 0 && (
                <Tooltip title={`Lợi nhuận dự tính từ ${profitData.contractCount} hợp đồng`}>
                  <Chip 
                    icon={<TrendingUp />}
                    label={formatCurrency(profitData.totalProfit)}
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: 'success.main'
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
            
            <Stack spacing={1}>
              {customer.phone && (
                <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                  <Phone fontSize="small" />
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {customer.phone}
                  </Typography>
                </InfoBox>
              )}
              {customer.email && (
                <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                  <Email fontSize="small" />
                  <Typography variant="body2" sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>
                    {customer.email}
                  </Typography>
                </InfoBox>
              )}
              {customer.address && (
                <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2" sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>
                    {customer.address}
                  </Typography>
                </InfoBox>
              )}
              {customer.hobby && (
                <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                  <Star fontSize="small" />
                  <Typography variant="body2" sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>
                    Sở thích: {customer.hobby}
                  </Typography>
                </InfoBox>
              )}
              <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Badge fontSize="small" />
                <Box>
                  {customer.customer_type === 'corporate' ? (
                    <Box>
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}>
                        Mã số doanh nghiệp: {customer.business_registration_number || 'Chưa cập nhật'}
                      </Typography>
                      {customer.registration_date && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          (Ngày đăng ký: {formatDateDisplay(customer.registration_date)})
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}>
                        CCCD: {customer.id_number || 'Chưa cập nhật'}
                      </Typography>
                      {customer.id_issue_date && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          (Cấp ngày: {formatDateDisplay(customer.id_issue_date)})
                        </Typography>
                      )}
                      {customer.id_issue_authority && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          wordBreak: 'break-word'
                        }}>
                          Nơi cấp: {customer.id_issue_authority}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </InfoBox>
              {customer.date_of_birth && (
                <InfoBox sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                  <CalendarToday fontSize="small" />
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Ngày sinh: {formatDateDisplay(customer.date_of_birth)}
                  </Typography>
                </InfoBox>
              )}
            </Stack>

            {customer.numerology_data && (
              <Box sx={{ mt: 2 }}>
                <ActionButton
                  startIcon={showNumerology ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowNumerology(!showNumerology)}
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                >
                  <Psychology sx={{ mr: 1 }} />
                  Dữ Liệu Thần Số Học
                  <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                    ({showNumerology ? 'Ẩn' : 'Hiện'})
                  </Typography>
                </ActionButton>
                
                <Collapse in={showNumerology}>
                  <Box sx={{ 
                    mt: 2, 
                    p: { xs: 2, sm: 3 },
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}>
                        🔮 Bản Đồ Thần Số Học
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        Khám phá bản thân qua con số của bạn
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(auto-fit, minmax(280px, 1fr))' 
                      }, 
                      gap: 2 
                    }}>
                      {(() => {
                        const numerology = customer.numerology_data as NumerologyData;
                        const cards = [];
                        
                        if (numerology?.walksOfLife) {
                          cards.push(
                            <NumerologyCard
                              key="walkOfLife"
                              title="Số Đường Đời"
                              value={numerology.walksOfLife}
                              explanation={getNumerologyExplanation('walksOfLife', numerology.walksOfLife)}
                              meaning="Con đường đúng bạn cần lựa chọn để tận dụng nguồn lực vũ trụ hậu thuẫn"
                              color="#1976d2"
                              icon="🛤️"
                            />
                          );
                        }
                        
                        if (numerology?.mission) {
                          cards.push(
                            <NumerologyCard
                              key="mission"
                              title="Số Sứ Mệnh"
                              value={numerology.mission}
                              explanation={getNumerologyExplanation('mission', numerology.mission)}
                              meaning="Mục đích cả đời và nhiệm vụ cần hoàn thành khi đến với cuộc đời này"
                              color="#388e3c"
                              icon="🎯"
                            />
                          );
                        }
                        
                        if (numerology?.soul) {
                          cards.push(
                            <NumerologyCard
                              key="soul"
                              title="Số Nội Tâm"
                              value={numerology.soul}
                              explanation={getNumerologyExplanation('soul', numerology.soul)}
                              meaning="Khát vọng tiềm ẩn bên trong, kim chỉ nam cho quyết định cuộc sống"
                              color="#7b1fa2"
                              icon="💜"
                            />
                          );
                        }
                        
                        const otherFields = [
                          { key: 'personality', title: 'Số Tính Cách', color: '#f57c00', icon: '🎭', meaning: 'Cách thể hiện ra thế giới bên ngoài và ấn tượng với người khác' },
                          { key: 'passion', title: 'Số Đam Mê', color: '#d32f2f', icon: '🔥', meaning: 'Tài năng đặc biệt tiềm ẩn cần rèn luyện và phát triển' },
                          { key: 'connect', title: 'Số Cầu Nối', color: '#00796b', icon: '🔗', meaning: 'Thu hẹp khoảng cách giữa số Đường đời và Sứ mệnh' },
                          { key: 'birthDate', title: 'Số Ngày Sinh', color: '#fbc02d', icon: '🎂', meaning: 'Tiết lộ tài năng rõ ràng và cụ thể nhất của bạn' },
                          { key: 'attitude', title: 'Số Thái Độ', color: '#e91e63', icon: '🎯', meaning: 'Thái độ trong công việc và phản ứng với tình huống' }
                        ];
                        
                        otherFields.forEach(field => {
                          if (numerology?.[field.key]) {
                            cards.push(
                              <NumerologyCard
                                key={field.key}
                                title={field.title}
                                value={numerology[field.key] as string | number}
                                explanation={getNumerologyExplanation(field.key, numerology[field.key] as string | number)}
                                meaning={field.meaning}
                                color={field.color}
                                icon={field.icon}
                              />
                            );
                          }
                        });
                        
                        if (numerology?.missingNumbers) {
                          cards.push(
                            <Box
                              key="missingNumbers"
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                border: '1px solid #616161',
                                boxShadow: 1,
                              }}
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: 1,
                                flexDirection: { xs: 'column', sm: 'row' },
                                textAlign: { xs: 'center', sm: 'left' }
                              }}>
                                <Typography variant="subtitle2" sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                  mb: { xs: 0.5, sm: 0 }
                                }}>
                                  ❌ Số Thiếu
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                  color: '#616161',
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}>
                                  {Array.isArray(numerology.missingNumbers) 
                                    ? numerology.missingNumbers.join(', ') 
                                    : numerology.missingNumbers}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary', 
                                fontStyle: 'italic', 
                                mb: 1, 
                                display: 'block',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }}>
                                Những khía cạnh cần phát triển thêm
                              </Typography>
                              <Box sx={{ p: 1, bgcolor: '#61616115', borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  color: '#616161', 
                                  fontWeight: 500,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}>
                                  <strong>Ý nghĩa:</strong> Lĩnh vực cần nỗ lực học tập để hoàn thiện bản thân
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }
                        
                        return cards;
                      })()}
                    </Box>
                    
                    <Box sx={{ 
                      mt: { xs: 2, sm: 3 }, 
                      p: { xs: 1.5, sm: 2 }, 
                      background: 'linear-gradient(45deg, #e3f2fd 30%, #e8eaf6 90%)',
                      borderRadius: 2,
                      border: '1px solid #1976d2'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#1976d2', 
                        textAlign: 'center', 
                        display: 'block',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        <strong>💡 Lưu ý:</strong> Thần số học chỉ là công cụ tham khảo để hiểu bản thân. 
                        Hãy sử dụng một cách khôn ngoan và phát triển bản thân tích cực.
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </CardHeader>
        
        <CardActions sx={{
          p: 0,
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          justifyContent: { xs: 'flex-start', sm: 'flex-start' }
        }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%', flexWrap: 'wrap', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-start' } }}>
            <ActionButton
              startIcon={<Edit />}
              onClick={() => onEdit(customer)}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 64 }}
            >
              Sửa
            </ActionButton>
            {onRecalculateNumerology && customer.full_name && customer.date_of_birth && (
              <Tooltip title="Tính lại thần số học">
                <IconButton
                  onClick={() => onRecalculateNumerology(customer.customer_id)}
                  color="secondary"
                  size="small"
                  sx={{ alignSelf: 'center' }}
                >
                  <Calculate />
                </IconButton>
              </Tooltip>
            )}
            {onGenerateQR && (
              <Tooltip title="Tạo mã QR thanh toán">
                <IconButton
                  onClick={() => onGenerateQR(customer)}
                  color="success"
                  size="small"
                  sx={{ alignSelf: 'center' }}
                >
                  <QrCode />
                </IconButton>
              </Tooltip>
            )}
            <ActionButton
              startIcon={<DeleteOutline />}
              onClick={() => onDelete(customer.customer_id)}
              color="error"
              variant="outlined"
              size="small"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, minWidth: 64 }}
            >
              Xóa
            </ActionButton>
          </Stack>
        </CardActions>
      </CardContent>
    </StyledCard>
  )
}
