import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import * as QRCode from 'qrcode';
import { list } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

// Font registration using local system fonts
async function registerFonts() {
  try {
    // In Vercel serverless, __dirname points to the .next/server directory, but public is at process.cwd()/public
    const fontDir = path.join(process.cwd(), 'public', 'fonts');
    const gilroyFonts = [
      { file: 'SVN-Gilroy-Regular.otf', weight: '400' },
      { file: 'SVN-Gilroy-Medium.otf', weight: '500' },
      { file: 'SVN-Gilroy-SemiBold.otf', weight: '600' },
      { file: 'SVN-Gilroy-Bold.otf', weight: '700' },
      { file: 'SVN-Gilroy-ExtraBold.otf', weight: '800' }
    ];
    for (const font of gilroyFonts) {
      const fontPath = path.join(fontDir, font.file);
      try {
        // Check if font file exists before registering
        await fs.access(fontPath);
        registerFont(fontPath, {
          family: 'Gilroy',
          weight: font.weight
        });
      } catch (error) {
        console.error(`Error loading Gilroy font ${font.file} (weight ${font.weight}):`, error);
      }
    }
  } catch (error) {
    console.error('Error registering Gilroy fonts:', error);
    // Fallback to system sans-serif font if fonts fail to load
    console.log('Using fallback font...');
  }
}

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
  backgroundImage?: string; // URL to background image from Vercel Blob
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
  // Ensure fonts are registered before creating the canvas
  await registerFonts();

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

  // Set background - either custom image or solid color
  if (options.backgroundImage) {
    try {
      // Extract image name from URL or use directly if it's already a name
      const imageName = options.backgroundImage.includes('/') 
        ? options.backgroundImage.split('/').pop() || options.backgroundImage
        : options.backgroundImage;
      
      const backgroundBuffer = await fetchQRBackgroundImage(imageName);
      if (backgroundBuffer) {
        const backgroundImg = await loadImage(backgroundBuffer);
        
        // Draw background image to fill canvas while maintaining aspect ratio
        const imgAspect = backgroundImg.width / backgroundImg.height;
        const canvasAspect = 680 / 1020;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider, fit by height
          drawHeight = 1020;
          drawWidth = 1020 * imgAspect;
          drawX = (680 - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller, fit by width
          drawWidth = 680;
          drawHeight = 680 / imgAspect;
          drawX = 0;
          drawY = (1020 - drawHeight) / 2;
        }
        
        ctx.drawImage(backgroundImg, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Fallback to solid color if image fails to load
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 680, 1020);
      }
    } catch (error) {
      console.error('Error loading background image:', error);
      // Fallback to solid color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 680, 1020);
    }
  } else {
    // Use solid background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 680, 1020);
  }

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

  // Draw bank logo and name
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.header}px 'Gilroy'`;
  ctx.textAlign = 'center';
  ctx.fillText(getBankName(qrData.bankCode), 680 / 2, 120);

  // Title styling (matching toolqr.html)
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.title}px 'Gilroy'`;
  ctx.textAlign = 'center';
  
  const title = 'THANH TOÁN QR CODE';
  ctx.fillText(title, 680 / 2, 660);

  // Account information section (matching toolqr.html positions)
  const accountY = 730;
  
  // Account number label with value
  ctx.fillStyle = colors.text;
  ctx.font = `normal ${fontSize.content}px 'Gilroy'`;
  ctx.textAlign = 'center';
  ctx.fillText('SỐ TÀI KHOẢN:', 680 / 2, accountY);
  
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.header}px 'Gilroy'`;
  // Format account number with spaces for readability
  const formattedAccountNumber = qrData.accountNumber.replace(/(\d{4})/g, '$1 ').trim();
  ctx.fillText(formattedAccountNumber, 680 / 2, accountY + 40);

  // Account holder name
  ctx.fillStyle = colors.text;
  ctx.font = `normal ${fontSize.content}px 'Gilroy'`;
  ctx.fillText('CHỦ TÀI KHOẢN:', 680 / 2, accountY + 90);
  
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${fontSize.header}px 'Gilroy'`;
  const accountName = qrData.accountName.toUpperCase();
  ctx.fillText(accountName, 680 / 2, accountY + 125);

  // Amount (if provided)
  if (qrData.amount && qrData.amount > 0) {
    const amountY = qrData.accountName ? accountY + 175 : accountY + 120;
    
    ctx.fillStyle = colors.text;
    ctx.font = `normal ${fontSize.small + 2}px 'Gilroy'`;
    ctx.fillText('SỐ TIỀN:', 680 / 2, amountY);
    
    ctx.fillStyle = colors.accent;
    ctx.font = `bold ${fontSize.content + 4}px 'Gilroy'`;
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
    ctx.font = `normal ${fontSize.small}px 'Gilroy'`;
    ctx.fillText('NỘI DUNG:', 680 / 2, descY);
    
    ctx.fillStyle = colors.text;
    ctx.font = `normal ${fontSize.small}px 'Gilroy'`;
    
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
  ctx.font = `bold ${fontSize.small}px 'Gilroy'`;
  ctx.textAlign = 'center';
  ctx.fillText('VietinBank - CN Bắc Đà Nẵng', 680 / 2, 1020 - 75);
  ctx.fillText('Phòng Giao Dịch Thanh Bình', 680 / 2, 1020 - 55);
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
    branch: 'VietinBank - CN Bắc Đà Nẵng',
    department: 'Phòng Giao Dịch Thanh Bình',
    address: '162 Đống Đa, P. Hải Châu, TP. Đà Nẵng'
  };
}

/**
 * Clean account number (same logic as toolqr.html)
 */
export function cleanAccountNumber(accountNumber: string): string {
  return (accountNumber || '').replace(/\D/g, ''); // chỉ giữ số
}

/**
 * Get list of available QR background images from Vercel Blob (qrimg folder)
 */
export async function getQRBackgroundImages(): Promise<Array<{
  name: string;
  url: string;
  pathname: string;
}>> {
  try {
    const { blobs } = await list({
      prefix: 'qrimg/',
      limit: 50
    });

    // Filter for image files
    const imageBlobs = blobs
      .filter((blob: any) => {
        const ext = blob.pathname.toLowerCase();
        return ext.endsWith('.png') || 
               ext.endsWith('.jpg') || 
               ext.endsWith('.jpeg') || 
               ext.endsWith('.webp') ||
               ext.endsWith('.gif');
      })
      .map((blob: any) => ({
        name: blob.pathname.replace('qrimg/', ''),
        url: blob.url,
        pathname: blob.pathname
      }));

    return imageBlobs;
  } catch (error) {
    console.error('Error fetching QR background images:', error);
    return [];
  }
}

/**
 * Fetch a specific QR background image from Vercel Blob
 */
export async function fetchQRBackgroundImage(imageName: string): Promise<Buffer | null> {
  try {
    const images = await getQRBackgroundImages();
    const targetImage = images.find(img => img.name === imageName);
    
    if (!targetImage) {
      console.warn(`Background image not found: ${imageName}`);
      return null;
    }

    const response = await fetch(targetImage.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Error fetching QR background image:', error);
    return null;
  }
}

export { BANK_CODES };
