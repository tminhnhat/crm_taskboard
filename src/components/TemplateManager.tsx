'use client';

import React, { useState, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import type { DocumentTemplate } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface TemplateManagerProps {
  templateType?: string;
  onTemplateSelect?: (template: DocumentTemplate) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

export function TemplateManager({ 
  templateType, 
  onTemplateSelect, 
  allowUpload = true, 
  allowDelete = true 
}: TemplateManagerProps) {
  const { 
    templates, 
    loading, 
    error, 
    fetchTemplates, 
    uploadTemplate, 
    deleteTemplateFile 
  } = useDocuments();

  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState(templateType || '');

  useEffect(() => {
    fetchTemplates(templateType);
  }, [fetchTemplates, templateType]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill template name from filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setNewTemplateName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newTemplateName || !newTemplateType) {
      alert('Vui lòng chọn file, nhập tên template và loại template');
      return;
    }

    try {
      setUploadLoading(true);
      await uploadTemplate(selectedFile, newTemplateName, newTemplateType);
      
      // Reset form
      setSelectedFile(null);
      setNewTemplateName('');
      if (!templateType) setNewTemplateType('');
      
      // Reset file input
      const fileInput = document.getElementById('template-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      alert('Upload template thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload template thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (template: DocumentTemplate) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa template "${template.template_name}"?`)) {
      return;
    }

    try {
      await deleteTemplateFile(template);
      alert('Xóa template thành công!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Xóa template thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatFileSize = (url: string): string => {
    // Extract filename from URL for display
    const filename = url.split('/').pop() || 'Unknown';
    return filename;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && templates.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Quản lý Templates {templateType ? `- ${templateType}` : ''}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Upload Section */}
      {allowUpload && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Template Mới</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="template-file" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn File Template
              </label>
              <input
                id="template-file"
                type="file"
                accept=".docx,.xlsx,.doc,.xls"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên Template
              </label>
              <input
                id="template-name"
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Nhập tên template..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-2">
                Loại Template
              </label>
              <input
                id="template-type"
                type="text"
                value={newTemplateType}
                onChange={(e) => setNewTemplateType(e.target.value)}
                placeholder="Ví dụ: hop_dong_tin_dung, bien_ban_dinh_gia..."
                disabled={!!templateType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={uploadLoading || !selectedFile || !newTemplateName || !newTemplateType}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? 'Đang upload...' : 'Upload Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Danh sách Templates ({templates.length})
        </h3>

        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có template nào. {allowUpload && 'Hãy upload template đầu tiên.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.template_id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {template.template_name}
                  </h4>
                  {allowDelete && (
                    <button
                      onClick={() => handleDelete(template)}
                      className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      title="Xóa template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Type: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{template.template_type}</span>
                </p>
                
                <p className="text-xs text-gray-500 mb-2">
                  File: {formatFileSize(template.file_url)}
                </p>
                
                <p className="text-xs text-gray-500 mb-3">
                  Tạo: {formatDate(template.created_at)}
                </p>

                <div className="flex gap-2">
                  <a
                    href={template.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                  >
                    Tải về
                  </a>
                  
                  {onTemplateSelect && (
                    <button
                      onClick={() => onTemplateSelect(template)}
                      className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                    >
                      Chọn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
