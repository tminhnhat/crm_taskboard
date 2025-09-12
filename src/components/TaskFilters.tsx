import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack
} from '@mui/material'
import { FilterList, Sort, Clear } from '@mui/icons-material'
import { StyledCard } from './StyledComponents'

interface TaskFiltersProps {
  filters: {
    status: string
    priority: string
    search: string
    sortBy: string
    taskType: string
  }
  onFiltersChange: (filters: { status: string; priority: string; search: string; sortBy: string; taskType: string }) => void
}

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
            Bộ lọc
          </Typography>
        </Box>
        
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', md: 'center' }}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            label="Tìm kiếm"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Tìm kiếm công việc..."
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status || "needsAction"}
              onChange={(e) => updateFilter('status', e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="needsAction">Cần thực hiện</MenuItem>
              <MenuItem value="inProgress">Đang thực hiện</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="deleted">Đã xóa</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Độ ưu tiên</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              label="Độ ưu tiên"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Do first">Làm ngay</MenuItem>
              <MenuItem value="Schedule">Lên lịch</MenuItem>
              <MenuItem value="Delegate">Phân công</MenuItem>
              <MenuItem value="Eliminate">Loại bỏ</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Loại công việc</InputLabel>
            <Select
              value={filters.taskType}
              onChange={(e) => updateFilter('taskType', e.target.value)}
              label="Loại công việc"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="disbursement">Giải ngân</MenuItem>
              <MenuItem value="guarantee issuance">Phát hành bảo lãnh</MenuItem>
              <MenuItem value="credit assessment">Thẩm định tín dụng</MenuItem>
              <MenuItem value="asset appraisal">Thẩm định tài sản</MenuItem>
              <MenuItem value="document preparation">Soạn hồ sơ</MenuItem>
              <MenuItem value="customer development">Phát triển khách hàng</MenuItem>
              <MenuItem value="customer care">Chăm sóc khách hàng</MenuItem>
              <MenuItem value="meeting">Cuộc họp</MenuItem>
              <MenuItem value="project">Dự án</MenuItem>
              <MenuItem value="reminder">Nhắc nhở</MenuItem>
              <MenuItem value="call">Gọi điện</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="training">Đào tạo</MenuItem>
              <MenuItem value="research">Nghiên cứu</MenuItem>
              <MenuItem value="maintenance">Bảo trì</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Sort sx={{ fontSize: 16 }} />
                Sắp xếp
              </Box>
            </InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              label="Sắp xếp"
            >
              <MenuItem value="created_at">Ngày tạo</MenuItem>
              <MenuItem value="task_date_start">Ngày bắt đầu</MenuItem>
              <MenuItem value="task_due_date">Ngày hết hạn</MenuItem>
              <MenuItem value="task_name">Tên công việc</MenuItem>
              <MenuItem value="task_priority">Độ ưu tiên</MenuItem>
              <MenuItem value="task_status">Trạng thái</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="text"
            size="small"
            startIcon={<Clear />}
            onClick={() => onFiltersChange({ status: '', priority: '', search: '', sortBy: 'task_date_start', taskType: '' })}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Box>
    </StyledCard>
  )
}
