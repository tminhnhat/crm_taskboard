'use client';
import { createTheme, Theme } from '@mui/material/styles';

// Creative Tim Otis Admin Pro inspired professional color palette
const colors = {
  // Primary palette - Professional navy/blue
  primary: '#344767',
  primaryLight: '#5a6c7d',
  primaryDark: '#1a202c',
  
  // Secondary palette - Clean gray/blue
  secondary: '#7b809a',
  secondaryLight: '#9ca3af',
  secondaryDark: '#374151',
  
  // Background colors - Clean whites and light grays
  background: '#f8fafc',
  paper: '#ffffff',
  surface: '#f1f5f9',
  
  // Status colors - Subtle and professional
  success: '#82d616',
  warning: '#fb8500',
  error: '#ea0606',
  info: '#49a3f1',
  
  // Creative Tim accent colors
  gradient1: '#ee5a24', // Orange-red
  gradient2: '#f368e0', // Pink
  gradient3: '#3867d6', // Blue
  gradient4: '#20bf6b', // Green
  gradient5: '#a55eea', // Purple
  
  // Text colors - Professional contrast
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  textDisabled: '#a0aec0',
  
  // Border and divider - Subtle
  divider: '#e2e8f0',
  border: '#f7fafc'
};

// Brighter alternative color palette for more vibrant UI
const brightColors = {
  // Primary palette - Vibrant ocean blue
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  primaryDark: '#0284c7',
  
  // Secondary palette - Fresh teal
  secondary: '#06b6d4',
  secondaryLight: '#67e8f9',
  secondaryDark: '#0891b2',
  
  // Background colors - Light and airy
  background: '#f0f9ff',
  paper: '#ffffff',
  surface: '#e0f2fe',
  
  // Status colors - Bright and clear
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Creative Tim accent colors - More vibrant
  gradient1: '#f97316', // Bright orange
  gradient2: '#ec4899', // Bright pink
  gradient3: '#3b82f6', // Electric blue
  gradient4: '#22c55e', // Fresh green
  gradient5: '#a855f7', // Modern purple
  
  // Text colors - High contrast
  textPrimary: '#0c4a6e',
  textSecondary: '#0369a1',
  textDisabled: '#64748b',
  
  // Border and divider - Soft but visible
  divider: '#bae6fd',
  border: '#e0f2fe'
};

// Export both color palettes for use
export { colors, brightColors };

// Glassmorphism/Transparent theme colors
const glassColors = {
  // Primary palette with transparency
  primary: 'rgba(52, 71, 103, 0.9)',
  primaryLight: 'rgba(90, 108, 125, 0.8)',
  primaryDark: 'rgba(26, 32, 44, 0.95)',
  
  // Secondary palette with transparency
  secondary: 'rgba(123, 128, 154, 0.8)',
  secondaryLight: 'rgba(156, 163, 175, 0.7)',
  secondaryDark: 'rgba(55, 65, 81, 0.9)',
  
  // Background colors with transparency
  background: 'rgba(248, 250, 252, 0.8)',
  paper: 'rgba(255, 255, 255, 0.15)',
  surface: 'rgba(241, 245, 249, 0.7)',
  
  // Status colors with transparency
  success: 'rgba(130, 214, 22, 0.9)',
  warning: 'rgba(251, 133, 0, 0.9)',
  error: 'rgba(234, 6, 6, 0.9)',
  info: 'rgba(73, 163, 241, 0.9)',
  
  // Glass-specific colors
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassWhiteMd: 'rgba(255, 255, 255, 0.2)',
  glassWhiteLg: 'rgba(255, 255, 255, 0.3)',
  glassBlack: 'rgba(0, 0, 0, 0.1)',
  glassBlackMd: 'rgba(0, 0, 0, 0.2)',
  glassBlackLg: 'rgba(0, 0, 0, 0.3)',
  
  // Text colors - with slight transparency for glass effect
  textPrimary: 'rgba(45, 55, 72, 0.95)',
  textSecondary: 'rgba(113, 128, 150, 0.9)',
  textDisabled: 'rgba(160, 174, 192, 0.8)',
  
  // Border and divider with transparency
  divider: 'rgba(226, 232, 240, 0.6)',
  border: 'rgba(247, 250, 252, 0.5)'
};

