import React from 'react'
import {
  Box,
  Typography,
  Divider
} from '@mui/material'
import { Settings } from '@mui/icons-material'
import MetadataForm from '../MetadataForm'
import JsonInputHelper from '../JsonInputHelper'
import { CollateralFormData } from './types'

interface CollateralMetadataSectionProps {
  formData: CollateralFormData
  onMetadataChange: (metadata: Record<string, Record<string, unknown>>) => void
}

export default function CollateralMetadataSection({
  formData,
  onMetadataChange
}: CollateralMetadataSectionProps) {
  const getSuggestedTemplates = (collateralType: string) => {
    switch (collateralType) {
      case 'real_estate':
        return ['property_certificate', 'property_land', 'property_building', 'property_value', 'property_assessment']
      case 'vehicle':
        return ['vehicle', 'legal', 'assessment', 'documents']
      case 'savings':
        return ['financial', 'legal', 'documents']
      case 'stocks':
      case 'bonds':
        return ['financial', 'legal', 'documents']
      case 'machinery':
        return ['assessment', 'legal', 'documents']
      default:
        return ['documents', 'communication']
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Thông Tin Chi Tiết & Metadata
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Structured Metadata Form */}
        {formData.collateral_type && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Thông Tin Chi Tiết Theo Loại Tài Sản
            </Typography>
            <MetadataForm
              initialData={formData.metadata}
              onChange={onMetadataChange}
              suggestedTemplates={getSuggestedTemplates(formData.collateral_type)}
            />
          </Box>
        )}

        {/* Custom JSON Input */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Thông Tin Tùy Chỉnh
          </Typography>
          <JsonInputHelper
            value={JSON.stringify(formData.metadata.custom || {}, null, 2)}
            onChange={(jsonString: string) => {
              try {
                const customData = JSON.parse(jsonString)
                onMetadataChange({
                  ...formData.metadata,
                  custom: customData
                })
              } catch (error) {
                // If JSON is invalid, don't update the state
                console.error('Invalid JSON:', error)
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Thêm các trường thông tin tùy chỉnh theo nhu cầu
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}