'use client';

// Utility functions for generating theme-based gradients and colors

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

/**
 * Generates a primary gradient based on current theme colors
 * Replaces hardcoded gradients like 'linear-gradient(135deg, #344767 0%, #3867d6 100%)'
 */
export const getThemePrimaryGradient = (
  themeSettings: ThemeSettings | null, 
  isDark: boolean = false
): string => {
  if (!themeSettings) {
    // Fallback to default colors
    return isDark 
      ? 'linear-gradient(135deg, #5a6c7d 0%, #344767 100%)'
      : 'linear-gradient(135deg, #344767 0%, #3867d6 100%)';
  }

  const colors = isDark ? themeSettings.darkColors : themeSettings.lightColors;
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`;
};

/**
 * Generates a secondary gradient based on current theme colors
 * Used for secondary elements and accents
 */
export const getThemeSecondaryGradient = (
  themeSettings: ThemeSettings | null, 
  isDark: boolean = false
): string => {
  if (!themeSettings) {
    // Fallback to default colors
    return isDark 
      ? 'linear-gradient(135deg, #9ca3af 0%, #7b809a 100%)'
      : 'linear-gradient(135deg, #3867d6 0%, #8854d0 100%)';
  }

  const colors = isDark ? themeSettings.darkColors : themeSettings.lightColors;
  return `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.secondary} 100%)`;
};

/**
 * Generates a text gradient for headings and titles
 * Replaces text gradient styles
 */
export const getThemeTextGradient = (
  themeSettings: ThemeSettings | null, 
  isDark: boolean = false
): string => {
  return getThemePrimaryGradient(themeSettings, isDark);
};

/**
 * Generates theme-aware status gradients for different states
 */
export const getThemeStatusGradient = (
  status: 'success' | 'warning' | 'error' | 'info',
  themeSettings: ThemeSettings | null, 
  isDark: boolean = false
): string => {
  if (!themeSettings) {
    // Fallback gradients
    const fallbacks = {
      success: 'linear-gradient(135deg, #82d616 0%, #a8e6cf 100%)',
      warning: 'linear-gradient(135deg, #fb8500 0%, #ffb347 100%)',
      error: 'linear-gradient(135deg, #ea0606 0%, #ff6b6b 100%)',
      info: 'linear-gradient(135deg, #49a3f1 0%, #5dade2 100%)'
    };
    return fallbacks[status];
  }

  const colors = isDark ? themeSettings.darkColors : themeSettings.lightColors;
  const baseColor = colors[status];
  
  // Generate a lighter variant for the gradient end
  const lighterColor = adjustColorBrightness(baseColor, 20);
  
  return `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`;
};

/**
 * Utility function to adjust color brightness
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16)
    .slice(1)}`;
}

/**
 * Gets the current theme colors for direct access
 */
export const getCurrentThemeColors = (
  themeSettings: ThemeSettings | null, 
  isDark: boolean = false
): CustomColors => {
  if (!themeSettings) {
    // Return default colors
    return isDark ? {
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
    } : {
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
  }

  return isDark ? themeSettings.darkColors : themeSettings.lightColors;
};