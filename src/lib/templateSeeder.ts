import { uploadTemplateFromServerToVercelBlob, uploadBufferToVercelBlob } from '@/lib/vercelBlob';
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
    },
    {
      type: 'giay_de_nghi_vay_von',
      name: 'Giấy đề nghị vay vốn',
      content: `
GIẤY ĐỀ NGHỊ VAY VỐN

THÔNG TIN KHÁCH HÀNG:
- Họ và tên: {customer.full_name}
- Số CCCD/CMND: {customer.id_number}
- Số điện thoại: {customer.phone}
- Email: {customer.email}
- Địa chỉ: {customer.address}
- Nghề nghiệp: {customer.occupation}

{#creditAssessment}
THÔNG TIN VAY VỐN:
- Số tiền đề nghị vay: {creditAssessment.approved_amount} VNĐ
- Mục đích sử dụng vốn: {creditAssessment.purpose}
- Thời hạn vay: {creditAssessment.loan_term} tháng
- Lãi suất mong muốn: {creditAssessment.interest_rate}%/năm
{/creditAssessment}

Ngày nộp đơn: ${new Date().toLocaleDateString('vi-VN')}

Chữ ký người đề nghị


__________________
{customer.full_name}
`
    },
    {
      type: 'bien_ban_dinh_gia',
      name: 'Biên bản định giá tài sản',
      content: `
BIÊN BẢN ĐỊNH GIÁ TÀI SẢN

CHỦ TÀI SẢN: {customer.full_name}
CCCD: {customer.id_number}
Địa chỉ: {customer.address}

{#collateral}
THÔNG TIN TÀI SẢN:
- Tên tài sản: {collateral.asset_name}
- Loại tài sản: {collateral.asset_type}
- Địa chỉ tài sản: {collateral.location}
- Diện tích: {collateral.area} m²
- Tình trạng pháp lý: {collateral.legal_status}
- Giá trị định giá: {collateral.value} VNĐ
- Ghi chú: {collateral.notes}
{/collateral}

Ngày định giá: ${new Date().toLocaleDateString('vi-VN')}

Cán bộ định giá                      Trưởng phòng


__________________                   __________________
`
    },
    {
      type: 'hop_dong_the_chap',
      name: 'Hợp đồng thế chấp',
      content: `
HỢP ĐỒNG THẾ CHẤP TÀI SẢN

BÊN THẾ CHẤP (Bên A): {customer.full_name}
CCCD: {customer.id_number}
Địa chỉ: {customer.address}
Điện thoại: {customer.phone}

BÊN NHẬN THẾ CHẤP (Bên B): NGÂN HÀNG

{#collateral}
TÀI SẢN THẾ CHẤP:
- Tên tài sản: {collateral.asset_name}
- Loại tài sản: {collateral.asset_type}
- Địa chỉ: {collateral.location}
- Giá trị thế chấp: {collateral.value} VNĐ
- Tình trạng pháp lý: {collateral.legal_status}
{/collateral}

{#creditAssessment}
NGHĨA VỤ THẾ CHẤP:
- Số tiền bảo đảm: {creditAssessment.approved_amount} VNĐ
- Thời hạn bảo đảm: {creditAssessment.loan_term} tháng
{/creditAssessment}

Ngày lập hợp đồng: ${new Date().toLocaleDateString('vi-VN')}

Bên A                               Bên B


__________________                  __________________
{customer.full_name}                Đại diện Ngân hàng
`
    }
  ];

  for (const template of templates) {
    try {
      // Tạo file Word buffer trực tiếp không cần file tạm thời
      const wordBuffer = createWordTemplate(template.content);

      // Upload trực tiếp buffer lên Vercel Blob
      await uploadBufferToVercelBlob(wordBuffer, `maubieu/${template.type}.docx`);
      
      console.log(`✓ Đã tạo template: ${template.name}`);
    } catch (error) {
      console.error(`✗ Lỗi tạo template ${template.name}:`, error);
    }
  }
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
