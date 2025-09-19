# DOCX Template Variables - Copy & Paste Ready

## 🚀 Cách sử dụng
1. Mở Microsoft Word
2. Tạo template mới 
3. Copy các variable bên dưới và paste vào vị trí mong muốn
4. Lưu file với định dạng .docx
5. Upload vào hệ thống để sử dụng

---

## 📋 HEADER TEMPLATE

```
HỢP ĐỒNG TÍN DỤNG SỐ: {{assessment_id}}

Ngày lập: {{current_date}}
Khách hàng: {{customer_name}}
Số CMND/CCCD: {{id_number}}
```

---

## 👤 THÔNG TIN KHÁCH HÀNG

```
THÔNG TIN KHÁCH HÀNG

Họ và tên: {{customer_name}}
Mã khách hàng: {{customer_id}}
Ngày sinh: {{date_of_birth}}
Giới tính: {{gender}}
Số CMND/CCCD: {{id_number}}
Ngày cấp: {{id_issue_date}}
Nơi cấp: {{id_issue_authority}}
Địa chỉ thường trú: {{address}}
Số điện thoại: {{phone}}
Email: {{email}}
Nghề nghiệp: {{occupation}}
Thu nhập hàng tháng: {{income_formatted}}
Nơi làm việc: {{workplace}}
Chức vụ: {{position}}
Tình trạng hôn nhân: {{marital_status}}
```

---

## 👥 THÔNG TIN VỢ/CHỒNG

```
THÔNG TIN VỢ/CHỒNG

Họ và tên: {{spouse_name}}
Số CMND/CCCD: {{spouse_id_number}}
Ngày sinh: {{spouse_date_of_birth}}
Số điện thoại: {{spouse_phone}}
Nghề nghiệp: {{spouse_occupation}}
Thu nhập hàng tháng: {{spouse_income_formatted}}
Nơi làm việc: {{spouse_workplace}}
```

---

## 🏠 THÔNG TIN TÀI SẢN THẾ CHẤP

```
THÔNG TIN TÀI SẢN THẾ CHẤP

Loại tài sản: {{collateral_type}}
Mô tả chi tiết: {{collateral_description}}
Giá trị định giá: {{collateral_value_formatted}}
Vị trí/Địa chỉ: {{location}}
Ngày định giá: {{valuation_date}}
Ngày định giá lại: {{re_evaluation_date}}
Tình trạng: {{collateral_status}}

[Dành cho Bất động sản]
Số GCN: {{so_gcn}}
Ngày cấp GCN: {{ngay_cap_gcn}}
Số thửa đất: {{so_thua}}
Tờ bản đồ số: {{to_ban_do}}
Diện tích đất: {{dien_tich_dat}} m²
Diện tích sàn xây dựng: {{dien_tich_san}} m²
Địa chỉ thửa đất: {{dia_chi_dat}}
Loại đất: {{loai_dat}}
Hình thức sở hữu: {{hinh_thuc_so_huu}}

[Dành cho Phương tiện]
Biển số đăng ký: {{license_plate}}
Số khung: {{chassis_number}}
Số máy: {{engine_number}}
Hãng sản xuất: {{vehicle_brand}}
Model/Dòng xe: {{vehicle_model}}
Năm sản xuất: {{manufacturing_year}}
Màu sắc: {{vehicle_color}}
Số chỗ ngồi: {{seating_capacity}}

[Dành cho Tài sản tài chính]
Số tài khoản: {{account_number_collateral}}
Tên ngân hàng: {{bank_name}}
Chi nhánh: {{bank_branch}}
Số dư hiện tại: {{account_balance_formatted}}
Ngày mở tài khoản: {{account_opening_date}}
Ngày đáo hạn: {{maturity_date}}
```

---

## 💰 THÔNG TIN KHOẢN VAY

```
THÔNG TIN KHOẢN VAY

Số tiền vay đề nghị: {{loan_amount_formatted}}
Lãi suất: {{interest_rate}}% /năm
Thời hạn vay: {{loan_term}} tháng
Loại hình vay: {{loan_type}}
Mục đích vay: {{loan_purpose}}
Hình thức trả nợ: {{repayment_method}}
Tần suất trả nợ: {{payment_frequency}}

KẾT QUẢ THẨM ĐỊNH:
Quyết định: {{approval_decision}}
Số tiền được duyệt: {{approved_amount_formatted}}
Lãi suất áp dụng: {{approved_interest_rate}}% /năm
Thời hạn được duyệt: {{approved_term}} tháng
Ngày phê duyệt: {{approval_date}}
Người phê duyệt: {{approver}}
```

---

## 📊 PHÂN TÍCH TÀI CHÍNH

