"use client";
import { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function testTemplateSeeding() {
    setLoading(true);
    setResult('Đang test template seeding...');
    
    try {
      const response = await fetch('/api/templates/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      
      const data = await response.json();
      setResult(`✓ Seed result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`✗ Error: ${error}`);
    }
    setLoading(false);
  }

  async function testTemplateList() {
    setLoading(true);
    setResult('Đang lấy danh sách templates...');
    
    try {
      const response = await fetch('/api/templates/seed');
      const data = await response.json();
      setResult(`✓ Templates: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`✗ Error: ${error}`);
    }
    setLoading(false);
  }

  async function testDocumentGeneration() {
    setLoading(true);
    setResult('Đang test tạo document...');
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'hop_dong_tin_dung',
          customerId: 'test-customer',
          exportType: 'docx'
        }),
      });
      
      const data = await response.json();
      setResult(`✓ Document generation: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`✗ Error: ${error}`);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug & Test Page</h1>
      
      <div className="grid gap-4 mb-6">
        <button 
          onClick={testTemplateSeeding}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Template Seeding
        </button>
        
        <button 
          onClick={testTemplateList}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Template List
        </button>
        
        <button 
          onClick={testDocumentGeneration}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Document Generation
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Kết quả:</h3>
        <pre className="whitespace-pre-wrap text-sm">
          {result || 'Chưa có test nào được chạy...'}
        </pre>
      </div>
    </div>
  );
}
