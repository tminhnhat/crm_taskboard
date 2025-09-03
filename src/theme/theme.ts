'use client';
import { createTheme, Theme } from '@mui/material/styles';

// Modern Mantis-style color palette
const colors = {
  // Primary palette - Modern blues
  primary: '#1976d2',
  primaryLight: '#42a5f5',
  primaryDark: '#1565c0',
  
  // Secondary palette - Modern teal
  secondary: '#00acc1',
  secondaryLight: '#4dd0e1',
  secondaryDark: '#0097a7',
  
  // Background colors
  background: '#fafafa',
  paper: '#ffffff',
  surface: '#f5f5f5',
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#bdbdbd',
  
  // Border and divider
  divider: '#e0e0e0',
  border: '#eeeeee'
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
          borderRadius: 12,
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${colors.border}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14)',
          '&:hover': {
            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
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
      light: '#90caf9',
      dark: colors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondaryLight,
      light: '#80deea',
      dark: colors.secondaryDark,
      contrastText: '#ffffff',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffcc02',
      dark: '#f57c00',
    },
    error: {
      main: '#ef5350',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    surface: '#2a2a2a',
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1e1e1e',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.28), 0px 1px 10px 0px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.4), 0px 8px 10px 1px rgba(0,0,0,0.28), 0px 3px 14px 2px rgba(0,0,0,0.24)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.28)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.28)',
          '&:hover': {
            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.4), 0px 8px 10px 1px rgba(0,0,0,0.28)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primaryLight,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primaryLight,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.4), 0px 24px 38px 3px rgba(0,0,0,0.28), 0px 9px 46px 8px rgba(0,0,0,0.24)',
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