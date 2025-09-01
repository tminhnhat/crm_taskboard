# Fix for "Template file not found" Error

## Problem
The error "Template file not found. Please upload the required template in the Templates section." occurs during document generation because:

1. **URL Format Issue**: Templates stored in database have full Vercel Blob URLs (like `https://...`) but the `fetchTemplateFromVercelBlob` function was expecting only path format (like `maubieu/filename.docx`)

2. **Missing Error Handling**: The function didn't handle full URLs properly and had limited error messages

## Solution Applied

### 1. Enhanced `fetchTemplateFromVercelBlob` Function
**File**: `/src/lib/vercelBlob.ts`

- **Added URL Detection**: Function now detects if input is a full URL (starts with `https://`) or a path
- **Direct URL Fetching**: For full URLs, fetches directly without using Vercel Blob list API
- **Better Error Handling**: More descriptive error messages for debugging
- **Retry Logic**: Maintained retry mechanism for both URL and path approaches

### 2. Enhanced Error Messages  
**File**: `/src/app/api/documents/route.ts`

- Added specific error handling for various template-related errors:
  - Empty template files
  - Invalid ZIP signatures (corrupted DOCX files)
  - Customer not found
  - Blob storage configuration issues
  - Network/access errors

### 3. Debug Endpoint
**File**: `/src/app/api/templates/debug/route.ts`

- Created debug endpoint to test template access: `GET /api/templates/debug?templateId=1`
- Shows template metadata, URL analysis, fetch test results, and environment info

## Testing Instructions

### 1. Test Database Setup (if not done yet)
```bash
# Run the database migration
./database/setup-database.sh docs-only
```

### 2. Test Template Debug Endpoint
```bash
# Replace with actual template ID from your database
curl "http://localhost:3000/api/templates/debug?templateId=1"
```

Expected response should show:
- `fetchTest.success: true`
- `urlAnalysis.isFullUrl: true` 
- `environment.hasBlobToken: true`

### 3. Test Document Generation
Use your existing document generation interface or API call.

### 4. Check Template URLs in Database
```sql
-- Run in Supabase SQL Editor
SELECT template_id, template_name, file_url, length(file_url) as url_length
FROM dulieu_congviec.templates 
ORDER BY created_at DESC;
```

Expected format: `https://[blob-id].vercel-storage.com/maubieu/[filename]`

## Common Issues & Solutions

### Issue 1: "BLOB_READ_WRITE_TOKEN not configured"
**Solution**: Add environment variable in `.env.local`:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

### Issue 2: "Template không tìm thấy"
**Solutions**:
1. Check if template file exists in Vercel Blob Storage
2. Verify template `file_url` in database is correct
3. Use debug endpoint to test template access

### Issue 3: "Template file is corrupted or invalid"
**Solutions**:
1. Re-upload template file as DOCX format
2. Ensure template file is not empty
3. Check template contains valid placeholders like `{{customer_name}}`

### Issue 4: Database Table Not Found (404 on /templates)
**Solution**: Run database migration:
```bash
./database/setup-database.sh docs-only
```

## Verification Steps

1. **Database**: Templates table exists with correct name (`templates` not `document_templates`)
2. **Templates**: Template records exist with valid `file_url` values
3. **Environment**: `BLOB_READ_WRITE_TOKEN` is configured
4. **Network**: Template files are accessible via their URLs
5. **File Format**: Template files are valid DOCX format with placeholders

## Error Monitoring

Enhanced error logging now provides:
- Template URL being accessed
- Buffer size and ZIP signature validation
- Retry attempt details
- Environment configuration status

Check console logs during document generation for detailed debugging information.
