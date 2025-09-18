# 📋 Hướng dẫn sử dụng Template Variables

## 📁 Files trong thư mục này

1. **`sample_credit_assessment_template.md`** - Hướng dẫn đầy đủ tất cả variables
2. **`DOCX_Template_Variables.md`** - Template ready-to-copy cho Microsoft Word
3. **`XLSX_Template_Sample.csv`** - Danh sách variables cho Excel/CSV
4. **`SAMPLE_DOCUMENT_TEMPLATE.docx`** - File template mẫu (placeholder)

## 🚀 Cách sử dụng nhanh

### Cho DOCX Template (Microsoft Word):
1. Mở file `DOCX_Template_Variables.md`
2. Copy sections cần thiết
3. Paste vào Word document
4. Save as `.docx`
5. Upload vào hệ thống

### Cho XLSX Template (Excel):
1. Mở file `XLSX_Template_Sample.csv` 
2. Import vào Excel
3. Tạo layout theo ý muốn
4. Sử dụng variables từ cột "Variable Placeholder"
5. Save as `.xlsx`

### Cho developers:
1. Tham khảo `sample_credit_assessment_template.md` để hiểu đầy đủ structure
2. Sử dụng nested objects để truy cập data phức tạp
3. Kiểm tra file `documentPlaceholders.ts` trong `/src/lib/` để cập nhật

## 🎯 Variables phổ biến nhất

```
{{customer_name}} - Tên khách hàng
{{loan_amount_formatted}} - Số tiền vay (có định dạng)
{{collateral_type}} - Loại tài sản thế chấp
{{current_date}} - Ngày hiện tại
{{approval_decision}} - Quyết định phê duyệt
```

## 💡 Tips quan trọng

- ✅ Luôn sử dụng `_formatted` cho số tiền và số lượng lớn
- ✅ Test template với dữ liệu thật trước khi production
- ✅ Backup template gốc trước khi chỉnh sửa
- ✅ Đọc kỹ documentation trước khi tạo template phức tạp

## 🔗 Liên kết

- **Source code**: `/src/lib/documentService.ts`
- **Placeholder definitions**: `/src/lib/documentPlaceholders.ts`
- **Form integration**: `/src/components/CreditAssessmentForm.tsx`

---

**Tạo bởi**: Document Generation System  
**Cập nhật**: 25/01/2025  
**Version**: 1.0