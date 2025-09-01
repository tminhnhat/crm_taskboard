# Database Setup Guide - CRM Document Management System

## Overview
This directory contains SQL migration files to set up the complete database structure for the CRM document management system on Supabase.

## Files Description

### 📄 `001_create_crm_tables.sql`
**Complete CRM System Database**
- Creates ALL tables needed for the full CRM system
- Includes: customers, collaterals, credit_assessments, document_templates, documents, tasks, staff, products, contracts
- Sets up indexes, triggers, RLS policies
- **Use this for:** Full production setup

### 📄 `002_document_template_core.sql`  
**Document & Template System Only**
- Focuses on document_templates and documents tables
- Detailed comments and documentation
- Sample data for testing
- **Use this for:** Document management feature only

### 📄 `003_quick_setup.sql`
**Minimal Setup for Testing**
- Bare minimum tables to test document generation
- Basic customers table for testing
- **Use this for:** Quick testing and development

## How to Run on Supabase

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of your chosen SQL file
4. Click **Run** to execute

### Method 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

### Method 3: Direct Database Connection
```bash
# Connect using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the SQL file
\i 001_create_crm_tables.sql
```

## Recommended Setup Process

### For Production:
1. **Run:** `001_create_crm_tables.sql` - Complete system
2. **Verify:** Check all tables are created
3. **Customize:** Adjust RLS policies for your authentication
4. **Test:** Run sample queries

### For Development/Testing:
1. **Run:** `003_quick_setup.sql` - Quick minimal setup
2. **Test:** Upload templates and generate documents
3. **Upgrade:** Run `002_document_template_core.sql` when needed

### For Document Feature Only:
1. **Run:** `002_document_template_core.sql` - Document system only
2. **Add:** Create related tables (customers, etc.) as needed
3. **Uncomment:** Foreign key constraints when related tables exist

## Database Schema Overview

### Core Tables for Document System:

#### `document_templates`
- `template_id` (PK) - Unique template identifier
- `template_name` - User-friendly template name
- `template_type` - Document type (hop_dong_tin_dung, etc.)
- `file_url` - Vercel Blob Storage URL
- `file_extension` - docx or xlsx
- `is_active` - Whether template is active

#### `documents` 
- `document_id` (PK) - Unique document identifier
- `document_type` - Type of document generated
- `template_id` (FK) - Which template was used
- `customer_id` (FK) - Which customer
- `file_name` - Generated document filename
- `file_url` - Vercel Blob Storage URL for result
- `generation_status` - pending/completed/failed

### Document Types Supported:
- `hop_dong_tin_dung` - Credit Agreement
- `to_trinh_tham_dinh` - Credit Assessment Report
- `giay_de_nghi_vay_von` - Loan Application
- `bien_ban_dinh_gia` - Appraisal Report
- `hop_dong_the_chap` - Collateral Agreement  
- `don_dang_ky_the_chap` - Collateral Registration
- `hop_dong_thu_phi` - Fee Agreement
- `tai_lieu_khac` - Other Documents

## Verification Queries

After running the setup, verify with these queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'dulieu_congviec';

-- Count templates by type
SELECT template_type, COUNT(*) 
FROM document_templates 
GROUP BY template_type;

-- Count documents by type  
SELECT document_type, COUNT(*)
FROM documents
GROUP BY document_type;

-- Test template selection
SELECT template_id, template_name, template_type, file_extension
FROM document_templates 
WHERE is_active = true
ORDER BY template_type, created_at;
```

## Customization

### RLS Policies
The default policies allow all operations for all users. For production:

```sql
-- Example: Restrict to authenticated users only
DROP POLICY "Enable read access for all users" ON documents;
CREATE POLICY "Enable read for authenticated users" ON documents 
FOR SELECT USING (auth.role() = 'authenticated');
```

### Adding New Document Types
```sql
-- Add new document type to constraint
ALTER TABLE document_templates 
DROP CONSTRAINT IF EXISTS document_templates_template_type_check;

ALTER TABLE document_templates 
ADD CONSTRAINT document_templates_template_type_check 
CHECK (template_type IN ('hop_dong_tin_dung', 'new_document_type', ...));
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**
   - Check RLS policies are correctly configured
   - Verify user authentication

2. **Foreign Key Violations**
   - Ensure related tables exist before adding constraints
   - Check referenced IDs exist

3. **Schema Not Found**
   - Create schema: `CREATE SCHEMA IF NOT EXISTS dulieu_congviec;`
   - Set search path: `SET search_path TO dulieu_congviec, public;`

### Test Queries:
```sql
-- Test template insertion
INSERT INTO document_templates (template_name, template_type, file_url, file_extension)
VALUES ('Test Template', 'hop_dong_tin_dung', 'test-url', 'docx');

-- Test document generation record
INSERT INTO documents (document_type, customer_id, file_name, file_url, file_extension)
VALUES ('hop_dong_tin_dung', 1, 'test_doc.docx', 'test-url', 'docx');
```

## Integration with Next.js App

The SQL structure is designed to work with:
- `/src/lib/supabase.ts` - Type definitions
- `/src/hooks/useDocuments.ts` - Document operations
- `/src/lib/documentService.ts` - Document generation
- `/src/app/documents/page.tsx` - Document UI
- `/src/app/templates/*` - Template management

Make sure your Supabase environment variables are configured:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

## Next Steps

1. ✅ Run appropriate SQL file for your needs
2. ✅ Verify tables are created successfully  
3. ✅ Upload sample templates via `/templates` page
4. ✅ Test document generation via `/documents` page
5. ✅ Customize RLS policies for production use
6. ✅ Monitor performance and add indexes as needed

---

**Note:** Remember to backup your database before running migration scripts in production!
