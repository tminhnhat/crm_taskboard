# Template Management System

## Tổng quan
Hệ thống quản lý template được thiết kế để lưu trữ và quản lý các template tài liệu. File được lưu trong **Vercel Blob Storage** và metadata được lưu trong **Supabase**.

## Cấu trúc lưu trữ

### 1. File Storage - Vercel Blob Storage
- **Folder**: `maubieu/`
- **Định dạng file**: `.docx`, `.xlsx`, `.doc`, `.xls`
- **Tên file**: `{template_name}_{timestamp}.{extension}` (auto-generated)
- **Access**: Public (có thể download trực tiếp qua URL)

### 2. Metadata Storage - Supabase
**Bảng**: `dulieu_congviec.templates`

| Cột | Kiểu dữ liệu | Mô tả |
|-----|-------------|-------|
| `template_id` | SERIAL PRIMARY KEY | ID tự động tăng |
| `template_name` | TEXT NOT NULL | Tên template hiển thị |
| `template_type` | TEXT NOT NULL | Loại template (có thể có nhiều template cùng type) |
| `file_url` | TEXT NOT NULL | URL file trong Vercel Blob Storage |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | Thời gian tạo |

## Tính năng

### 1. Upload Template
- Upload file template (.docx, .xlsx) lên Vercel Blob Storage
- Tự động generate tên file unique
- Lưu metadata vào Supabase
- Validation file format

### 2. Quản lý Template
- Xem danh sách templates
- Filter theo `template_type`
- Download template
- Xóa template (xóa cả file và metadata)

### 3. Multiple Templates per Type
- Một `template_type` có thể có nhiều template
- Ví dụ: `hop_dong_tin_dung` có thể có nhiều phiên bản khác nhau

## API Endpoints

### GET /api/templates
Lấy danh sách templates

**Query Parameters:**
- `type` (optional): Filter theo template_type

**Response:**
```json
{
  "templates": [
    {
      "template_id": 1,
      "template_name": "Hợp đồng tín dụng v1.0",
      "template_type": "hop_dong_tin_dung", 
      "file_url": "https://blob.vercel-storage.com/maubieu/hop_dong_v1_123456.docx",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/templates/upload
Upload template mới

**Form Data:**
- `file`: File template
- `templateName`: Tên template
- `templateType`: Loại template

**Response:**
```json
{
  "fileUrl": "https://blob.vercel-storage.com/maubieu/template_123456.docx",
  "filename": "template_123456.docx",
  "success": true
}
```

### DELETE /api/templates?file=filename
Xóa template file từ Vercel Blob Storage

## Cách sử dụng

### 1. Truy cập trang Templates
Vào `/templates` để quản lý templates

### 2. Upload Template
1. Chọn file template (.docx/.xlsx)
2. Nhập tên template
3. Nhập loại template 
4. Click "Upload Template"

### 3. Quản lý Templates
- **Tải về**: Click vào nút "Tải về" để download template
- **Xóa**: Click vào nút "Xóa" để xóa template (cần confirm)
- **Lọc**: Sử dụng filter để tìm template theo type

## Hook sử dụng

### useDocuments Hook
```tsx
import { useDocuments } from '@/hooks/useDocuments';

const {
  templates,
  loading,
  error,
  fetchTemplates,
  uploadTemplate,
  deleteTemplateFile,
  addTemplate,
  updateTemplate,
  deleteTemplate
} = useDocuments();
```

### Các function chính:
- `fetchTemplates(templateType?)`: Lấy danh sách templates
- `uploadTemplate(file, templateName, templateType)`: Upload template mới
- `deleteTemplateFile(template)`: Xóa template (file + metadata)
- `addTemplate(template)`: Thêm metadata template (chỉ metadata)
- `updateTemplate(id, updates)`: Cập nhật template metadata
- `deleteTemplate(id)`: Xóa template metadata

## Component

### TemplateManager Component
```tsx
import { TemplateManager } from '@/components/TemplateManager';

// Sử dụng toàn bộ tính năng
<TemplateManager />

// Chỉ hiển thị templates của một type
<TemplateManager templateType="hop_dong_tin_dung" />

// Tùy chọn tính năng
<TemplateManager 
  templateType="bien_ban_dinh_gia"
  allowUpload={true}
  allowDelete={true}
  onTemplateSelect={(template) => console.log('Selected:', template)}
/>
```

## Cài đặt cơ sở dữ liệu

### 1. Tạo bảng templates
```sql
-- Chạy file migration
psql -f database/migrations/create_templates_table.sql

-- Hoặc chạy test script
psql -f database/test_templates_creation.sql
```

### 2. Environment Variables
Cần các biến môi trường sau:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key

# Vercel Blob Storage  
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## Lưu ý kỹ thuật

### 1. File Naming
- Tự động generate tên file unique để tránh conflict
- Format: `{sanitized_name}_{timestamp}.{extension}`
- Ví dụ: `Hop_dong_tin_dung_1640995200000.docx`

### 2. Security
- RLS enabled cho bảng templates
- Policies cho phép CRUD operations
- File validation trước khi upload

### 3. Error Handling
- Validation đầy đủ cho file format và size
- Error handling cho network requests
- User feedback cho mọi operations

### 4. Performance
- Indexes trên `template_type` và `created_at`
- Lazy loading danh sách templates
- Optimized queries

## Troubleshooting

### 1. Upload failures
- Kiểm tra BLOB_READ_WRITE_TOKEN
- Kiểm tra file format (chỉ chấp nhận .docx, .xlsx)
- Kiểm tra kết nối network

### 2. Database errors
- Kiểm tra Supabase connection
- Kiểm tra RLS policies
- Kiểm tra schema permissions

### 3. Template not found
- Kiểm tra file có tồn tại trong Vercel Blob không
- Kiểm tra URL trong database có chính xác không
- Kiểm tra access permissions
