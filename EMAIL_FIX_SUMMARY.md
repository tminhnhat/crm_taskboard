# Email Sending Fix - "Document not found" Error Resolution

## 🎯 **Problem Identified:**

The "Lỗi gửi email: Document not found" error was caused by the email API trying to find documents in the local filesystem (`ketqua/` directory) instead of Vercel Blob storage where documents are actually stored.

## ✅ **Solution Implemented:**

### 1. **Root Cause Fixed:**
- **Before**: Email API looked for files in local `ketqua/` directory (which doesn't exist in serverless)
- **After**: Email API fetches documents from Vercel Blob storage using `fetchTemplateFromVercelBlob()`

### 2. **New Function Created:**
- Added `sendDocumentByEmailFromBlob()` function that:
  - Fetches documents from Vercel Blob storage
  - Handles both filename and blob URL formats
  - Includes comprehensive error handling and logging
  - Verifies SMTP configuration before sending

### 3. **Enhanced Error Handling:**
- Better error messages for debugging
- SMTP configuration validation
- Blob path handling for different filename formats
- Detailed console logging for troubleshooting

### 4. **Fixed Environment Variables:**
- **Before**: Used `SMTP_PASS` (undefined)
- **After**: Uses `SMTP_PASSWORD` (matching .env file)

## 🔧 **Changes Made:**

### Files Modified:

1. **`src/app/api/documents/sendmail/route.ts`**
   - Updated to use `sendDocumentByEmailFromBlob()` instead of local file checking
   - Removed `existsSync()` file system checks
   - Improved error handling

2. **`src/lib/documentService.ts`**
   - Added new `sendDocumentByEmailFromBlob()` function
   - Fixed SMTP environment variable name (`SMTP_PASS` → `SMTP_PASSWORD`)
   - Enhanced error messages and logging

3. **`src/app/documents/page.tsx`**
   - Added debugging logs to help troubleshoot issues
   - Added validation for missing file_name

## ⚙️ **Configuration Required:**

To enable email functionality, update your environment variables:

```bash
# Current (won't work)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Required (real SMTP server)
SMTP_HOST=smtp.gmail.com  # or your SMTP server
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail App Password
```

### For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `SMTP_PASSWORD`

### For other providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Your provider's settings

## 🧪 **Testing:**

1. **Check Document Storage:**
   ```bash
   # Verify documents exist in Vercel Blob
   curl https://your-app.vercel.app/api/documents
   ```

2. **Test Email Function:**
   - Generate a document first
   - Try sending via email
   - Check console logs for detailed error messages

## 📋 **Error Messages Guide:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Document not found: filename" | File doesn't exist in blob storage | Ensure document was generated and stored |
| "SMTP configuration is not properly set up" | Missing SMTP env vars | Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD |
| "Email server configuration error" | Wrong SMTP settings | Verify SMTP credentials and server settings |
| "Document file name is missing" | Document object lacks file_name | Check document generation process |

## ✅ **Status:**

- ✅ **API Fixed**: Email API now uses Vercel Blob storage
- ✅ **Error Handling**: Comprehensive logging and error messages
- ✅ **Environment**: Fixed SMTP_PASSWORD variable name
- ⚙️ **SMTP Configuration**: Requires real SMTP server setup
- 🧪 **Testing**: Ready for testing with proper SMTP config

## 🚀 **Next Steps:**

1. **Configure real SMTP server** (Gmail, Outlook, etc.)
2. **Test email sending** with generated documents
3. **Monitor logs** for any remaining issues
4. **Consider adding email templates** for better formatting

The "Document not found" error is now resolved! 🎉
