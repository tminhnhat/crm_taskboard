import React, { useState } from 'react';

interface DocumentGeneratorProps {
  templateType: 'docx' | 'xlsx';
  data: any;
}

export default function DocumentGenerator({ templateType, data }: DocumentGeneratorProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const generateDocument = async (downloadOnly: boolean = false) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType,
          data,
          email: downloadOnly ? null : email,
          downloadOnly
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error generating document');
      }

      setDownloadUrl(result.fileUrl);
      if (!downloadOnly) {
        alert('Document has been sent to your email!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          onClick={() => generateDocument(false)}
          disabled={isLoading || !email}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send via Email'}
        </button>
        <button
          onClick={() => generateDocument(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Download'}
        </button>
      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {downloadUrl && (
        <p className="text-green-600">
          Document generated! {' '}
          <a 
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Click here to download
          </a>
        </p>
      )}
    </div>
  );
}
