# Hướng Dẫn Tính Toán Lợi Nhuận Khách Hàng

## Tổng Quan

Tính năng tính toán lợi nhuận khách hàng giúp dự tính lợi nhuận mang lại từ từng khách hàng dựa trên các hợp đồng và hồ sơ thẩm định tín dụng của họ.

## Các Loại Lợi Nhuận

### 1. Lợi Nhuận Từ Cho Vay (Lending Profit)

Lợi nhuận từ hoạt động cho vay được tính dựa trên:
- Số tiền vay (từ hợp đồng hoặc hồ sơ thẩm định)
- Lãi suất (từ hồ sơ thẩm định hoặc sản phẩm)
- Thời hạn vay (tính theo tháng)

**Công thức:**
```
Lợi nhuận cho vay = Số tiền vay × Lãi suất × (Thời hạn / 12)
```

**Ví dụ:**
- Số tiền vay: 100,000,000 VNĐ
- Lãi suất: 12% năm
- Thời hạn: 12 tháng
- Lợi nhuận = 100,000,000 × 0.12 × 1 = 12,000,000 VNĐ

### 2. Lợi Nhuận Từ Huy Động Vốn (Capital Mobilization Profit)

Lợi nhuận từ hoạt động huy động vốn (tiền gửi) được tính dựa trên:
- Số tiền gửi
- Chênh lệch lãi suất cho vay và huy động (mặc định 3%)
- Thời hạn gửi

**Công thức:**
```
Lợi nhuận huy động = Số tiền gửi × Chênh lệch lãi suất × (Thời hạn / 12)
```

**Lưu ý:** Tính năng này chỉ áp dụng cho các sản phẩm có loại là "deposit", "tiền gửi", hoặc "huy động".

**Ví dụ:**
- Số tiền gửi: 50,000,000 VNĐ
- Chênh lệch lãi suất: 3% (giả định)
- Thời hạn: 12 tháng
- Lợi nhuận = 50,000,000 × 0.03 × 1 = 1,500,000 VNĐ

### 3. Lợi Nhuận Từ Thu Phí (Fee Profit)

Lợi nhuận từ thu phí bao gồm:
- Phí từ hồ sơ thẩm định tín dụng (`fee_amount`)
- Phí từ sản phẩm (`product.fees`)
- Các khoản phí khác từ thông tin khoản vay (`loan_info.fees`)

**Công thức:**
```
Lợi nhuận phí = Tổng tất cả các khoản phí
```

**Ví dụ:**
- Phí thẩm định: 500,000 VNĐ
- Phí sản phẩm: 1,000,000 VNĐ
- Tổng phí = 1,500,000 VNĐ

### 4. Tổng Lợi Nhuận

```
Tổng lợi nhuận = Lợi nhuận cho vay + Lợi nhuận huy động + Lợi nhuận phí
```

## Cách Sử Dụng

### 1. Xem Lợi Nhuận Trên Trang Khách Hàng

Trên trang Quản Lý Khách Hàng (`/customers`), bạn sẽ thấy:

1. **Thống kê tổng thể:** Thẻ "Lợi Nhuận Dự Tính" hiển thị tổng lợi nhuận từ tất cả khách hàng
2. **Trên mỗi thẻ khách hàng:** Badge hiển thị lợi nhuận dự tính từ khách hàng đó

### 2. Chi Tiết Lợi Nhuận

Mỗi khách hàng có thể có nhiều hợp đồng, lợi nhuận được tính riêng cho từng hợp đồng và tổng hợp lại.

Thông tin bao gồm:
- Lợi nhuận cho vay
- Lợi nhuận huy động vốn
- Lợi nhuận thu phí
- Tổng lợi nhuận
- Số lượng hợp đồng

## API và Hooks

### Hook `useCustomerProfits`

```typescript
import { useCustomerProfits } from '@/hooks/useCustomerProfits'

// Lấy dữ liệu lợi nhuận cho tất cả khách hàng
const { 
  allCustomerProfits,        // Danh sách lợi nhuận tất cả khách hàng
  totalProfitAcrossAllCustomers, // Tổng lợi nhuận
  getCustomerProfit,         // Hàm lấy lợi nhuận của 1 khách hàng
  getTopProfitableCustomers, // Lấy top khách hàng có lợi nhuận cao
  loading,                   // Trạng thái loading
  error                      // Lỗi nếu có
} = useCustomerProfits()

// Lấy dữ liệu lợi nhuận cho một khách hàng cụ thể
const { 
  allCustomerProfits,
  loading,
  error 
} = useCustomerProfits(customerId)
```

### Utility Functions

```typescript
import {
  calculateLendingProfit,
  calculateCapitalMobilizationProfit,
  calculateFeeProfit,
  calculateContractProfit,
  calculateCustomerProfitability,
  formatCurrency
} from '@/lib/profitCalculation'

// Tính lợi nhuận cho vay
const lendingProfit = calculateLendingProfit(contract, assessment)

// Tính lợi nhuận huy động
const capMobilProfit = calculateCapitalMobilizationProfit(contract, assessment)

// Tính lợi nhuận phí
const feeProfit = calculateFeeProfit(contract, assessment)

// Tính tổng lợi nhuận từ một hợp đồng
const contractProfit = calculateContractProfit(contract, assessment)

// Tính tổng lợi nhuận từ tất cả hợp đồng của khách hàng
const customerProfit = calculateCustomerProfitability(contracts, assessments)

// Format tiền tệ
const formatted = formatCurrency(12000000) // "12.000.000 ₫"
```

## Components

### CustomerProfitDisplay

Component hiển thị chi tiết lợi nhuận:

```typescript
import CustomerProfitDisplay from '@/components/CustomerProfitDisplay'

<CustomerProfitDisplay 
  profitData={customerProfitData}
  compact={false} // true để hiển thị dạng compact
/>
```

### CustomerProfitBadge

Badge hiển thị lợi nhuận ngắn gọn:

```typescript
import { CustomerProfitBadge } from '@/components/CustomerProfitDisplay'

<CustomerProfitBadge profitData={customerProfitData} />
```

## Lưu Ý Kỹ Thuật

### Xử Lý Dữ Liệu Thiếu

- Nếu không có lãi suất hoặc số tiền vay, lợi nhuận cho vay = 0
- Nếu không có thời hạn từ thẩm định, hệ thống sẽ tính từ ngày bắt đầu và kết thúc hợp đồng
- Tất cả các giá trị được làm tròn đến số nguyên

### Validation

- Số tiền vay, lãi suất, và thời hạn phải > 0 để tính lợi nhuận
- Phí phải là số và > 0
- Sản phẩm huy động vốn được xác định theo `product_type` chứa các từ khóa: "deposit", "tiền gửi", "huy động"

### Performance

- Hook `useCustomerProfits` tự động fetch và cache dữ liệu
- Tính toán được memoize để tránh tính toán lại không cần thiết
- Chỉ fetch dữ liệu cho khách hàng cụ thể khi cần

## Tương Lai

Các cải tiến có thể thêm vào:

1. **Lợi nhuận thực tế:** Theo dõi thanh toán thực tế thay vì dự tính
2. **Phân tích xu hướng:** Xem lợi nhuận theo thời gian
3. **So sánh:** So sánh lợi nhuận giữa các khách hàng
4. **Export:** Xuất báo cáo lợi nhuận
5. **Filtering:** Lọc khách hàng theo mức lợi nhuận
6. **Alerts:** Cảnh báo khi lợi nhuận thấp hoặc âm

## Hỗ Trợ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.
