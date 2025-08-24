# Template Corruption Fix - Complete Solution

## Problem Analysis

**Error**: `"Template file is corrupted or invalid. Please re-upload a valid DOCX template."`

**Root Causes**:
1. DOCX files corrupted during upload/download
2. Files uploaded in wrong format (not actual DOCX)
3. Incomplete file transfers
4. Empty or minimal template files
5. Corrupted ZIP structure within DOCX files

## Comprehensive Solution Implemented

### 1. Template Validation Function (`src/lib/documentService.ts`)

Added `validateDocxTemplate()` function with comprehensive checks:

```typescript
function validateDocxTemplate(buffer: Buffer): { isValid: boolean; error?: string } {
  // File size validation (minimum 1KB for valid DOCX)
  if (buffer.length < 1000) {
    return { isValid: false, error: 'Template file is too small (likely corrupted)' };
  }

  // ZIP signature validation (DOCX are ZIP files)
  const firstBytes = buffer.subarray(0, 4);
  if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
    return { isValid: false, error: 'Not a valid ZIP/DOCX file (invalid signature)' };
  }

  // DOCX structure validation
  const zip = new PizZip(buffer);
  const requiredFiles = ['[Content_Types].xml', 'word/document.xml', '_rels/.rels'];
  
  for (const file of requiredFiles) {
    if (!zip.file(file)) {
      return { isValid: false, error: `Missing required file: ${file}` };
    }
  }

  // XML content validation
  const documentXml = zip.file('word/document.xml');
  const content = documentXml.asText();
  
  if (!content || content.length < 100) {
    return { isValid: false, error: 'Document content is empty or too small' };
  }
  
  if (!content.includes('<w:document') || !content.includes('</w:document>')) {
    return { isValid: false, error: 'Invalid document XML structure' };
  }

  return { isValid: true };
}
```

### 2. Enhanced Template Processing

**Before Processing**:
```typescript
// Validate template using comprehensive validation
const validation = validateDocxTemplate(templateBuffer);
if (!validation.isValid) {
  throw new Error(`Template file is corrupted or invalid: ${validation.error}. Please re-upload a valid DOCX template.`);
}
```

**During ZIP Initialization**:
```typescript
try {
  const zip = new PizZip(templateBuffer);
  // Check for required DOCX files structure
  const contentTypesFile = zip.file('[Content_Types].xml');
  if (!contentTypesFile) {
    throw new Error('Template file is corrupted: missing [Content_Types].xml');
  }
  
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) {
    throw new Error('Template file is corrupted: missing word/document.xml');
  }
} catch (initError) {
  // Handle specific corruption types
  if (initError.message.includes('Can\'t read the data')) {
    throw new Error('Template file is corrupted or invalid. Please re-upload a valid DOCX template.');
  }
  throw new Error(`Template file is corrupted or invalid. Details: ${initError.message}`);
}
```

### 3. Template Validation API (`src/app/api/templates/validate/route.ts`)

Added diagnostic endpoint for testing templates:

- **POST `/api/templates/validate`**: Validate specific template
- **GET `/api/templates/validate`**: Validate all templates

**Response Format**:
```json
{
  "templateName": "to_trinh_tham_dinh.docx",
  "validation": {
    "isValid": true,
    "details": {
      "size": 12485,
      "hasZipSignature": true,
      "requiredFiles": {
        "[Content_Types].xml": true,
        "word/document.xml": true,
        "_rels/.rels": true
      },
      "xmlContent": {
        "length": 2842,
        "hasDocumentTag": true,
        "hasClosingTag": true
      }
    }
  }
}
```

### 4. User-Friendly Error Messages

**Specific Error Types**:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Template file is too small (likely corrupted)" | Incomplete upload/empty file | Re-upload complete file |
| "Not a valid ZIP/DOCX file (invalid signature)" | Wrong file format | Save as .docx in Word |
| "Missing required file: [Content_Types].xml" | Corrupted DOCX structure | Create new document in Word |
| "Document content is empty or too small" | Empty template | Add content to template |
| "Invalid document XML structure" | Corrupted Word XML | Use "Open and Repair" in Word |

## Testing and Validation

### 1. Template Validation Endpoint
```bash
# Test specific template
curl -X POST /api/templates/validate -d '{"templateName":"to_trinh_tham_dinh"}' 

# Test all templates
curl /api/templates/validate
```

### 2. Document Generation Testing
```bash
# Should work with valid template
curl -X POST /api/documents -d '{
  "documentType": "to_trinh_tham_dinh",
  "exportType": "docx",
  "customerId": "1"
}'

# Should show clear error with invalid template
curl -X POST /api/documents -d '{
  "documentType": "invalid_template",
  "exportType": "docx", 
  "customerId": "1"
}'
```

## User Instructions

### For Template Upload Issues:

1. **Check File Format**: Ensure file is actually `.docx` (not `.doc`, `.html`, `.pdf`)
2. **Verify in Word**: Open file in Microsoft Word to confirm it works
3. **Create Fresh File**: Use "Save As" > "Word Document (.docx)" to create clean file
4. **Add Content**: Ensure template has actual content (not empty document)
5. **Stable Upload**: Use stable internet connection for complete file transfer

### For Template Creation:

1. **Use Microsoft Word**: Not Google Docs or LibreOffice for best compatibility
2. **Save as DOCX**: Use modern .docx format, not legacy .doc
3. **Add Placeholders**: Include template variables like `{customer_name}`
4. **Test Template**: Open/close in Word before uploading
5. **Avoid Complex Formatting**: Keep templates simple for reliable processing

## Benefits of the Fix

- ✅ **Early Detection**: Catches corruption before processing starts
- ✅ **Specific Diagnostics**: Identifies exact type of corruption
- ✅ **User Guidance**: Provides actionable steps to fix issues
- ✅ **Robust Processing**: Handles edge cases gracefully
- ✅ **Debugging Tools**: API endpoints for testing templates
- ✅ **Prevention**: Validates templates at multiple stages

## Monitoring

1. **Template Validation API**: Use to check all templates health
2. **Document Generation Logs**: Monitor for specific error types
3. **User Feedback**: Track upload success rates
4. **Error Patterns**: Identify common corruption sources

This comprehensive fix transforms cryptic corruption errors into clear, actionable guidance while ensuring robust template processing across different environments.
