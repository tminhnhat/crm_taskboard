-- Document Management System Migration (Fixed Version)
-- Creates tables and policies for document storage and templates

-- Start transaction for atomic execution
BEGIN;

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS dulieu_congviec;

-- Create the documents table
CREATE TABLE IF NOT EXISTS dulieu_congviec.documents (
    document_id SERIAL PRIMARY KEY,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'hop_dong_tin_dung',
        'to_trinh_tham_dinh', 
        'giay_de_nghi_vay_von',
        'bien_ban_dinh_gia',
        'hop_dong_the_chap',
        'bang_tinh_lai',
        'lich_tra_no'
    )),
    customer_id INTEGER NOT NULL,
    collateral_id INTEGER,
    assessment_id INTEGER,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    export_type TEXT NOT NULL DEFAULT 'docx' CHECK (export_type IN ('docx', 'pdf', 'xlsx')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT,
    
    -- Ensure unique filename per customer to prevent conflicts
    UNIQUE(customer_id, file_name)
);

-- Create the document_templates table
CREATE TABLE IF NOT EXISTS dulieu_congviec.document_templates (
    template_id SERIAL PRIMARY KEY,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'hop_dong_tin_dung',
        'to_trinh_tham_dinh', 
        'giay_de_nghi_vay_von',
        'bien_ban_dinh_gia',
        'hop_dong_the_chap',
        'bang_tinh_lai',
        'lich_tra_no'
    )),
    template_name TEXT NOT NULL,
    template_url TEXT NOT NULL,
    template_version TEXT DEFAULT '1.0',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add missing columns to documents table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'documents' 
                   AND column_name = 'file_size') THEN
        ALTER TABLE dulieu_congviec.documents 
        ADD COLUMN file_size INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'documents' 
                   AND column_name = 'export_type') THEN
        ALTER TABLE dulieu_congviec.documents 
        ADD COLUMN export_type TEXT NOT NULL DEFAULT 'docx' CHECK (export_type IN ('docx', 'pdf', 'xlsx'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'documents' 
                   AND column_name = 'created_by') THEN
        ALTER TABLE dulieu_congviec.documents 
        ADD COLUMN created_by TEXT;
    END IF;

    -- Add is_default column to document_templates if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'document_templates' 
                   AND column_name = 'is_default') THEN
        ALTER TABLE dulieu_congviec.document_templates 
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add template_version column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'document_templates' 
                   AND column_name = 'template_version') THEN
        ALTER TABLE dulieu_congviec.document_templates 
        ADD COLUMN template_version TEXT DEFAULT '1.0';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'document_templates' 
                   AND column_name = 'description') THEN
        ALTER TABLE dulieu_congviec.document_templates 
        ADD COLUMN description TEXT;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'dulieu_congviec' 
                   AND table_name = 'document_templates' 
                   AND column_name = 'created_by') THEN
        ALTER TABLE dulieu_congviec.document_templates 
        ADD COLUMN created_by TEXT;
    END IF;
END $$;

-- Add foreign key constraints (after tables are created)
DO $$ 
BEGIN
    -- Add foreign key for customer_id if the customers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'customers') THEN
        ALTER TABLE dulieu_congviec.documents ADD CONSTRAINT fk_documents_customer 
            FOREIGN KEY (customer_id) REFERENCES dulieu_congviec.customers(customer_id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for collateral_id if the collaterals table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'collaterals') THEN
        ALTER TABLE dulieu_congviec.documents ADD CONSTRAINT fk_documents_collateral 
            FOREIGN KEY (collateral_id) REFERENCES dulieu_congviec.collaterals(collateral_id) ON DELETE SET NULL;
    END IF;
    
    -- Add foreign key for assessment_id if the credit_assessments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'credit_assessments') THEN
        ALTER TABLE dulieu_congviec.documents ADD CONSTRAINT fk_documents_assessment 
            FOREIGN KEY (assessment_id) REFERENCES dulieu_congviec.credit_assessments(assessment_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON dulieu_congviec.documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_collateral_id ON dulieu_congviec.documents(collateral_id);
CREATE INDEX IF NOT EXISTS idx_documents_assessment_id ON dulieu_congviec.documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON dulieu_congviec.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON dulieu_congviec.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON dulieu_congviec.documents(created_at);
CREATE INDEX IF NOT EXISTS idx_document_templates_document_type ON dulieu_congviec.document_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_status ON dulieu_congviec.document_templates(status);

-- Add unique constraint for default templates (only one default per document type)
-- Only create if the is_default column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'dulieu_congviec' 
               AND table_name = 'document_templates' 
               AND column_name = 'is_default') THEN
        -- Drop existing index if it exists
        DROP INDEX IF EXISTS dulieu_congviec.idx_document_templates_one_default_per_type;
        
        -- Create the unique index
        CREATE UNIQUE INDEX idx_document_templates_one_default_per_type 
            ON dulieu_congviec.document_templates(document_type) 
            WHERE is_default = true;
    END IF;
