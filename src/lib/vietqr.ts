import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import * as QRCode from 'qrcode';

// VietQR Bank codes
const BANK_CODES = {
  VIETINBANK: 'VTB',
  TECHCOMBANK: 'TCB',
  VIETCOMBANK: 'VCB',
  BIDV: 'BIDV',
  AGRIBANK: 'AGB',
  MBBANK: 'MBB',
  VPBANK: 'VPB',
  SACOMBANK: 'STB'
};

export interface VietQRData {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
  template?: string;
}

export interface QRImageOptions {
  backgroundColor?: string;
  qrSize?: number;
  fontSize?: {
    title: number;
    header: number;
    content: number;
    small: number;
  };
  colors?: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
}

// A6 size in pixels at 300 DPI (4.1" x 5.8" = 1230 x 1740 pixels)
const A6_WIDTH = 1230;
const A6_HEIGHT = 1740;

/**
 * Generate VietQR payment string according to VietQR standard (similar to toolqr.html)
 */
export function generateVietQRString(data: VietQRData): string {
  const {
    bankCode,
    accountNumber,
    accountName,
    amount = 0,
    description = '',
    template = 'QY3QZ1v'
  } = data;

  // Use VietQR.io API format (same as toolqr.html)
  const baseUrl = 'https://img.vietqr.io/image/';
  const qrUrl = `${baseUrl}970415-${accountNumber}-${template}.jpg`;
  
  return qrUrl;
}

/**
 * Generate VietQR URL for account (same logic as toolqr.html)
 */
export function qrUrlFromAccount(accountNumber: string): string {
  const clean = (accountNumber || '').replace(/\D/g, ''); // chỉ giữ số
  if (!clean) return '';
  return `https://img.vietqr.io/image/970415-${clean}-QY3QZ1v.jpg`;
}

/**
 * Generate EMVCo compliant QR string for Vietnamese banks
 */
function generateEMVCoQRString(data: VietQRData): string {
  const { bankCode, accountNumber, accountName, amount = 0, description = '' } = data;
  
  // EMVCo QR Code format for VietQR
  // This is a simplified version - in production, use official VietQR library
  const qrString = `00020101021238570010A00000072701270006${bankCode}01${accountNumber.length.toString().padStart(2, '0')}${accountNumber}0208QRIBFTTA53037040${amount > 0 ? `54${amount.toString().length.toString().padStart(2, '0')}${amount}` : ''}5802VN62${(description.length + 4).toString().padStart(2, '0')}0208${description}6304`;
  
  // Calculate CRC16 checksum (simplified)
  const checksum = calculateCRC16(qrString);
  
  return qrString + checksum;
}

/**
 * Simple CRC16 calculation (for demo purposes)
 */
