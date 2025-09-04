'use client';
import React from 'react';
import { 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Box, 
  Typography, 
  IconButton,
  Select,
  MenuItem,
  FormControl,
  styled 
} from '@mui/material';

// Styled components for consistent design
export const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

export const PriorityChip = styled(Chip)<{ priority?: string }>(({ theme, priority }) => ({
  fontWeight: 500,
  borderRadius: 16,
  ...(priority === 'Do first' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
  ...(priority === 'Schedule' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(priority === 'Delegate' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  }),
  ...(priority === 'Eliminate' && {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
  }),
}));

export const StatusChip = styled(Chip)<{ status?: string }>(({ theme, status }) => ({
  fontWeight: 500,
  borderRadius: 16,
  ...(status === 'needsAction' && {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[800],
  }),
  ...(status === 'inProgress' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  }),
  ...(status === 'onHold' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(status === 'completed' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(status === 'cancelled' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: '6px 12px',
  minWidth: 'auto',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: 8,
  },
}));

export const InfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[800] 
    : theme.palette.grey[50],
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    gap: theme.spacing(0.75),
    '& .MuiTypography-root': {
      fontSize: '0.8rem',
    },
  },
}));

export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1),
  },
}));

export const CardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'stretch',
  },
}));