export const numberToWordsVN = (number: number): string => {
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const positions = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  
  // Xử lý số 0
  if (number === 0) return 'Không đồng'
  
  // Xử lý số âm
  if (number < 0) return 'Âm ' + numberToWordsVN(Math.abs(number)).toLowerCase()
  
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
  
  // Tách số thành các block 3 chữ số
  const blocks: number[] = []
  let remaining = number
  while (remaining > 0) {
    blocks.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }
  
  // Đọc từng block và ghép với đơn vị
  let result = ''
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i] > 0) {
      result += readBlock(blocks[i]) + ' ' + positions[i] + ' '
    } else if (i === blocks.length - 1) {
      // Trường hợp block cuối = 0
      result += readBlock(blocks[i]) + ' ' + positions[i] + ' '
    }
  }
  
  // Viết hoa chữ cái đầu tiên
  result = result.trim()
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
}

export const formatMoneyToWords = (value: number): string => {
  try {
    return numberToWordsVN(value)
  } catch (error) {
    console.error('Error converting number to words:', error)
    return 'Không thể chuyển đổi số thành chữ'
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}
