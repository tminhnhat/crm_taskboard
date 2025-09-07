'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Assignment,
  People,
  Inventory,
  Person,
  Description,
  Home,
  Search,
  Folder,
  Settings
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '@/theme/ThemeProvider'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const { darkMode, toggleDarkMode } = useCustomTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const navigation = [
    // Main homepage
    { name: 'Trang Chủ', href: '/', icon: Home },
    
    // Main features
    { name: 'Công Việc', href: '/tasks', icon: Assignment },
    { name: 'Khách Hàng', href: '/customers', icon: People },
    { name: 'Sản Phẩm', href: '/products', icon: Inventory },
    { name: 'Nhân Viên', href: '/staff', icon: Person },
    
    // Credit process
    { name: 'Hợp Đồng', href: '/contracts', icon: Description },
    { name: 'Tài Sản Thế Chấp', href: '/collaterals', icon: Search },
    { name: 'Thẩm Định', href: '/assessments', icon: Folder },
    
    // Document management
    { name: 'Tài Liệu', href: '/documents', icon: Description },
    { name: 'Mẫu Tài Liệu', href: '/templates', icon: Folder },
    
    // Settings
    { name: 'Cài Đặt', href: '/settings', icon: Settings }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    
    return (
      <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {mobile ? (
          <ListItemButton
            sx={{
              borderRadius: 2,
              mb: 0.5,
              ...(isActive && {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              }),
            }}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.name}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
          </ListItemButton>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              borderRadius: 2,
              textDecoration: 'none',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              ...(isActive ? {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[2],
              } : {
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateY(-1px)',
                },
              }),
            }}
          >
            <Icon sx={{ fontSize: 18, mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 500 }}>
              {item.name}
            </Typography>
          </Box>
        )}
      </Link>
    )
  }

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        🏢 Hệ Thống Quản Lý
      </Typography>
      <List>
        {navigation.map((item) => (
          <ListItem key={item.name} disablePadding>
            <NavLink item={item} mobile />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* Logo and Title */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: isMobile ? 1 : 0, 
              fontWeight: 700,
              mr: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            🏢 Hệ Thống Quản Lý
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </Box>
          )}

          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{ 
              ml: 1,
              bgcolor: 'action.selected',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            size="small"
          >
            {darkMode ? '🌙' : '☀️'}
          </IconButton>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
    </Box>
  )
}
