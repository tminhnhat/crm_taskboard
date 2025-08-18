import React, { useState } from 'react';

import { TemplateWithData, GeneratedFile } from '@/types/templates';

interface DocumentGeneratorProps {
  templates: TemplateWithData[];
}

export default function DocumentGenerator({ templates }: DocumentGeneratorProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<Array<{ url: string, fileName: string }>>([]);
  const [error, setError] = useState('');

  const generateDocuments = async (downloadOnly: boolean = false) => {
    if (selectedTemplates.length === 0) {
      setError('Please select at least one template');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templates: selectedTemplates.map(id => {
            const template = templates.find(t => t.id === id);
            return template;
          }),
          email: downloadOnly ? null : email,
          downloadOnly
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error generating documents');
      }

      setFiles(result.files);
      if (!downloadOnly) {
        alert('Documents have been sent to your email!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Select Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                selectedTemplates.includes(template.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => toggleTemplate(template.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTemplates.includes(template.id)}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <p className="font-medium">{template.type.toUpperCase()}</p>
                  <p className="text-sm text-gray-500">Template {template.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          onClick={() => generateDocuments(false)}
          disabled={isLoading || !email || selectedTemplates.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send via Email'}
        </button>
        <button
          onClick={() => generateDocuments(true)}
          disabled={isLoading || selectedTemplates.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Download'}
        </button>
      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="bg-green-50 p-4 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Documents generated!</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index}>
                <a 
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 underline"
                >
                  {file.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
