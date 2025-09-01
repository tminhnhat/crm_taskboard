-- Update document_type constraints to add new document types
-- and remove old ones that were deleted

-- Update documents table constraint
ALTER TABLE dulieu_congviec.documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE dulieu_congviec.documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
    'hop_dong_tin_dung',
    'to_trinh_tham_dinh', 
    'giay_de_nghi_vay_von',
    'bien_ban_dinh_gia',
    'hop_dong_the_chap',
    'don_dang_ky_the_chap',
    'hop_dong_thu_phi',
    'tai_lieu_khac'
));

-- Update document_templates table constraint  
ALTER TABLE dulieu_congviec.document_templates 
DROP CONSTRAINT IF EXISTS document_templates_document_type_check;

ALTER TABLE dulieu_congviec.document_templates 
ADD CONSTRAINT document_templates_document_type_check 
CHECK (document_type IN (
    'hop_dong_tin_dung',
    'to_trinh_tham_dinh', 
    'giay_de_nghi_vay_von',
    'bien_ban_dinh_gia',
    'hop_dong_the_chap',
    'don_dang_ky_the_chap',
    'hop_dong_thu_phi',
    'tai_lieu_khac'
));

-- Update export_type constraint to only allow docx (since we removed xlsx/pdf support)
ALTER TABLE dulieu_congviec.documents 
DROP CONSTRAINT IF EXISTS documents_export_type_check;

ALTER TABLE dulieu_congviec.documents 
ADD CONSTRAINT documents_export_type_check 
CHECK (export_type IN ('docx'));

-- Add comments for new document types
COMMENT ON TABLE dulieu_congviec.documents IS 'Stores generated documents. Updated to include new document types: don_dang_ky_the_chap, hop_dong_thu_phi, tai_lieu_khac';

-- Optional: Insert sample templates metadata for new document types
INSERT INTO dulieu_congviec.templates (template_name, template_type, file_url) VALUES 
('Đơn đăng ký thế chấp mẫu', 'don_dang_ky_the_chap', 'placeholder_url_don_dang_ky_the_chap'),
('Hợp đồng thu phí mẫu', 'hop_dong_thu_phi', 'placeholder_url_hop_dong_thu_phi'),
('Tài liệu khác mẫu', 'tai_lieu_khac', 'placeholder_url_tai_lieu_khac')
ON CONFLICT DO NOTHING;
