-- Migration to add ID issue date and issuing authority fields to customers table
-- Run this SQL in your Supabase SQL editor or database management tool

-- Add new columns to customers table
ALTER TABLE customers 
ADD COLUMN id_issue_date DATE NULL,
ADD COLUMN id_issue_authority TEXT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN customers.id_issue_date IS 'Date when the ID document (CMND/CCCD) was issued';
COMMENT ON COLUMN customers.id_issue_authority IS 'Authority that issued the ID document (e.g., Công an TP. Hồ Chí Minh)';

-- Update the updated_at trigger to include the new columns (if you have such trigger)
-- This ensures the updated_at timestamp is updated when these fields are modified

-- Optional: Add some sample data format examples
INSERT INTO customers (
  customer_type, 
  full_name, 
  account_number, 
  id_number, 
  id_issue_date, 
  id_issue_authority, 
  status
) VALUES (
  'individual',
  'Nguyễn Văn A (Sample)',
  'ACC-SAMPLE-001',
  '123456789012',
  '2020-01-15',
  'Công an TP. Hồ Chí Minh',
  'active'
) ON CONFLICT DO NOTHING;

-- Note: Remove the sample insert above after testing
-- DELETE FROM customers WHERE account_number = 'ACC-SAMPLE-001';
