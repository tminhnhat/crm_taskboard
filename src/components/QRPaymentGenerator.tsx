'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Autocomplete,
  Chip
} from '@mui/material'
import {
  Close as CloseIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Image as ImageIcon
} from '@mui/icons-material'
import { useCustomers } from '@/hooks/useCustomers'

interface QRPaymentGeneratorProps {
  isOpen: boolean
  onClose: () => void
  prefilledCustomerId?: number
}

interface QRPaymentData {
  accountNumber: string
  accountName: string
  amount?: number
  description?: string
  useCustomerData: boolean
  selectedCustomerId?: number
  backgroundImage?: string
}

export default function QRPaymentGenerator({
  isOpen,
  onClose,
  prefilledCustomerId
}: QRPaymentGeneratorProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const { customers } = useCustomers()
  
  const [formData, setFormData] = useState<QRPaymentData>({
    accountNumber: '',
    accountName: '',
    amount: undefined,
    description: '',
    useCustomerData: true,
    selectedCustomerId: prefilledCustomerId,
    backgroundImage: undefined
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [backgroundImages, setBackgroundImages] = useState<Array<{
    name: string;
    url: string;
    pathname: string;
  }>>([])
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(true)

  // Update form when customer is selected
  useEffect(() => {
    if (formData.useCustomerData && formData.selectedCustomerId) {
      const customer = customers.find(c => c.customer_id === formData.selectedCustomerId)
      if (customer) {
        setFormData(prev => ({
          ...prev,
          accountName: customer.full_name,
          // Use customer's account_number field if available
          accountNumber: customer.account_number || prev.accountNumber || ''
        }))
      }
    }
  }, [formData.useCustomerData, formData.selectedCustomerId, customers])

  // Set prefilled customer on dialog open
  useEffect(() => {
    if (prefilledCustomerId && customers.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedCustomerId: prefilledCustomerId,
        useCustomerData: true
      }))
    }
  }, [prefilledCustomerId, customers])

  // Load available background images
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch('/api/qr-backgrounds')
        const data = await response.json()
        if (data.success) {
          setBackgroundImages(data.backgrounds)
        }
      } catch (error) {
        console.error('Error fetching background images:', error)
      } finally {
        setIsLoadingBackgrounds(false)
      }
    }

    fetchBackgrounds()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const generateQRCode = async () => {
    if (!formData.accountNumber || !formData.accountName) {
      alert('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản')
      return
    }

    setIsGenerating(true)
    setPreviewUrl(null)

    try {
      const response = await fetch('/api/qr-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          amount: formData.amount,
          description: formData.description,
          backgroundImage: formData.backgroundImage,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } else {
        const error = await response.json()
        alert(`Lỗi: ${error.error || 'Không thể tạo mã QR'}`)
      }
    } catch (error) {
      console.error('Error generating QR:', error)
      alert('Lỗi kết nối khi tạo mã QR')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `qr-payment-${formData.accountNumber}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setFormData({
      accountNumber: '',
      accountName: '',
      amount: undefined,
      description: '',
      useCustomerData: true,
      selectedCustomerId: undefined,
      backgroundImage: undefined
    })
    onClose()
  }

  const selectedCustomer = formData.selectedCustomerId 
    ? customers.find(c => c.customer_id === formData.selectedCustomerId)
    : null

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          boxShadow: theme.shadows[8],
          minHeight: fullScreen ? '100vh' : 'auto'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        p: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon />
          <Typography variant="h6">
            Tạo Mã QR Thanh Toán Vietinbank
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ color: 'inherit' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
          gap: 3 
        }}>
          {/* Form Section */}
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Customer Data Section */}
              <Card sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Thông tin tài khoản
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="useCustomerData"
                        checked={formData.useCustomerData}
                        onChange={handleCheckboxChange}
                      />
                    }
                    label="Sử dụng thông tin từ khách hàng"
                    sx={{ mb: 2 }}
                  />

                  {formData.useCustomerData && (
                    <Autocomplete
                      value={selectedCustomer}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          selectedCustomerId: newValue?.customer_id || undefined
                        }))
                      }}
                      options={customers}
                      getOptionLabel={(option) => 
                        `${option.full_name} - ${option.phone}${
                          option.account_number ? ` (STK: ${option.account_number})` : ''
                        }`
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Chọn khách hàng"
                          variant="outlined"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                <PersonIcon color="action" />
                              </Box>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {option.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.phone} {option.account_number && `• STK: ${option.account_number}`}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Account Number */}
              <TextField
                name="accountNumber"
                label="Số tài khoản"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                placeholder="Nhập số tài khoản Vietinbank"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <AccountBalanceIcon color="action" />
                    </Box>
                  ),
                  readOnly: formData.useCustomerData && !!formData.selectedCustomerId && !!formData.accountNumber
                }}
                helperText={
                  formData.useCustomerData && !!formData.selectedCustomerId
                    ? formData.accountNumber 
                      ? "Từ thông tin khách hàng"
                      : "⚠️ Khách hàng chưa có số tài khoản. Vui lòng nhập thủ công."
                    : "Trường này là bắt buộc"
                }
                sx={{
                  '& .MuiInputBase-root': formData.useCustomerData && !!formData.selectedCustomerId && formData.accountNumber
                    ? { bgcolor: 'success.50', borderColor: 'success.main' }
                    : {}
                }}
              />

              {/* Account Name */}
              <TextField
                name="accountName"
                label="Tên chủ tài khoản"
                value={formData.accountName}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                placeholder="Nhập tên chủ tài khoản"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <PersonIcon color="action" />
                    </Box>
                  ),
                  readOnly: formData.useCustomerData && !!formData.selectedCustomerId
                }}
                helperText="Trường này là bắt buộc"
              />

              {/* Amount */}
              <TextField
                name="amount"
                label="Số tiền (VNĐ)"
                type="number"
                value={formData.amount || ''}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Nhập số tiền (tùy chọn)"
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <AttachMoneyIcon color="action" />
                    </Box>
                  ),
                }}
              />

              {/* Description */}
              <TextField
                name="description"
                label="Nội dung chuyển khoản"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Nhập nội dung chuyển khoản (tùy chọn)"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mr: 1, pt: 1 }}>
                      <DescriptionIcon color="action" />
                    </Box>
                  ),
                }}
              />

              {/* Background Image */}
              <TextField
                name="backgroundImage"
                label="Ảnh nền QR Code"
                value={formData.backgroundImage || ''}
                onChange={handleInputChange}
                select
                fullWidth
                variant="outlined"
                disabled={isLoadingBackgrounds}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <ImageIcon color="action" />
                    </Box>
                  ),
                }}
                helperText={
                  backgroundImages.length === 0 && !isLoadingBackgrounds
                    ? "ℹ️ Chưa có ảnh nền nào trong thư mục qrimg của Vercel Blob"
                    : formData.backgroundImage
                    ? `✓ Sử dụng ảnh nền: ${formData.backgroundImage}`
                    : undefined
                }
              >
                <MenuItem value="">Không sử dụng ảnh nền (màu đặc)</MenuItem>
                {isLoadingBackgrounds ? (
                  <MenuItem disabled>Đang tải ảnh nền...</MenuItem>
                ) : (
                  backgroundImages.map((bg) => (
                    <MenuItem key={bg.pathname} value={bg.name}>
                      {bg.name}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* Generate Button */}
              <Button
                onClick={generateQRCode}
                variant="contained"
                size="large"
                disabled={isGenerating || !formData.accountNumber || !formData.accountName}
                startIcon={isGenerating ? <CircularProgress size={20} /> : <QrCodeIcon />}
                sx={{ py: 1.5 }}
              >
                {isGenerating ? 'Đang tạo...' : 'Tạo mã QR'}
              </Button>
            </Box>
          </Box>

          {/* Preview Section */}
          <Box>
            <Paper sx={{ p: 3, bgcolor: 'grey.50', height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Xem trước
              </Typography>
              
              {previewUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Paper 
                    sx={{ 
                      display: 'inline-block',
                      p: 2,
                      mb: 3,
                      boxShadow: 4,
                      maxWidth: '100%'
                    }}
                  >
                    <Image
                      src={previewUrl}
                      alt="QR Payment Code"
                      width={400}
                      height={400}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        maxWidth: '400px'
                      }}
                    />
                  </Paper>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      onClick={downloadQRCode}
                      variant="contained"
                      color="success"
                      startIcon={<DownloadIcon />}
                    >
                      Tải xuống
                    </Button>
                    <Button
                      onClick={() => window.open(previewUrl, '_blank')}
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                    >
                      Xem toàn màn hình
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  py: 10
                }}>
                  <QrCodeIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography>
                    Mã QR sẽ hiển thị tại đây sau khi tạo
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Lưu ý:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>Mã QR được tạo có kích thước khổ giấy A6 (105 x 148 mm)</li>
            <li>Hình ảnh có độ phân giải cao phù hợp để in ấn</li>
            <li>Mã QR tương thích với các ứng dụng banking của Vietinbank</li>
            <li>Nếu không nhập số tiền, khách hàng có thể nhập số tiền khi quét mã</li>
          </Box>
        </Alert>
      </DialogContent>
    </Dialog>
  )
}
