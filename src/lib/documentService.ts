import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import { ensureTemplatesExist } from '@/lib/templateSeeder';
import { getMockCustomer, getMockCollateral, getMockCreditAssessment } from '@/lib/mockData';
import { isSupabaseConfigured } from '@/lib/config';
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

// Helper function to create fallback template
function createFallbackTemplate(
  documentType: DocumentType, 
  customer: any, 
  collateral: any, 
  creditAssessment: any
): Buffer {
  // Create a simple Word document structure
  const content = getFallbackContent(documentType);
  
  // Create minimal DOCX structure
  const zip = new PizZip();
  
  // Add document.xml with template placeholders
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  
  // Add required DOCX structure files
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  return zip.generate({ type: 'nodebuffer' });
}

function getFallbackContent(documentType: DocumentType): string {
  const templates = {
    hop_dong_tin_dung: `
HỢP ĐỒNG TÍN DỤNG

THÔNG TIN KHÁCH HÀNG:
- Họ và tên: {customer.full_name}
- Số CCCD/CMND: {customer.id_number}
- Số điện thoại: {customer.phone}
- Email: {customer.email}
- Địa chỉ: {customer.address}
- Nghề nghiệp: {customer.occupation}

{#collateral}
THÔNG TIN TÀI SAN ĐẢM BẢO:
- Tên tài sản: {collateral.asset_name}
- Loại tài sản: {collateral.asset_type}
- Giá trị định giá: {collateral.value} VNĐ
- Địa chỉ tài sản: {collateral.location}
{/collateral}

{#creditAssessment}
ĐIỀU KHOẢN TÍN DỤNG:
- Mức tín dụng: {creditAssessment.approved_amount} VNĐ
- Lãi suất: {creditAssessment.interest_rate}%/năm
- Thời hạn vay: {creditAssessment.loan_term} tháng
{/creditAssessment}

Ngày lập: ${format(new Date(), 'dd/MM/yyyy')}
`,
    to_trinh_tham_dinh: `
TỜ TRÌNH THẨM ĐỊNH TÍN DỤNG

KHÁCH HÀNG: {customer.full_name}
SỐ CCCD: {customer.id_number}
ĐIỆN THOẠI: {customer.phone}

{#creditAssessment}
KẾT QUẢ THẨM ĐỊNH:
- Kết quả: {creditAssessment.assessment_result}
- Mức duyệt: {creditAssessment.approved_amount} VNĐ
- Lãi suất: {creditAssessment.interest_rate}%
{/creditAssessment}

Ngày lập: ${format(new Date(), 'dd/MM/yyyy')}
`,
    giay_de_nghi_vay_von: `
GIẤY ĐỀ NGHỊ VAY VỐN

Khách hàng: {customer.full_name}
CCCD: {customer.id_number}

{#creditAssessment}
Số tiền đề nghị: {creditAssessment.approved_amount} VNĐ
Mục đích: {creditAssessment.purpose}
{/creditAssessment}

Ngày: ${format(new Date(), 'dd/MM/yyyy')}
`,
    bien_ban_dinh_gia: `
BIÊN BẢN ĐỊNH GIÁ TÀI SẢN

{#collateral}
TÀI SẢN: {collateral.asset_name}
LOẠI: {collateral.asset_type}
GIÁ TRỊ: {collateral.value} VNĐ
ĐỊA CHỈ: {collateral.location}
{/collateral}

Ngày định giá: ${format(new Date(), 'dd/MM/yyyy')}
`,
    hop_dong_the_chap: `
HỢP ĐỒNG THẾ CHẤP

Bên thế chấp: {customer.full_name}

{#collateral}
TÀI SẢN THẾ CHẤP:
- Tên: {collateral.asset_name}
- Giá trị: {collateral.value} VNĐ
{/collateral}

Ngày lập: ${format(new Date(), 'dd/MM/yyyy')}
`
  };

  const content = templates[documentType] || templates.hop_dong_tin_dung;
  return content;
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
  
  // 1. Lấy dữ liệu từ database hoặc sử dụng mock data
  let customer, collateral = null, creditAssessment = null;
  
  if (isSupabaseConfigured()) {
    try {
      // Try to get data from Supabase
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      customer = customerData;
      
      if (collateralId) {
        const { data } = await supabase
          .from('collaterals')
          .select('*')
          .eq('collateral_id', collateralId)
          .single();
        collateral = data;
      }
      
      if (creditAssessmentId) {
        const { data } = await supabase
          .from('credit_assessments')
          .select('*')
          .eq('assessment_id', creditAssessmentId)
          .single();
        creditAssessment = data;
      }
    } catch (error) {
      console.log('Supabase query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to mock data
      customer = getMockCustomer(customerId);
      if (collateralId) {
        collateral = getMockCollateral(collateralId);
      }
      if (creditAssessmentId) {
        creditAssessment = getMockCreditAssessment(creditAssessmentId);
      }
    }
  } else {
    console.log('Supabase not configured, using mock data');
    // Use mock data directly
    customer = getMockCustomer(customerId);
    if (collateralId) {
      collateral = getMockCollateral(collateralId);
    }
    if (creditAssessmentId) {
      creditAssessment = getMockCreditAssessment(creditAssessmentId);
    }
    console.log('Mock customer found:', customer ? customer.full_name : 'null');
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
    
    // Fallback: Tạo template cơ bản nếu không tìm thấy
    console.log(`Creating fallback template for ${documentType}`);
    try {
      const basicTemplate = createFallbackTemplate(documentType, customer, collateral, creditAssessment);
      templateBuffer = basicTemplate;
    } catch (fallbackError) {
      console.error('Error creating fallback template:', fallbackError);
      throw new Error(`Không thể tạo template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
