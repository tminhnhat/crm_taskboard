'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, createCustomTheme } from './theme';

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

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  updateThemeSettings: (settings: ThemeSettings) => void;
  themeSettings: ThemeSettings | null;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  updateThemeSettings: () => {},
  themeSettings: null,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);

  // Auto-detect system theme preference and load saved settings
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkModePreference', JSON.stringify(newDarkMode));
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

  // Create theme based on custom settings or use default
  const theme = themeSettings 
    ? createCustomTheme(darkMode ? themeSettings.darkColors : themeSettings.lightColors, darkMode)
    : (darkMode ? darkTheme : lightTheme);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      updateThemeSettings,
      themeSettings 
    }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}