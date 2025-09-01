-- Create templates table for template management
-- This table stores template metadata while files are stored in Vercel Blob Storage

CREATE TABLE IF NOT EXISTS dulieu_congviec.templates (
    template_id SERIAL PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- Can have multiple templates per type
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
