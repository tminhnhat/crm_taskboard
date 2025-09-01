# Hướng dẫn hỗ trợ XLSX

## Tổng quan

Hệ thống hiện đã hỗ trợ template và tài liệu định dạng XLSX (Excel) bên cạnh DOCX (Word).

## Các tính năng được hỗ trợ

### 1. Quản lý Template XLSX
- ✅ Upload template XLSX trong Template Manager
- ✅ Lưu trữ template XLSX trên Vercel Blob Storage
- ✅ Metadata template XLSX trong Supabase
- ✅ Xóa template XLSX
- ✅ Validation file XLSX

### 2. Tạo tài liệu XLSX
- ✅ Chọn export type XLSX trong form tạo tài liệu
- ✅ Tải template XLSX từ Vercel Blob
- ✅ Tạo tài liệu XLSX (chỉ copy template, không fill data)
- ✅ Lưu kết quả vào Vercel Blob Storage

### 3. Các loại tài liệu hỗ trợ XLSX
Tất cả 8 loại tài liệu đều hỗ trợ XLSX:
- hop_dong_tin_dung
- to_trinh_tham_dinh
- giay_de_nghi_vay_von
- bien_ban_dinh_gia
- hop_dong_the_chap
- don_dang_ky_the_chap
- hop_dong_thu_phi
- tai_lieu_khac

## Hạn chế hiện tại

### Không hỗ trợ fill dữ liệu tự động
- XLSX template sẽ được copy nguyên văn, không fill dữ liệu như DOCX
- Chỉ hỗ trợ về mặt quản lý template và render
- Người dùng cần tự điền dữ liệu sau khi tải về

### Lý do hạn chế
- XLSX có cấu trúc phức tạp hơn DOCX
- Cần thư viện chuyên dụng để xử lý Excel (như SheetJS, ExcelJS)
- Focus vào template management thay vì content generation

## Cách sử dụng

### 1. Upload template XLSX
1. Vào trang Templates (`/templates`)
2. Click "Thêm Template Mới"
3. Chọn file .xlsx từ máy tính
4. Nhập tên template
5. Chọn loại tài liệu
6. Click "Tải lên"

### 2. Tạo tài liệu XLSX
1. Vào trang Documents (`/documents`)
2. Click "Tạo Tài Liệu Mới"
3. Chọn loại tài liệu
4. Chọn "Excel (.xlsx)" trong Export Type
5. Điền thông tin khách hàng, tài sản, đánh giá
6. Click "Tạo Tài Liệu"
7. Tải về file XLSX kết quả

### 3. Quản lý template XLSX
- Xem danh sách template trong Template Manager
- Xóa template không cần thiết
- Preview thông tin template (tên, loại, ngày tạo)

## Cấu trúc Code

### Types
```typescript
// src/lib/supabase.ts
export type DocumentExportType = 'docx' | 'xlsx'

// src/types/models.ts  
export type ExportType = 'docx' | 'xlsx'
```

### Content Type Mapping
```typescript
// src/lib/documentService.ts
const CONTENT_TYPE_MAP = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}
```

### Logic xử lý XLSX
```typescript
// src/lib/documentService.ts - generateCreditDocument()
} else if (exportType === 'xlsx') {
  // Fetch template XLSX và return as-is
  const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${documentType}.xlsx`);
  outBuffer = templateBuffer; // Không fill data
  contentType = CONTENT_TYPE_MAP[exportType];
}
```

## Template Storage Structure

```
Vercel Blob Storage:
├── maubieu/
│   ├── hop_dong_tin_dung.docx
│   ├── hop_dong_tin_dung.xlsx
│   ├── to_trinh_tham_dinh.docx
│   ├── to_trinh_tham_dinh.xlsx
│   └── ... (các template khác)
└── ketqua/
    ├── hop_dong_tin_dung_CUST001_20231201_143022.docx
    ├── hop_dong_tin_dung_CUST001_20231201_143155.xlsx
    └── ... (tài liệu đã tạo)
```

## Supabase Schema

Template metadata được lưu trong bảng `document_templates`:

```sql
document_templates (
  template_id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL, -- DocumentType
  file_url VARCHAR(500) NOT NULL,      -- Vercel Blob URL
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Tương lai - Content Generation cho XLSX

Để implement fill dữ liệu tự động cho XLSX:

### Thư viện gợi ý
1. **SheetJS** - Phổ biến, mạnh mẽ
2. **ExcelJS** - Dễ sử dụng, có template support
3. **xlsx-template** - Chuyên về template

### Template syntax có thể dùng
```
A1: {{customer_name}}
B1: {{loan_amount}}  
C1: {{current_date}}
```

### Implementation approach
1. Đọc template XLSX
2. Parse các cell có placeholder
3. Replace với dữ liệu thực
4. Generate file mới

## Troubleshooting

### Template không tìm thấy
- Đảm bảo đã upload template cho loại tài liệu
- Kiểm tra tên file template đúng format: `{documentType}.xlsx`
- Check Vercel Blob Storage có file

### File tải về bị lỗi
- Kiểm tra template gốc có đúng định dạng XLSX
- Đảm bảo template không bị corrupt
- Try re-upload template

### UI không hiện option XLSX
- Check browser cache, reload trang
- Đảm bảo build app success
- Kiểm tra export type trong form
