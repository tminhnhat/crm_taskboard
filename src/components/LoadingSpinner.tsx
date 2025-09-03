import React from 'react'
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Stack
} from '@mui/material'
import { StyledCard } from './StyledComponents'

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}

export function TaskCardSkeleton() {
  return (
    <StyledCard>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="75%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={64} height={24} />
          </Stack>
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        <Skeleton variant="rectangular" width={96} height={32} sx={{ ml: 2, borderRadius: 1 }} />
      </Box>
    </StyledCard>
  )
}

export function CustomerCardSkeleton() {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </StyledCard>
  )
}

export function ProductCardSkeleton() {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2, borderRadius: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={70} height={24} />
          <Skeleton variant="rounded" width={90} height={24} />
        </Stack>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </StyledCard>
  )
}
