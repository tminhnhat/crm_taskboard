-- ===================================================================
-- QUICK SETUP: DOCUMENT & TEMPLATE TABLES ONLY
-- ===================================================================
-- Run this if you only need document/template functionality
-- Perfect for testing the document generation system

-- 1. Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create documents table  
CREATE TABLE IF NOT EXISTS documents (
    document_id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    customer_id INTEGER NOT NULL,
    collateral_id INTEGER,
    assessment_id INTEGER,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create minimal customers table for testing
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert test data
INSERT INTO customers (full_name, phone, email) VALUES
('Nguyễn Văn An', '0901234567', 'test1@example.com'),
('Trần Thị Bình', '0987654321', 'test2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO document_templates (template_name, template_type, file_url) VALUES
('Test Template DOCX', 'hop_dong_tin_dung', 'maubieu/test_template.docx'),
('Test Template XLSX', 'hop_dong_tin_dung', 'maubieu/test_template.xlsx')
ON CONFLICT DO NOTHING;
