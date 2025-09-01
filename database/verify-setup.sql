-- Quick verification queries for Supabase setup
-- Run these after executing the migration to verify everything works

-- 1. Check if schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'dulieu_congviec';

-- 2. Check if tables exist with correct names
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'dulieu_congviec' 
AND table_name IN ('templates', 'documents');

-- 3. Check templates table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'dulieu_congviec' 
AND table_name = 'templates'
ORDER BY ordinal_position;

-- 4. Check documents table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'dulieu_congviec' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- 5. Test sample data insertion (should show 4 templates)
SELECT template_id, template_name, template_type, file_extension, is_active
FROM dulieu_congviec.templates
ORDER BY created_at DESC;

-- 6. Test sample documents (should show 2 documents)  
SELECT document_id, document_type, file_name, generation_status
FROM dulieu_congviec.documents
ORDER BY created_at DESC;

-- 7. Check RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'dulieu_congviec' 
AND tablename IN ('templates', 'documents');

-- 8. Check indexes exist
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'dulieu_congviec' 
AND tablename IN ('templates', 'documents')
ORDER BY tablename, indexname;

-- SUCCESS INDICATORS:
-- ✅ Schema 'dulieu_congviec' exists
-- ✅ Tables 'templates' and 'documents' exist  
-- ✅ 4 sample templates inserted
-- ✅ 2 sample documents inserted
-- ✅ RLS policies enabled
-- ✅ Indexes created properly
