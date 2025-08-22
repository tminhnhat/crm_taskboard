-- Document Management System Migration
-- Creates tables and policies for document storage and templates

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
    customer_id INTEGER NOT NULL REFERENCES dulieu_congviec.customers(customer_id) ON DELETE CASCADE,
    collateral_id INTEGER REFERENCES dulieu_congviec.collaterals(collateral_id) ON DELETE SET NULL,
    assessment_id INTEGER REFERENCES dulieu_congviec.credit_assessments(assessment_id) ON DELETE SET NULL,
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

-- Create indexes for better performance (after table creation)
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON dulieu_congviec.documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_collateral_id ON dulieu_congviec.documents(collateral_id);
CREATE INDEX IF NOT EXISTS idx_documents_assessment_id ON dulieu_congviec.documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON dulieu_congviec.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON dulieu_congviec.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON dulieu_congviec.documents(created_at);
CREATE INDEX IF NOT EXISTS idx_document_templates_document_type ON dulieu_congviec.document_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_status ON dulieu_congviec.document_templates(status);

-- Add unique constraint for default templates (only one default per document type)
-- This must come after the table is created
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_templates_one_default_per_type 
    ON dulieu_congviec.document_templates(document_type) 
    WHERE is_default = true;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON dulieu_congviec.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON dulieu_congviec.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE dulieu_congviec.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dulieu_congviec.document_templates ENABLE ROW LEVEL SECURITY;

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
    USING (true); -- Allow soft delete by updating status

-- Document template policies  
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
    USING (status != 'active' OR is_default = false); -- Prevent deletion of active default templates

-- Add comments for documentation
COMMENT ON TABLE dulieu_congviec.documents IS 'Stores generated documents linked to customers, collaterals, and assessments';
COMMENT ON TABLE dulieu_congviec.document_templates IS 'Stores document templates for various document types';
COMMENT ON COLUMN dulieu_congviec.documents.document_type IS 'Type of document generated (contract, assessment, etc.)';
COMMENT ON COLUMN dulieu_congviec.documents.export_type IS 'Format of the exported document (docx, pdf, xlsx)';
COMMENT ON COLUMN dulieu_congviec.document_templates.is_default IS 'Whether this is the default template for the document type';
COMMENT ON COLUMN dulieu_congviec.document_templates.template_version IS 'Version of the template for tracking changes';