// Glass theme dark mode colors
const glassDarkColors = {
  // Primary palette with transparency for dark mode
  primary: 'rgba(14, 165, 233, 0.9)',
  primaryLight: 'rgba(56, 189, 248, 0.8)',
  primaryDark: 'rgba(2, 132, 199, 0.95)',
  
  // Secondary palette
  secondary: 'rgba(148, 163, 184, 0.8)',
  secondaryLight: 'rgba(203, 213, 225, 0.7)',
  secondaryDark: 'rgba(71, 85, 105, 0.9)',
  
  // Background colors for dark glass
  background: 'rgba(15, 23, 42, 0.8)',
  paper: 'rgba(30, 41, 59, 0.15)',
  surface: 'rgba(51, 65, 85, 0.7)',
  
  // Status colors
  success: 'rgba(34, 197, 94, 0.9)',
  warning: 'rgba(245, 158, 11, 0.9)',
  error: 'rgba(239, 68, 68, 0.9)',
  info: 'rgba(59, 130, 246, 0.9)',
  
  // Glass-specific dark colors
  glassWhite: 'rgba(255, 255, 255, 0.05)',
  glassWhiteMd: 'rgba(255, 255, 255, 0.1)',
  glassWhiteLg: 'rgba(255, 255, 255, 0.15)',
  glassBlack: 'rgba(0, 0, 0, 0.2)',
  glassBlackMd: 'rgba(0, 0, 0, 0.3)',
  glassBlackLg: 'rgba(0, 0, 0, 0.4)',
  
  // Text colors for dark mode
  textPrimary: 'rgba(248, 250, 252, 0.95)',
  textSecondary: 'rgba(203, 213, 225, 0.9)',
  textDisabled: 'rgba(148, 163, 184, 0.8)',
  
  // Borders for dark mode
  divider: 'rgba(71, 85, 105, 0.6)',
  border: 'rgba(30, 41, 59, 0.5)'
};

export { glassColors, glassDarkColors };

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success,
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: colors.warning,
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: colors.error,
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: colors.info,
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: colors.background,
      paper: colors.paper,
    },
    surface: colors.surface,
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.divider,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: colors.textPrimary,
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: colors.textPrimary,
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: colors.textPrimary,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: colors.textPrimary,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: colors.textPrimary,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: colors.textPrimary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 0px 1px rgba(0,0,0,0.05), 0px 0px 2px rgba(0,0,0,0.05), 0px 4px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.paper,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 0px 2px rgba(0,0,0,0.1), 0px 2px 8px rgba(0,0,0,0.1), 0px 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: colors.paper,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 4px 16px rgba(0,0,0,0.1), 0px 8px 24px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
        elevation2: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primaryLight,
      light: '#5a6c7d',
      dark: colors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondaryLight,
      light: '#9ca3af',
      dark: colors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: '#82d616',
      light: '#a8e6cf',
      dark: '#66bb6a',
    },
    warning: {
      main: '#fb8500',
      light: '#ffb347',
      dark: '#f57c00',
    },
    error: {
      main: '#ea0606',
      light: '#ff6b6b',
      dark: '#d32f2f',
    },
    info: {
      main: '#49a3f1',
      light: '#5dade2',
      dark: '#1976d2',
    },
    background: {
      default: '#1a202c',
      paper: '#2d3748',
    },
    surface: '#374151',
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#f7fafc', // Use dark mode text color
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#f7fafc', // Use dark mode text color
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#f7fafc', // Use dark mode text color
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#f7fafc', // Use dark mode text color
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#f7fafc', // Use dark mode text color
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#f7fafc', // Use dark mode text color
    },
    body1: {
      color: '#f7fafc', // Use dark mode text color
    },
    body2: {
      color: '#a0aec0', // Use dark mode secondary text color
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      color: '#f7fafc', // Use dark mode text color
    },
  },
  shape: lightTheme.shape,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#2d3748',
          boxShadow: '0px 0px 1px rgba(255,255,255,0.05), 0px 0px 2px rgba(255,255,255,0.05), 0px 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 0px 2px rgba(255,255,255,0.1), 0px 2px 8px rgba(255,255,255,0.1), 0px 8px 16px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#374151',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primaryLight,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primaryLight,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 4px 16px rgba(0,0,0,0.3), 0px 8px 24px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.28), 0px 1px 3px 0px rgba(0,0,0,0.24)',
        },
        elevation2: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.4), 0px 2px 2px 0px rgba(0,0,0,0.28), 0px 1px 5px 0px rgba(0,0,0,0.24)',
        },
      },
    },
  },
});

// Extend the theme interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: string;
  }

  interface PaletteOptions {
    surface?: string;
  }
}

