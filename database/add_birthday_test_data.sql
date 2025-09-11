-- Add sample customers with birthdays in December for testing birthday functionality
-- Run this in your Supabase SQL editor to add test data

SET search_path TO dulieu_congviec, public;

-- Insert sample customers with December birthdays and hobby information
INSERT INTO customers (
  customer_type,
  full_name,
  date_of_birth,
  gender,
  id_number,
  phone,
  email,
  address,
  hobby,
  status
) VALUES
  ('individual', 'Nguyễn Thị Mai', '1990-12-05', 'female', '123456781', '0901234561', 'mai.nguyen@email.com', 'Hà Nội', 'Đọc sách, nghe nhạc', 'active'),
  ('individual', 'Trần Văn Bình', '1985-12-15', 'male', '123456782', '0901234562', 'binh.tran@email.com', 'TP.HCM', 'Chơi golf, du lịch', 'active'),
  ('individual', 'Lê Thị Hoa', '1992-12-22', 'female', '123456783', '0901234563', 'hoa.le@email.com', 'Đà Nẵng', 'Nấu ăn, yoga', 'active'),
  ('individual', 'Phạm Văn Nam', '1988-12-08', 'male', '123456784', '0901234564', 'nam.pham@email.com', 'Hải Phòng', 'Câu cá, xem phim', 'active'),
  ('corporate', 'Công ty ABC Holding', '2015-12-01', null, '0123456784', '0281234564', 'info@abcholding.com', 'TP.HCM', 'Đầu tư bất động sản', 'active'),
  ('individual', 'Võ Thị Lan', '1995-12-28', 'female', '123456785', '0901234565', 'lan.vo@email.com', 'Cần Thơ', 'Thể thao, massage', 'active')
ON CONFLICT (id_number) DO NOTHING;

-- Verify the data was inserted
SELECT 
  customer_id,
  full_name,
  date_of_birth,
  hobby,
  phone,
  email
FROM customers 
WHERE EXTRACT(MONTH FROM date_of_birth) = 12
ORDER BY EXTRACT(DAY FROM date_of_birth);