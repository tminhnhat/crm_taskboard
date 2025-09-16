// Danh sách các biến placeholder dùng để render document từ template
// Sử dụng cho DOCX/XLSX template

export const DOCUMENT_PLACEHOLDERS = {
  // Customer data
  '{{customer_name}}': 'Tên khách hàng',
  '{{full_name}}': 'Họ tên đầy đủ',
  '{{id_number}}': 'Số CMND/CCCD',
  '{{phone}}': 'Số điện thoại',
  '{{email}}': 'Email',
  '{{address}}': 'Địa chỉ',

  // Financial data
  '{{loan_amount}}': 'Số tiền vay',
  '{{loan_amount_formatted}}': 'Số tiền vay (định dạng)',
  '{{interest_rate}}': 'Lãi suất',
  '{{loan_term}}': 'Thời hạn vay',

  // Dates
  '{{current_date}}': 'Ngày hiện tại',
  '{{current_year}}': 'Năm hiện tại',
  '{{current_month}}': 'Tháng hiện tại',
  '{{current_day}}': 'Ngày hiện tại (số)',

  // Collateral data
  '{{collateral_type}}': 'Loại tài sản thế chấp',
  '{{collateral_value}}': 'Giá trị tài sản',
  '{{collateral_description}}': 'Mô tả tài sản',
};
