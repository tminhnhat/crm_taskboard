'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  RestartAlt as ResetIcon,
  SaveAlt as SaveIcon,
  GetApp as ImportIcon,
  Publish as ExportIcon,
  Settings as SettingsIcon,
  BrightnessMedium as BrightnessIcon,
  ColorLens as ColorLensIcon,
  Diamond as DiamondIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTheme } from '@/theme/ThemeProvider';
import Navigation from '@/components/Navigation';
import { getThemePrimaryGradient } from '@/lib/themeUtils';
import { useKPIWeights } from '@/hooks/useKPIWeights';
import { percentageToWeight, weightToPercentage, resetKPIWeights } from '@/lib/kpiWeights';

interface CustomColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  paper: string;
  surface: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
}

interface ThemeSettings {
  lightColors: CustomColors;
  darkColors: CustomColors;
}

const defaultLightColors: CustomColors = {
  primary: '#344767',
  primaryLight: '#5a6c7d',
  primaryDark: '#1a202c',
  secondary: '#7b809a',
  secondaryLight: '#9ca3af',
  secondaryDark: '#374151',
  background: '#f8fafc',
  paper: '#ffffff',
  surface: '#f1f5f9',
  success: '#82d616',
  warning: '#fb8500',
  error: '#ea0606',
  info: '#49a3f1',
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  divider: '#e2e8f0',
};

const defaultDarkColors: CustomColors = {
  primary: '#5a6c7d',
  primaryLight: '#5a6c7d',
  primaryDark: '#1a202c',
  secondary: '#9ca3af',
  secondaryLight: '#9ca3af',
  secondaryDark: '#374151',
  background: '#1a202c',
  paper: '#2d3748',
  surface: '#374151',
  success: '#82d616',
  warning: '#fb8500',
  error: '#ea0606',
  info: '#49a3f1',
  textPrimary: '#f7fafc',
  textSecondary: '#a0aec0',
  divider: 'rgba(255, 255, 255, 0.1)',
};

// Bright theme presets
const brightThemePresets = [
  {
    name: 'Vibrant Ocean',
    description: 'Màu xanh dương tươi sáng và năng động',
    file: 'vibrant-ocean.json',
    preview: '#0ea5e9'
  },
  {
    name: 'Fresh Spring',
    description: 'Màu xanh lá tươi mới và tự nhiên',
    file: 'fresh-spring.json',
    preview: '#22c55e'
  },
  {
    name: 'Sunset Glow',
    description: 'Màu cam ấm áp và rực rỡ',
    file: 'sunset-glow.json',
    preview: '#f97316'
  },
  {
    name: 'Modern Purple',
    description: 'Màu tím hiện đại và sang trọng',
    file: 'modern-purple.json',
    preview: '#a855f7'
  },
  {
    name: 'Electric Blue',
    description: 'Màu xanh điện tử và sống động',
    file: 'electric-blue.json',
    preview: '#3b82f6'
  }
];

// Luxury theme presets
const luxuryThemePresets = [
  {
    name: 'Royal Burgundy',
    description: 'Đỏ burgundy hoàng gia với điểm nhấn vàng sang trọng',
    file: 'royal-burgundy.json',
    preview: '#8B1538'
  },
  {
    name: 'Elegant Gold',
    description: 'Vàng thanh lịch với tông nâu ấm áp và tinh tế',
    file: 'elegant-gold.json',
    preview: '#D4AF37'
  },
  {
    name: 'Midnight Navy',
    description: 'Xanh navy đậm với điểm nhấn bạc sang trọng',
    file: 'midnight-navy.json',
    preview: '#1B263B'
  },
  {
    name: 'Emerald Luxury',
    description: 'Xanh ngọc lục bảo với chi tiết vàng quý phái',
    file: 'emerald-luxury.json',
    preview: '#064E3B'
  },
  {
    name: 'Platinum Elite',
    description: 'Bạch kim tinh tế với xanh dương nhẹ nhàng',
    file: 'platinum-elite.json',
    preview: '#71717A'
  }
];

