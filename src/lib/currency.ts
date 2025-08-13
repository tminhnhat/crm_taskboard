export const numberToWordsVN = (value: number, type: 'currency' | 'area' = 'currency'): string => {
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const positions = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  
  // Hàm đọc block 3 số
  const readBlock = (block: number): string => {
    const hundred = Math.floor(block / 100)
    const ten = Math.floor((block % 100) / 10)
    const one = block % 10
    
    let result = ''
    
    if (hundred > 0) {
      result += units[hundred] + ' trăm '
    }
    
    if (ten > 0) {
      if (ten === 1) {
        result += 'mười '
      } else {
        result += units[ten] + ' mươi '
      }
      
      if (one === 1) {
        result += 'mốt'
      } else if (one === 5 && ten > 0) {
        result += 'lăm'
      } else if (one > 0) {
        result += units[one]
      }
    } else if (one > 0) {
      if (hundred > 0) { // Nếu có hàng trăm
        result += 'lẻ '
      }
      result += units[one]
    }
    
    return result.trim()
  }

  // Xử lý số 0
  if (value === 0) {
    return type === 'currency' ? 'Không đồng' : 'Không mét vuông'
  }
  
  // Xử lý số âm
  if (value < 0) {
    return 'Âm ' + numberToWordsVN(Math.abs(value), type).toLowerCase()
  }

  let numberToConvert = value
  let decimalPart = ''

  // Xử lý số thập phân cho diện tích
  if (type === 'area' && !Number.isInteger(value)) {
    const decimal = Math.round((value % 1) * 100) / 100
    if (decimal > 0) {
      const decimalStr = decimal.toString().split('.')[1]
      if (decimalStr) {
        const decimalNumber = parseInt(decimalStr.padEnd(2, '0').substring(0, 2))
        if (decimalNumber > 0) {
          decimalPart = ' phẩy ' + readBlock(decimalNumber)
        }
      }
    }
    numberToConvert = Math.floor(value)
  }

  // Tách số thành các block 3 chữ số
  const blocks: number[] = []
  let remaining = numberToConvert
  while (remaining > 0) {
    blocks.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }

  // Nếu không có block nào (số 0)
  if (blocks.length === 0) {
    blocks.push(0)
  }

  // Đọc từng block và ghép với đơn vị
  let result = ''
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i] > 0 || i === blocks.length - 1) {
      result += readBlock(blocks[i]) + ' ' + positions[i] + ' '
    }
  }

  // Viết hoa chữ cái đầu tiên và thêm đơn vị
  result = result.trim()
  return result.charAt(0).toUpperCase() + result.slice(1) + decimalPart + (type === 'area' ? ' mét vuông' : ' đồng')
}

export const formatMoneyToWords = (value: number): string => {
  try {
    return numberToWordsVN(value, 'currency')
  } catch (error) {
    console.error('Error converting number to words:', error)
    return 'Không thể chuyển đổi số thành chữ'
  }
}

export const formatAreaToWords = (value: number): string => {
  try {
    return numberToWordsVN(value, 'area')
  } catch (error) {
    console.error('Error converting area to words:', error)
    return 'Không thể chuyển đổi diện tích thành chữ'
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}