// Interface for custom color settings
export interface CustomColors {
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

// Function to create custom theme with user-defined colors
export const createCustomTheme = (customColors: CustomColors, isDark: boolean): Theme => {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: customColors.primary,
        light: customColors.primaryLight,
        dark: customColors.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: customColors.secondary,
        light: customColors.secondaryLight,
        dark: customColors.secondaryDark,
        contrastText: '#ffffff',
      },
      success: {
        main: customColors.success,
        light: isDark ? '#a8e6cf' : '#81c784',
        dark: isDark ? '#66bb6a' : '#388e3c',
      },
      warning: {
        main: customColors.warning,
        light: isDark ? '#ffb347' : '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: customColors.error,
        light: isDark ? '#ff6b6b' : '#e57373',
        dark: '#d32f2f',
      },
      info: {
        main: customColors.info,
        light: isDark ? '#5dade2' : '#64b5f6',
        dark: '#1976d2',
      },
      background: {
        default: customColors.background,
        paper: customColors.paper,
      },
      surface: customColors.surface,
      text: {
        primary: customColors.textPrimary,
        secondary: customColors.textSecondary,
      },
      divider: customColors.divider,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        color: customColors.textPrimary,
      },
      h2: {
        fontWeight: 500,
        fontSize: '2rem',
        lineHeight: 1.3,
        color: customColors.textPrimary,
      },
      h3: {
        fontWeight: 500,
        fontSize: '1.75rem',
        lineHeight: 1.3,
        color: customColors.textPrimary,
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        color: customColors.textPrimary,
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        color: customColors.textPrimary,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
        color: customColors.textPrimary,
      },
      body1: {
        color: customColors.textPrimary,
      },
      body2: {
        color: customColors.textSecondary,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        color: customColors.textPrimary,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark 
              ? '0px 0px 1px rgba(255,255,255,0.05), 0px 0px 2px rgba(255,255,255,0.05), 0px 4px 8px rgba(0,0,0,0.2)'
              : '0px 0px 1px rgba(0,0,0,0.05), 0px 0px 2px rgba(0,0,0,0.05), 0px 4px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease-in-out',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : `1px solid ${customColors.divider}`,
            backgroundColor: customColors.paper,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0px 0px 2px rgba(255,255,255,0.1), 0px 2px 8px rgba(255,255,255,0.1), 0px 8px 16px rgba(0,0,0,0.3)'
                : '0px 0px 2px rgba(0,0,0,0.1), 0px 2px 8px rgba(0,0,0,0.1), 0px 8px 16px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDark ? '0px 4px 8px rgba(0,0,0,0.2)' : '0px 4px 8px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            boxShadow: isDark ? '0px 2px 4px rgba(0,0,0,0.2)' : '0px 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: isDark ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: customColors.paper,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: customColors.primary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: customColors.primary,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: isDark 
              ? '0px 4px 16px rgba(0,0,0,0.3), 0px 8px 24px rgba(0,0,0,0.2)'
              : '0px 4px 16px rgba(0,0,0,0.1), 0px 8px 24px rgba(0,0,0,0.1)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : `1px solid ${customColors.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark
              ? '0px 2px 1px -1px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.28), 0px 1px 3px 0px rgba(0,0,0,0.24)'
              : '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          },
          elevation2: {
            boxShadow: isDark
              ? '0px 3px 1px -2px rgba(0,0,0,0.4), 0px 2px 2px 0px rgba(0,0,0,0.28), 0px 1px 5px 0px rgba(0,0,0,0.24)'
              : '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  });
};

// Quick function to create bright theme
export const createBrightTheme = (isDark: boolean = false): Theme => {
  const colorPalette = brightColors;
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: colorPalette.primary,
        light: colorPalette.primaryLight,
        dark: colorPalette.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: colorPalette.secondary,
        light: colorPalette.secondaryLight,
        dark: colorPalette.secondaryDark,
        contrastText: '#ffffff',
      },
      success: {
        main: colorPalette.success,
        light: isDark ? '#34d399' : '#4ade80',
        dark: isDark ? '#10b981' : '#059669',
      },
      warning: {
        main: colorPalette.warning,
        light: isDark ? '#fbbf24' : '#fcd34d',
        dark: isDark ? '#d97706' : '#b45309',
      },
      error: {
        main: colorPalette.error,
        light: isDark ? '#f87171' : '#fca5a5',
        dark: isDark ? '#dc2626' : '#b91c1c',
      },
      info: {
        main: colorPalette.info,
        light: isDark ? '#60a5fa' : '#93c5fd',
        dark: isDark ? '#2563eb' : '#1d4ed8',
      },
      background: {
        default: isDark ? '#0c1629' : colorPalette.background,
        paper: isDark ? '#1e293b' : colorPalette.paper,
      },
      surface: isDark ? '#334155' : colorPalette.surface,
      text: {
        primary: isDark ? '#f1f5f9' : colorPalette.textPrimary,
        secondary: isDark ? '#cbd5e1' : colorPalette.textSecondary,
      },
      divider: isDark ? 'rgba(56, 189, 248, 0.2)' : colorPalette.divider,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
        color: isDark ? '#f1f5f9' : colorPalette.textPrimary,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark 
              ? '0px 0px 1px rgba(255,255,255,0.05), 0px 0px 2px rgba(255,255,255,0.05), 0px 4px 8px rgba(0,0,0,0.2)'
              : '0px 0px 1px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.06), 0px 8px 16px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease-in-out',
            border: isDark 
              ? '1px solid rgba(56, 189, 248, 0.1)'
              : `1px solid ${colorPalette.divider}`,
            backgroundColor: isDark ? '#1e293b' : colorPalette.paper,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0px 0px 2px rgba(255,255,255,0.1), 0px 4px 12px rgba(255,255,255,0.1), 0px 12px 24px rgba(0,0,0,0.3)'
                : '0px 0px 2px rgba(0,0,0,0.12), 0px 4px 12px rgba(0,0,0,0.1), 0px 12px 24px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '12px 28px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDark ? '0px 6px 12px rgba(0,0,0,0.3)' : '0px 6px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            boxShadow: isDark ? '0px 3px 6px rgba(0,0,0,0.25)' : '0px 3px 6px rgba(0,0,0,0.12)',
            '&:hover': {
              boxShadow: isDark ? '0px 8px 16px rgba(0,0,0,0.4)' : '0px 8px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark ? '#334155' : colorPalette.paper,
              transition: 'all 0.2s ease-in-out',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colorPalette.primary,
                borderWidth: 2,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorPalette.primary,
                borderWidth: 2,
                boxShadow: `0 0 0 3px ${colorPalette.primary}20`,
              },
            },
          },
        },
      },
    },
  });
};

