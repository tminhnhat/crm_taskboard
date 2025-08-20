'use client'

import { useEffect, useState } from 'react'
import DocumentGenerator from '@/components/DocumentGenerator'
import TemplateManager from '@/components/TemplateManager'
import Navigation from '@/components/Navigation'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { TemplateWithData } from '@/types/templates'

export default function DocumentsPage() {
  const [templates, setTemplates] = useState<TemplateWithData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (!response.ok) {
          throw new Error('Failed to fetch templates')
        }
        const data = await response.json()
        setTemplates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tài Liệu</h1>
              <p className="text-gray-600">Quản lý và tạo tài liệu từ templates</p>
            </div>
          </div>
        </div>

        {/* Template Management */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quản Lý Template</h2>
          <TemplateManager />
        </div>

        {/* Document Generation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tạo Tài Liệu Mới</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {error}
              </div>
            ) : (
              <DocumentGenerator templates={templates} />
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lịch Sử Tài Liệu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Tài Liệu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Document history will be populated dynamically */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
