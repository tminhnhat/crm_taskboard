import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import fs from 'fs';
import path from 'path';

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

export async function generateCreditDocument({
  documentType,
  customerId,
  collateralId,
  creditAssessmentId,
  exportType,
}: GenerateDocumentOptions): Promise<string> {
  // 1. Lấy dữ liệu từ database trực tiếp qua supabase
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', customerId)
    .single();
  let collateral = null;
  if (collateralId) {
    const { data } = await supabase
      .from('collaterals')
      .select('*')
      .eq('collateral_id', collateralId)
      .single();
    collateral = data;
  }
  let creditAssessment = null;
  if (creditAssessmentId) {
    const { data } = await supabase
      .from('credit_assessments')
      .select('*')
      .eq('assessment_id', creditAssessmentId)
      .single();
    creditAssessment = data;
  }

  // 2. Lấy template từ Vercel Blob
  const templateBuffer = await fetchTemplateFromVercelBlob(
    `maubieu/${documentType}.docx`
  );

  // 3. Render template với dữ liệu
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render({ customer, collateral, creditAssessment });
  const outBuffer = doc.getZip().generate({ type: 'nodebuffer' });

  // 4. Lưu file vào folder ketqua
  const dateStr = format(new Date(), 'yyyyMMdd');
  const fileName = `${documentType}_${customerId}_${dateStr}.${exportType}`;
  const outputPath = path.join(process.cwd(), 'ketqua', fileName);
  fs.writeFileSync(outputPath, outBuffer);

  // 5. Nếu exportType là pdf, chuyển đổi docx sang pdf (cần thêm thư viện chuyển đổi)
  // (Có thể dùng libreoffice hoặc mammoth + pdfkit, hoặc dịch vụ cloud)
  // Ở đây chỉ xử lý docx, pdf sẽ bổ sung sau

  return outputPath;
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
