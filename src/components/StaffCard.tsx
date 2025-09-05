import React from 'react';
import { Staff } from '@/lib/supabase'
import {
  CardContent,
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Link
} from '@mui/material'
import { 
  Person,
  Email,
  Phone,
  Work,
  Business,
  Edit,
  DeleteOutline
} from '@mui/icons-material'
import {
  StyledCard,
  ActionButton,
  InfoBox,
  CardHeader,
  CardActions,
  StyledSelect
} from './StyledComponents'

interface StaffCardProps {
  staff: Staff
  onEdit: (staff: Staff) => void
  onDelete: (staffId: number) => void
  onStatusChange: (staffId: number, status: string) => void
}

export default function StaffCard({ staff, onEdit, onDelete, onStatusChange }: StaffCardProps) {
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  return (
    <StyledCard>
      <CardContent>
        <CardHeader>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Person color="action" sx={{ mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {staff.full_name}
                </Typography>
                {staff.position && (
                  <Typography variant="body2" color="text.secondary">
                    {staff.position}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                color={getStatusColor(staff.status) as any}
                size="small"
              />
              {staff.department && (
                <Chip 
                  icon={<Business />}
                  label={staff.department}
                  color="primary"
                  size="small"
                />
              )}
            </Stack>
            
            <Stack spacing={1}>
              {staff.email && (
                <InfoBox>
                  <Email fontSize="small" color="primary" />
                  <Link 
                    href={`mailto:${staff.email}`}
                    color="primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    <Typography variant="body2">
                      {staff.email}
                    </Typography>
                  </Link>
                </InfoBox>
              )}
              
              {staff.phone && (
                <InfoBox>
                  <Phone fontSize="small" color="secondary" />
                  <Link 
                    href={`tel:${staff.phone}`}
                    color="secondary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    <Typography variant="body2">
                      {staff.phone}
                    </Typography>
                  </Link>
                </InfoBox>
              )}
              
              {staff.position && (
                <InfoBox>
                  <Work fontSize="small" color="action" />
                  <Typography variant="body2">
                    {staff.position}
                  </Typography>
                </InfoBox>
              )}
              
              {staff.department && (
                <InfoBox>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2">
                    {staff.department}
                  </Typography>
                </InfoBox>
              )}
            </Stack>
          </Box>
          
          {/* Đã gỡ bỏ staff status input field */}
        </CardHeader>
        
        <CardActions>
          <ActionButton
            startIcon={<Edit />}
            onClick={() => onEdit(staff)}
            color="primary"
            variant="outlined"
            size="small"
          >
            Sửa
          </ActionButton>
          <ActionButton
            startIcon={<DeleteOutline />}
            onClick={() => onDelete(staff.staff_id)}
            color="error"
            variant="outlined"
            size="small"
          >
            Xóa
          </ActionButton>
        </CardActions>
      </CardContent>
    </StyledCard>
  )
}
