import React, { useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField
} from '@mui/material'
import { ExpandMore, Description } from '@mui/icons-material'
import JsonInputHelper from '../JsonInputHelper'

interface ContractMetadataSectionProps {
  metadataInput: string
  onMetadataInputChange: (value: string) => void
}

export default function ContractMetadataSection({
  metadataInput,
  onMetadataInputChange
}: ContractMetadataSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        Siêu Dữ Liệu Hợp Đồng
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* JSON Input Helper */}
        <JsonInputHelper 
          value={metadataInput} 
          onChange={onMetadataInputChange} 
        />
        
        {/* Direct JSON Editor */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="json-editor-content"
            id="json-editor-header"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              <Typography variant="body2" color="primary">
                Chỉnh Sửa JSON Trực Tiếp
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              value={metadataInput}
              onChange={(e) => onMetadataInputChange(e.target.value)}
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              placeholder='{"terms": "Net 30", "renewal": "Auto", "commission": 5}'
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </AccordionDetails>
        </Accordion>
        
        <Typography variant="caption" color="text.secondary">
          Tùy chọn: Nhập JSON hợp lệ cho siêu dữ liệu hợp đồng bổ sung
        </Typography>
      </Box>
    </Box>
  )
}