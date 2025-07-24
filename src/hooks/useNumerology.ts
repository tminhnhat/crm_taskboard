import { useState, useCallback } from 'react'
import { calculateNumerologyData } from '@/lib/numerology'

interface NumerologyHookResult {
  isCalculating: boolean
  numerologyData: Record<string, unknown> | null
  error: string | null
  calculateNumerology: (fullName: string, birthDate: string) => Promise<void>
  clearData: () => void
  formatForDisplay: () => string
}

/**
 * Custom hook for numerology calculations
 * Provides a clean interface for calculating and managing numerology data
 */
export function useNumerology(): NumerologyHookResult {
  const [isCalculating, setIsCalculating] = useState(false)
  const [numerologyData, setNumerologyData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateNumerology = useCallback(async (fullName: string, birthDate: string) => {
    if (!fullName || !birthDate) {
      setError('Vui lòng cung cấp đầy đủ họ tên và ngày sinh')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      // Convert dd/mm/yyyy to ISO format if needed
      let isoDate = birthDate
      if (birthDate.includes('/')) {
        const [day, month, year] = birthDate.split('/')
        if (!day || !month || !year) {
          throw new Error('Định dạng ngày sinh không hợp lệ')
        }
        isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      // Calculate numerology data using the existing library
      const rawData = calculateNumerologyData(fullName, isoDate)
      
      // Transform to a more user-friendly format
      const transformedData = {
        // Core numbers
        walksOfLife: rawData.walksOfLife || rawData.duongdoi,
        mission: rawData.mission || rawData.sumeng,
        soul: rawData.soul || rawData.linhhon,
        personality: rawData.personality || rawData.nhancach,
        birthDate: rawData.birthDate || rawData.ngaysinh,
        attitude: rawData.attitude || rawData.thaido,
        
        // Additional numbers
        passion: rawData.passion || rawData.damme,
        connect: rawData.connect || rawData.cauno,
        balance: rawData.balance || rawData.canbangtrongkhokhan,
        maturity: rawData.maturity || rawData.truongthanh,
        supplement: rawData.supplement || rawData.bosung,
        
        // Analysis data
        missingNumbers: rawData.missingNumbers || rawData.sothieu || [],
        yearIndividual: rawData.yearIndividual || rawData.namcanhan,
        monthIndividual: rawData.monthIndividual || rawData.thangcanhan,
        
        // Meta data
        calculatedAt: new Date().toISOString(),
        calculatedFor: fullName,
        birthDate: birthDate,
        note: `Tính toán thần số học cho ${fullName} sinh ngày ${birthDate}`,
        
        // Keep original data for reference
        _originalData: rawData
      }

      setNumerologyData(transformedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tính toán thần số học'
      setError(errorMessage)
      console.error('Numerology calculation error:', err)
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setNumerologyData(null)
    setError(null)
  }, [])

  const formatForDisplay = useCallback(() => {
    if (!numerologyData) return ''
    return JSON.stringify(numerologyData, null, 2)
  }, [numerologyData])

  return {
    isCalculating,
    numerologyData,
    error,
    calculateNumerology,
    clearData,
    formatForDisplay
  }
}

/**
 * Get explanation for a numerology number
 */
export function getNumerologyExplanation(type: string, value: number | string): string {
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
      9: "Người nhân đạo, rộng lượng, phục vụ - Sứ mệnh cống hiến cho cộng đồng",
      11: "Người trực giác cao, thần bí, truyền cảm hứng - Số bậc thầy về tâm linh",
      22: "Người xây dựng vĩ đại, thực hiện ước mơ lớn - Số bậc thầy về vật chất",
      33: "Người thầy vĩ đại, yêu thương vô điều kiện - Số bậc thầy về tình yêu"
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

/**
 * Get numerology field definitions for documentation
 */
export function getNumerologyDefinitions() {
  return {
    coreNumbers: {
      walksOfLife: {
        name: "Số Đường Đời",
        description: "Số quan trọng nhất, cho thấy con đường đúng bạn cần lựa chọn để tận dụng nguồn lực vũ trụ hậu thuẫn"
      },
      mission: {
        name: "Số Sứ Mệnh", 
        description: "Mục đích cả đời và nhiệm vụ bạn cần hoàn thành khi đến với cuộc đời này"
      },
      soul: {
        name: "Số Nội Tâm",
        description: "Khát vọng tiềm ẩn bên trong, kim chỉ nam cho nhiều quyết định trong đời sống"
      },
      personality: {
        name: "Số Tính Cách",
        description: "Cách người khác nhìn thấy bạn qua lời nói, cử chỉ, hành động và tương tác"
      },
      birthDate: {
        name: "Số Ngày Sinh",
        description: "Tiết lộ tài năng mà bạn đang sở hữu một cách rõ ràng và cụ thể nhất"
      },
      attitude: {
        name: "Số Thái Độ",
        description: "Ấn tượng đầu tiên người khác có được khi tiếp xúc với bạn"
      }
    },
    additionalNumbers: {
      passion: {
        name: "Số Đam Mê Tiềm Ẩn",
        description: "Tiết lộ tài năng đặc biệt cần được rèn luyện và trải nghiệm"
      },
      connect: {
        name: "Số Cầu Nối", 
        description: "Giúp kết nối các số lõi để tạo sự nhất quán và đồng bộ"
      },
      balance: {
        name: "Số Cân Bằng",
        description: "Cách tốt nhất để lấy lại cân bằng trong các tình huống khó khăn"
      },
      maturity: {
        name: "Số Trưởng Thành",
        description: "Mục tiêu cuối cùng và tiềm năng trong tương lai của cuộc đời"
      }
    }
  }
}
