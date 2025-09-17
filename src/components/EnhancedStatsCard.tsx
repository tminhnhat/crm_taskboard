'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { useTheme as useCustomTheme } from '@/theme/ThemeProvider';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  trend,
  onClick
}) => {
  const theme = useTheme();
  const { themeMode } = useCustomTheme();

  const getColorValue = (colorName: string) => {
    return theme.palette[colorName as keyof typeof theme.palette]?.main || theme.palette.primary.main;
  };

  const cardStyle = {
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': onClick ? {
      transform: 'translateY(-8px) scale(1.02)',
      ...(themeMode === 'glass' ? {
        background: 'rgba(255, 255, 255, 0.25)',
        boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
      } : {
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }),
    } : {},
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${getColorValue(color)}, ${getColorValue(color)}CC)`,
      ...(themeMode === 'glass' && {
        background: `linear-gradient(90deg, ${getColorValue(color)}CC, ${getColorValue(color)}99)`,
        boxShadow: `0 0 10px ${getColorValue(color)}50`,
      }),
    },
    ...(themeMode === 'glass' && {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
  };

  const iconStyle = {
    fontSize: '2.5rem',
    color: getColorValue(color),
    opacity: 0.9,
    transition: 'all 0.3s ease',
    ...(themeMode === 'glass' && {
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
    }),
  };

  return (
    <Card
      sx={cardStyle}
      onClick={onClick}
      className={themeMode === 'glass' ? 'animate-fade-in-up' : 'animate-scale-in'}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={iconStyle}>
            {icon}
          </Box>
          {trend && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: trend.isPositive ? 'success.main' : 'error.main',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                ...(themeMode === 'glass' && {
                  bgcolor: trend.isPositive ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                  backdropFilter: 'blur(5px)',
                }),
              }}
            >
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </Box>
          )}
        </Box>

        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            background: themeMode === 'glass' 
              ? `linear-gradient(45deg, ${getColorValue(color)}, ${getColorValue(color)}CC)`
              : getColorValue(color),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: themeMode === 'glass' ? 'transparent' : 'inherit',
            color: themeMode !== 'glass' ? getColorValue(color) : 'transparent',
            ...(themeMode === 'glass' && {
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }),
          }}
        >
          {value}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            opacity: 0.8,
            ...(themeMode === 'glass' && {
              color: 'rgba(255,255,255,0.9)',
            }),
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              mt: 0.5,
              display: 'block',
              ...(themeMode === 'glass' && {
                color: 'rgba(255,255,255,0.7)',
              }),
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Animated background effect for glass theme */}
        {themeMode === 'glass' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 20%, ${getColorValue(color)}10, transparent 50%)`,
              pointerEvents: 'none',
              zIndex: -1,
              animation: 'float 6s ease-in-out infinite',
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedStatsCard;