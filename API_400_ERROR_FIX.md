# API 400 Error Fix - Document Generation Endpoint

## Problem Analysis

**API Endpoint**: `https://crm.titi.io.vn/api/documents?return=json`  
**Issue**: Returns 400 (Bad Request) error when generating documents
**Root Cause**: Client-side request validation failures

## Common Causes of 400 Errors

### 1. Missing Required Fields
The API requires these mandatory fields:
- `documentType` (string)
- `customerId` (string) 
- `exportType` (string)

### 2. Invalid Field Values

**Document Type** must be one of:
- `hop_dong_tin_dung` (Hợp đồng tín dụng)
- `to_trinh_tham_dinh` (Tờ trình thẩm định)
- `giay_de_nghi_vay_von` (Giấy đề nghị vay vốn)
- `bien_ban_dinh_gia` (Biên bản định giá)
- `hop_dong_the_chap` (Hợp đồng thế chấp)
- `bang_tinh_lai` (Bảng tính lãi)
- `lich_tra_no` (Lịch trả nợ)

**Export Type** must be:
- `docx` (Word document)
- `xlsx` (Excel spreadsheet)

### 3. Request Format Issues
- Malformed JSON syntax
- Missing `Content-Type: application/json` header
- Invalid character encoding

## Enhanced Error Handling Implemented

### Improved API Route (`src/app/api/documents/route.ts`)

1. **Enhanced JSON Parsing with Error Handling**:
```typescript
try {
  body = await req.json();
  console.log('Parsed request body:', body);
} catch (jsonError) {
  return NextResponse.json({ 
    error: 'Invalid JSON in request body',
    details: jsonError.message
  }, { status: 400 });
}
```

2. **Detailed Field Validation**:
```typescript
const missingFields = [];
if (!documentType) missingFields.push('documentType');
if (!customerId) missingFields.push('customerId'); 
if (!exportType) missingFields.push('exportType');

if (missingFields.length > 0) {
  return NextResponse.json({ 
    error: 'Missing required fields: ' + missingFields.join(', '),
    received: { documentType, customerId, exportType },
    required: ['documentType', 'customerId', 'exportType']
  }, { status: 400 });
}
```

3. **Enhanced Value Validation**:
```typescript
if (!validDocumentTypes.includes(documentType)) {
  return NextResponse.json({ 
    error: `Invalid document type: ${documentType}`,
    received: documentType,
    validTypes: validDocumentTypes,
    suggestion: 'Use one of the valid document types listed in validTypes array'
  }, { status: 400 });
}
```

4. **Comprehensive Logging**:
```typescript
console.log('Request URL:', req.url);
console.log('Request headers:', Object.fromEntries(req.headers.entries()));
console.log('Extracted params:', { documentType, customerId, collateralId, creditAssessmentId, exportType });
```

## Error Response Examples

### Missing Fields (400)
```json
{
  "error": "Missing required fields: documentType, exportType",
  "received": {
    "documentType": "",
    "customerId": "1",
    "exportType": ""
  },
  "required": ["documentType", "customerId", "exportType"]
}
```

### Invalid Document Type (400)
```json
{
  "error": "Invalid document type: invalid_type",
  "received": "invalid_type",
  "validTypes": [
    "hop_dong_tin_dung",
    "to_trinh_tham_dinh",
    "giay_de_nghi_vay_von",
    "bien_ban_dinh_gia",
    "hop_dong_the_chap",
    "bang_tinh_lai",
    "lich_tra_no"
  ],
  "suggestion": "Use one of the valid document types listed in validTypes array"
}
```

### Invalid JSON (400)
```json
{
  "error": "Invalid JSON in request body",
  "details": "Unexpected token } in JSON at position 45"
}
```

## Testing Tools Provided

### 1. Bash Test Script
```bash
./test-api-400-errors.sh
```
Tests all common 400 error scenarios with the live API.

### 2. Node.js Diagnostic Tool
```bash
node api-diagnostic-tool.js
```
Comprehensive API testing with detailed analysis.

### 3. Manual cURL Commands

**Test Missing Field**:
```bash
curl -X POST "https://crm.titi.io.vn/api/documents?return=json" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "1", "exportType": "docx"}'
```

**Test Invalid Document Type**:
```bash
curl -X POST "https://crm.titi.io.vn/api/documents?return=json" \
  -H "Content-Type: application/json" \
  -d '{"documentType": "invalid", "customerId": "1", "exportType": "docx"}'
```

**Valid Request**:
```bash
curl -X POST "https://crm.titi.io.vn/api/documents?return=json" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "exportType": "docx"
  }'
```

## Debugging Steps

1. **Check Request Format**:
   - Ensure JSON is properly formatted
   - Include `Content-Type: application/json` header
   - Verify all required fields are present

2. **Validate Field Values**:
   - Use only valid `documentType` values
   - Use only `docx` or `xlsx` for `exportType`
   - Ensure IDs are strings, not numbers

3. **Review Server Logs**:
   - Check Vercel function logs for detailed error context
   - Look for specific validation failure messages
   - Monitor request parsing success/failure

4. **Test with Tools**:
   - Use provided test scripts to isolate issues
   - Start with simple valid requests
   - Gradually add complexity to identify breaking point

## Success Response Format

When the request is valid and processing succeeds:

```json
{
  "blobUrl": "https://blob.vercel-storage.com/ketqua/to_trinh_tham_dinh_1_20250824_123456.docx",
  "filename": "to_trinh_tham_dinh_1_20250824_123456.docx",
  "message": "Document generated successfully"
}
```

## Monitoring & Maintenance

1. **Server-Side Monitoring**:
   - Track 400 error frequency and causes
   - Monitor field validation failure patterns
   - Log common request format issues

2. **Client-Side Improvements**:
   - Add request validation before sending
   - Provide user-friendly error messages
   - Implement request retry logic for transient issues

3. **API Documentation**:
   - Keep valid field values updated
   - Provide clear examples for each document type
   - Document all possible error responses

The enhanced error handling now provides specific, actionable error messages instead of generic 400 responses, making it much easier to identify and fix request issues.
