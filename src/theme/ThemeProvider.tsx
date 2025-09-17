'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme, glassTheme, glassDarkTheme, createCustomTheme } from './theme';

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

type ThemeMode = 'normal' | 'glass';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  updateThemeSettings: (settings: ThemeSettings) => void;
  themeSettings: ThemeSettings | null;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  themeMode: 'normal',
  setThemeMode: () => {},
  updateThemeSettings: () => {},
  themeSettings: null,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Glass theme global styles for enhanced effects
const glassGlobalStyles = (
  <GlobalStyles
    styles={{
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
      },
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '10px',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.5)',
        },
      },
      body: {
        '&.glass-theme': {
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        },
        '&.glass-theme.light': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        '&.glass-theme.dark': {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        },
      },
      // Enhanced animations
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      '@keyframes glow': {
        '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
        '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)' },
      },
      '@keyframes shimmer': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      // Glass effect utilities
      '.glass': {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
      },
      '.glass-hover': {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
      },
    }}
  />
);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('normal');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);

  // Auto-detect system theme preference and load saved settings
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    // Load saved theme mode
    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedThemeMode) {
      setThemeModeState(savedThemeMode);
    }

    // Load saved theme settings from Vercel Blob
    const loadThemeSettings = async () => {
      try {
        const response = await fetch('/api/theme');
        const data = await response.json();
        if (data.settings) {
          setThemeSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load theme settings from Vercel Blob:', error);
        // Fallback to localStorage for backwards compatibility
        const savedTheme = localStorage.getItem('customThemeSettings');
        if (savedTheme) {
          try {
            const settings: ThemeSettings = JSON.parse(savedTheme);
            setThemeSettings(settings);
            // Migrate to Vercel Blob
            updateThemeSettings(settings);
          } catch (error) {
            console.error('Failed to load theme settings from localStorage:', error);
          }
        }
      }
    };

    loadThemeSettings();

    // Load saved dark mode preference (keep in localStorage for quick access)
    const savedDarkMode = localStorage.getItem('darkModePreference');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkModePreference') === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update body class when theme mode changes
  useEffect(() => {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('glass-theme', 'light', 'dark');
    
    // Add new theme classes
    if (themeMode === 'glass') {
      body.classList.add('glass-theme');
      body.classList.add(darkMode ? 'dark' : 'light');
    }
  }, [themeMode, darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkModePreference', JSON.stringify(newDarkMode));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  };

  const updateThemeSettings = async (settings: ThemeSettings) => {
    setThemeSettings(settings);
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme settings');
      }
      
      // Also save to localStorage as backup for quick loading
      localStorage.setItem('customThemeSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving theme settings to Vercel Blob:', error);
      // Fallback to localStorage only
      localStorage.setItem('customThemeSettings', JSON.stringify(settings));
    }
  };

  // Create theme based on custom settings or use default/glass theme
  const getTheme = () => {
    if (themeSettings) {
      return createCustomTheme(darkMode ? themeSettings.darkColors : themeSettings.lightColors, darkMode);
    }
    
    if (themeMode === 'glass') {
      return darkMode ? glassDarkTheme : glassTheme;
    }
    
    return darkMode ? darkTheme : lightTheme;
  };

  const theme = getTheme();

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode,
      themeMode,
      setThemeMode,
      updateThemeSettings,
      themeSettings 
    }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {themeMode === 'glass' && glassGlobalStyles}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}