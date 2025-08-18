'use client'

import React, { useState, useEffect } from 'react';
import { TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  fileName: string;
  createdAt: string;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Load templates
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Upload template
  const handleUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError('');

    const formData = new FormData(e.target);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await loadTemplates();
      e.target.reset();
    } catch (error) {
      setUploadError('Error uploading template');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      await loadTemplates();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Upload New Template</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="docx">DOCX</option>
              <option value="xlsx">XLSX</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Template File</label>
          <input
            type="file"
            name="file"
            required
            accept=".docx,.xlsx"
            className="mt-1 block w-full"
          />
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
        <button
          type="submit"
          disabled={isUploading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Upload Template
            </>
          )}
        </button>
      </form>

      {/* Templates List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium">Templates</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500">{template.description}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span className="capitalize">{template.type}</span>
                      <span className="mx-2">&bull;</span>
                      <time dateTime={template.createdAt}>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href={template.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {templates.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No templates uploaded yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
