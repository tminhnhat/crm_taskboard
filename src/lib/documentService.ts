import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import { ensureTemplatesExist } from '@/lib/templateSeeder';

export type DocumentType =
  | 'hop_dong_tin_dung'
  | 'to_trinh_tham_dinh'
  | 'giay_de_nghi_vay_von'
  | 'bien_ban_dinh_gia'
  | 'hop_dong_the_chap';

export interface GenerateDocumentOptions {
  documentType: DocumentType;
  customerId: string;
  collateralId?: string;
  creditAssessmentId?: string;
  exportType: 'docx' | 'pdf';
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
  await ensureTemplatesExist();
  
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

  // 3. Render template với dữ liệu
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    
    // Prepare data for template
    const templateData = {
      customer: customer || {},
      collateral: collateral || {},
      creditAssessment: creditAssessment || {}
    };
    
    doc.render(templateData);
    const outBuffer = doc.getZip().generate({ type: 'nodebuffer' });

    // 4. Tạo filename và return buffer
    const dateStr = format(new Date(), 'yyyyMMdd');
    const fileName = `${documentType}_${customerId}_${dateStr}.${exportType}`;
    
    // 5. Return buffer thay vì lưu file
    return {
      buffer: outBuffer,
      filename: fileName,
      contentType: exportType === 'docx' 
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf'
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
