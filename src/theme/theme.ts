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