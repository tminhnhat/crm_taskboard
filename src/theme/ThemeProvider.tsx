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

    // Load saved theme settings
    const savedTheme = localStorage.getItem('customThemeSettings');
    if (savedTheme) {
      try {
        const settings: ThemeSettings = JSON.parse(savedTheme);
        setThemeSettings(settings);
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }

    // Load saved dark mode preference
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

  const updateThemeSettings = (settings: ThemeSettings) => {
    setThemeSettings(settings);
    localStorage.setItem('customThemeSettings', JSON.stringify(settings));
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