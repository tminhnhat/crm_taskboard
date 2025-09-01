# Document Service Cleanup - Remove Excel Functions

## Tóm tắt thay đổi

Đã thành công xóa các function liên quan đến `bang_tinh_lai` và `lich_tra_no` khỏi document service và cleanup toàn bộ code.

## ✅ Những gì đã được xóa/thay đổi

### 1. **DocumentService.ts**
- ❌ Removed `bang_tinh_lai` và `lich_tra_no` từ `DocumentType` enum
- ❌ Removed import `addMonths` từ date-fns (không còn cần)
- ❌ Removed import `* as XLSX` (không còn cần Excel)
- ❌ Removed function `generateInterestCalculationSheet()`
- ❌ Removed function `generateRepaymentScheduleSheet()`
- ❌ Removed function `generateExcelBuffer()`
- ❌ Removed interface `ExcelRow`
- ❌ Removed Excel generation logic từ `generateCreditDocument()`
- ✅ Updated export type validation để reject xlsx explicitly
- ✅ Simplified code flow chỉ support DOCX templates

### 2. **Documents Page**
- ❌ Removed `bang_tinh_lai` và `lich_tra_no` từ `documentTypes` array
- ❌ Removed Excel export option từ form
- ❌ Removed Excel-related validation logic
- ❌ Removed Excel conversion messages
- ✅ Updated interface `DocumentGenerationForm` để chỉ support `'docx'`
- ✅ Simplified template validation logic
- ✅ Updated form labels và help text
- ✅ Updated warning messages

### 3. **Supabase Types**
- ❌ Removed `bang_tinh_lai` và `lich_tra_no` từ `DocumentType`
- ❌ Removed `'pdf' | 'xlsx'` từ `DocumentExportType` (chỉ còn `'docx'`)

## 🔧 Logic mới

### Document Generation Flow:
```
User selects document type → Check template exists → Generate DOCX only
                                    ↓
                              No template = Show error + link to templates
```

### Export Type Support:
- ✅ **DOCX**: Full support với template system
- ❌ **XLSX**: Explicitly rejected với clear error message  
- ❌ **PDF**: Not implemented (existing behavior)

### Template Validation:
```javascript
// Before: Conditional validation based on export type
if (formData.exportType === 'docx' && !hasTemplate) { ... }

// After: All documents require templates
if (!hasTemplate) {
  alert('Vui lòng tải lên template trước khi tạo tài liệu');
  return;
}
```

## 📁 Files Modified

1. `/src/lib/documentService.ts` - Core document generation logic
2. `/src/app/documents/page.tsx` - Document management UI
3. `/src/lib/supabase.ts` - Type definitions

## 🧹 Code Cleanup Benefits

### Reduced Complexity:
- **-150 lines** of Excel generation code
- **-2 document types** to maintain
- **-1 export format** to handle
- **-3 functions** for Excel generation

### Simplified Logic:
- Single export path (DOCX only)
- Consistent template requirement
- Cleaner error handling
- Reduced conditional complexity

### Improved Maintainability:
- Fewer dependencies (removed XLSX library usage)
- Cleaner type definitions
- Focused functionality
- Better user experience with clear messaging

## 🎯 User Experience Changes

### Before:
- Users could choose between DOCX/XLSX
- Some documents generated Excel, others needed templates
- Confusing validation messages
- Inconsistent behavior

### After:
- All documents require templates
- Single, consistent workflow
- Clear error messages with actionable guidance
- Simplified UI with focus on template management

## 🔄 Migration Impact

### Database:
- No database changes needed
- Existing documents unaffected
- Templates system unchanged

### API:
- Excel endpoints still work but return errors for removed types
- DOCX generation unchanged
- Template management unaffected

### User Workflow:
1. **Old**: Create document → Choose format → Hope template exists
2. **New**: Ensure template exists → Create document → Get DOCX result

## 🚀 Next Steps

The system is now:
- ✅ Cleaner and more maintainable
- ✅ Focused on core template functionality  
- ✅ Consistent in document generation approach
- ✅ Better user experience with clear guidance

Users should upload templates for all needed document types before generating documents.
