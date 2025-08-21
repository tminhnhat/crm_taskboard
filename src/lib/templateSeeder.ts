import { uploadTemplateFromServerToVercelBlob } from '@/lib/vercelBlob';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

/**
 * Tạo file Word template từ nội dung text
 */
function createWordTemplate(content: string): Buffer {
  // Tạo một document Word đơn giản với nội dung
  const zip = new PizZip();
  
  // Tạo content cho document.xml
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  // Tạo cấu trúc file Word cơ bản
  zip.file('word/document.xml', documentXml);
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

  return zip.generate({ type: 'nodebuffer' });
}
/**
 * Tạo các template mẫu cơ bản cho hệ thống
 */
export async function seedBasicTemplates(): Promise<void> {
  const templates = [
    {
      type: 'hop_dong_tin_dung',
      name: 'Hợp đồng tín dụng',
      content: `
HỢP ĐỒNG TÍN DỤNG

Khách hàng: {customer.full_name}
Số CCCD/CMND: {customer.id_number}
Số điện thoại: {customer.phone}
Email: {customer.email}
Địa chỉ: {customer.address}

{#collateral}
THÔNG TIN TÀI SAN ĐẢM BẢO:
- Tên tài sản: {collateral.asset_name}
- Loại tài sản: {collateral.asset_type}
- Giá trị định giá: {collateral.value} VNĐ
- Địa chỉ tài sản: {collateral.location}
{/collateral}

{#creditAssessment}
KẾT QUẢ THẨM ĐỊNH:
- Mức tín dụng được duyệt: {creditAssessment.approved_amount} VNĐ
- Lãi suất: {creditAssessment.interest_rate}%/năm
- Thời hạn vay: {creditAssessment.loan_term} tháng
- Kết quả thẩm định: {creditAssessment.assessment_result}
{/creditAssessment}

Ngày lập hợp đồng: ${new Date().toLocaleDateString('vi-VN')}

Chữ ký khách hàng                    Chữ ký ngân hàng


__________________                   __________________
`
    },
    {
      type: 'to_trinh_tham_dinh',
      name: 'Tờ trình thẩm định',
      content: `
TỜ TRÌNH THẨM ĐỊNH TÍN DỤNG

THÔNG TIN KHÁCH HÀNG:
- Họ và tên: {customer.full_name}
- Số CCCD/CMND: {customer.id_number}
- Ngày sinh: {customer.date_of_birth}
- Số điện thoại: {customer.phone}
- Email: {customer.email}
- Địa chỉ: {customer.address}
- Nghề nghiệp: {customer.occupation}

{#collateral}
THÔNG TIN TÀI SAN ĐẢM BẢO:
- Tên tài sản: {collateral.asset_name}
- Loại tài sản: {collateral.asset_type}
- Giá trị định giá: {collateral.value} VNĐ
- Tình trạng pháp lý: {collateral.legal_status}
- Địa chỉ tài sản: {collateral.location}
- Ghi chú: {collateral.notes}
{/collateral}

{#creditAssessment}
KẾT QUẢ THẨM ĐỊNH:
- Mức tín dụng đề xuất: {creditAssessment.approved_amount} VNĐ
- Lãi suất đề xuất: {creditAssessment.interest_rate}%/năm
- Thời hạn vay: {creditAssessment.loan_term} tháng
- Mục đích sử dụng vốn: {creditAssessment.purpose}
- Đánh giá rủi ro: {creditAssessment.risk_level}
- Kết quả thẩm định: {creditAssessment.assessment_result}
- Ghi chú: {creditAssessment.notes}
{/creditAssessment}

Ngày lập tờ trình: ${new Date().toLocaleDateString('vi-VN')}

Cán bộ thẩm định                     Trưởng phòng tín dụng


__________________                   __________________
`
    }
  ];

  const tempDir = path.join(process.cwd(), 'temp_templates');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (const template of templates) {
    try {
      // Tạo file Word template
      const wordBuffer = createWordTemplate(template.content);
      
      // Lưu tạm thời
      const tempFilePath = path.join(tempDir, `${template.type}.docx`);
      fs.writeFileSync(tempFilePath, wordBuffer);

      // Upload lên Vercel Blob
      await uploadTemplateFromServerToVercelBlob(tempFilePath, `maubieu/${template.type}.docx`);
      
      // Xóa file tạm
      fs.unlinkSync(tempFilePath);
      
      console.log(`✓ Đã tạo template: ${template.name}`);
    } catch (error) {
      console.error(`✗ Lỗi tạo template ${template.name}:`, error);
    }
  }

  // Xóa thư mục tạm
  fs.rmSync(tempDir, { recursive: true, force: true });
}

/**
 * Kiểm tra và tạo template nếu cần thiết
 */
export async function ensureTemplatesExist(): Promise<void> {
  try {
    const { fetchTemplatesListFromVercelBlob } = await import('@/lib/vercelBlob');
    const templates = await fetchTemplatesListFromVercelBlob('maubieu/');
    
    if (templates.length === 0) {
      console.log('Không tìm thấy template. Đang tạo template cơ bản...');
      await seedBasicTemplates();
    }
  } catch (error) {
    console.log('Lỗi kiểm tra template, sẽ tạo template cơ bản:', error);
    await seedBasicTemplates();
  }
}