```
PHÂN TÍCH TÀI CHÍNH KHÁCH HÀNG

NGUỒN THU NHẬP:
- Thu nhập từ lương: {{salary_income_formatted}}
- Thu nhập từ kinh doanh: {{business_income_formatted}}
- Thu nhập khác: {{other_income_formatted}}
- Thu nhập vợ/chồng: {{spouse_income_formatted}}
TỔNG NGUỒN THU: {{total_repayment_sources_formatted}}

CÁC KHOẢN NỢ HIỆN TẠI:
- Nợ ngân hàng: {{bank_debt_formatted}}
- Nợ tín dụng đen: {{informal_debt_formatted}}
- Nợ khác: {{other_debt_formatted}}
TỔNG NỢ HIỆN TẠI: {{total_liability_formatted}}

CHI PHÍ SINH HOẠT:
- Chi phí ăn uống: {{food_expenses_formatted}}
- Chi phí sinh hoạt: {{living_expenses_formatted}}
- Chi phí giáo dục: {{education_expenses_formatted}}
- Chi phí y tế: {{medical_expenses_formatted}}
- Chi phí khác: {{other_expenses_formatted}}
TỔNG CHI PHÍ: {{total_expenses_formatted}}

KẾT QUẢ PHÂN TÍCH:
Thu nhập còn lại sau chi phí: {{total_residual_income_formatted}}
Khả năng trả nợ hàng tháng: {{debt_service_capacity_formatted}}
Tỷ lệ thu nhập/nợ: {{debt_to_income_ratio}}%
```

---

## 🏢 THÔNG TIN THẨM ĐỊNH

```
THÔNG TIN THẨM ĐỊNH

Mã hồ sơ thẩm định: {{assessment_id}}
Nhân viên thẩm định: {{staff_name}}
Mã nhân viên: {{staff_id}}
Phòng ban: {{department}}
Trưởng phòng phê duyệt: {{department_head}}
Sản phẩm tín dụng: {{product_name}}
Mã sản phẩm: {{product_id}}
Phí thẩm định: {{fee_amount_formatted}}
Trạng thái hồ sơ: {{assessment_status}}
Ngày tiếp nhận: {{application_date}}
Ngày hoàn thành thẩm định: {{completion_date}}
```

---

## 📝 ĐÁNH GIÁ VÀ KẾT LUẬN

```
ĐÁNH GIÁ RỦI RO

Mức độ rủi ro: {{risk_level}}
Điểm tín dụng: {{credit_score}}
Lịch sử tín dụng: {{credit_history_status}}
Khả năng trả nợ: {{repayment_capacity}}
Giá trị tài sản bảo đảm: {{collateral_coverage_ratio}}%

KẾT LUẬN VÀ KIẾN NGHỊ:
{{assessment_conclusion}}

ĐỀ XUẤT CÁC ĐIỀU KIỆN ĐẶC BIỆT:
{{special_conditions}}

GHI CHÚ THÊM:
{{additional_notes}}
```

---

## 📅 FOOTER TEMPLATE

```
────────────────────────────────────────

Ngày lập: {{current_date}}
Thời gian: {{current_datetime}}

CHỮ KÝ XÁC NHẬN

KHÁCH HÀNG                    NHÂN VIÊN THẨM ĐỊNH
{{customer_name}}             {{staff_name}}


TRƯỞNG PHÒNG TÍN DỤNG        GIÁM đỐC
{{department_head}}           

Hồ sơ được lập tại: {{company_name}}
Địa chỉ: {{company_address}}
Điện thoại: {{company_phone}}
```

---

## 🎯 TEMPLATE MẪU NGẮN GỌN

```
HỢP ĐỒNG VAY VỐN

Bên cho vay: {{company_name}}
Bên vay: {{customer_name}} (CMND: {{id_number}})

Thông tin khoản vay:
- Số tiền: {{approved_amount_formatted}}
- Lãi suất: {{approved_interest_rate}}%/năm  
- Thời hạn: {{approved_term}} tháng
- Mục đích: {{loan_purpose}}

Tài sản bảo đảm:
{{collateral_type}} - {{collateral_description}}
Giá trị: {{collateral_value_formatted}}

Ngày ký: {{current_date}}

Chữ ký:
Bên vay: ________________    Bên cho vay: ________________
```

---

## 💡 GHI CHÚ QUAN TRỌNG

1. **Định dạng tiền tệ**: Sử dụng variables có đuôi `_formatted` để hiển thị đẹp (VD: ₫1.500.000.000)
2. **Ngày tháng**: Format chuẩn dd/MM/yyyy
3. **Kiểm tra dữ liệu**: Test với dữ liệu thật trước khi sử dụng chính thức
4. **Nested objects**: Có thể truy cập sâu hơn như `{{customer.metadata.custom_field}}`
5. **Conditional logic**: Một số hệ thống hỗ trợ if/else trong template

**File này sẵn sàng để copy-paste vào Microsoft Word template!**