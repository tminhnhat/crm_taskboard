-- ===================================================================
-- DOCUMENT & TEMPLATE TABLES - CORE SETUP FOR CRM DOCUMENT SYSTEM
-- Created: September 2024
-- Description: Essential tables for document template management and generation
-- ===================================================================

-- Create schema if it doesn't exist 
CREATE SCHEMA IF NOT EXISTS dulieu_congviec;
SET search_path TO dulieu_congviec, public;

-- ===================================================================
-- 1. DOCUMENT TEMPLATES TABLE - Core table for template management
-- ===================================================================
CREATE TABLE IF NOT EXISTS dulieu_congviec.document_templates (
    -- Primary key
    template_id SERIAL PRIMARY KEY,
    
    -- Template metadata
    template_name VARCHAR(255) NOT NULL, -- User-friendly name for the template
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
        'hop_dong_tin_dung',      -- Credit Agreement
        'to_trinh_tham_dinh',     -- Credit Assessment Report  
        'giay_de_nghi_vay_von',   -- Loan Application
        'bien_ban_dinh_gia',      -- Appraisal Report
        'hop_dong_the_chap',      -- Collateral Agreement
        'don_dang_ky_the_chap',   -- Collateral Registration
        'hop_dong_thu_phi',       -- Fee Agreement
        'tai_lieu_khac'           -- Other Documents
    )),
    
    -- File information
    file_url VARCHAR(500) NOT NULL,        -- URL to template file in Vercel Blob Storage
    file_size BIGINT,                      -- File size in bytes (optional)
    file_extension VARCHAR(10) CHECK (file_extension IN ('docx', 'xlsx')), -- Template format
    
    -- Additional metadata
    description TEXT,                      -- Template description/notes
    is_active BOOLEAN DEFAULT true,       -- Whether template is active for use
    version VARCHAR(10) DEFAULT '1.0',    -- Template version
    
    -- Audit fields
    created_by VARCHAR(255),              -- Who created the template
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON dulieu_congviec.document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON dulieu_congviec.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_extension ON dulieu_congviec.document_templates(file_extension);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_at ON dulieu_congviec.document_templates(created_at);

