'use client'

import React, { useState } from 'react'
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'

interface JsonInputHelperProps {
  value: string
  onChange: (value: string) => void
}

interface JsonField {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean'
}

export default function JsonInputHelper({ value, onChange }: JsonInputHelperProps) {
  const [fields, setFields] = useState<JsonField[]>(() => {
    try {
      const parsedValue = value ? JSON.parse(value) : {}
      return Object.entries(parsedValue).map(([key, val]) => ({
        key,
        value: String(val),
        type: typeof val as 'string' | 'number' | 'boolean'
      }))
    } catch {
      return []
    }
  })

  const addField = () => {
    setFields([...fields, { key: '', value: '', type: 'string' }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, field: Partial<JsonField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...field }

    // Convert value based on type
    if (field.type && newFields[index].value) {
      switch (field.type) {
        case 'number':
          newFields[index].value = String(Number(newFields[index].value) || 0)
          break
        case 'boolean':
          newFields[index].value = newFields[index].value.toLowerCase() === 'true' ? 'true' : 'false'
          break
      }
    }

    setFields(newFields)
    updateJsonOutput(newFields)
  }

  const updateJsonOutput = (currentFields: JsonField[]) => {
    const obj = currentFields.reduce<Record<string, string | number | boolean>>((acc, field) => {
      if (field.key && field.value !== undefined) {
        let value: string | number | boolean = field.value
        switch (field.type) {
          case 'number':
            value = Number(field.value)
            break
          case 'boolean':
            value = field.value.toLowerCase() === 'true'
            break
        }
        acc[field.key] = value
      }
      return acc
    }, {})

    onChange(JSON.stringify(obj, null, 2))
  }

  return (
    <Stack spacing={2}>
      {/* Fields */}
      <Stack spacing={1}>
        {fields.map((field, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Tên trường"
              value={field.key}
              onChange={(e) => updateField(index, { key: e.target.value })}
              sx={{ minWidth: 120, flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Loại</InputLabel>
              <Select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as JsonField['type'] })}
                label="Loại"
              >
                <MenuItem value="string">Chữ</MenuItem>
                <MenuItem value="number">Số</MenuItem>
                <MenuItem value="boolean">True/False</MenuItem>
              </Select>
            </FormControl>
            {field.type === 'boolean' ? (
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Giá trị</InputLabel>
                <Select
                  value={field.value}
                  onChange={(e) => updateField(index, { value: e.target.value })}
                  label="Giá trị"
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder="Giá trị"
                value={field.value}
                onChange={(e) => updateField(index, { value: e.target.value })}
                sx={{ flex: 1 }}
              />
            )}
            <IconButton
              onClick={() => removeField(index)}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {/* Add Field Button */}
      <Button
        variant="text"
        size="small"
        startIcon={<Add />}
        onClick={addField}
        sx={{ alignSelf: 'flex-start' }}
      >
        Thêm trường
      </Button>
    </Stack>
  )
}
