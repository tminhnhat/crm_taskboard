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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📄 Template Manager
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý templates cho tất cả loại tài liệu {templateType ? `- ${templateType}` : ''}
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">DOCX Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.file_url.includes('.docx')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XLSX Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.file_url.includes('.xlsx')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {allowUpload && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-bold text-gray-900">Upload Template Mới</h2>
                <p className="text-gray-600">Thêm template DOCX hoặc XLSX mới vào hệ thống</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="template-file" className="block text-sm font-semibold text-gray-700 mb-2">
                    📎 Chọn File Template
                  </label>
                  <div className="relative">
                    <input
                      id="template-file"
                      type="file"
                      accept=".docx,.xlsx,.doc,.xls"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700 file:transition-all file:duration-200 file:shadow-sm hover:file:shadow-md"
                    />
                    {selectedFile && (
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="template-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Tên Template
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Nhập tên mô tả cho template..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="template-type" className="block text-sm font-semibold text-gray-700 mb-2">
                    📂 Loại Template
                  </label>
                  <select
                    id="template-type"
                    value={newTemplateType}
                    onChange={(e) => setNewTemplateType(e.target.value)}
                    disabled={!!templateType}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-50"
                  >
                    <option value="">Chọn loại template...</option>
                    <option value="hop_dong_tin_dung">Hợp đồng tín dụng</option>
                    <option value="to_trinh_tham_dinh">Tờ trình thẩm định</option>
                    <option value="giay_de_nghi_vay_von">Giấy đề nghị vay vốn</option>
                    <option value="bien_ban_dinh_gia">Biên bản định giá</option>
                    <option value="hop_dong_the_chap">Hợp đồng thế chấp</option>
                    <option value="don_dang_ky_the_chap">Đơn đăng ký thế chấp</option>
                    <option value="hop_dong_thu_phi">Hợp đồng thu phí</option>
                    <option value="tai_lieu_khac">Tài liệu khác</option>
                  </select>
                </div>

                <div className="flex items-end h-full">
                  <button
                    onClick={handleUpload}
                    disabled={uploadLoading || !selectedFile || !newTemplateName || !newTemplateType}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {uploadLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang upload...
                      </div>
                    ) : (
                      <>🚀 Upload Template</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-indigo-100">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-bold text-gray-900">Danh sách Templates</h2>
                <p className="text-gray-600">{templates.length} templates có sẵn</p>
              </div>
            </div>
            
            {loading && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải...
              </div>
            )}
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có template nào</h3>
              <p className="text-gray-500 mb-6">
                {allowUpload ? 'Hãy upload template đầu tiên để bắt đầu sử dụng.' : 'Liên hệ admin để thêm templates.'}
              </p>
              {allowUpload && (
                <button
                  onClick={() => document.getElementById('template-file')?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Template Đầu Tiên
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => {
                const fileExtension = template.file_url.split('.').pop()?.toLowerCase() || '';
                const isDocx = fileExtension === 'docx';
                const isXlsx = fileExtension === 'xlsx';
                
                return (
                  <div
                    key={template.template_id}
                    className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full"></div>
                    
                    {/* File type icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${isDocx ? 'bg-blue-100' : isXlsx ? 'bg-green-100' : 'bg-gray-100'} relative z-10`}>
                        {isDocx ? (
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : isXlsx ? (
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* File type badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDocx ? 'bg-blue-100 text-blue-700' : 
                        isXlsx ? 'bg-green-100 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {fileExtension.toUpperCase()}
                      </div>
                    </div>

                    {/* Template info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                        {template.template_name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {template.template_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(template.created_at)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{formatFileSize(template.file_url)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <a
                        href={template.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tải về
                      </a>
                      
                      {onTemplateSelect && (
                        <button
                          onClick={() => onTemplateSelect(template)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Chọn
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    {allowDelete && (
                      <button
                        onClick={() => handleDelete(template)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 z-10"
                        title="Xóa template"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
