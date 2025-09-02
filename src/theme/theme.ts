'use client';
import { createTheme, Theme } from '@mui/material/styles';

// Define the color palette based on requirements
const colors = {
  navy: '#1A2A44',
  silver: '#C0C0C0',
  platinum: '#E5E4E2',
  white: '#FFFFFF',
  lightBlue: '#E3F2FD'
};

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.navy,
      light: '#2A3A54',
      dark: '#0A1A34',
      contrastText: colors.white,
    },
    secondary: {
      main: colors.silver,
      light: '#D0D0D0',
      dark: '#A0A0A0',
      contrastText: colors.navy,
    },
    background: {
      default: colors.white,
      paper: colors.white,
    },
    surface: colors.lightBlue,
    text: {
      primary: colors.navy,
      secondary: '#556B7A',
    },
  },
  typography: {
    fontFamily: '"Gilroy", "DejaVu Sans", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: colors.navy,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: colors.navy,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: colors.navy,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: colors.navy,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(26, 42, 68, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(26, 42, 68, 0.15)',
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
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(26, 42, 68, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 42, 68, 0.3)',
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
              borderColor: colors.navy,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.navy,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(26, 42, 68, 0.2)',
        },
      },
    },
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.lightBlue,
      light: '#F3F8FD',
      dark: '#D3E8FD',
      contrastText: colors.navy,
    },
    secondary: {
      main: colors.platinum,
      light: '#F5F4F2',
      dark: '#D5D4D2',
      contrastText: colors.navy,
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    surface: '#2A2A2A',
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1E1E1E',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
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
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(26, 42, 68, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 42, 68, 0.3)',
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
              borderColor: colors.lightBlue,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.lightBlue,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
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