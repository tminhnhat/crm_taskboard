-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
    document_id SERIAL PRIMARY KEY,
    document_type TEXT NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    collateral_id INTEGER REFERENCES collaterals(collateral_id),
    assessment_id INTEGER REFERENCES credit_assessments(assessment_id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
    template_id SERIAL PRIMARY KEY,
    document_type TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_collateral_id ON documents(collateral_id);
CREATE INDEX IF NOT EXISTS idx_documents_assessment_id ON documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_templates_document_type ON document_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_status ON document_templates(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Allow read access to active documents" ON documents
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Allow insert for authenticated users" ON documents
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update own documents" ON documents
    FOR UPDATE
    USING (status = 'active')
    WITH CHECK (true);

CREATE POLICY "Allow soft delete own documents" ON documents
    FOR DELETE
    USING (status = 'active');

-- Create policies for document_templates
CREATE POLICY "Allow read access to active templates" ON document_templates
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Allow insert for authenticated users" ON document_templates
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update own templates" ON document_templates
    FOR UPDATE
    USING (status = 'active')
    WITH CHECK (true);

CREATE POLICY "Allow soft delete own templates" ON document_templates
    FOR DELETE
    USING (status = 'active');