END $$;

-- Add trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION dulieu_congviec.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_documents_updated_at ON dulieu_congviec.documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON dulieu_congviec.documents
    FOR EACH ROW
    EXECUTE FUNCTION dulieu_congviec.update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON dulieu_congviec.document_templates;
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON dulieu_congviec.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION dulieu_congviec.update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE dulieu_congviec.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dulieu_congviec.document_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "documents_select_policy" ON dulieu_congviec.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON dulieu_congviec.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON dulieu_congviec.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON dulieu_congviec.documents;
DROP POLICY IF EXISTS "templates_select_policy" ON dulieu_congviec.document_templates;
DROP POLICY IF EXISTS "templates_insert_policy" ON dulieu_congviec.document_templates;
DROP POLICY IF EXISTS "templates_update_policy" ON dulieu_congviec.document_templates;
DROP POLICY IF EXISTS "templates_delete_policy" ON dulieu_congviec.document_templates;

-- Document policies
CREATE POLICY "documents_select_policy" ON dulieu_congviec.documents
    FOR SELECT
    USING (status IN ('active', 'archived'));

CREATE POLICY "documents_insert_policy" ON dulieu_congviec.documents
    FOR INSERT
    WITH CHECK (status = 'active');

CREATE POLICY "documents_update_policy" ON dulieu_congviec.documents
    FOR UPDATE
    USING (status IN ('active', 'archived'))
    WITH CHECK (status IN ('active', 'archived', 'deleted'));

CREATE POLICY "documents_delete_policy" ON dulieu_congviec.documents
    FOR DELETE
    USING (true);

-- Document template policies (only create if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'dulieu_congviec' 
               AND table_name = 'document_templates' 
               AND column_name = 'is_default') THEN
        
        CREATE POLICY "templates_select_policy" ON dulieu_congviec.document_templates
            FOR SELECT
            USING (status IN ('active', 'inactive'));

        CREATE POLICY "templates_insert_policy" ON dulieu_congviec.document_templates
            FOR INSERT
            WITH CHECK (status = 'active');

        CREATE POLICY "templates_update_policy" ON dulieu_congviec.document_templates
            FOR UPDATE
            USING (status IN ('active', 'inactive'))
            WITH CHECK (status IN ('active', 'inactive', 'deprecated'));

        CREATE POLICY "templates_delete_policy" ON dulieu_congviec.document_templates
            FOR DELETE
            USING (status != 'active' OR is_default = false);
    ELSE
        -- Fallback policies if is_default column doesn't exist
        CREATE POLICY "templates_select_policy" ON dulieu_congviec.document_templates
            FOR SELECT
            USING (status IN ('active', 'inactive'));

        CREATE POLICY "templates_insert_policy" ON dulieu_congviec.document_templates
            FOR INSERT
            WITH CHECK (status = 'active');

        CREATE POLICY "templates_update_policy" ON dulieu_congviec.document_templates
            FOR UPDATE
            USING (status IN ('active', 'inactive'))
            WITH CHECK (status IN ('active', 'inactive', 'deprecated'));

        CREATE POLICY "templates_delete_policy" ON dulieu_congviec.document_templates
            FOR DELETE
            USING (status != 'active');
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE dulieu_congviec.documents IS 'Stores generated documents linked to customers, collaterals, and assessments';
COMMENT ON TABLE dulieu_congviec.document_templates IS 'Stores document templates for various document types';
COMMENT ON COLUMN dulieu_congviec.documents.document_type IS 'Type of document generated (contract, assessment, etc.)';
COMMENT ON COLUMN dulieu_congviec.documents.export_type IS 'Format of the exported document (docx, pdf, xlsx)';
COMMENT ON COLUMN dulieu_congviec.document_templates.is_default IS 'Whether this is the default template for the document type';
COMMENT ON COLUMN dulieu_congviec.document_templates.template_version IS 'Version of the template for tracking changes';

-- Commit transaction
COMMIT;