-- ===================================================================
-- 2. DOCUMENTS TABLE - Generated documents from templates
-- ===================================================================
CREATE TABLE IF NOT EXISTS dulieu_congviec.documents (
    -- Primary key
    document_id SERIAL PRIMARY KEY,
    
    -- Document metadata
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'hop_dong_tin_dung',      -- Credit Agreement
        'to_trinh_tham_dinh',     -- Credit Assessment Report
        'giay_de_nghi_vay_von',   -- Loan Application  
        'bien_ban_dinh_gia',      -- Appraisal Report
        'hop_dong_the_chap',      -- Collateral Agreement
        'don_dang_ky_the_chap',   -- Collateral Registration
        'hop_dong_thu_phi',       -- Fee Agreement
        'tai_lieu_khac'           -- Other Documents
    )),
    
    -- Relations to other tables
    template_id INTEGER,                   -- REFERENCES document_templates(template_id) - which template was used
    customer_id INTEGER NOT NULL,         -- REFERENCES customers(customer_id) - which customer
    collateral_id INTEGER,                -- REFERENCES collaterals(collateral_id) - related collateral (optional)
    assessment_id INTEGER,                -- REFERENCES credit_assessments(assessment_id) - related assessment (optional)
    
    -- Generated file information
    file_name VARCHAR(255) NOT NULL,      -- Generated file name
    file_url VARCHAR(500) NOT NULL,       -- URL to generated document in Vercel Blob Storage
    file_size BIGINT,                     -- Generated file size in bytes
    file_extension VARCHAR(10) CHECK (file_extension IN ('docx', 'xlsx')), -- Generated file format
    
    -- Generation tracking
    generation_status VARCHAR(20) CHECK (generation_status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    generation_error TEXT,               -- Error message if generation failed
    
    -- Audit fields
    generated_by VARCHAR(255),           -- Who generated the document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON dulieu_congviec.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON dulieu_congviec.documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON dulieu_congviec.documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON dulieu_congviec.documents(generation_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON dulieu_congviec.documents(created_at);

-- ===================================================================
-- 3. FOREIGN KEY CONSTRAINTS (uncomment when related tables exist)
-- ===================================================================
-- Add foreign key constraints to documents table
-- NOTE: Uncomment these when you have the related tables created

-- ALTER TABLE dulieu_congviec.documents 
--     ADD CONSTRAINT fk_documents_template 
--     FOREIGN KEY (template_id) REFERENCES dulieu_congviec.document_templates(template_id) ON DELETE SET NULL;

-- ALTER TABLE dulieu_congviec.documents 
--     ADD CONSTRAINT fk_documents_customer 
--     FOREIGN KEY (customer_id) REFERENCES dulieu_congviec.customers(customer_id) ON DELETE CASCADE;

-- ALTER TABLE dulieu_congviec.documents 
--     ADD CONSTRAINT fk_documents_collateral 
--     FOREIGN KEY (collateral_id) REFERENCES dulieu_congviec.collaterals(collateral_id) ON DELETE SET NULL;

-- ALTER TABLE dulieu_congviec.documents 
--     ADD CONSTRAINT fk_documents_assessment 
--     FOREIGN KEY (assessment_id) REFERENCES dulieu_congviec.credit_assessments(assessment_id) ON DELETE SET NULL;

-- ===================================================================
-- 4. AUTOMATIC UPDATED_AT TRIGGERS
-- ===================================================================

-- Function to update updated_at timestamp (create only if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_document_templates_updated_at ON dulieu_congviec.document_templates;
CREATE TRIGGER update_document_templates_updated_at 
    BEFORE UPDATE ON dulieu_congviec.document_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON dulieu_congviec.documents;
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON dulieu_congviec.documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS (adjust policies according to your authentication needs)
ALTER TABLE dulieu_congviec.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dulieu_congviec.documents ENABLE ROW LEVEL SECURITY;

-- Basic permissive policies (customize for your authentication system)
-- Document Templates policies
DROP POLICY IF EXISTS "Enable read access for all users" ON dulieu_congviec.document_templates;
CREATE POLICY "Enable read access for all users" ON dulieu_congviec.document_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON dulieu_congviec.document_templates;
CREATE POLICY "Enable insert for all users" ON dulieu_congviec.document_templates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON dulieu_congviec.document_templates;
CREATE POLICY "Enable update for all users" ON dulieu_congviec.document_templates FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON dulieu_congviec.document_templates;
CREATE POLICY "Enable delete for all users" ON dulieu_congviec.document_templates FOR DELETE USING (true);

-- Documents policies
DROP POLICY IF EXISTS "Enable read access for all users" ON dulieu_congviec.documents;
CREATE POLICY "Enable read access for all users" ON dulieu_congviec.documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON dulieu_congviec.documents;
CREATE POLICY "Enable insert for all users" ON dulieu_congviec.documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON dulieu_congviec.documents;
CREATE POLICY "Enable update for all users" ON dulieu_congviec.documents FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON dulieu_congviec.documents;
CREATE POLICY "Enable delete for all users" ON dulieu_congviec.documents FOR DELETE USING (true);

-- ===================================================================
-- 6. SAMPLE DATA FOR TESTING
-- ===================================================================

-- Insert sample document templates
INSERT INTO dulieu_congviec.document_templates (template_name, template_type, file_url, file_extension, description) VALUES
('Mẫu Hợp Đồng Tín Dụng Cá Nhân V1.0', 'hop_dong_tin_dung', 'https://example-blob.com/templates/hop_dong_tin_dung_v1.docx', 'docx', 'Template chuẩn cho hợp đồng tín dụng cá nhân'),
('Mẫu Hợp Đồng Tín Dụng Excel V1.0', 'hop_dong_tin_dung', 'https://example-blob.com/templates/hop_dong_tin_dung_v1.xlsx', 'xlsx', 'Template Excel với tính toán tự động'),
('Mẫu Tờ Trình Thẩm Định V1.0', 'to_trinh_tham_dinh', 'https://example-blob.com/templates/to_trinh_tham_dinh_v1.docx', 'docx', 'Template tờ trình thẩm định tín dụng'),
('Mẫu Biên Bản Định Giá V1.0', 'bien_ban_dinh_gia', 'https://example-blob.com/templates/bien_ban_dinh_gia_v1.docx', 'docx', 'Template biên bản định giá tài sản thế chấp')
ON CONFLICT DO NOTHING;

-- Sample documents (using fake data - replace with real references)
INSERT INTO dulieu_congviec.documents (document_type, customer_id, file_name, file_url, file_extension, generated_by) VALUES
('hop_dong_tin_dung', 1, 'hop_dong_tin_dung_CUST001_20240901_143022.docx', 'https://example-blob.com/documents/hop_dong_CUST001.docx', 'docx', 'system'),
('to_trinh_tham_dinh', 2, 'to_trinh_tham_dinh_CUST002_20240901_150000.docx', 'https://example-blob.com/documents/to_trinh_CUST002.docx', 'docx', 'system')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check tables were created successfully
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'document_templates') THEN
        RAISE NOTICE '✅ dulieu_congviec.document_templates table created successfully';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'dulieu_congviec' AND table_name = 'documents') THEN
        RAISE NOTICE '✅ dulieu_congviec.documents table created successfully';
    END IF;
    
    RAISE NOTICE '📊 Template types supported: hop_dong_tin_dung, to_trinh_tham_dinh, giay_de_nghi_vay_von, bien_ban_dinh_gia, hop_dong_the_chap, don_dang_ky_the_chap, hop_dong_thu_phi, tai_lieu_khac';
    RAISE NOTICE '📁 File formats supported: docx, xlsx';
    RAISE NOTICE '🔗 Remember to add foreign key constraints when related tables (customers, collaterals, credit_assessments) are created';
    RAISE NOTICE '🚀 Document & Template management system is ready!';
END $$;

-- Query to show table structure
\d dulieu_congviec.document_templates;
\d dulieu_congviec.documents;