// Glass/Transparent Theme
export const glassTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: glassColors.primary,
      light: glassColors.primaryLight,
      dark: glassColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: glassColors.secondary,
      light: glassColors.secondaryLight,
      dark: glassColors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: glassColors.success,
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: glassColors.warning,
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: glassColors.error,
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: glassColors.info,
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradient background
      paper: glassColors.paper,
    },
    text: {
      primary: glassColors.textPrimary,
      secondary: glassColors.textSecondary,
    },
    divider: glassColors.divider,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: glassColors.textPrimary,
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: glassColors.textPrimary,
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: glassColors.textPrimary,
      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: glassColors.textPrimary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: glassColors.textPrimary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: glassColors.textPrimary,
    },
    body1: {
      color: glassColors.textPrimary,
    },
    body2: {
      color: glassColors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            background: 'rgba(255, 255, 255, 0.25)',
            boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: glassColors.textPrimary,
          boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.3)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px 0 rgba(31, 38, 135, 0.4)',
          },
        },
        outlined: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            },
          },
          '& .MuiInputLabel-root': {
            color: glassColors.textSecondary,
          },
          '& .MuiOutlinedInput-input': {
            color: glassColors.textPrimary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Glass Dark Theme
export const glassDarkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: glassDarkColors.primary,
      light: glassDarkColors.primaryLight,
      dark: glassDarkColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: glassDarkColors.secondary,
      light: glassDarkColors.secondaryLight,
      dark: glassDarkColors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: glassDarkColors.success,
      light: '#4ade80',
      dark: '#15803d',
    },
    warning: {
      main: glassDarkColors.warning,
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: glassDarkColors.error,
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: glassDarkColors.info,
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Dark gradient background
      paper: glassDarkColors.paper,
    },
    text: {
      primary: glassDarkColors.textPrimary,
      secondary: glassDarkColors.textSecondary,
    },
    divider: glassDarkColors.divider,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: glassDarkColors.textPrimary,
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: glassDarkColors.textPrimary,
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: glassDarkColors.textPrimary,
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: glassDarkColors.textPrimary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: glassDarkColors.textPrimary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: glassDarkColors.textPrimary,
    },
    body1: {
      color: glassDarkColors.textPrimary,
    },
    body2: {
      color: glassDarkColors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(30, 41, 59, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            background: 'rgba(30, 41, 59, 0.25)',
            boxShadow: '0 12px 48px 0 rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: glassDarkColors.textPrimary,
          boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
          '&:hover': {
            background: 'rgba(30, 41, 59, 0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px 0 rgba(0, 0, 0, 0.5)',
          },
        },
        outlined: {
          background: 'rgba(30, 41, 59, 0.2)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'rgba(30, 41, 59, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              background: 'rgba(30, 41, 59, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            },
            '&.Mui-focused': {
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            },
          },
          '& .MuiInputLabel-root': {
            color: glassDarkColors.textSecondary,
          },
          '& .MuiOutlinedInput-input': {
            color: glassDarkColors.textPrimary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          background: 'rgba(30, 41, 59, 0.2)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 41, 59, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 41, 59, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(30, 41, 59, 0.4)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});