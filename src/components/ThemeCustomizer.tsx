'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  SaveAlt as SaveIcon,
  GetApp as ImportIcon,
  Publish as ExportIcon,
} from '@mui/icons-material';
import { useTheme } from '@/theme/ThemeProvider';

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

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export default function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { darkMode, updateThemeSettings, themeSettings } = useTheme();
  const [lightColors, setLightColors] = useState<CustomColors>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<CustomColors>(defaultDarkColors);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  // Load current theme settings
  useEffect(() => {
    if (themeSettings) {
      setLightColors(themeSettings.lightColors);
      setDarkColors(themeSettings.darkColors);
    }
  }, [themeSettings]);

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

  const handleSaveTheme = () => {
    const settings: ThemeSettings = { lightColors, darkColors };
    updateThemeSettings(settings);
    alert('Cài đặt theme đã được lưu!');
  };

  const handleResetTheme = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    const defaultSettings: ThemeSettings = {
      lightColors: defaultLightColors,
      darkColors: defaultDarkColors,
    };
    updateThemeSettings(defaultSettings);
    localStorage.removeItem('customThemeSettings');
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

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings: ThemeSettings = JSON.parse(e.target?.result as string);
          setLightColors(settings.lightColors);
          setDarkColors(settings.darkColors);
          updateThemeSettings(settings);
          alert('Theme đã được import thành công!');
        } catch (error) {
          alert('Lỗi khi import theme file!');
        }
      };
      reader.readAsText(file);
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
        <Grid item xs={6}>
          <Typography variant="body2">{label}</Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            type="color"
            value={colors[colorKey]}
            onChange={(e) => handleColorChange(mode, colorKey, e.target.value)}
            size="small"
            sx={{ '& .MuiInputBase-input': { padding: '4px', width: '50px', height: '30px' } }}
          />
        </Grid>
        <Grid item xs={2}>
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
            <Grid item xs={12}>
              <ColorInput label="Màu chính" colorKey="primary" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Màu chính nhạt" colorKey="primaryLight" mode={mode} />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ColorInput label="Màu phụ" colorKey="secondary" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Màu phụ nhạt" colorKey="secondaryLight" mode={mode} />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ColorInput label="Nền chính" colorKey="background" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Nền card/paper" colorKey="paper" mode={mode} />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ColorInput label="Thành công" colorKey="success" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Cảnh báo" colorKey="warning" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Lỗi" colorKey="error" mode={mode} />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ColorInput label="Chữ chính" colorKey="textPrimary" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Chữ phụ" colorKey="textSecondary" mode={mode} />
            </Grid>
            <Grid item xs={12}>
              <ColorInput label="Đường viền" colorKey="divider" mode={mode} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PaletteIcon />
            <Typography variant="h6">Tùy Chỉnh Theme</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ padding: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Tùy chỉnh màu sắc cho toàn bộ ứng dụng CRM. Thay đổi sẽ được áp dụng ngay lập tức và lưu tự động.
        </Alert>

        <Box mb={3}>
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

        <Divider sx={{ my: 2 }} />

        {/* Preview current colors */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Xem Trước Màu Sắc</Typography>
          <Grid container spacing={1}>
            {Object.entries(previewMode === 'light' ? lightColors : darkColors).map(([key, color]) => (
              <Grid item key={key}>
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

        <Divider sx={{ my: 2 }} />

        {/* Color customization */}
        <ColorSection mode="light" />
        <Box mt={3}>
          <ColorSection mode="dark" />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <input
          type="file"
          accept=".json"
          onChange={handleImportTheme}
          style={{ display: 'none' }}
          id="import-theme-input"
        />
        <label htmlFor="import-theme-input">
          <Button variant="outlined" component="span" startIcon={<ImportIcon />}>
            Import
          </Button>
        </label>
        
        <Button
          variant="outlined"
          onClick={handleExportTheme}
          startIcon={<ExportIcon />}
        >
          Export
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleResetTheme}
          startIcon={<ResetIcon />}
          color="warning"
        >
          Reset
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSaveTheme}
          startIcon={<SaveIcon />}
        >
          Lưu Theme
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Floating Action Button for opening theme customizer
export function ThemeCustomizerFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="primary"
        aria-label="theme customizer"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setOpen(true)}
      >
        <PaletteIcon />
      </Fab>
      <ThemeCustomizer
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}