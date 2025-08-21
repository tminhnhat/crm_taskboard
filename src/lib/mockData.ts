// Mock data for development when Supabase is not available

export const mockCustomers = [
  {
    customer_id: 1,
    full_name: 'Nguyễn Văn An',
    id_number: '123456789',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    occupation: 'Kỹ sư',
    date_of_birth: '1985-05-15',
    status: 'active'
  },
  {
    customer_id: 2,
    full_name: 'Trần Thị Bình',
    id_number: '987654321',
    phone: '0912345678',
    email: 'tranthib@example.com',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    occupation: 'Giáo viên',
    date_of_birth: '1990-08-20',
    status: 'active'
  }
];

export const mockCollaterals = [
  {
    collateral_id: 1,
    asset_name: 'Nhà phố tại Quận 1',
    asset_type: 'Bất động sản',
    value: '5000000000',
    location: '789 Đường DEF, Quận 1, TP.HCM',
    legal_status: 'Đầy đủ giấy tờ',
    area: '120',
    notes: 'Nhà phố 3 tầng, vị trí đẹp'
  },
  {
    collateral_id: 2,
    asset_name: 'Căn hộ chung cư',
    asset_type: 'Bất động sản',
    value: '3000000000',
    location: '321 Đường GHI, Quận 3, TP.HCM',
    legal_status: 'Đầy đủ giấy tờ',
    area: '85',
    notes: 'Căn hộ 2 phòng ngủ'
  }
];

export const mockCreditAssessments = [
  {
    assessment_id: 1,
    customer_id: 1,
    approved_amount: '2000000000',
    interest_rate: '8.5',
    loan_term: '120',
    purpose: 'Mua nhà ở',
    risk_level: 'Thấp',
    assessment_result: 'Được phê duyệt',
    notes: 'Khách hàng có thu nhập ổn định',
    department: 'Phòng Tín dụng'
  },
  {
    assessment_id: 2,
    customer_id: 2,
    approved_amount: '1500000000',
    interest_rate: '9.0',
    loan_term: '84',
    purpose: 'Kinh doanh',
    risk_level: 'Trung bình',
    assessment_result: 'Được phê duyệt có điều kiện',
    notes: 'Cần thêm tài sản đảm bảo',
    department: 'Phòng Tín dụng'
  }
];

export function getMockCustomer(customerId: string | number) {
  return mockCustomers.find(c => c.customer_id.toString() === customerId.toString()) || mockCustomers[0];
}

export function getMockCollateral(collateralId: string | number) {
  return mockCollaterals.find(c => c.collateral_id.toString() === collateralId.toString());
}

export function getMockCreditAssessment(assessmentId: string | number) {
  return mockCreditAssessments.find(a => a.assessment_id.toString() === assessmentId.toString());
}
