'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import Navigation from '@/components/Navigation';
import { TemplateManager } from '@/components/TemplateManager';

export default function TemplatesPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navigation />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản lý Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tải lên và quản lý các template tài liệu cho hệ thống
          </Typography>
        </Box>

        {/* Template Manager */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <TemplateManager />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}