function calculateCRC16(data: string): string {
  // This is a simplified version - use proper CRC16 calculation in production
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (crc >> 1) ^ 0x8408 : crc >> 1;
    }
  }
  return (~crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Create A6 payment QR code image with VietinBank styling (similar to toolqr.html)
 */
export async function createPaymentQRImage(
  qrData: VietQRData,
  options: QRImageOptions = {}
): Promise<Buffer> {
  const {
    backgroundColor = '#bfe8ff',
    qrSize = 380,
    fontSize = {
      title: 40,
      header: 30,
      content: 24,
      small: 18
    },
    colors = {
      primary: '#134a7c',
      secondary: '#0b7cc2', 
      text: '#134a7c',
      accent: '#355a78'
    }
  } = options;

  // Create canvas (using 680x1020 to match toolqr.html card dimensions)
  const canvas = createCanvas(680, 1020);
  const ctx = canvas.getContext('2d');

  // Set background with VietinBank gradient
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 680, 1020);

  // Generate QR code using VietQR API format
  const qrUrl = qrUrlFromAccount(qrData.accountNumber);
  let qrCodeBuffer;
  
  try {
    // Try to fetch QR from VietQR API first
    const response = await fetch(qrUrl);
    if (response.ok) {
      qrCodeBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      throw new Error('VietQR API unavailable');
    }
  } catch (error) {
    // Fallback to generated QR code
    const qrString = generateEMVCoQRString(qrData);
    qrCodeBuffer = await QRCode.toBuffer(qrString, {
      width: qrSize,
      margin: 2,
      color: {
        dark: colors.primary,
        light: '#FFFFFF'
      }
    });
  }

  // Load QR code image
  const qrImage = await loadImage(qrCodeBuffer);

  // QR Box styling (matching toolqr.html)
  const qrX = (680 - qrSize) / 2;
  const qrY = 200;
  
  // QR background with shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.shadowColor = 'transparent';
  
  // Draw QR code
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // Title styling (matching toolqr.html)
  ctx.fillStyle = colors.primary;
  ctx.font = `800 ${fontSize.title}px "SVN Gilroy", Arial, sans-serif`;
  ctx.textAlign = 'center';
  
  const title = 'THANH TOÁN QR CODE';
  ctx.fillText(title, 680 / 2, 660);

  // Account information section (matching toolqr.html positions)
  const accountY = 730;
  
  // Account number label
  ctx.fillStyle = colors.text;
  ctx.font = `400 ${fontSize.content}px "SVN Gilroy", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('STK:', 680 / 2, accountY);
  
  // Account number value
  ctx.fillStyle = colors.primary;
  ctx.font = `700 ${fontSize.header}px "SVN Gilroy", Arial, sans-serif`;
  ctx.fillText(qrData.accountNumber, 680 / 2, accountY + 40);

  // Account holder name (if provided)
  if (qrData.accountName) {
    ctx.fillStyle = colors.text;
    ctx.font = `500 ${fontSize.small + 2}px "SVN Gilroy", Arial, sans-serif`;
    ctx.fillText('CHỦ TÀI KHOẢN:', 680 / 2, accountY + 90);
    
    ctx.fillStyle = colors.primary;
    ctx.font = `700 ${fontSize.content + 2}px "SVN Gilroy", Arial, sans-serif`;
    const accountName = qrData.accountName.toUpperCase();
    ctx.fillText(accountName, 680 / 2, accountY + 125);
  }

  // Amount (if provided)
  if (qrData.amount && qrData.amount > 0) {
    const amountY = qrData.accountName ? accountY + 175 : accountY + 120;
    
    ctx.fillStyle = colors.text;
    ctx.font = `500 ${fontSize.small + 2}px "SVN Gilroy", Arial, sans-serif`;
    ctx.fillText('SỐ TIỀN:', 680 / 2, amountY);
    
    ctx.fillStyle = colors.accent;
    ctx.font = `700 ${fontSize.content + 4}px "SVN Gilroy", Arial, sans-serif`;
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(qrData.amount);
    ctx.fillText(formattedAmount, 680 / 2, amountY + 35);
  }

  // Description (if provided)
  if (qrData.description) {
    const baseY = qrData.accountName ? accountY + 175 : accountY + 120;
    const descY = qrData.amount ? baseY + 85 : baseY;
    
    ctx.fillStyle = colors.text;
    ctx.font = `500 ${fontSize.small}px "SVN Gilroy", Arial, sans-serif`;
    ctx.fillText('NỘI DUNG:', 680 / 2, descY);
    
    ctx.fillStyle = colors.text;
    ctx.font = `400 ${fontSize.small}px "SVN Gilroy", Arial, sans-serif`;
    
    // Wrap text if too long
    const maxWidth = 600;
    const words = qrData.description.split(' ');
    let line = '';
    let lineY = descY + 30;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 680 / 2, lineY);
        line = word + ' ';
        lineY += fontSize.small + 5;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 680 / 2, lineY);
  }

  // Footer (matching toolqr.html style)
  ctx.fillStyle = colors.accent;
  ctx.font = `700 ${fontSize.small}px "SVN Gilroy", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('VietinBank - CN Nam Sài Gòn', 680 / 2, 1020 - 75);
  ctx.fillText('Phòng Dịch vụ Khách Hàng', 680 / 2, 1020 - 55);
  ctx.fillText('Quét mã QR để thanh toán', 680 / 2, 1020 - 25);

  // Convert to buffer
  return canvas.toBuffer('image/png');
}

/**
 * Get bank name from bank code (enhanced with VietinBank focus)
 */
export function getBankName(bankCode: string): string {
  const bankNames: { [key: string]: string } = {
    '970415': 'VietinBank', // VietinBank code used in toolqr.html
    'VTB': 'VietinBank',
    'TCB': 'Techcombank', 
    'VCB': 'Vietcombank',
    'BIDV': 'BIDV',
    'AGB': 'Agribank',
    'MBB': 'MB Bank',
    'VPB': 'VPBank',
    'STB': 'Sacombank'
  };
  
  return bankNames[bankCode] || 'VietinBank'; // Default to VietinBank
}

/**
 * Get VietinBank branch info (matching toolqr.html footer)
 */
export function getVietinBankBranchInfo() {
  return {
    branch: 'VietinBank - CN Nam Sài Gòn',
    department: 'Phòng Dịch vụ Khách Hàng',
    address: '23 Nguyễn Hữu Thọ, P. Tân Hưng, TP HCM'
  };
}

/**
 * Clean account number (same logic as toolqr.html)
 */
export function cleanAccountNumber(accountNumber: string): string {
  return (accountNumber || '').replace(/\D/g, ''); // chỉ giữ số
}

export { BANK_CODES };
