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
import { Collateral, Customer } from '@/lib/supabase'
import { CollateralFormProps, CollateralFormData } from './types'
import CollateralBasicInfoSection from './CollateralBasicInfoSection'
import CollateralOwnerInfoSection from './CollateralOwnerInfoSection'
import CollateralMetadataSection from './CollateralMetadataSection'

export default function CollateralFormModular({
  isOpen,
  onClose,
  onSubmit,
  collateral,
  isLoading,
  fetchCustomers
}: CollateralFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [formState, setFormState] = useState<CollateralFormData>({
    collateral_type: collateral?.collateral_type || '',
    value: collateral?.value?.toString() || '',
    customer_id: collateral?.customer_id?.toString() || '',
    valuation_date: collateral?.valuation_date || '',
    status: collateral?.status || 'active',
    location: collateral?.location || '',
    description: collateral?.description || '',
    owner_info: collateral?.owner_info || JSON.stringify({
      primary_owner_id: '',
      primary_owner_name: '',
      spouse_id: '',
      spouse_name: '',
      notes: ''
    }),
    metadata: (collateral?.metadata as Record<string, Record<string, unknown>>) || {}
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (error) {
        console.error('Error loading customers:', error)
      } finally {
        setLoadingCustomers(false)
      }
    }
    loadCustomers()
  }, [fetchCustomers])

  // Update form state when collateral prop changes
  useEffect(() => {
    if (collateral) {
      setFormState({
        collateral_type: collateral.collateral_type || '',
        value: collateral.value?.toString() || '',
        customer_id: collateral.customer_id?.toString() || '',
        valuation_date: collateral.valuation_date || '',
        status: collateral.status || 'active',
        location: collateral.location || '',
        description: collateral.description || '',
        owner_info: collateral.owner_info || JSON.stringify({
          primary_owner_id: '',
          primary_owner_name: '',
          spouse_id: '',
          spouse_name: '',
          notes: ''
        }),
        metadata: (collateral.metadata as Record<string, Record<string, unknown>>) || {}
      })
    } else {
      // Reset form for new collateral
      setFormState({
        collateral_type: '',
        value: '',
        customer_id: '',
        valuation_date: '',
        status: 'active',
        location: '',
        description: '',
        owner_info: JSON.stringify({
          primary_owner_id: '',
          primary_owner_name: '',
          spouse_id: '',
          spouse_name: '',
          notes: ''
        }),
        metadata: {}
      })
    }
  }, [collateral])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const collateralData: Partial<Collateral> = {
      collateral_type: formState.collateral_type,
      value: parseFloat(formState.value) || 0,
      customer_id: parseInt(formState.customer_id),
      valuation_date: formState.valuation_date,
      status: formState.status,
      location: formState.location,
      description: formState.description,
      owner_info: formState.owner_info,
      metadata: formState.metadata
    }

    onSubmit(collateralData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleFormDataChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleMetadataChange = (metadata: Record<string, Record<string, unknown>>) => {
    setFormState(prev => ({ ...prev, metadata }))
  }

  if (loadingCustomers) {
    return (
      <Dialog open={isOpen} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>Đang tải dữ liệu khách hàng...</Typography>
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
      maxWidth="xl"
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
          {collateral ? 'Cập Nhật Tài Sản' : 'Thêm Tài Sản Mới'}
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
          <CollateralBasicInfoSection
            formData={formState}
            onChange={handleInputChange}
            customers={customers}
          />

          <CollateralOwnerInfoSection
            formData={formState}
            onChange={handleInputChange}
            onFormDataChange={handleFormDataChange}
            customers={customers}
          />

          <CollateralMetadataSection
            formData={formState}
            onMetadataChange={handleMetadataChange}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={isLoading}
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
            !formState.customer_id || 
            !formState.collateral_type || 
            !formState.value
          }
          sx={{ minWidth: 120 }}
        >
          {isLoading ? 'Đang Lưu...' : (collateral ? 'Cập Nhật' : 'Tạo Mới')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}