export default function SettingsPage() {
  const { darkMode, updateThemeSettings, themeSettings } = useTheme();
  const [lightColors, setLightColors] = useState<CustomColors>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<CustomColors>(defaultDarkColors);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  
  // KPI Weights management
  const { weights: kpiWeights, updateWeights: updateKPIWeights } = useKPIWeights();
  const [lendingWeight, setLendingWeight] = useState(weightToPercentage(kpiWeights.lending));
  const [mobilizationWeight, setMobilizationWeight] = useState(weightToPercentage(kpiWeights.mobilization));
  const [feesWeight, setFeesWeight] = useState(weightToPercentage(kpiWeights.fees));
  const [kpiWeightsError, setKpiWeightsError] = useState<string | null>(null);

  // Load current theme settings
  useEffect(() => {
    if (themeSettings) {
      setLightColors(themeSettings.lightColors);
      setDarkColors(themeSettings.darkColors);
    }
  }, [themeSettings]);
  
  // Update local state when KPI weights change
  useEffect(() => {
    setLendingWeight(weightToPercentage(kpiWeights.lending));
    setMobilizationWeight(weightToPercentage(kpiWeights.mobilization));
    setFeesWeight(weightToPercentage(kpiWeights.fees));
  }, [kpiWeights]);

  const handleColorChange = (mode: 'light' | 'dark', colorKey: keyof CustomColors, value: string) => {
    if (mode === 'light') {
      const newColors = { ...lightColors, [colorKey]: value };
      setLightColors(newColors);
      updateThemeSettings({ lightColors: newColors, darkColors });
    } else {
      const newColors = { ...darkColors, [colorKey]: value };
      setDarkColors(newColors);
      updateThemeSettings({ lightColors, darkColors: newColors });
    }
  };

  const handleSaveTheme = async () => {
    const settings: ThemeSettings = { lightColors, darkColors };
    setLoading(true);
    try {
      await updateThemeSettings(settings);
      alert('Cài đặt theme đã được lưu thành công trên Vercel Blob!');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Lỗi khi lưu cài đặt theme!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetTheme = async () => {
    setLoading(true);
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    const defaultSettings: ThemeSettings = {
      lightColors: defaultLightColors,
      darkColors: defaultDarkColors,
    };
    
    try {
      // Delete theme settings from Vercel Blob
      await fetch('/api/theme', { method: 'DELETE' });
      // Also remove from localStorage backup
      localStorage.removeItem('customThemeSettings');
      
      // Apply default theme
      await updateThemeSettings(defaultSettings);
      alert('Theme đã được reset về mặc định trên Vercel Blob!');
    } catch (error) {
      console.error('Error resetting theme:', error);
      // Fallback to local reset
      localStorage.removeItem('customThemeSettings');
      await updateThemeSettings(defaultSettings);
      alert('Theme đã được reset về mặc định (local fallback)!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTheme = () => {
    const settings: ThemeSettings = { lightColors, darkColors };
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'theme-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportPreset = async (presetFile: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/theme-presets/${presetFile}`);
      const settings: ThemeSettings = await response.json();
      setLightColors(settings.lightColors);
      setDarkColors(settings.darkColors);
      await updateThemeSettings(settings);
      alert(`Theme "${presetFile.replace('.json', '')}" đã được áp dụng thành công!`);
    } catch (error) {
      console.error('Error importing preset theme:', error);
      alert('Lỗi khi import preset theme!');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const settings: ThemeSettings = JSON.parse(e.target?.result as string);
          setLightColors(settings.lightColors);
          setDarkColors(settings.darkColors);
          await updateThemeSettings(settings);
          alert('Theme đã được import thành công vào Vercel Blob!');
        } catch (error) {
          console.error('Error importing theme:', error);
          alert('Lỗi khi import theme file!');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };
  
  // KPI Weights handlers
  const handleKPIWeightChange = (type: 'lending' | 'mobilization' | 'fees', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'lending') {
      setLendingWeight(numValue);
    } else if (type === 'mobilization') {
      setMobilizationWeight(numValue);
    } else {
      setFeesWeight(numValue);
    }
    
    // Clear error when user makes changes
    setKpiWeightsError(null);
  };
  
  const handleSaveKPIWeights = () => {
    const total = lendingWeight + mobilizationWeight + feesWeight;
    
    if (Math.abs(total - 100) > 0.1) {
      setKpiWeightsError(`Tổng trọng số phải bằng 100%. Hiện tại: ${total.toFixed(1)}%`);
      return;
    }
    
    const success = updateKPIWeights({
      lending: percentageToWeight(lendingWeight),
      mobilization: percentageToWeight(mobilizationWeight),
      fees: percentageToWeight(feesWeight)
    });
    
    if (success) {
      setKpiWeightsError(null);
      alert('Đã lưu trọng số KPI thành công!');
    } else {
      setKpiWeightsError('Lỗi khi lưu trọng số KPI');
    }
  };
  
  const handleResetKPIWeights = () => {
    if (confirm('Bạn có chắc chắn muốn reset trọng số KPI về mặc định (40%-40%-20%)?')) {
      resetKPIWeights();
      setLendingWeight(40);
      setMobilizationWeight(40);
      setFeesWeight(20);
      setKpiWeightsError(null);
      alert('Đã reset trọng số KPI về mặc định!');
    }
  };

  const ColorInput = ({ 
    label, 
    colorKey, 
    mode 
  }: { 
    label: string; 
    colorKey: keyof CustomColors; 
    mode: 'light' | 'dark' 
  }) => {
    const colors = mode === 'light' ? lightColors : darkColors;
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid size={6}>
          <Typography variant="body2">{label}</Typography>
        </Grid>
        <Grid size={4}>
          <TextField
            type="color"
            value={colors[colorKey]}
            onChange={(e) => handleColorChange(mode, colorKey, e.target.value)}
            size="small"
            sx={{ '& .MuiInputBase-input': { padding: '4px', width: '50px', height: '30px' } }}
          />
        </Grid>
        <Grid size={2}>
          <Box
            sx={{
              width: 30,
              height: 30,
              backgroundColor: colors[colorKey],
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        </Grid>
      </Grid>
    );
  };

  const ColorSection = ({ mode }: { mode: 'light' | 'dark' }) => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {mode === 'light' ? 'Chế độ sáng (Light Mode)' : 'Chế độ tối (Dark Mode)'}
      </Typography>
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Màu chính (Primary Colors)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ColorInput label="Màu chính" colorKey="primary" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Màu chính nhạt" colorKey="primaryLight" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Màu chính đậm" colorKey="primaryDark" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Màu phụ (Secondary Colors)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ColorInput label="Màu phụ" colorKey="secondary" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Màu phụ nhạt" colorKey="secondaryLight" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Màu phụ đậm" colorKey="secondaryDark" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Màu nền (Background)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ColorInput label="Nền chính" colorKey="background" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Nền card/paper" colorKey="paper" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Nền surface" colorKey="surface" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Màu trạng thái (Status Colors)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ColorInput label="Thành công" colorKey="success" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Cảnh báo" colorKey="warning" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Lỗi" colorKey="error" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Thông tin" colorKey="info" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Màu chữ (Text Colors)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ColorInput label="Chữ chính" colorKey="textPrimary" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Chữ phụ" colorKey="textSecondary" mode={mode} />
            </Grid>
            <Grid size={12}>
              <ColorInput label="Đường viền" colorKey="divider" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      
      {/* Header Section */}
      <Box
        sx={{
          background: getThemePrimaryGradient(themeSettings, darkMode),
          color: 'white',
          py: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                <SettingsIcon sx={{ fontSize: 40 }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                  Cài Đặt
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Tùy chỉnh giao diện và màu sắc của hệ thống CRM
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Theme Customization Section */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <PaletteIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Tùy Chỉnh Theme
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Tùy chỉnh màu sắc cho toàn bộ ứng dụng CRM. Thay đổi sẽ được áp dụng ngay lập tức và lưu tự động trên Vercel Blob Storage để đảm bảo tính toàn cầu và persistence trong môi trường serverless.
            </Alert>

            {/* Bright Theme Presets Section */}
            <Card elevation={1} sx={{ mb: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <BrightnessIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Theme Tươi Sáng Có Sẵn
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Chọn một trong các theme tươi sáng và năng động có sẵn để làm mới giao diện:
                </Typography>

                <Grid container spacing={2}>
                  {brightThemePresets.map((preset) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={preset.file}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '2px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: preset.preview,
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => handleImportPreset(preset.file)}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: preset.preview,
                              border: '2px solid white',
                              boxShadow: 1,
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {preset.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {preset.description}
                        </Typography>
                        <Box mt={1} display="flex" justifyContent="center">
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<ColorLensIcon />}
                            disabled={loading}
                            sx={{ borderColor: preset.preview, color: preset.preview }}
                          >
                            Áp dụng
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Luxury Theme Presets Section */}
            <Card elevation={1} sx={{ mb: 4, backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <DiamondIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Theme Sang Trọng Cao Cấp
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Lựa chọn các theme sang trọng và tinh tế cho doanh nghiệp cao cấp:
                </Typography>

                <Grid container spacing={2}>
                  {luxuryThemePresets.map((preset) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={preset.file}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2.5,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '2px solid transparent',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: preset.preview,
                            boxShadow: `0 10px 25px -5px ${preset.preview}20, 0 10px 10px -5px ${preset.preview}10`,
                          },
                        }}
                        onClick={() => handleImportPreset(preset.file)}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${preset.preview} 0%, ${preset.preview}80 100%)`,
                              border: '2px solid white',
                              boxShadow: `0 4px 8px ${preset.preview}30`,
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {preset.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                          {preset.description}
                        </Typography>
                        <Box mt={1.5} display="flex" justifyContent="center">
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<DiamondIcon />}
                            disabled={loading}
                            sx={{ 
                              borderColor: preset.preview, 
                              color: preset.preview,
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: `${preset.preview}10`,
                                borderColor: preset.preview,
                              }
                            }}
                          >
                            Áp dụng
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {loading && (
              <Alert severity="warning" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                Đang xử lý cài đặt theme trên Vercel Blob...
              </Alert>
            )}

            {/* Preview Mode Toggle */}
            <Box mb={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={previewMode === 'dark'}
                    onChange={(e) => setPreviewMode(e.target.checked ? 'dark' : 'light')}
                  />
                }
                label="Xem trước chế độ tối"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Preview current colors */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>Xem Trước Màu Sắc</Typography>
              <Grid container spacing={1}>
                {Object.entries(previewMode === 'light' ? lightColors : darkColors).map(([key, color]) => (
                  <Grid size="auto" key={key}>
                    <Chip
                      label={key}
                      sx={{
                        backgroundColor: color,
                        color: key.includes('text') ? color : 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Color customization */}
            <ColorSection mode="light" />
            <Box mt={4}>
              <ColorSection mode="dark" />
            </Box>

            {/* Action Buttons */}
            <Box mt={4} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                style={{ display: 'none' }}
                id="import-theme-input"
              />
              <label htmlFor="import-theme-input">
                <Button 
                  variant="outlined" 
                  component="span" 
                  startIcon={loading ? <CircularProgress size={20} /> : <ImportIcon />}
                  disabled={loading}
                >
                  {loading ? 'Importing...' : 'Import Theme'}
                </Button>
              </label>
              
              <Button
                variant="outlined"
                onClick={handleExportTheme}
                startIcon={<ExportIcon />}
              >
                Export Theme
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleResetTheme}
                startIcon={loading ? <CircularProgress size={20} /> : <ResetIcon />}
                color="warning"
                disabled={loading}
              >
                {loading ? 'Đang reset...' : 'Reset Theme'}
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSaveTheme}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                size="large"
              >
                {loading ? 'Đang lưu...' : 'Lưu Theme'}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* KPI Weights Configuration */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Cấu Hình Trọng Số KPI
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Điều chỉnh trọng số để tính điểm KPI từ các nguồn lợi nhuận. Tổng trọng số phải bằng 100%.
            </Alert>
            
            {kpiWeightsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {kpiWeightsError}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Lợi nhuận cho vay (%)"
                  type="number"
                  value={lendingWeight}
                  onChange={(e) => handleKPIWeightChange('lending', e.target.value)}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Trọng số cho lợi nhuận từ hoạt động cho vay"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Lợi nhuận huy động vốn (%)"
                  type="number"
                  value={mobilizationWeight}
                  onChange={(e) => handleKPIWeightChange('mobilization', e.target.value)}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Trọng số cho lợi nhuận từ huy động vốn"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Lợi nhuận phí (%)"
                  type="number"
                  value={feesWeight}
                  onChange={(e) => handleKPIWeightChange('fees', e.target.value)}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Trọng số cho lợi nhuận từ phí dịch vụ"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tổng trọng số: <strong>{(lendingWeight + mobilizationWeight + feesWeight).toFixed(1)}%</strong>
                {Math.abs(lendingWeight + mobilizationWeight + feesWeight - 100) < 0.1 && (
                  <Chip label="✓ Hợp lệ" color="success" size="small" sx={{ ml: 2 }} />
                )}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleResetKPIWeights}
                startIcon={<ResetIcon />}
                color="warning"
              >
                Reset về mặc định
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSaveKPIWeights}
                startIcon={<SaveIcon />}
                size="large"
              >
                Lưu Trọng Số KPI
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}