'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Paper,
} from '@mui/material';
import {
  AutoAwesome,
  Visibility,
  Speed,
  Security,
  Palette,
  Animation,
  TouchApp,
  TrendingUp,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '@/theme/ThemeProvider';
import EnhancedStatsCard from '@/components/EnhancedStatsCard';

const GlassThemeDemo = () => {
  const { themeMode, setThemeMode, darkMode } = useCustomTheme();

  const features = [
    {
      icon: <AutoAwesome />,
      title: 'Glassmorphism Design',
      description: 'Beautiful transparent glass effects with backdrop blur',
      color: 'primary' as const,
    },
    {
      icon: <Animation />,
      title: 'Smooth Animations',
      description: 'Fluid transitions and micro-interactions',
      color: 'secondary' as const,
    },
    {
      icon: <TouchApp />,
      title: 'Interactive Elements',
      description: 'Hover effects and responsive feedback',
      color: 'success' as const,
    },
    {
      icon: <Palette />,
      title: 'Dynamic Theming',
      description: 'Switch between normal and glass themes instantly',
      color: 'warning' as const,
    },
  ];

  const stats = [
    { title: 'Transparency', value: '85%', icon: <Visibility />, color: 'info' as const },
    { title: 'Performance', value: '98%', icon: <Speed />, color: 'success' as const },
    { title: 'Security', value: '100%', icon: <Security />, color: 'primary' as const },
    { title: 'User Experience', value: 'A+', icon: <TrendingUp />, color: 'warning' as const },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: themeMode === 'glass'
                ? 'linear-gradient(45deg, #667eea, #764ba2)'
                : 'linear-gradient(45deg, #344767, #3867d6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'glow-pulse 3s ease-in-out infinite alternate',
            }}
          >
            ✨ Glass Theme Experience
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Experience the beauty of glassmorphism with transparent elements, backdrop blur effects, and smooth animations.
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant={themeMode === 'glass' ? 'contained' : 'outlined'}
              onClick={() => setThemeMode('glass')}
              startIcon={<AutoAwesome />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                ...(themeMode === 'glass' && {
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                }),
              }}
            >
              Enable Glass Theme
            </Button>
            <Button
              variant={themeMode === 'normal' ? 'contained' : 'outlined'}
              onClick={() => setThemeMode('normal')}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
              }}
            >
              Normal Theme
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={6}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <EnhancedStatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={{
                  value: Math.floor(Math.random() * 20) + 5,
                  isPositive: Math.random() > 0.3,
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Feature Cards */}
        <Grid container spacing={3} mb={6}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    ...(themeMode === 'glass' && {
                      background: 'rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 12px 48px rgba(31, 38, 135, 0.5)',
                    }),
                  },
                  ...(themeMode === 'glass' && {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }),
                }}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${feature.color}.main`,
                      color: 'white',
                      mb: 2,
                      ...(themeMode === 'glass' && {
                        background: `rgba(${feature.color === 'primary' ? '52, 71, 103' : 
                          feature.color === 'secondary' ? '123, 128, 154' :
                          feature.color === 'success' ? '130, 214, 22' :
                          '251, 133, 0'}, 0.2)`,
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }),
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Interactive Demo */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            ...(themeMode === 'glass' && {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }),
          }}
        >
          <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
            Interactive Demo
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Try typing here"
                variant="outlined"
                placeholder="Experience glass theme input..."
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Another field"
                variant="outlined"
                placeholder="See the blur effects..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {['React', 'TypeScript', 'Material-UI', 'Glassmorphism'].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    variant="outlined"
                    sx={{
                      ...(themeMode === 'glass' && {
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }),
                    }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {themeMode === 'glass' 
                  ? '🎉 Glass theme is active! Notice the beautiful transparency and blur effects.'
                  : '💡 Switch to glass theme to see the magic happen!'
                }
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" mt={6}>
          <Typography variant="body2" color="text.secondary">
            Toggle between themes using the ✨ button in the navigation bar
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default GlassThemeDemo;