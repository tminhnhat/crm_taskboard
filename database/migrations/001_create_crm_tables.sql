-- ===================================================================
-- SUPABASE DATABASE SETUP FOR CRM DOCUMENT MANAGEMENT SYSTEM
-- Created: September 2024
-- Description: Creates all necessary tables for document and template management
-- ===================================================================

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS dulieu_congviec;

-- Set search path to use the schema
SET search_path TO dulieu_congviec, public;

-- ===================================================================
-- 1. CUSTOMERS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    customer_type VARCHAR(20) CHECK (customer_type IN ('individual', 'corporate', 'business_individual')) DEFAULT 'individual',
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    id_number VARCHAR(20) UNIQUE, -- CMND/CCCD/Passport
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_id_number ON customers(id_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ===================================================================
-- 2. COLLATERALS TABLE  
-- ===================================================================
CREATE TABLE IF NOT EXISTS collaterals (
    collateral_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    collateral_type VARCHAR(100) NOT NULL, -- Real estate, Vehicle, Securities, etc.
    description TEXT,
    market_value DECIMAL(15,2),
    appraised_value DECIMAL(15,2),
    appraisal_date DATE,
    location TEXT,
    legal_status VARCHAR(50), -- Clear, Disputed, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for collaterals
CREATE INDEX IF NOT EXISTS idx_collaterals_customer_id ON collaterals(customer_id);
CREATE INDEX IF NOT EXISTS idx_collaterals_type ON collaterals(collateral_type);

-- ===================================================================
-- 3. CREDIT ASSESSMENTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS credit_assessments (
    assessment_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    collateral_id INTEGER REFERENCES collaterals(collateral_id) ON DELETE SET NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    approved_amount DECIMAL(15,2),
    interest_rate DECIMAL(5,2), -- Percentage with 2 decimal places
    loan_term INTEGER, -- In months
    assessment_status VARCHAR(20) CHECK (assessment_status IN ('pending', 'approved', 'rejected', 'under_review')) DEFAULT 'pending',
    risk_rating VARCHAR(10) CHECK (risk_rating IN ('low', 'medium', 'high')),
    notes TEXT,
    assessed_by VARCHAR(255),
    assessment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for credit_assessments
CREATE INDEX IF NOT EXISTS idx_credit_assessments_customer_id ON credit_assessments(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_assessments_status ON credit_assessments(assessment_status);
CREATE INDEX IF NOT EXISTS idx_credit_assessments_date ON credit_assessments(assessment_date);

-- ===================================================================
-- 4. DOCUMENT TEMPLATES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS document_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
        'hop_dong_tin_dung',
        'to_trinh_tham_dinh', 
        'giay_de_nghi_vay_von',
        'bien_ban_dinh_gia',
        'hop_dong_the_chap',
        'don_dang_ky_the_chap',
        'hop_dong_thu_phi',
        'tai_lieu_khac'
    )),
    file_url VARCHAR(500) NOT NULL, -- URL to Vercel Blob storage
    file_size BIGINT, -- File size in bytes
    file_extension VARCHAR(10) CHECK (file_extension IN ('docx', 'xlsx')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for document_templates
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_extension ON document_templates(file_extension);

-- ===================================================================
-- 5. DOCUMENTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS documents (
    document_id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'hop_dong_tin_dung',
        'to_trinh_tham_dinh',
        'giay_de_nghi_vay_von', 
        'bien_ban_dinh_gia',
        'hop_dong_the_chap',
        'don_dang_ky_the_chap',
        'hop_dong_thu_phi',
        'tai_lieu_khac'
    )),
    template_id INTEGER REFERENCES document_templates(template_id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    collateral_id INTEGER REFERENCES collaterals(collateral_id) ON DELETE SET NULL,
    assessment_id INTEGER REFERENCES credit_assessments(assessment_id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- URL to generated document in Vercel Blob
    file_size BIGINT, -- File size in bytes
    file_extension VARCHAR(10) CHECK (file_extension IN ('docx', 'xlsx')),
    generation_status VARCHAR(20) CHECK (generation_status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    generated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(generation_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- ===================================================================
-- 6. TASKS TABLE (if not exists)
-- ===================================================================
CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100),
    task_priority VARCHAR(20) CHECK (task_priority IN ('Do first', 'Schedule', 'Delegate', 'Eliminate')),
    task_time_process INTERVAL,
    task_date_start DATE,
    task_start_time TIME,
    task_note TEXT,
    task_due_date DATE,
    task_time_finish TIME,
    task_date_finish DATE,
    task_status VARCHAR(20) CHECK (task_status IN ('needsAction', 'inProgress', 'onHold', 'completed', 'cancelled', 'deleted')) DEFAULT 'needsAction',
    calendar_event_id VARCHAR(255),
    sync_status VARCHAR(50) DEFAULT 'pending',
    timezone_offset INTEGER DEFAULT 0,
    timezone VARCHAR(50) DEFAULT 'UTC',
    google_task_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(task_priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(task_due_date);

-- ===================================================================
-- 7. OTHER SUPPORTING TABLES
-- ===================================================================

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100),
    description TEXT,
    interest_rate_min DECIMAL(5,2),
    interest_rate_max DECIMAL(5,2),
    loan_term_min INTEGER, -- months
    loan_term_max INTEGER, -- months
    max_loan_amount DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(staff_id) ON DELETE SET NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    loan_term INTEGER NOT NULL, -- months
    contract_status VARCHAR(20) CHECK (contract_status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    contract_date DATE DEFAULT CURRENT_DATE,
    maturity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaterals_updated_at BEFORE UPDATE ON collaterals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_assessments_updated_at BEFORE UPDATE ON credit_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS for all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust according to your authentication requirements)
-- These are permissive policies - you should customize based on your auth requirements

-- Customers policies
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON customers FOR DELETE USING (true);

-- Document templates policies
CREATE POLICY "Enable read access for all users" ON document_templates FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON document_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON document_templates FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON document_templates FOR DELETE USING (true);

-- Documents policies
CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON documents FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON documents FOR DELETE USING (true);

-- Collaterals policies
CREATE POLICY "Enable read access for all users" ON collaterals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON collaterals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON collaterals FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON collaterals FOR DELETE USING (true);

-- Credit assessments policies
CREATE POLICY "Enable read access for all users" ON credit_assessments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON credit_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON credit_assessments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON credit_assessments FOR DELETE USING (true);

-- Tasks policies
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);

-- Staff policies
CREATE POLICY "Enable read access for all users" ON staff FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON staff FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON staff FOR DELETE USING (true);

-- Products policies
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON products FOR DELETE USING (true);

-- Contracts policies
CREATE POLICY "Enable read access for all users" ON contracts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON contracts FOR DELETE USING (true);

-- ===================================================================
-- 10. SAMPLE DATA (OPTIONAL)
-- ===================================================================

-- Insert sample customers
INSERT INTO customers (full_name, customer_type, id_number, phone, email, address) VALUES
('Nguyễn Văn An', 'individual', '123456789', '0901234567', 'nguyen.van.a@email.com', 'Hà Nội'),
('Trần Thị Bình', 'individual', '987654321', '0987654321', 'tran.thi.b@email.com', 'TP.HCM'),
('Công ty TNHH ABC', 'corporate', '0123456789', '0281234567', 'info@abc.com', 'Đà Nẵng')
ON CONFLICT (id_number) DO NOTHING;

-- Insert sample staff
INSERT INTO staff (full_name, position, department, email, phone) VALUES
('Lê Văn Cường', 'Credit Officer', 'Tín Dụng', 'le.van.cuong@bank.com', '0909123456'),
('Phạm Thị Dung', 'Risk Manager', 'Quản Lý Rủi Ro', 'pham.thi.dung@bank.com', '0909654321')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (product_name, product_type, interest_rate_min, interest_rate_max, loan_term_min, loan_term_max, max_loan_amount) VALUES
('Vay Thế Chấp Nhà Đất', 'Mortgage', 8.5, 12.0, 12, 240, 5000000000),
('Vay Tín Chấp Cá Nhân', 'Personal Loan', 12.0, 18.0, 6, 60, 500000000),
('Vay Kinh Doanh', 'Business Loan', 9.0, 15.0, 12, 120, 10000000000);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================

-- Grant permissions (adjust as needed)
GRANT USAGE ON SCHEMA dulieu_congviec TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA dulieu_congviec TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dulieu_congviec TO postgres, anon, authenticated;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'CRM Database setup completed successfully!';
    RAISE NOTICE 'Tables created: customers, collaterals, credit_assessments, document_templates, documents, tasks, staff, products, contracts';
    RAISE NOTICE 'Remember to customize RLS policies according to your authentication requirements.';
END $$;
