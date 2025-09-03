import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import { CustomerFormSectionProps } from './types';
import { useNumerology } from './useNumerology';

export default function CustomerNumerologySection({ formData, onChange }: CustomerFormSectionProps) {
  const {
    showNumerologyInfo,
    setShowNumerologyInfo,
    isCalculatingNumerology,
    getQuickPreview,
    autoCalculateNumerology
  } = useNumerology(formData, onChange);

  const preview = getQuickPreview();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Section Header with Info Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
        <Typography variant="subtitle2" color="primary">
          Dữ Liệu Thần Số Học (JSON)
        </Typography>
        <Button
          size="small"
          onClick={() => setShowNumerologyInfo(!showNumerologyInfo)}
          sx={{ fontSize: '0.75rem', textTransform: 'none' }}
        >
          📚 Tìm hiểu về Thần Số Học
        </Button>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          onClick={autoCalculateNumerology}
          disabled={isCalculatingNumerology || !formData.full_name || !formData.date_of_birth}
          sx={{ 
            bgcolor: 'purple',
            '&:hover': { bgcolor: 'darkviolet' }
          }}
        >
          {isCalculatingNumerology ? (
            <>⏳ Đang tính...</>
          ) : (
            <>🔮 Tự động tính toán</>
          )}
        </Button>
        
        {formData.numerology_data && Object.keys(formData.numerology_data).length > 0 && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onChange({ numerology_data: {} as Record<string, unknown> })}
          >
            🗑️ Xóa
          </Button>
        )}
      </Stack>

      {/* Numerology Information Modal */}
      {showNumerologyInfo && (
        <Box sx={{ 
          p: 3, 
          bgcolor: 'background.paper', 
          border: 1, 
          borderColor: 'primary.light', 
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            📖 22 Định Nghĩa Cơ Bản Trong Thần Số Học
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" color="info.main" sx={{ mb: 1 }}>
                🧭 A. HIỂU VỀ CHÍNH MÌNH
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                <strong>1. Số Lặp:</strong> Những số xuất hiện lặp lại trong 6 số lõi
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                <strong>2. Số Ngày Sinh:</strong> Tiết lộ tài năng bạn đang sở hữu
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                <strong>3. Số Tính Cách:</strong> Cách người khác nhìn thấy bạn
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" color="success.main" sx={{ mb: 1 }}>
                ❤️ B. KHAO KHÁT VỀ HẠNH PHÚC
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                <strong>1. Số Nội Tâm:</strong> Khát vọng tiềm ẩn của trái tim
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                <strong>2. Số Đam Mê Tiềm Ẩn:</strong> Tài năng cần rèn luyện
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                <strong>3. Nguyên Âm Đầu:</strong> Cửa sổ để hiểu sâu hơn
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
            💡 Hệ thống sẽ tự động tính toán dựa trên tên và ngày sinh của khách hàng.
          </Typography>
        </Box>
      )}

      {/* Quick Preview */}
      {preview && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'info.light', 
          borderRadius: 1,
          border: 1,
          borderColor: 'info.main'
        }}>
          <Typography variant="body2" color="info.dark" sx={{ mb: 1, fontWeight: 'bold' }}>
            🔍 Xem trước tính toán:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`🛤️ Đường Đời: ${preview.walksOfLife}`} size="small" color="primary" />
            <Chip label={`🎯 Sứ Mệnh: ${preview.mission}`} size="small" color="secondary" />
            <Chip label={`💜 Nội Tâm: ${preview.soul}`} size="small" color="success" />
            <Chip label={`🎂 Ngày Sinh: ${preview.birthDate}`} size="small" color="warning" />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
            ↑ Đây là bản xem trước. Nhấn "Tự động tính toán" để có dữ liệu đầy đủ.
          </Typography>
        </Box>
      )}

      {/* Numerology Data Input */}
      <TextField
        size="small"
        fullWidth
        multiline
        rows={4}
        label="Dữ liệu thần số học (JSON)"
        value={JSON.stringify(formData.numerology_data || {}, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ numerology_data: parsed });
          } catch {
            // If invalid JSON, keep current data
          }
        }}
        sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.875rem' } }}
        placeholder='Dữ liệu thần số học sẽ được tự động tạo hoặc nhập thủ công dạng JSON'
      />

      {/* Calculation Hint */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'warning.light', 
        borderRadius: 1,
        border: 1,
        borderColor: 'warning.main'
      }}>
        <Typography variant="body2" color="warning.dark">
          💡 <strong>Tự động tính toán:</strong> Khi bạn cung cấp đầy đủ <strong>Họ Tên</strong> và <strong>Ngày Sinh</strong>, 
          nhấn nút "🔮 Tự động tính toán" để hệ thống tạo dữ liệu thần số học hoàn chỉnh.
        </Typography>
      </Box>
    </Box>
  );
}