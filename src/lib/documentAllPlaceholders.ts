// Danh sách đầy đủ các biến placeholder cho document template

export const DOCUMENT_ALL_PLACEHOLDERS = {
  // Customer
  '{{customer_id}}': 'ID khách hàng',
  '{{customer_code}}': 'Mã khách hàng',
  '{{customer_name}}': 'Tên khách hàng',
  '{{full_name}}': 'Họ tên đầy đủ',
  '{{first_name}}': 'Tên',
  '{{last_name}}': 'Họ',
  '{{gender}}': 'Giới tính',
  '{{date_of_birth}}': 'Ngày sinh',
  '{{place_of_birth}}': 'Nơi sinh',
  '{{nationality}}': 'Quốc tịch',
  '{{id_type}}': 'Loại giấy tờ định danh',
  '{{id_number}}': 'Số CMND/CCCD',
  '{{id_issue_date}}': 'Ngày cấp CMND/CCCD',
  '{{id_issue_place}}': 'Nơi cấp CMND/CCCD',
  '{{phone}}': 'Số điện thoại',
  '{{email}}': 'Email',
  '{{address}}': 'Địa chỉ',
  '{{province}}': 'Tỉnh/Thành phố',
  '{{district}}': 'Quận/Huyện',
  '{{ward}}': 'Phường/Xã',
  '{{job}}': 'Nghề nghiệp',
  '{{workplace}}': 'Nơi làm việc',
  '{{marital_status}}': 'Tình trạng hôn nhân',
  '{{spouse_name}}': 'Tên vợ/chồng',
  '{{spouse_id_number}}': 'Số CMND/CCCD vợ/chồng',
  '{{spouse_phone}}': 'Số điện thoại vợ/chồng',
  '{{spouse_workplace}}': 'Nơi làm việc vợ/chồng',
  '{{income}}': 'Thu nhập',
  '{{income_source}}': 'Nguồn thu nhập',
  '{{cif}}': 'Số CIF',

  // Collateral
  '{{collateral_id}}': 'ID tài sản thế chấp',
  '{{collateral_type}}': 'Loại tài sản thế chấp',
  '{{collateral_value}}': 'Giá trị tài sản',
  '{{collateral_description}}': 'Mô tả tài sản',
  '{{collateral_value_number}}': 'Giá trị tài sản (số)',
  '{{collateral_value_formatted}}': 'Giá trị tài sản (định dạng tiền tệ)',

  // Credit Assessment
  '{{assessment_id}}': 'ID thẩm định tín dụng',
  '{{staff_id}}': 'ID nhân viên thẩm định',
  '{{product_id}}': 'ID sản phẩm',
  '{{department}}': 'Phòng ban',
  '{{department_head}}': 'Lãnh đạo phòng',
  '{{fee_amount}}': 'Phí thẩm định',
  '{{status}}': 'Trạng thái thẩm định',
  '{{loan_type}}': 'Loại khoản vay',
  '{{spouse_info}}': 'Thông tin vợ/chồng (object)',
  '{{loan_info}}': 'Thông tin khoản vay (object)',
  '{{business_plan}}': 'Phương án kinh doanh (object)',
  '{{financial_reports}}': 'Báo cáo tài chính (object)',
  '{{assessment_details}}': 'Đánh giá thẩm định (object)',
  '{{repayment_sources}}': 'Nguồn trả nợ (object)',
  '{{liabilities}}': 'Nợ phải trả (object)',
  '{{monthly_expenses}}': 'Chi phí sinh hoạt hàng tháng (object)',
  '{{residual_income}}': 'Thu nhập còn lại (object)',
  // Thẻ tín dụng
  '{{card_expried}}': 'Thẻ hết hạn (tháng/năm)',
  '{{card_type}}': 'Loại thẻ tín dụng',
  '{{min_payment_percent}}': 'Tỷ lệ thanh toán tối thiểu (%)',
  '{{amount.requested}}': 'Hạn mức thẻ',
  '{{term.requested_months}}': 'Thời hạn thẻ (tháng)',
  '{{purpose.description}}': 'Mô tả chi tiết',
  '{{assessment_code}}': 'Mã thẩm định',
  '{{assessment_type}}': 'Loại thẩm định',
  '{{assessment_status}}': 'Trạng thái thẩm định',
  '{{assessment_date}}': 'Ngày thẩm định',
  '{{assessment_expiry}}': 'Ngày hết hạn thẩm định',
  '{{assessment_method}}': 'Phương pháp thẩm định',
  '{{assessment_appraiser}}': 'Đơn vị thẩm định',
  '{{assessment_value}}': 'Giá trị thẩm định',
  '{{assessment_notes}}': 'Ghi chú thẩm định',
  '{{loan_amount}}': 'Số tiền vay',
  '{{loan_amount_number}}': 'Số tiền vay (số)',
  '{{loan_amount_formatted}}': 'Số tiền vay (định dạng tiền tệ)',
  '{{interest_rate}}': 'Lãi suất',
  '{{interest_rate_number}}': 'Lãi suất (số)',
  '{{loan_term}}': 'Thời hạn vay',
  '{{loan_term_number}}': 'Thời hạn vay (số)',
  '{{purpose}}': 'Mục đích vay',
  '{{repayment_method}}': 'Phương thức trả nợ',
  '{{guarantee_type}}': 'Loại bảo đảm',
  '{{guarantee_value}}': 'Giá trị bảo đảm',
  '{{guarantee_description}}': 'Mô tả bảo đảm',
  '{{risk_level}}': 'Mức độ rủi ro',
  '{{approval_status}}': 'Trạng thái phê duyệt',
  '{{approved_amount}}': 'Số tiền được duyệt',
  '{{approved_date}}': 'Ngày duyệt',
  '{{approved_by}}': 'Người duyệt',

  // Dates
  '{{current_date}}': 'Ngày hiện tại',
  '{{current_year}}': 'Năm hiện tại',
  '{{current_month}}': 'Tháng hiện tại',
  '{{current_day}}': 'Ngày hiện tại (số)',

  // Nested objects (nếu cần dùng trong template nâng cao)
  '{{customer}}': 'Đối tượng khách hàng (object)',
  '{{collateral}}': 'Đối tượng tài sản thế chấp (object)',
  '{{creditAssessment}}': 'Đối tượng thẩm định tín dụng (object)',
    // Metadata fields
    // property_certificate
    '{{loai_gcn}}': 'Loại giấy chứng nhận',
    '{{so_gcn}}': 'Số giấy chứng nhận',
    '{{so_vao_so_gcn}}': 'Số vào sổ GCN',
    '{{ngay_cap_gcn}}': 'Ngày cấp GCN',
    '{{noi_cap_gcn}}': 'Nơi cấp GCN',
    // property_land
    '{{so_thua}}': 'Số thửa',
    '{{to_ban_do}}': 'Tờ bản đồ số',
    '{{dia_chi_dat}}': 'Địa chỉ thửa đất',
    '{{vitri_thua_dat}}': 'Vị trí thửa đất',
    '{{muc_dich_su_dung_dat}}': 'Mục đích sử dụng đất',
    '{{thoi_gian_su_dung}}': 'Thời hạn sử dụng',
    '{{nguon_goc_dat}}': 'Nguồn gốc sử dụng',
    '{{hinh_thuc_su_dung}}': 'Hình thức sử dụng',
    '{{dien_tich}}': 'Tổng diện tích (m²)',
    '{{dien_tich_bang_chu}}': 'Diện tích bằng chữ',
    '{{dien_tich_dat_o}}': 'Diện tích đất ở (m²)',
    '{{dien_tich_dat_trong_cay}}': 'Diện tích đất trồng cây (m²)',
    '{{dien_tich_dat_khac}}': 'Diện tích đất khác (m²)',
    // property_building
    '{{loai_ts_tren_dat}}': 'Loại tài sản trên đất',
    '{{dia_chi_nha}}': 'Địa chỉ nhà',
    '{{dien_tich_xay_dung}}': 'Diện tích xây dựng (m²)',
    '{{dien_tich_san}}': 'Diện tích sàn (m²)',
    '{{ket_cau}}': 'Kết cấu',
    '{{cap_hang}}': 'Cấp hạng',
    '{{so_tang}}': 'Số tầng',
    '{{nam_hoan_thanh_xd}}': 'Năm hoàn thành xây dựng',
    '{{thoi_han_so_huu}}': 'Thời hạn sở hữu',
    '{{hinh_thuc_so_huu_nha}}': 'Hình thức sở hữu nhà',
  // property_value
  // (Đã có các key này ở trên, không lặp lại)
  // property_assessment
  // (Đã có các key này ở trên, không lặp lại)
  // vehicle
  // (Đã có các key này ở trên, không lặp lại)
  // financial
  // (Đã có các key này ở trên, không lặp lại)
  // documents
  // (Đã có các key này ở trên, không lặp lại)
  // legal
  // (Đã có các key này ở trên, không lặp lại)
  // assessment
  // (Đã có các key này ở trên, không lặp lại)
  // communication
  // (Đã có các key này ở trên, không lặp lại)
  // property_land
  // (Đã có các key này ở trên, không lặp lại)
  // property_building
  // (Đã có các key này ở trên, không lặp lại)
    // property_value
    '{{tong_gia_tri_tsbd}}': 'Tổng giá trị TSBĐ (VNĐ)',
    '{{tong_gia_tri_tsbd_bang_chu}}': 'Tổng giá trị bằng chữ',
    '{{tong_gia_tri_dat}}': 'Giá trị đất (VNĐ)',
    '{{don_gia_dat_o}}': 'Đơn giá đất ở (VNĐ/m²)',
    '{{don_gia_dat_trong_cay}}': 'Đơn giá đất trồng cây (VNĐ/m²)',
    '{{don_gia_dat_khac}}': 'Đơn giá đất khác (VNĐ/m²)',
    '{{tong_gia_tri_nha}}': 'Giá trị nhà (VNĐ)',
    '{{don_gia_nha}}': 'Đơn giá nhà (VNĐ/m²)',
    '{{ty_le_khau_hao_nha_o}}': 'Tỷ lệ khấu hao nhà ở (%)',
    // property_assessment
    '{{so_cif_chu_ts}}': 'Số CIF chủ tài sản',
    '{{muc_cho_vay_toi_da}}': 'Mức cho vay tối đa (VNĐ)',
    '{{danhgiatsbd}}': 'Nhận xét đánh giá TSBĐ',
    '{{so_hdtc_tsbd}}': 'Số HĐTC TSBĐ',
    '{{van_phong_dktc}}': 'Văn phòng ĐKTC',
    '{{ghi_chu}}': 'Ghi chú',
    // vehicle
    '{{vehicle_type}}': 'Loại phương tiện',
    '{{brand}}': 'Thương hiệu',
    '{{model}}': 'Model',
    '{{year}}': 'Năm sản xuất',
    '{{license_plate}}': 'Biển số',
    // financial
    '{{account_type}}': 'Loại tài khoản',
    '{{bank_name}}': 'Tên ngân hàng',
    '{{account_number}}': 'Số tài khoản',
    '{{balance}}': 'Số dư',
    '{{currency}}': 'Loại tiền',
    // documents
    '{{document_type}}': 'Loại giấy tờ',
    '{{document_number}}': 'Số giấy tờ',
    '{{issue_date}}': 'Ngày cấp',
    '{{issue_place}}': 'Nơi cấp',
    '{{expiry_date}}': 'Ngày hết hạn',
    // legal
    '{{ownership_status}}': 'Tình trạng sở hữu',
    '{{legal_restrictions}}': 'Hạn chế pháp lý',
    '{{registration_date}}': 'Ngày đăng ký',
    '{{contract_number}}': 'Số hợp đồng',
    // assessment
    '{{appraised_value}}': 'Giá trị định giá',
    '{{appraisal_date}}': 'Ngày định giá',
    '{{appraiser}}': 'Đơn vị định giá',
    '{{appraisal_method}}': 'Phương pháp định giá',
    '{{next_appraisal_date}}': 'Ngày định giá tiếp theo',
    // communication
    '{{contact_person}}': 'Người liên hệ',
    '{{notes}}': 'Ghi chú liên hệ',
};
