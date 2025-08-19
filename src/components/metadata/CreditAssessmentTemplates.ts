'use client'

import { useState, useEffect } from 'react'
import {
  BanknotesIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'

type IconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>

interface MetadataField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'tel' | 'email' | 'textarea' | 'section' | 'boolean'
  options?: string[]
  readOnly?: boolean
}

interface TemplateConfig {
  title: string
  icon: IconType
  fields: MetadataField[]
}

type MetadataTemplates = {
  [key: string]: TemplateConfig
}

const CREDIT_ASSESSMENT_TEMPLATES: MetadataTemplates = {
  loan_info: {
    title: '1. Thông tin khoản vay',
    icon: BanknotesIcon,
    fields: [
      {
        key: 'loan_type.category',
        label: 'Loại khoản vay',
        type: 'select',
        options: ['business', 'consumer', 'mortgage', 'credit_card']
      },
      { key: 'loan_type.product_code', label: 'Mã sản phẩm', type: 'text' },
      { key: 'loan_type.product_name', label: 'Tên sản phẩm', type: 'text' },
      { key: 'purpose.main_purpose', label: 'Mục đích vay chính', type: 'text' },
      { key: 'purpose.sub_purpose', label: 'Mục đích vay chi tiết', type: 'text' },
      { key: 'purpose.description', label: 'Mô tả chi tiết', type: 'textarea' },
      { key: 'amount.requested', label: 'Số tiền đề nghị vay', type: 'number' },
      { key: 'amount.approved', label: 'Số tiền được duyệt', type: 'number' },
      { key: 'amount.disbursement', label: 'Số tiền giải ngân', type: 'number' },
      { key: 'term.requested_months', label: 'Thời hạn đề nghị (tháng)', type: 'number' },
      { key: 'term.approved_months', label: 'Thời hạn được duyệt (tháng)', type: 'number' },
      { key: 'term.grace_period_months', label: 'Thời gian ân hạn (tháng)', type: 'number' }
    ]
  },

  business_plan: {
    title: '2. Phương án kinh doanh',
    icon: ChartBarIcon,
    fields: [
      { key: 'pakd_doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'pakd_giavon', label: 'Giá vốn', type: 'number' },
      { key: 'pakd_nhancong', label: 'Chi phí nhân công', type: 'number' },
      { key: 'pakd_chiphikhac', label: 'Chi phí khác', type: 'number' },
      { key: 'pakd_laivay', label: 'Lãi vay', type: 'number' },
      { key: 'pakd_thue', label: 'Thuế', type: 'number' },
      { key: 'pakd_loinhuansauthue', label: 'Lợi nhuận sau thuế', type: 'number' },
      { key: 'pakd_tongchiphi', label: 'Tổng chi phí', type: 'number' },
      { key: 'pakd_vongquay', label: 'Vòng quay', type: 'number' },
      { key: 'pakd_nhucauvon', label: 'Nhu cầu vốn', type: 'number' },
      { key: 'pakd_vontuco', label: 'Vốn tự có', type: 'number' },
      { key: 'pakd_vaytctdkhac', label: 'Vay TCTD khác', type: 'number' },
      { key: 'pakd_vaynhct', label: 'Vay NHCT', type: 'number' }
    ]
  },

  financial_reports: {
    title: '3. Báo cáo tài chính',
    icon: DocumentTextIcon,
    fields: [
      // Năm 0
      { key: 'section_nam_0', label: 'Năm hiện tại', type: 'section' },
      { key: 'nam_0.title', label: 'Năm', type: 'number' },
      { key: 'nam_0.tongtaisan', label: 'Tổng tài sản', type: 'number' },
      { key: 'nam_0.taisannganhang', label: 'Tài sản ngân hàng', type: 'number' },
      { key: 'nam_0.tien', label: 'Tiền', type: 'number' },
      { key: 'nam_0.phaithu', label: 'Phải thu', type: 'number' },
      { key: 'nam_0.tonkho', label: 'Tồn kho', type: 'number' },
      { key: 'nam_0.tscd', label: 'TSCĐ', type: 'number' },
      { key: 'nam_0.tongnguonvon', label: 'Tổng nguồn vốn', type: 'number' },
      { key: 'nam_0.notranguoiban', label: 'Nợ trả người bán', type: 'number' },
      { key: 'nam_0.nonhct', label: 'Nợ NHCT', type: 'number' },
      { key: 'nam_0.notctd', label: 'Nợ TCTD', type: 'number' },
      { key: 'nam_0.nodaihan', label: 'Nợ dài hạn', type: 'number' },
      { key: 'nam_0.voncsh', label: 'Vốn CSH', type: 'number' },
      { key: 'nam_0.doanhthu', label: 'Doanh thu', type: 'number' },
      { key: 'nam_0.giavon', label: 'Giá vốn', type: 'number' },
      { key: 'nam_0.chingoaigiavon', label: 'Chi ngoài giá vốn', type: 'number' },
      { key: 'nam_0.thue', label: 'Thuế', type: 'number' },
      { key: 'nam_0.laivay', label: 'Lãi vay', type: 'number' },
      { key: 'nam_0.loinhuan', label: 'Lợi nhuận', type: 'number' },

      // Năm 1 và 2 tương tự
      { key: 'section_nam_1', label: 'Năm trước', type: 'section' },
      // Copy fields from nam_0 for nam_1
      { key: 'section_nam_2', label: 'Năm trước nữa', type: 'section' }
      // Copy fields from nam_0 for nam_2
    ]
  },

  assessment_details: {
    title: '4. Đánh giá chi tiết',
    icon: ClipboardDocumentCheckIcon,
    fields: [
      { key: 'section_taichinh', label: 'Đánh giá tài chính', type: 'section' },
      { key: 'danhgiathongtintaichinh.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'danhgiathongtintaichinh.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'danhgiathongtintaichinh.content', label: 'Nội dung', type: 'textarea' },

      { key: 'section_pakd', label: 'Đánh giá PAKD', type: 'section' },
      { key: 'danhgiapakd.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'danhgiapakd.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'danhgiapakd.content', label: 'Nội dung', type: 'textarea' },

      // Thêm các mục đánh giá khác tương tự
      { key: 'section_kinhnghiem', label: 'Kinh nghiệm SXKD', type: 'section' },
      { key: 'linhvuc_kinhnghiemsxkd.checked', label: 'Đã đánh giá', type: 'boolean' },
      { key: 'linhvuc_kinhnghiemsxkd.keyword', label: 'Từ khóa', type: 'text' },
      { key: 'linhvuc_kinhnghiemsxkd.content', label: 'Nội dung', type: 'textarea' }
    ]
  },

  borrower_info: {
    title: '5. Thông tin người vay',
    icon: UserIcon,
    fields: [
      { key: 'borrower.full_name', label: 'Họ tên', type: 'text' },
      { key: 'borrower.birth_date', label: 'Ngày sinh', type: 'date' },
      { key: 'borrower.gender', label: 'Giới tính', type: 'select', options: ['Nam', 'Nữ'] },
      { key: 'borrower.id_number', label: 'Số CMND/CCCD', type: 'text' },
      { key: 'borrower.id_issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'borrower.id_issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'borrower.phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'borrower.email', label: 'Email', type: 'email' },
      { key: 'borrower.marital_status', label: 'Tình trạng hôn nhân', type: 'select', options: ['Độc thân', 'Đã kết hôn', 'Ly hôn'] },
      { key: 'borrower.education_level', label: 'Trình độ học vấn', type: 'text' },
      { key: 'borrower.current_address', label: 'Địa chỉ hiện tại', type: 'text' },
      { key: 'borrower.permanent_address', label: 'Địa chỉ thường trú', type: 'text' },
      { key: 'borrower.residence_status', label: 'Tình trạng cư trú', type: 'text' },
      { key: 'borrower.residence_time_years', label: 'Thời gian cư trú (năm)', type: 'number' }
    ]
  },

  spouse_info: {
    title: '6. Thông tin vợ/chồng',
    icon: UserGroupIcon,
    fields: [
      { key: 'spouse.full_name', label: 'Họ tên', type: 'text' },
      { key: 'spouse.birth_date', label: 'Ngày sinh', type: 'date' },
      { key: 'spouse.id_number', label: 'Số CMND/CCCD', type: 'text' },
      { key: 'spouse.id_issue_date', label: 'Ngày cấp', type: 'date' },
      { key: 'spouse.id_issue_place', label: 'Nơi cấp', type: 'text' },
      { key: 'spouse.phone', label: 'Số điện thoại', type: 'tel' },
      { key: 'spouse.current_address', label: 'Địa chỉ hiện tại', type: 'text' },
      { key: 'spouse.permanent_address', label: 'Địa chỉ thường trú', type: 'text' },
      { key: 'spouse.occupation', label: 'Nghề nghiệp', type: 'text' },
      { key: 'spouse.workplace', label: 'Nơi làm việc', type: 'text' },
      { key: 'spouse.position', label: 'Chức vụ', type: 'text' },
      { key: 'spouse.income_monthly', label: 'Thu nhập hàng tháng', type: 'number' }
    ]
  },

  credit_history: {
    title: '7. Lịch sử tín dụng',
    icon: BuildingOfficeIcon,
    fields: [
      { key: 'borrower.credit_history.credit_score', label: 'Điểm tín dụng', type: 'number' },
      { key: 'section_loans', label: 'Các khoản vay hiện có', type: 'section' },
      { key: 'borrower.credit_history.existing_loans[].bank', label: 'Ngân hàng', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].product', label: 'Sản phẩm', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].original_amount', label: 'Số tiền vay', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].current_balance', label: 'Dư nợ hiện tại', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].monthly_payment', label: 'Trả góp hàng tháng', type: 'number' },
      { key: 'borrower.credit_history.existing_loans[].start_date', label: 'Ngày bắt đầu', type: 'date' },
      { key: 'borrower.credit_history.existing_loans[].end_date', label: 'Ngày kết thúc', type: 'date' },
      { key: 'borrower.credit_history.existing_loans[].collateral', label: 'Tài sản đảm bảo', type: 'text' },
      { key: 'borrower.credit_history.existing_loans[].status', label: 'Trạng thái', type: 'text' }
    ]
  }
}

export default CREDIT_ASSESSMENT_TEMPLATES
