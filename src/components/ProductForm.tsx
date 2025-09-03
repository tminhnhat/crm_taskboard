'use client'

import { useState } from 'react'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Divider,
  Grid,
  InputAdornment
} from '@mui/material'
import { Product } from '@/lib/supabase'
import JsonInputHelper from './JsonInputHelper'

interface ProductFormProps {
  product?: Product | null
  onSave: (productData: Partial<Product>) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductForm({ product, onSave, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    product_type: product?.product_type || '',
    description: product?.description || '',
    status: product?.status || 'active',
    interest_rate: product?.interest_rate?.toString() || '',
    minimum_amount: product?.minimum_amount?.toString() || '',
    maximum_amount: product?.maximum_amount?.toString() || '',
    currency: product?.currency || 'VND',
    terms_months: product?.terms_months?.toString() || '',
    fees: product?.fees?.toString() || '',
    requirements: product?.requirements || '',
    benefits: product?.benefits || '',
    metadata: product?.metadata || {}
  })

  const [metadataInput, setMetadataInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch {
        alert('Định dạng JSON không hợp lệ trong trường metadata')
        return
      }
    }

    onSave({
      product_name: formData.product_name,
      product_type: formData.product_type || null,
      description: formData.description || null,
      status: formData.status,
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : null,
      maximum_amount: formData.maximum_amount ? parseFloat(formData.maximum_amount) : null,
      currency: formData.currency || null,
      terms_months: formData.terms_months ? parseInt(formData.terms_months) : null,
      fees: formData.fees ? parseFloat(formData.fees) : null,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Initialize metadata input when component mounts or product changes
  useState(() => {
    if (product?.metadata) {
      setMetadataInput(JSON.stringify(product.metadata, null, 2))
    }
  })

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        inset: 0, 
        bgcolor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2, 
        zIndex: 50 
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          boxShadow: 24, 
          maxWidth: '4xl', 
          width: '100%', 
          maxHeight: '90vh', 
          overflow: 'auto' 
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
            {product ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Product Information */}
            <TextField
              size="small"
              fullWidth
              required
              label="Tên Sản Phẩm"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              placeholder="VD: Gói Tiết Kiệm Sinh Lợi, Vay Thế Chấp Nhà Đất"
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Loại Sản Phẩm</InputLabel>
              <Select
                name="product_type"
                value={formData.product_type}
                label="Loại Sản Phẩm"
                onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
              >
                <MenuItem value="">Chọn loại sản phẩm</MenuItem>
                <MenuItem value="Savings Account">Tài Khoản Tiết Kiệm</MenuItem>
                <MenuItem value="Current Account">Tài Khoản Vãng Lai</MenuItem>
                <MenuItem value="Term Deposit">Gửi Tiết Kiệm Có Kỳ Hạn</MenuItem>
                <MenuItem value="Personal Loan">Vay Cá Nhân</MenuItem>
                <MenuItem value="Home Loan">Vay Thế Chấp Nhà Đất</MenuItem>
                <MenuItem value="Auto Loan">Vay Mua Xe</MenuItem>
                <MenuItem value="Business Loan">Vay Kinh Doanh</MenuItem>
                <MenuItem value="Credit Card">Thẻ Tín Dụng</MenuItem>
                <MenuItem value="Debit Card">Thẻ Ghi Nợ</MenuItem>
                <MenuItem value="Life Insurance">Bảo Hiểm Nhân Thọ</MenuItem>
                <MenuItem value="Health Insurance">Bảo Hiểm Sức Khỏe</MenuItem>
                <MenuItem value="Property Insurance">Bảo Hiểm Tài Sản</MenuItem>
                <MenuItem value="Auto Insurance">Bảo Hiểm Ô Tô</MenuItem>
                <MenuItem value="Investment">Đầu Tư</MenuItem>
                <MenuItem value="Foreign Exchange">Ngoại Hối</MenuItem>
                <MenuItem value="Money Transfer">Chuyển Tiền</MenuItem>
                <MenuItem value="Cash Management">Quản Lý Tiền Mặt</MenuItem>
                <MenuItem value="Trade Finance">Tài Chính Thương Mại</MenuItem>
                <MenuItem value="Payment Services">Dịch Vụ Thanh Toán</MenuItem>
                <MenuItem value="Safe Deposit Box">Két An Toàn</MenuItem>
                <MenuItem value="Financial Advisory">Tư Vấn Tài Chính</MenuItem>
              </Select>
            </FormControl>

            {/* Financial Details */}
            <Divider />
            <Typography variant="subtitle2" color="primary">
              Thông Tin Tài Chính
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ step: 0.01 }}
                  label="Lãi Suất"
                  name="interest_rate"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%/năm</InputAdornment>,
                  }}
                  placeholder="VD: 8.5"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Đơn Vị Tiền Tệ</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    label="Đơn Vị Tiền Tệ"
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <MenuItem value="VND">VND</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Amount Limits */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Số Tiền Tối Thiểu"
                  name="minimum_amount"
                  value={formData.minimum_amount}
                  onChange={handleChange}
                  placeholder="VD: 100000"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Số Tiền Tối Đa"
                  name="maximum_amount"
                  value={formData.maximum_amount}
                  onChange={handleChange}
                  placeholder="VD: 5000000000"
                />
              </Grid>
            </Grid>

            {/* Terms and Fees */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Thời Hạn"
                  name="terms_months"
                  value={formData.terms_months}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">tháng</InputAdornment>,
                  }}
                  placeholder="VD: 12"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ step: 0.01 }}
                  label="Phí Dịch Vụ"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  placeholder="VD: 50000"
                />
              </Grid>
            </Grid>

            {/* Description and Details */}
            <Divider />
            <Typography variant="subtitle2" color="primary">
              Chi Tiết Sản Phẩm
            </Typography>

            <TextField
              size="small"
              fullWidth
              multiline
              rows={3}
              label="Mô Tả Sản Phẩm"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về sản phẩm, tính năng và ưu điểm"
            />

            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              label="Điều Kiện Áp Dụng"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="VD: Tuổi từ 18-65, thu nhập tối thiểu 10 triệu/tháng"
            />

            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              label="Quyền Lợi & Ưu Đãi"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="VD: Miễn phí chuyển khoản, tặng thẻ quà tặng, bảo hiểm miễn phí"
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Trạng Thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Trạng Thái"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="active">Đang Hoạt Động</MenuItem>
                <MenuItem value="inactive">Tạm Ngưng</MenuItem>
              </Select>
            </FormControl>

            {/* Metadata Section */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Thông Tin Bổ Sung
              </Typography>
              <JsonInputHelper
                value={metadataInput}
                onChange={setMetadataInput}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Thêm thông tin bổ sung với giao diện thân thiện
              </Typography>
            </Box>

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !formData.product_name.trim()}
                sx={{ flex: 1 }}
              >
                {isLoading ? 'Đang lưu...' : (product ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={onCancel}
                sx={{ flex: 1 }}
              >
                Hủy
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
