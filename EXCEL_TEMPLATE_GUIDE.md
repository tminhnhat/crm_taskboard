# Excel Template Generation Guide

## Tổng quan

Hệ thống hiện đã hỗ trợ **tạo nội dung tự động** cho file Excel (.xlsx) tương tự như file Word (.docx). Điều này có nghĩa là dữ liệu từ khách hàng, tài sản đảm bảo và đánh giá tín dụng sẽ được tự động điền vào template Excel.

## Cách sử dụng Template Excel

### 1. Tạo Template Excel
Tạo file Excel (.xlsx) với các placeholder theo format:
```
{{tên_biến}}
```

### 2. Các biến có sẵn

#### Thông tin khách hàng:
- `{{customer_id}}` - ID khách hàng
- `{{customer_name}}` / `{{full_name}}` - Tên đầy đủ khách hàng  
- `{{id_number}}` - Số CMND/CCCD
- `{{phone}}` - Số điện thoại
- `{{email}}` - Email
- `{{address}}` - Địa chỉ

#### Thông tin tài sản đảm bảo:
- `{{collateral_id}}` - ID tài sản
- `{{collateral_type}}` - Loại tài sản
- `{{collateral_value}}` - Giá trị tài sản (text)
- `{{collateral_value_number}}` - Giá trị tài sản (số)
- `{{collateral_value_formatted}}` - Giá trị tài sản (định dạng tiền tệ)
- `{{collateral_description}}` - Mô tả tài sản

#### Thông tin đánh giá tín dụng:
- `{{assessment_id}}` - ID đánh giá
- `{{loan_amount}}` - Số tiền vay (text)
- `{{loan_amount_number}}` - Số tiền vay (số)
- `{{loan_amount_formatted}}` - Số tiền vay (định dạng tiền tệ)
- `{{interest_rate}}` - Lãi suất (text)
- `{{interest_rate_number}}` - Lãi suất (số)
- `{{loan_term}}` - Kỳ hạn vay (text)
- `{{loan_term_number}}` - Kỳ hạn vay (số)

#### Thông tin ngày tháng:
- `{{current_date}}` - Ngày hiện tại (dd/MM/yyyy)
- `{{current_year}}` - Năm hiện tại (yyyy)
- `{{current_month}}` - Tháng hiện tại (MM)
- `{{current_day}}` - Ngày hiện tại (dd)

### 3. Ví dụ Template Excel

#### Cell A1: `Hợp đồng tín dụng - {{customer_name}}`
#### Cell A3: `Số tiền vay: {{loan_amount_formatted}}`
#### Cell B3: `{{loan_amount_number}}` (Excel sẽ nhận dạng là số để tính toán)
#### Cell A4: `Lãi suất: {{interest_rate}}%`
#### Cell A5: `Ngày tạo: {{current_date}}`

### 4. Tính năng đặc biệt cho Excel

#### Tự động chuyển đổi kiểu dữ liệu:
- Các biến có hậu tố `_number` sẽ được chuyển thành số trong Excel
- Có thể sử dụng trong công thức Excel
- Ví dụ: `=B3*C3` (loan_amount_number * interest_rate_number)

#### Hỗ trợ nhiều worksheet:
- Template có thể có nhiều sheet
- Tất cả các sheet đều được xử lý tự động
- Placeholder hoạt động trên tất cả các sheet

#### Định dạng tiền tệ:
- Sử dụng `{{loan_amount_formatted}}` để hiển thị: "1.000.000 ₫"
- Sử dụng `{{loan_amount_number}}` để tính toán: 1000000

### 5. Upload và sử dụng

1. **Upload Template:**
   - Vào trang Templates (/templates)
   - Upload file .xlsx có chứa placeholder
   - Chọn loại tài liệu phù hợp

2. **Tạo tài liệu:**
   - Vào trang Documents (/documents)
   - Chọn template Excel từ dropdown
   - Chọn khách hàng, tài sản, đánh giá tín dụng
   - Chọn "Excel (.xlsx)" làm định dạng xuất
   - Nhấn "Tạo tài liệu"

3. **Kết quả:**
   - File Excel được tạo với dữ liệu đã điền sẵn
   - Lưu tự động vào Vercel Blob Storage
   - Có thể tải về hoặc gửi email

### 6. So sánh với DOCX

| Tính năng | DOCX | XLSX |
|-----------|------|------|
| Template placeholders | ✅ | ✅ |
| Tự động điền dữ liệu | ✅ | ✅ |
| Định dạng số | Cơ bản | Nâng cao (Excel formulas) |
| Nhiều sheets/pages | Không | ✅ |
| Tính toán tự động | Không | ✅ |
| Biểu đồ | Cơ bản | Nâng cao |

### 7. Troubleshooting

#### Template không được điền dữ liệu:
- Kiểm tra placeholder đúng format `{{tên_biến}}`
- Đảm bảo không có space thừa
- Kiểm tra tên biến có trong danh sách hỗ trợ

#### File Excel bị lỗi:
- Upload lại template gốc
- Kiểm tra file Excel không bị corrupt
- Đảm bảo file là định dạng .xlsx (không phải .xls)

#### Số không được nhận dạng:
- Sử dụng biến có hậu tố `_number`
- Ví dụ: `{{loan_amount_number}}` thay vì `{{loan_amount}}`

## Lợi ích của Excel Template

1. **Tính toán tự động**: Có thể tạo công thức để tính lãi, kỳ hạn, etc.
2. **Định dạng phong phú**: Màu sắc, border, format số
3. **Biểu đồ và chart**: Tự động tạo biểu đồ từ dữ liệu
4. **Multiple sheets**: Tổ chức thông tin theo nhiều trang
5. **Export friendly**: Dễ dàng xuất sang PDF hoặc in ấn

Hệ thống Excel template generation giờ đây mạnh mẽ không kém gì DOCX và phù hợp với các tài liệu tài chính, báo cáo số liệu.
