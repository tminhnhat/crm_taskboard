import { supabase } from '@/lib/supabase';
import { format, addMonths } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import { ensureTemplatesExist } from '@/lib/templateSeeder';
import * as XLSX from 'xlsx';

export type DocumentType =
  | 'hop_dong_tin_dung'
  | 'to_trinh_tham_dinh'
  | 'giay_de_nghi_vay_von'
  | 'bien_ban_dinh_gia'
  | 'hop_dong_the_chap'
  | 'bang_tinh_lai'
  | 'lich_tra_no';

export type ExportType = 'docx' | 'pdf' | 'xlsx';

export interface GenerateDocumentOptions {
  documentType: DocumentType;
  customerId: string;
  collateralId?: string;
  creditAssessmentId?: string;
  exportType: 'docx' | 'pdf' | 'xlsx';
}



function generateExcelBuffer(documentType: DocumentType, data: any): Buffer {
  const workbook = XLSX.utils.book_new();
  let worksheet;

  switch (documentType) {
    case 'bang_tinh_lai': {
      const { creditAssessment, customer } = data;
      const rows = [];
      
      // Header row
      rows.push(['BẢNG TÍNH LÃI VAY', '', '', '', '']);
      rows.push(['Khách hàng:', customer.full_name, '', 'CCCD:', customer.id_number]);
      rows.push(['Số tiền vay:', creditAssessment.approved_amount, 'VNĐ', '', '']);
      rows.push(['Lãi suất:', creditAssessment.interest_rate, '%/năm', '', '']);
      rows.push(['Kỳ hạn:', creditAssessment.loan_term, 'tháng', '', '']);
      rows.push(['', '', '', '', '']);
      rows.push(['Kỳ', 'Ngày', 'Dư nợ gốc', 'Lãi phải trả', 'Tổng phải trả']);

      const startDate = new Date();
      const monthlyRate = creditAssessment.interest_rate / 12 / 100;
      const monthlyPayment = (creditAssessment.approved_amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -creditAssessment.loan_term));
      let balance = creditAssessment.approved_amount;

      for (let month = 1; month <= creditAssessment.loan_term; month++) {
        const date = addMonths(startDate, month - 1);
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        
        rows.push([
          month,
          format(date, 'dd/MM/yyyy'),
          Math.round(balance),
          Math.round(interest),
          Math.round(monthlyPayment)
        ]);
        
        balance -= principal;
      }

      worksheet = XLSX.utils.aoa_to_sheet(rows);
      break;
    }
    
    case 'lich_tra_no': {
      const { creditAssessment, customer } = data;
      const rows = [];
      
      // Header
      rows.push(['LỊCH TRẢ NỢ', '', '', '']);
      rows.push(['Khách hàng:', customer.full_name, 'CCCD:', customer.id_number]);
      rows.push(['Số tiền vay:', creditAssessment.approved_amount, 'VNĐ', '']);
      rows.push(['', '', '', '']);
      rows.push(['Kỳ', 'Ngày đến hạn', 'Số tiền', 'Trạng thái']);

      const startDate = new Date();
      const monthlyPayment = creditAssessment.approved_amount / creditAssessment.loan_term;

      for (let month = 1; month <= creditAssessment.loan_term; month++) {
        const dueDate = addMonths(startDate, month);
        rows.push([
          month,
          format(dueDate, 'dd/MM/yyyy'),
          Math.round(monthlyPayment),
          ''  // Status will be updated manually
        ]);
      }

      worksheet = XLSX.utils.aoa_to_sheet(rows);
      break;
    }

    default:
      throw new Error(`Excel generation not supported for document type: ${documentType}`);
  }

  // Apply some styling
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  worksheet['!cols'] = [
    { wch: 8 },   // Column A
    { wch: 15 },  // Column B
    { wch: 15 },  // Column C
    { wch: 15 },  // Column D
    { wch: 15 }   // Column E
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export interface GenerateDocumentResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export async function generateCreditDocument({
  documentType,
  customerId,
  collateralId,
  creditAssessmentId,
  exportType,
}: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
  // 0. Đảm bảo templates tồn tại
  if (exportType !== 'xlsx') {
    await ensureTemplatesExist();
  }
  
  // 1. Lấy dữ liệu từ database
  let customer, collateral = null, creditAssessment = null;
  
  // Get customer data
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', customerId)
    .single();
    
  if (customerError || !customerData) {
    throw new Error(`Could not find customer with ID ${customerId}: ${customerError?.message}`);
  }
  customer = customerData;
  
  // Get collateral data if requested
  if (collateralId) {
    const { data, error } = await supabase
      .from('collaterals')
      .select('*')
      .eq('collateral_id', collateralId)
      .single();
    if (error) {
      throw new Error(`Could not find collateral with ID ${collateralId}: ${error.message}`);
    }
    collateral = data;
  }
  
  // Get credit assessment data if requested
  if (creditAssessmentId) {
    const { data, error } = await supabase
      .from('credit_assessments')
      .select('*')
      .eq('assessment_id', creditAssessmentId)
      .single();
    if (error) {
      throw new Error(`Could not find credit assessment with ID ${creditAssessmentId}: ${error.message}`);
    }
    creditAssessment = data;
  }

  if (!customer) {
    console.error('Customer not found for ID:', customerId);
    throw new Error('Customer not found');
  }

  // 2. Lấy template từ Vercel Blob
  let templateBuffer: Buffer;
  try {
    templateBuffer = await fetchTemplateFromVercelBlob(
      `maubieu/${documentType}.docx`
    );
    console.log(`✓ Template ${documentType} loaded successfully`);
  } catch (error) {
    console.error('Error fetching template from blob:', error);
    throw new Error(`Could not load template "${documentType}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 3. Generate document based on type
  try {
    const templateData = {
      customer: customer || {},
      collateral: collateral || {},
      creditAssessment: creditAssessment || {}
    };

    let outBuffer: Buffer;
    let contentType: string;

    // Handle Excel files
    if (exportType === 'xlsx' && (documentType === 'bang_tinh_lai' || documentType === 'lich_tra_no')) {
      outBuffer = generateExcelBuffer(documentType, templateData);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } 
    // Handle Word documents
    else if (exportType === 'docx') {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.render(templateData);
      outBuffer = doc.getZip().generate({ type: 'nodebuffer' });
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    // Handle PDF (if implemented)
    else if (exportType === 'pdf') {
      throw new Error('PDF export not yet implemented');
    }
    else {
      throw new Error(`Unsupported export type: ${exportType}`);
    }

    // 4. Create filename and return buffer
    const dateStr = format(new Date(), 'yyyyMMdd');
    const fileName = `${documentType}_${customerId}_${dateStr}.${exportType}`;
    
    // 5. Return buffer
    return {
      buffer: outBuffer!,
      filename: fileName,
      contentType
    };
  } catch (renderError) {
    console.error('Error rendering document:', renderError);
    throw new Error(`Lỗi tạo tài liệu: ${renderError instanceof Error ? renderError.message : 'Unknown render error'}`);
  }
}

// Hàm tìm kiếm & lọc tài liệu
export function searchDocuments({ customerId, loanId, status }: { customerId?: string; loanId?: string; status?: string }) {
  // Đọc folder ketqua, lọc theo tên file hoặc metadata
  // ...
}

// Hàm upload template lên Vercel Blob (dashboard sẽ gọi)
export async function uploadTemplateToVercelBlob(file: File, documentType: DocumentType) {
  // ...
}

// Hàm gửi mail tài liệu
import nodemailer from 'nodemailer';

export async function sendDocumentByEmail(documentPath: string, email: string) {
  // Đọc file
  const fs = require('fs');
  const path = require('path');
  const fileName = path.basename(documentPath);
  const fileBuffer = fs.readFileSync(documentPath);

  // Cấu hình transporter (cần cấu hình biến môi trường thực tế)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Tài liệu hồ sơ tín dụng: ${fileName}`,
    text: 'Vui lòng xem file đính kèm.',
    attachments: [
      {
        filename: fileName,
        content: fileBuffer,
      },
    ],
  });
}

export async function deleteDocument(fileName: string): Promise<boolean> {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'ketqua', fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
