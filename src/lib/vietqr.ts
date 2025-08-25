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
 * Generate VietQR payment string according to VietQR standard
 */
export function generateVietQRString(data: VietQRData): string {
  const {
    bankCode,
    accountNumber,
    accountName,
    amount = 0,
    description = '',
    template = 'compact2'
  } = data;

  // VietQR format: https://www.vietqr.io/docs/api
  const qrData = {
    accountNo: accountNumber,
    accountName: accountName,
    acqId: bankCode,
    amount: amount,
    addInfo: description,
    format: 'text',
    template: template
  };

  // Create VietQR URL format
  const baseUrl = 'https://img.vietqr.io/image/';
  const params = new URLSearchParams();
  
  if (qrData.accountNo) params.append('accountNo', qrData.accountNo);
  if (qrData.accountName) params.append('accountName', qrData.accountName);
  if (qrData.acqId) params.append('acqId', qrData.acqId);
  if (qrData.amount > 0) params.append('amount', qrData.amount.toString());
  if (qrData.addInfo) params.append('addInfo', qrData.addInfo);
  if (qrData.template) params.append('template', qrData.template);

  const qrUrl = `${baseUrl}${bankCode}-${accountNumber}-${template}.png?${params.toString()}`;
  
  // For QR code content, use the standard EMVCo format
  return generateEMVCoQRString(data);
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
 * Create A6 payment QR code image with background and account information
 */
export async function createPaymentQRImage(
  qrData: VietQRData,
  options: QRImageOptions = {}
): Promise<Buffer> {
  const {
    backgroundColor = '#ffffff',
    qrSize = 400,
    fontSize = {
      title: 48,
      header: 36,
      content: 32,
      small: 24
    },
    colors = {
      primary: '#1E40AF',
      secondary: '#3B82F6', 
      text: '#1F2937',
      accent: '#059669'
    }
  } = options;

  // Create canvas
  const canvas = createCanvas(A6_WIDTH, A6_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, A6_WIDTH, A6_HEIGHT);

  // Add gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, A6_HEIGHT);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, A6_WIDTH, A6_HEIGHT);

  // Generate QR code
  const qrString = generateVietQRString(qrData);
  const qrCodeBuffer = await QRCode.toBuffer(qrString, {
    width: qrSize,
    margin: 2,
    color: {
      dark: colors.primary,
      light: '#FFFFFF'
    }
  });

  // Load QR code image
  const qrImage = await loadImage(qrCodeBuffer);

  // Title
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.title}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  const title = 'THANH TOÁN QR CODE';
  ctx.fillText(title, A6_WIDTH / 2, 100);

  // VietinBank logo area (text for now)
  ctx.fillStyle = colors.secondary;
  ctx.font = `bold ${fontSize.header}px Arial, sans-serif`;
  ctx.fillText('VIETINBANK', A6_WIDTH / 2, 180);

  // Draw QR code
  const qrX = (A6_WIDTH - qrSize) / 2;
  const qrY = 220;
  
  // QR background
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
  ctx.shadowColor = 'transparent';
  
  ctx.drawImage(qrImage, qrX, qrY);

  // Account information section
  const infoStartY = qrY + qrSize + 80;
  
  // Account holder name
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${fontSize.content}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('TÊN TÀI KHOẢN:', A6_WIDTH / 2, infoStartY);
  
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${fontSize.content + 4}px Arial, sans-serif`;
  const accountName = qrData.accountName.toUpperCase();
  ctx.fillText(accountName, A6_WIDTH / 2, infoStartY + 50);

  // Account number
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${fontSize.content}px Arial, sans-serif`;
  ctx.fillText('SỐ TÀI KHOẢN:', A6_WIDTH / 2, infoStartY + 120);
  
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${fontSize.content + 4}px Arial, sans-serif`;
  ctx.fillText(qrData.accountNumber, A6_WIDTH / 2, infoStartY + 170);

  // Bank name
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${fontSize.content}px Arial, sans-serif`;
  ctx.fillText('NGÂN HÀNG:', A6_WIDTH / 2, infoStartY + 240);
  
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.content + 4}px Arial, sans-serif`;
  ctx.fillText('VIETINBANK', A6_WIDTH / 2, infoStartY + 290);

  // Amount (if provided)
  if (qrData.amount && qrData.amount > 0) {
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${fontSize.content}px Arial, sans-serif`;
    ctx.fillText('SỐ TIỀN:', A6_WIDTH / 2, infoStartY + 360);
    
    ctx.fillStyle = colors.accent;
    ctx.font = `bold ${fontSize.content + 8}px Arial, sans-serif`;
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(qrData.amount);
    ctx.fillText(formattedAmount, A6_WIDTH / 2, infoStartY + 410);
  }

  // Description (if provided)
  if (qrData.description) {
    const descY = qrData.amount ? infoStartY + 480 : infoStartY + 360;
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${fontSize.small}px Arial, sans-serif`;
    ctx.fillText('NỘI DUNG:', A6_WIDTH / 2, descY);
    
    ctx.fillStyle = colors.text;
    ctx.font = `${fontSize.small}px Arial, sans-serif`;
    
    // Wrap text if too long
    const maxWidth = A6_WIDTH - 100;
    const words = qrData.description.split(' ');
    let line = '';
    let lineY = descY + 40;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, A6_WIDTH / 2, lineY);
        line = word + ' ';
        lineY += fontSize.small + 10;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, A6_WIDTH / 2, lineY);
  }

  // Footer
  ctx.fillStyle = colors.text;
  ctx.font = `${fontSize.small}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Quét mã QR để thanh toán', A6_WIDTH / 2, A6_HEIGHT - 80);
  
  ctx.fillStyle = colors.secondary;
  ctx.font = `${fontSize.small - 4}px Arial, sans-serif`;
  ctx.fillText('Được tạo bởi CRM TaskBoard', A6_WIDTH / 2, A6_HEIGHT - 40);

  // Convert to buffer
  return canvas.toBuffer('image/png');
}

/**
 * Get bank name from bank code
 */
export function getBankName(bankCode: string): string {
  const bankNames: { [key: string]: string } = {
    'VTB': 'Vietinbank',
    'TCB': 'Techcombank', 
    'VCB': 'Vietcombank',
    'BIDV': 'BIDV',
    'AGB': 'Agribank',
    'MBB': 'MB Bank',
    'VPB': 'VPBank',
    'STB': 'Sacombank'
  };
  
  return bankNames[bankCode] || 'Unknown Bank';
}

export { BANK_CODES };
