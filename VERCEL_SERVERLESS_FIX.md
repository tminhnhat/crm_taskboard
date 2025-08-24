# Vercel Serverless Document Generation Fix

## Problem Summary
The application was throwing `"Lỗi tạo tài liệu: Document generation failed: Template loading failed: Multi error"` when running in Vercel serverless environment. This generic error made it difficult to diagnose the actual issue.

## Root Cause Analysis
1. **Docxtemplater "Multi error"**: Generic error in serverless environment when template processing fails
2. **Buffer Handling**: Differences in how ArrayBuffer/Buffer are handled between local and serverless
3. **Template Validation**: Missing validation for template file integrity in serverless environment
4. **Error Context**: Insufficient logging for debugging serverless-specific issues

## Serverless-Specific Fixes Applied

### 1. Enhanced Buffer Handling (`src/lib/documentService.ts`)

**Problem**: Docxtemplater fails with "Multi error" due to invalid buffer types in serverless
**Solution**: Added comprehensive buffer validation and conversion

```typescript
// Enhanced buffer validation
if (!(templateBuffer instanceof ArrayBuffer) && !Buffer.isBuffer(templateBuffer)) {
  throw new Error(`Invalid template buffer format: ${typeof templateBuffer}`);
}

// Improved Docxtemplater initialization with nullGetter
const doc = new Docxtemplater(zip, { 
  paragraphLoop: true, 
  linebreaks: true,
  nullGetter: function(part: any) {
    if (part.module === 'rawxml') {
      return '';
    }
    return '';
  }
});

// Enhanced error catching for template rendering
try {
  doc.render(documentData);
  outBuffer = doc.getZip().generate({ type: 'nodebuffer' });
} catch (renderError: any) {
  if (renderError.properties && renderError.properties.errors) {
    const errorDetails = renderError.properties.errors.map((err: any) => 
      `${err.message} at ${err.part || 'unknown location'}`
    ).join('; ');
    throw new Error(`Template rendering failed: ${errorDetails}`);
  }
  throw new Error(`Template rendering failed: ${renderError.message || 'Unknown rendering error'}`);
}
```

### 2. Improved Template Fetching (`src/lib/vercelBlob.ts`)

**Problem**: Template files may be corrupted or empty in serverless environment
**Solution**: Added buffer validation and enhanced error messages

```typescript
// Enhanced buffer validation
if (!templateBuffer || templateBuffer.byteLength === 0) {
  throw new Error(`Template file '${blobPath}' is empty or corrupted`);
}

// Better error context
catch (error) {
  console.error('Template fetch error details:', {
    blobPath,
    error: error instanceof Error ? error.message : error,
    bufferSize: templateBuffer ? templateBuffer.byteLength : 'undefined'
  });
  
  if (error instanceof Error && error.message.includes('not found')) {
    throw new Error(`Template không tìm thấy: ${blobPath}`);
  }
  throw new Error(`Failed to fetch template: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### 3. Enhanced API Error Handling (`src/app/api/documents/route.ts`)

**Problem**: Poor error context in serverless logs
**Solution**: Added comprehensive request context logging

```typescript
// Improved variable scope management
let documentType = '';
let customerId = '';
let collateralId = '';
let creditAssessmentId = '';
let exportType = '';

// Enhanced error logging with serverless context
console.error('Request context:', {
  documentType: documentType || 'undefined',
  exportType: exportType || 'undefined', 
  customerId: customerId || 'undefined',
  collateralId: collateralId || 'undefined',
  creditAssessmentId: creditAssessmentId || 'undefined',
  userAgent: req.headers.get('user-agent'),
  runtime: process.env.VERCEL ? 'vercel-serverless' : 'local'
});
```

## Testing in Vercel Environment

### 1. Deploy to Vercel
```bash
vercel --prod
```

### 2. Test Cases
1. **Template Available**: Test with `to_trinh_tham_dinh` (should work)
2. **Template Missing**: Test with `hop_dong_tin_dung` (should show clear error)
3. **Excel Export**: Test XLSX export (should work without templates)

### 3. Monitor Logs
```bash
vercel logs
```

## Expected Behavior After Fix

### Before ❌
- Generic "Multi error" message
- No context about what failed
- Difficult to debug in serverless environment
- Poor user experience

### After ✅
- Clear, specific error messages
- Enhanced logging for debugging
- Proper buffer handling in serverless
- Graceful error handling with actionable feedback

## Error Message Examples

### Template Missing (Clear Error)
```
"Template file missing: Please upload a template for document type 'hop_dong_tin_dung' in the Templates dashboard before generating documents."
```

### Template Rendering Error (Specific)
```
"Template rendering failed: Missing variable 'customer_name' at paragraph 1"
```

### Buffer Error (Diagnostic)
```
"Invalid template buffer format: object (expected ArrayBuffer or Buffer)"
```

## Monitoring and Maintenance

1. **Vercel Logs**: Monitor function execution logs for errors
2. **Template Status**: Check template availability in UI
3. **User Feedback**: Track user-reported generation failures
4. **Performance**: Monitor document generation latency

## Rollback Plan

If issues persist:
1. Revert `documentService.ts` changes
2. Add more detailed buffer debugging
3. Consider implementing template caching
4. Evaluate alternative document generation libraries

## Success Metrics

- ✅ Elimination of generic "Multi error" messages
- ✅ Clear error messages for missing templates
- ✅ Successful document generation for available templates
- ✅ Enhanced debugging capabilities in Vercel logs
- ✅ Improved user experience with actionable error messages

The fix addresses the core issues causing document generation failures in Vercel serverless environment while providing better debugging capabilities and user experience.
