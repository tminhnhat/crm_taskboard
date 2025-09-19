# Sample Credit Assessment Document Template

## Hướng dẫn sử dụng Template Variables

Template này chứa tất cả các variable placeholder có sẵn trong hệ thống document generation.
Bạn có thể copy các variable này vào file DOCX hoặc XLSX template của mình.

---

## 📋 THÔNG TIN KHÁCH HÀNG (Customer Information)

### Thông tin cơ bản
- **Tên khách hàng**: {{customer_name}} hoặc {{full_name}}
- **Mã khách hàng**: {{customer_id}}
- **Loại khách hàng**: {{customer_type}}
- **Số CMND/CCCD**: {{id_number}}
- **Ngày cấp**: {{id_issue_date}}
- **Nơi cấp**: {{id_issue_authority}}
- **Ngày sinh**: {{date_of_birth}}
- **Giới tính**: {{gender}}
- **Điện thoại**: {{phone}}
- **Email**: {{email}}
- **Địa chỉ**: {{address}}

### Thông tin nghề nghiệp
- **Nghề nghiệp**: {{occupation}}
- **Thu nhập**: {{income}}
- **Thu nhập định dạng**: {{income_formatted}}
- **Nơi làm việc**: {{workplace}}
- **Chức vụ**: {{position}}

### Thông tin tài chính
- **Số tài khoản**: {{account_number}}
- **Số CIF**: {{cif_number}}
- **Tình trạng**: {{status}}

---

## 🏠 THÔNG TIN TÀI SẢN THẾ CHẤP (Collateral Information)

### Thông tin chung
- **ID tài sản**: {{collateral_id}}
- **Loại tài sản**: {{collateral_type}}
- **Mô tả**: {{collateral_description}} hoặc {{description}}
- **Giá trị**: {{collateral_value}}
- **Giá trị định dạng**: {{collateral_value_formatted}}
- **Vị trí**: {{location}}
- **Ngày định giá**: {{valuation_date}}
- **Ngày định giá lại**: {{re_evaluation_date}}
- **Tình trạng**: {{collateral_status}}

### Thông tin bất động sản
- **Số GCN**: {{so_gcn}}
- **Ngày cấp GCN**: {{ngay_cap_gcn}}
- **Số thửa**: {{so_thua}}
- **Tờ bản đồ**: {{to_ban_do}}
- **Diện tích đất**: {{dien_tich_dat}}
- **Diện tích sàn**: {{dien_tich_san}}
- **Địa chỉ đất**: {{dia_chi_dat}}
- **Loại đất**: {{loai_dat}}
- **Hình thức sở hữu**: {{hinh_thuc_so_huu}}

### Thông tin phương tiện
- **Biển số**: {{license_plate}}
- **Số khung**: {{chassis_number}}
- **Số máy**: {{engine_number}}
- **Hãng xe**: {{vehicle_brand}}
- **Model**: {{vehicle_model}}
- **Năm sản xuất**: {{manufacturing_year}}
- **Màu sắc**: {{vehicle_color}}
- **Số chỗ ngồi**: {{seating_capacity}}

### Thông tin tài chính
- **Số tài khoản**: {{account_number_collateral}}
- **Tên ngân hàng**: {{bank_name}}
- **Chi nhánh**: {{bank_branch}}
- **Số dư**: {{account_balance}}
- **Ngày mở**: {{account_opening_date}}
- **Ngày đáo hạn**: {{maturity_date}}

---

## 💰 THÔNG TIN THẨM ĐỊNH TÍN DỤNG (Credit Assessment)

### Thông tin cơ bản
- **ID thẩm định**: {{assessment_id}}
- **Nhân viên thẩm định**: {{staff_id}}
- **Sản phẩm**: {{product_id}}
- **Phòng ban**: {{department}}
- **Lãnh đạo phòng**: {{department_head}}
- **Phí thẩm định**: {{fee_amount}}
- **Trạng thái**: {{assessment_status}}

### Thông tin khoản vay
- **Số tiền vay**: {{loan_amount}}
- **Số tiền vay định dạng**: {{loan_amount_formatted}}
- **Lãi suất**: {{interest_rate}}
- **Thời hạn vay**: {{loan_term}}
- **Loại vay**: {{loan_type}}
- **Mục đích vay**: {{loan_purpose}}

