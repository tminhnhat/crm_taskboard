'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { Contract, Customer, Product, Staff } from '@/lib/supabase'
import { ContractFormProps, ContractFormData } from './types'
import { useDateFormatting } from './useDateFormatting'
import ContractBasicInfoSection from './ContractBasicInfoSection'
import ContractDatesSection from './ContractDatesSection'
import ContractMetadataSection from './ContractMetadataSection'

export default function ContractFormModular({ 
  isOpen,
  onClose,
  onSubmit,
  contract, 
  isLoading,
  checkContractNumberExists,
  fetchCustomers,
  fetchProducts,
  fetchStaff
}: ContractFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { formatDateForDisplay, formatDateForSubmission, validateDateFormat } = useDateFormatting()

  const [formData, setFormData] = useState<ContractFormData>({
    customer_id: contract?.customer_id?.toString() || '',
    product_id: contract?.product_id?.toString() || '',
    contract_number: contract?.contract_number || '',
    contract_credit_limit: contract?.contract_credit_limit?.toString() || '0',
    start_date: formatDateForDisplay(contract?.start_date || null),
    end_date: formatDateForDisplay(contract?.end_date || null),
    status: contract?.status || 'draft',
    signed_by: contract?.signed_by?.toString() || '',
    metadata: contract?.metadata || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [metadataInput, setMetadataInput] = useState('')
  const [contractNumberError, setContractNumberError] = useState('')

  // Load customers, products, and staff for dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersData, productsData, staffData] = await Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchStaff()
        ])
        setCustomers(customersData)
        setProducts(productsData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [fetchCustomers, fetchProducts, fetchStaff])

  // Initialize form data and metadata input when component mounts or contract changes
  useEffect(() => {
    if (contract) {
      setFormData({
        customer_id: contract.customer_id?.toString() || '',
        product_id: contract.product_id?.toString() || '',
        contract_number: contract.contract_number || '',
        contract_credit_limit: contract.contract_credit_limit?.toString() || '0',
        start_date: formatDateForDisplay(contract.start_date || null),
        end_date: formatDateForDisplay(contract.end_date || null),
        status: contract.status || 'draft',
        signed_by: contract.signed_by?.toString() || '',
        metadata: contract.metadata || {}
      })
      
      if (contract.metadata) {
        setMetadataInput(JSON.stringify(contract.metadata, null, 2))
      }
    }
  }, [contract, formatDateForDisplay])

  // Validate contract number
  const validateContractNumber = async (contractNumber: string) => {
    if (!contractNumber.trim()) {
      setContractNumberError('Số hợp đồng là bắt buộc')
      return false
    }

    const exists = await checkContractNumberExists(contractNumber, contract?.contract_id)
    if (exists) {
      setContractNumberError('Số hợp đồng đã tồn tại')
      return false
    }

    setContractNumberError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate contract number
    const isValidContractNumber = await validateContractNumber(formData.contract_number)
    if (!isValidContractNumber) {
      return
    }

    // Validate date formats
    if (formData.start_date && !validateDateFormat(formData.start_date)) {
      alert('Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }
    
    if (formData.end_date && !validateDateFormat(formData.end_date)) {
      alert('Định dạng ngày kết thúc không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy')
      return
    }

    let parsedMetadata = {}
    if (metadataInput.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataInput)
      } catch {
        alert('Định dạng JSON không hợp lệ trong trường metadata')
        return
      }
    }

    // Convert string values to appropriate types
    const cleanedData = {
      customer_id: parseInt(formData.customer_id),
      product_id: parseInt(formData.product_id),
      contract_number: formData.contract_number.trim(),
      contract_credit_limit: parseFloat(formData.contract_credit_limit) || 0,
      start_date: formatDateForSubmission(formData.start_date),
      end_date: formatDateForSubmission(formData.end_date),
      status: formData.status,
      signed_by: parseInt(formData.signed_by),
      metadata: Object.keys(parsedMetadata).length > 0 ? parsedMetadata : null
    }

    onSubmit(cleanedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear contract number error when user types
    if (name === 'contract_number') {
      setContractNumberError('')
    }
  }

  const handleDateChange = (field: 'start_date' | 'end_date', e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Remove all non-digits
    
    // Format as user types: dd/mm/yyyy
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9)
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContractNumberBlur = async () => {
    if (formData.contract_number.trim()) {
      await validateContractNumber(formData.contract_number)
    }
  }

  if (loadingOptions) {
    return (
      <Dialog open={isOpen} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>Đang tải dữ liệu form...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '100vh' : '90vh',
          m: isMobile ? 0 : 1,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div">
          {contract ? 'Sửa Hợp Đồng' : 'Tạo Hợp Đồng Mới'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ContractBasicInfoSection
            formData={formData}
            onChange={handleChange}
            customers={customers}
            products={products}
            staff={staff}
            contractNumberError={contractNumberError}
            onContractNumberBlur={handleContractNumberBlur}
          />

          <ContractDatesSection
            formData={formData}
            onChange={handleChange}
            onDateChange={handleDateChange}
            validateDateFormat={validateDateFormat}
          />

          <ContractMetadataSection
            metadataInput={metadataInput}
            onMetadataInputChange={setMetadataInput}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={
            isLoading || 
            !formData.customer_id || 
            !formData.product_id || 
            !formData.contract_number.trim() || 
            !formData.signed_by || 
            !!contractNumberError
          }
          sx={{ minWidth: 120 }}
        >
          {isLoading ? 'Đang Lưu...' : (contract ? 'Cập Nhật' : 'Tạo Mới')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}