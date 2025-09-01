-- Test script to verify templates table creation
-- Run this script to check if the templates table can be created successfully

-- First, let's try to create the schema if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dulieu_congviec') THEN
        CREATE SCHEMA dulieu_congviec;
        RAISE NOTICE 'Schema dulieu_congviec created';
    ELSE
        RAISE NOTICE 'Schema dulieu_congviec already exists';
    END IF;
END $$;

-- Create templates table
CREATE TABLE IF NOT EXISTS dulieu_congviec.templates (
    template_id SERIAL PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Add constraints
    CHECK (template_name != ''),
    CHECK (template_type != ''),
    CHECK (file_url != '')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_template_type ON dulieu_congviec.templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON dulieu_congviec.templates(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE dulieu_congviec.templates ENABLE ROW LEVEL SECURITY;

-- Template policies - Allow all operations for now
DROP POLICY IF EXISTS "templates_select_policy" ON dulieu_congviec.templates;
DROP POLICY IF EXISTS "templates_insert_policy" ON dulieu_congviec.templates;
DROP POLICY IF EXISTS "templates_update_policy" ON dulieu_congviec.templates;
DROP POLICY IF EXISTS "templates_delete_policy" ON dulieu_congviec.templates;

CREATE POLICY "templates_select_policy" ON dulieu_congviec.templates
    FOR SELECT
    USING (true);

CREATE POLICY "templates_insert_policy" ON dulieu_congviec.templates
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "templates_update_policy" ON dulieu_congviec.templates
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "templates_delete_policy" ON dulieu_congviec.templates
    FOR DELETE
    USING (true);

-- Add comment for documentation
COMMENT ON TABLE dulieu_congviec.templates IS 'Stores template metadata. Files are stored in Vercel Blob Storage under maubieu/ folder';
COMMENT ON COLUMN dulieu_congviec.templates.template_type IS 'Type of template - can have multiple templates per type';
COMMENT ON COLUMN dulieu_congviec.templates.file_url IS 'URL to template file in Vercel Blob Storage';

-- Insert some sample data for testing
INSERT INTO dulieu_congviec.templates (template_name, template_type, file_url) VALUES 
('Hợp đồng tín dụng mẫu', 'hop_dong_tin_dung', 'https://example.com/maubieu/hop_dong_tin_dung_sample.docx'),
('Biên bản định giá tài sản', 'bien_ban_dinh_gia', 'https://example.com/maubieu/bien_ban_dinh_gia_sample.docx')
ON CONFLICT DO NOTHING;

-- Verify table creation and data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'templates') THEN
        RAISE NOTICE 'Templates table created successfully';
        RAISE NOTICE 'Sample data count: %', (SELECT COUNT(*) FROM dulieu_congviec.templates);
    ELSE
        RAISE ERROR 'Templates table creation failed';
    END IF;
END $$;
