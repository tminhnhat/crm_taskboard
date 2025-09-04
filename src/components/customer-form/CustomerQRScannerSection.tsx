import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import QRScanner from '../QRScanner';
import { CustomerFormSectionProps } from './types';

export default function CustomerQRScannerSection({ formData, onChange }: CustomerFormSectionProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleQRResult = (data: any) => {
    onChange({
      id_number: data.id_number || formData.id_number,
      id_issue_date: data.id_issue_date ?
        (data.id_issue_date.length === 8 ? `${data.id_issue_date.slice(0,2)}/${data.id_issue_date.slice(2,4)}/${data.id_issue_date.slice(4)}` : data.id_issue_date)
        : formData.id_issue_date,
      full_name: data.full_name || formData.full_name,
      date_of_birth: data.date_of_birth ?
        (data.date_of_birth.length === 8 ? `${data.date_of_birth.slice(0,2)}/${data.date_of_birth.slice(2,4)}/${data.date_of_birth.slice(4)}` : data.date_of_birth)
        : formData.date_of_birth,
      gender: data.gender && (data.gender.toLowerCase() === 'nam' ? 'male' : data.gender.toLowerCase() === 'nữ' ? 'female' : formData.gender),
      address: data.address || formData.address,
    });
    setShowQRScanner(false);
  };

  return (
    <>
      {/* QR Scanner Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<QrCodeScanner />}
          onClick={() => setShowQRScanner(true)}
          sx={{ 
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' }
          }}
        >
          Quét QR CCCD
        </Button>
      </Box>

      {/* QRScanner Modal */}
      <Dialog 
        open={showQRScanner} 
        onClose={() => setShowQRScanner(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Quét mã QR CCCD</Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <QRScanner onResult={handleQRResult} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRScanner(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}