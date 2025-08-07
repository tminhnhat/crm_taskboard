'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

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
    <div className="space-y-4">
      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="Tên trường"
              value={field.key}
              onChange={(e) => updateField(index, { key: e.target.value })}
              className="w-1/3 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={field.type}
              onChange={(e) => updateField(index, { type: e.target.value as JsonField['type'] })}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
            >
              <option value="string">Chữ</option>
              <option value="number">Số</option>
              <option value="boolean">True/False</option>
            </select>
            {field.type === 'boolean' ? (
              <select
                value={field.value}
                onChange={(e) => updateField(index, { value: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder="Giá trị"
                value={field.value}
                onChange={(e) => updateField(index, { value: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              />
            )}
            <button
              type="button"
              onClick={() => removeField(index)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Field Button */}
      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <PlusIcon className="h-4 w-4" />
        Thêm trường
      </button>
    </div>
  )
}