### Thông tin phê duyệt
- **Quyết định phê duyệt**: {{approval_decision}}
- **Số tiền được duyệt**: {{approved_amount}}
- **Số tiền được duyệt định dạng**: {{approved_amount_formatted}}
- **Ngày phê duyệt**: {{approval_date}}
- **Người phê duyệt**: {{approver}}

---

## 👥 THÔNG TIN VỢ/CHỒNG (Spouse Information)

- **Tên vợ/chồng**: {{spouse_name}}
- **CMND vợ/chồng**: {{spouse_id_number}}
- **Điện thoại vợ/chồng**: {{spouse_phone}}
- **Nghề nghiệp vợ/chồng**: {{spouse_occupation}}
- **Thu nhập vợ/chồng**: {{spouse_income}}

---

## 📊 THÔNG TIN TÀI CHÍNH CHI TIẾT

### Nguồn trả nợ
- **Tổng nguồn trả nợ**: {{total_repayment_sources}}
- **Thu nhập từ lương**: {{salary_income}}
- **Thu nhập khác**: {{other_income}}

### Nợ phải trả
- **Tổng nợ**: {{total_liability}}
- **Nợ ngân hàng**: {{bank_debt}}
- **Nợ khác**: {{other_debt}}

### Chi phí sinh hoạt
- **Tổng chi phí**: {{total_expenses}}
- **Chi ăn uống**: {{food_expenses}}
- **Chi sinh hoạt**: {{living_expenses}}
- **Chi khác**: {{other_expenses}}

### Thu nhập còn lại
- **Thu nhập còn lại**: {{total_residual_income}}

---

## 🗓️ THÔNG TIN HỆ THỐNG (System Information)

### Ngày tháng
- **Ngày hiện tại**: {{current_date}}
- **Ngày giờ hiện tại**: {{current_datetime}}
- **Ngày**: {{current_day}}
- **Tháng**: {{current_month}}
- **Năm**: {{current_year}}

### Thông tin định dạng
- **Định dạng tiền tệ VND**: Sử dụng các trường có đuôi `_formatted`
- **Định dạng ngày**: dd/MM/yyyy
- **Định dạng ngày giờ**: dd/MM/yyyy HH:mm:ss

---

## 🔧 SỬ DỤNG NESTED OBJECTS

Ngoài các trường flatten ở trên, bạn có thể truy cập toàn bộ object:

### Customer Object
```
{{customer.full_name}}
{{customer.phone}}
{{customer.email}}
{{customer.metadata.any_field}}
```

### Collateral Object
```
{{collateral.collateral_type}}
{{collateral.value}}
{{collateral.description}}
{{collateral.metadata.so_gcn}}
{{collateral.metadata.license_plate}}
```

### Credit Assessment Object
```
{{creditAssessment.approved_amount}}
{{creditAssessment.loan_type}}
{{creditAssessment.assessment_details.loan_info.loan_purpose}}
{{creditAssessment.assessment_details.spouse_info.spouse_name}}
```

---

## 💡 TIPS SỬ DỤNG

1. **Kiểm tra dữ liệu**: Luôn test template với dữ liệu thật trước khi sử dụng
2. **Fallback values**: Sử dụng || để cung cấp giá trị mặc định: `{{customer_name || "Không có"}}`
3. **Nested access**: Truy cập sâu vào object: `{{customer.metadata.property_info.so_gcn}}`
4. **Formatting**: Sử dụng các trường có `_formatted` cho hiển thị đẹp

---

## 📝 VÍ DỤ TEMPLATE HOÀN CHỈNH

```
HỢP ĐỒNG TÍN DỤNG

Khách hàng: {{customer_name}}
CMND: {{id_number}} cấp ngày {{id_issue_date}} tại {{id_issue_authority}}
Địa chỉ: {{address}}
Điện thoại: {{phone}}

Thông tin khoản vay:
- Số tiền: {{loan_amount_formatted}}
- Lãi suất: {{interest_rate}}%/năm
- Thời hạn: {{loan_term}} tháng
- Mục đích: {{loan_purpose}}

Tài sản thế chấp:
- Loại: {{collateral_type}}
- Mô tả: {{collateral_description}}
- Giá trị: {{collateral_value_formatted}}
- Vị trí: {{location}}

Ngày lập: {{current_date}}
Người thẩm định: {{staff_name}}
```

---

**Lưu ý**: File này chỉ là hướng dẫn. Để tạo template thực tế, copy các variable cần thiết vào file DOCX hoặc XLSX của bạn.