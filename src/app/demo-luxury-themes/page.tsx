'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Diamond as DiamondIcon,
  ColorLens as ColorLensIcon,
} from '@mui/icons-material';
import Navigation from '@/components/Navigation';

// Luxury theme presets demo
const luxuryThemePresets = [
  {
    name: 'Royal Burgundy',
    description: 'Đỏ burgundy hoàng gia với điểm nhấn vàng sang trọng',
    file: 'royal-burgundy.json',
    preview: '#8B1538',
    accent: '#D4AF37'
  },
  {
    name: 'Elegant Gold',
    description: 'Vàng thanh lịch với tông nâu ấm áp và tinh tế',
    file: 'elegant-gold.json',
    preview: '#D4AF37',
    accent: '#8B4513'
  },
  {
    name: 'Midnight Navy',
    description: 'Xanh navy đậm với điểm nhấn bạc sang trọng',
    file: 'midnight-navy.json',
    preview: '#1B263B',
    accent: '#C0C0C0'
  },
  {
    name: 'Emerald Luxury',
    description: 'Xanh ngọc lục bảo với chi tiết vàng quý phái',
    file: 'emerald-luxury.json',
    preview: '#064E3B',
    accent: '#D4AF37'
  },
  {
    name: 'Platinum Elite',
    description: 'Bạch kim tinh tế với xanh dương nhẹ nhàng',
    file: 'platinum-elite.json',
    preview: '#71717A',
    accent: '#3B82F6'
  }
];

export default function LuxuryThemesDemo() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Navigation />
      
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d30 50%, #1a1a1a 100%)',
          color: 'white',
          py: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(212,175,55,0.1) 0%, rgba(139,21,56,0.1) 50%, rgba(113,113,122,0.1) 100%)',
            zIndex: 1,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box display="flex" alignItems="center" gap={3} mb={2}>
            <DiamondIcon sx={{ fontSize: 48, color: '#D4AF37' }} />
            <Typography variant="h3" sx={{ fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              Theme Sang Trọng Cao Cấp
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 800 }}>
            Bộ sưu tập các theme màu sắc sang trọng và tinh tế, được thiết kế đặc biệt cho doanh nghiệp cao cấp và professional workspace
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Features Description */}
        <Card elevation={0} sx={{ mb: 6, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1a1a1a' }}>
              🎨 Tính Năng Đã Thực Hiện
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#2d2d30' }}>
                  ✨ Chức Năng Chính:
                </Typography>
                <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
                  <li><strong>5 theme sang trọng mới</strong> - Đỏ burgundy, vàng elegant, navy đậm, xanh emerald, bạch kim</li>
                  <li><strong>Import files tự động</strong> - Áp dụng theme chỉ với 1 click</li>
                  <li><strong>Tích hợp settings page</strong> - Section riêng cho luxury themes</li>
                  <li><strong>Preview cards chuyên nghiệp</strong> - Hiệu ứng hover và gradient</li>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#2d2d30' }}>
                  🎯 Ưu Điểm:
                </Typography>
                <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
                  <li><strong>Màu sắc cao cấp</strong> - Phù hợp doanh nghiệp sang trọng</li>
                  <li><strong>Tương thích dark/light mode</strong> - Hoạt động hoàn hảo cả hai chế độ</li>
                  <li><strong>Vercel Blob integration</strong> - Lưu trữ và sync toàn cầu</li>
                  <li><strong>Professional design</strong> - Thiết kế tinh tế và modern</li>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Luxury Theme Presets */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Bộ Sưu Tập Theme Sang Trọng
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          Mỗi theme được thiết kế tỉ mỉ với bảng màu tinh tế, phù hợp cho các ứng dụng doanh nghiệp cao cấp và workspace chuyên nghiệp
        </Typography>

        <Grid container spacing={4}>
          {luxuryThemePresets.map((preset, index) => (
            <Grid item xs={12} sm={6} lg={4} key={preset.file}>
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  border: '2px solid transparent',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${preset.preview}08 0%, ${preset.accent}08 100%)`,
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    borderColor: preset.preview,
                    boxShadow: `0 20px 40px -8px ${preset.preview}40, 0 15px 25px -5px ${preset.preview}20`,
                    '&::before': {
                      background: `linear-gradient(135deg, ${preset.preview}15 0%, ${preset.accent}15 100%)`,
                    }
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Box display="flex" alignItems="center" gap={2.5} mb={2}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${preset.preview} 0%, ${preset.accent} 100%)`,
                        border: '3px solid white',
                        boxShadow: `0 6px 12px ${preset.preview}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DiamondIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {preset.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, minHeight: 48 }}>
                    {preset.description}
                  </Typography>
                  
                  {/* Color Palette Preview */}
                  <Box display="flex" gap={1} mb={3}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        backgroundColor: preset.preview,
                        border: '2px solid white',
                        boxShadow: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        backgroundColor: preset.accent,
                        border: '2px solid white',
                        boxShadow: 1,
                      }}
                    />
                  </Box>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<ColorLensIcon />}
                    fullWidth
                    sx={{ 
                      borderColor: preset.preview, 
                      color: preset.preview,
                      fontWeight: 'bold',
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        backgroundColor: `${preset.preview}15`,
                        borderColor: preset.preview,
                        borderWidth: 2,
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    Xem Trước Theme
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Instructions */}
        <Card elevation={2} sx={{ mt: 6, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1a1a1a' }}>
              📋 Hướng Dẫn Sử Dụng
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>1. Truy cập Settings Page:</strong> Vào menu "Cài Đặt" trong navigation
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>2. Tìm Section "Theme Sang Trọng Cao Cấp":</strong> Scroll xuống để thấy bộ luxury themes
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>3. Chọn Theme:</strong> Click vào card theme bạn muốn áp dụng
                </Typography>
                <Typography variant="body1">
                  <strong>4. Tự Động Import:</strong> Theme sẽ được áp dụng ngay lập tức và lưu trên Vercel Blob
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    backgroundColor: 'white', 
                    p: 3, 
                    borderRadius: 2, 
                    border: '1px solid #dee2e6',
                    textAlign: 'center' 
                  }}
                >
                  <DiamondIcon sx={{ fontSize: 48, color: '#D4AF37', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                    Premium Quality
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thiết kế cao cấp cho doanh nghiệp chuyên nghiệp
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}