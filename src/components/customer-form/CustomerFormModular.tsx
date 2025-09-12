import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Customer } from '@/lib/supabase';
import { useCustomers } from '@/hooks/useCustomers';

// Import modular sections
import CustomerQRScannerSection from './CustomerQRScannerSection';
import CustomerBasicInfoSection from './CustomerBasicInfoSection';
import CustomerBusinessSection from './CustomerBusinessSection';
import CustomerAccountSection from './CustomerAccountSection';
import CustomerContactSection from './CustomerContactSection';
import CustomerPersonalInfoSection from './CustomerPersonalInfoSection';
import CustomerNumerologySection from './CustomerNumerologySection';
import CustomerRelationshipSection from './CustomerRelationshipSection';

// Import types and utilities
import { CustomerFormData, CustomerFormProps } from './types';
import { useDateFormatting } from './useDateFormatting';

export default function CustomerForm({ isOpen, onClose, onSubmit, customer }: CustomerFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { customers } = useCustomers();
  
  const { 
    formatDateForDisplay, 
    formatDateForSubmission, 
    validateDateFormat, 
    handleDateChange 
  } = useDateFormatting();

  const [formData, setFormData] = useState<CustomerFormData>({
    customer_type: 'individual',
    full_name: '',
    date_of_birth: '',
    gender: '',
    id_number: '',
    id_issue_date: '',
    id_issue_authority: 'Cục CS QLHC về TTXH',
    phone: '',
    email: '',
    address: '',
    hobby: '',
    status: 'active',
    account_number: '',
    cif_number: '',
    numerology_data: {} as Record<string, unknown>,
    relationship: '',
    relationship_other: '',
    business_registration_number: '',
    registration_date: '',
    business_registration_authority: '',
    company_name: '',
    legal_representative: '',
    legal_representative_cif_number: '',
    business_sector: '',
    spouse_id: undefined,
    spouse_info: {},
  });

  // Initialize form data when customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData({
        customer_type: customer.customer_type,
        full_name: customer.full_name,
        date_of_birth: formatDateForDisplay(customer.date_of_birth),
        gender: customer.gender || '',
        id_number: customer.id_number || '',
        id_issue_date: formatDateForDisplay(customer.id_issue_date),
        id_issue_authority: customer.id_issue_authority || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        hobby: customer.hobby || '',
        status: customer.status,
        account_number: customer.account_number,
        cif_number: customer.cif_number || '',
        numerology_data: customer.numerology_data || {} as Record<string, unknown>,
        relationship: customer.relationship || '',
        relationship_other: '',
        business_registration_number: customer.business_registration_number || '',
        business_registration_authority: customer.business_registration_authority || '',
        registration_date: formatDateForDisplay(customer.registration_date),
        company_name: customer.company_name || '',
        legal_representative: customer.legal_representative || '',
        legal_representative_cif_number: customer.legal_representative_cif_number || '',
        business_sector: customer.business_sector || '',
        spouse_id: undefined,
        spouse_info: {},
      });
    } else {
      setFormData({
        customer_type: 'individual',
        full_name: '',
        date_of_birth: '',
        gender: '',
        id_number: '',
        id_issue_date: '',
        id_issue_authority: 'Cục CS QLHC về TTXH',
        phone: '',
        email: '',
        address: '',
        hobby: '',
        status: 'active',
        account_number: '',
        cif_number: '',
        numerology_data: {} as Record<string, unknown>,
        relationship: '',
        relationship_other: '',
        business_registration_number: '',
        business_registration_authority: '',
        registration_date: '',
        company_name: '',
        legal_representative: '',
        legal_representative_cif_number: '',
        business_sector: '',
        spouse_id: undefined,
        spouse_info: {},
      });
    }
  }, [customer, isOpen]);

  // Update form data handler
  const handleFormDataChange = (newData: Partial<CustomerFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Date change handler
  const handleFormDateChange = (field: 'date_of_birth' | 'id_issue_date' | 'registration_date', e: React.ChangeEvent<HTMLInputElement>) => {
    handleDateChange(field, e.target.value, handleFormDataChange);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date formats
    if (formData.date_of_birth && !validateDateFormat(formData.date_of_birth)) {
      alert('Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy');
      return;
    }

    if (formData.id_issue_date && !validateDateFormat(formData.id_issue_date)) {
      alert('Định dạng ngày cấp CCCD không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy');
      return;
    }

    if (formData.registration_date && !validateDateFormat(formData.registration_date)) {
      alert('Định dạng ngày đăng ký không hợp lệ. Vui lòng sử dụng định dạng dd/mm/yyyy');
      return;
    }

    let numerologyData = null;
    if (formData.numerology_data && Object.keys(formData.numerology_data).length > 0) {
      numerologyData = formData.numerology_data;
    }

    // Only include fields that exist in the Customer table
    const {
      spouse_id,
      spouse_info,
      relationship_other,
      ...customerData
    } = formData;

    // Handle relationship data
    let relationshipValue = null;
    if (formData.spouse_id) {
      const spouse = customers.find(c => c.customer_id === formData.spouse_id);
      if (spouse) {
        relationshipValue = JSON.stringify({
          customer_id: spouse.customer_id,
          full_name: spouse.full_name,
          date_of_birth: spouse.date_of_birth,
          gender: spouse.gender,
          id_number: spouse.id_number,
          id_issue_date: spouse.id_issue_date,
          id_issue_authority: spouse.id_issue_authority,
          phone: spouse.phone,
          address: spouse.address,
          cif_number: spouse.cif_number,
        });
      }
    } else if (formData.relationship === 'Khác') {
      relationshipValue = formData.relationship_other || 'Khác';
    } else {
      relationshipValue = formData.relationship || null;
    }

    onSubmit({
      ...customerData,
      date_of_birth: formData.date_of_birth ? formatDateForSubmission(formData.date_of_birth) : null,
      id_issue_date: formData.id_issue_date ? formatDateForSubmission(formData.id_issue_date) : null,
      registration_date: formData.registration_date ? formatDateForSubmission(formData.registration_date) : null,
      gender: formData.gender || null,
      id_number: formData.id_number || null,
      id_issue_authority: formData.id_issue_authority || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      hobby: formData.hobby || null,
      cif_number: formData.cif_number || null,
      numerology_data: numerologyData,
      relationship: relationshipValue,
      business_registration_number: formData.business_registration_number || null,
      business_registration_authority: formData.business_registration_authority || null,
      company_name: formData.company_name || null,
      legal_representative: formData.legal_representative || null,
      business_sector: formData.business_sector || null,
    });
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
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
          {customer ? 'Sửa Khách Hàng' : 'Tạo Khách Hàng Mới'}
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
          {/* QR Scanner Section */}
          <CustomerQRScannerSection 
            formData={formData} 
            onChange={handleFormDataChange} 
          />

          {/* Basic Information Section */}
          <CustomerBasicInfoSection 
            formData={formData} 
            onChange={handleFormDataChange} 
          />

          {/* Business Information Section (for corporate customers) */}
          <CustomerBusinessSection 
            formData={formData} 
            onChange={handleFormDataChange}
            onDateChange={handleFormDateChange}
            validateDateFormat={validateDateFormat}
          />

          {/* Account Information Section */}
          <CustomerAccountSection 
            formData={formData} 
            onChange={handleFormDataChange} 
          />

          {/* Contact Information Section */}
          <CustomerContactSection 
            formData={formData} 
            onChange={handleFormDataChange} 
          />

          {/* Personal Information Section */}
          <CustomerPersonalInfoSection 
            formData={formData} 
            onChange={handleFormDataChange}
            onDateChange={handleFormDateChange}
            validateDateFormat={validateDateFormat}
          />

          {/* Numerology Section */}
          <CustomerNumerologySection 
            formData={formData} 
            onChange={handleFormDataChange} 
          />

          {/* Relationship Section */}
          <CustomerRelationshipSection 
            formData={formData} 
            onChange={handleFormDataChange}
            customers={customers}
            customer={customer}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Hủy
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
        >
          {customer ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}