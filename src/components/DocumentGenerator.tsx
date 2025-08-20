import React, { useState, useEffect } from 'react';
import { TemplateWithData } from '@/types/templates';
import { Customer } from '@/lib/supabase';
import { useCustomers } from '@/hooks/useCustomers';
import { useCollaterals } from '@/hooks/useCollaterals';
import useCreditAssessments from '@/hooks/useCreditAssessments';

// Types
interface FilterState {
  customerId?: string;
  loanId?: string;
  status?: string;
}

interface DocumentGeneratorProps {
  templates: TemplateWithData[];
}

interface Assessment {
  id: number;
  customer_id: number;
  loan_amount: number;
  purpose: string;
  status: string;
}

// Constants
const DOCUMENT_TYPES = {
  CREDIT_CONTRACT: 'Hợp đồng tín dụng',
  ASSESSMENT_REPORT: 'Tờ trình thẩm định',
  LOAN_APPLICATION: 'Giấy đề nghị vay vốn',
  VALUATION_REPORT: 'Biên bản định giá',
  COLLATERAL_CONTRACT: 'Hợp đồng thế chấp'
} as const;

// Component
export default function DocumentGenerator({ templates }: DocumentGeneratorProps) {
  // State
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<Array<{ url: string; fileName: string }>>([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Hooks
  const { customers = [], loading: customersLoading } = useCustomers();
  const { collaterals = [], loading: collateralsLoading } = useCollaterals();
  const { isLoading: assessmentsLoading, fetchAssessments } = useCreditAssessments();

  // Effects
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const data = await fetchAssessments();
        setAssessments(data);
      } catch (err) {
        console.error('Error loading assessments:', err);
        setError('Failed to load assessments');
      }
    };
    loadAssessments();
  }, [fetchAssessments]);

  // Utility functions
  const getTemplateTypeName = (type: string): string => {
    const foundType = Object.entries(DOCUMENT_TYPES).find(([key]) => 
      type.toLowerCase().includes(key.toLowerCase())
    );
    return foundType ? foundType[1] : type;
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Main document generation function
  const generateDocuments = async (downloadOnly: boolean = false) => {
    if (selectedTemplates.length === 0) {
      setError('Please select at least one template');
      return;
    }

    if (!filters.customerId) {
      setError('Please select a customer');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Get customer data
      const customer = customers.find(c => String(c.customer_id) === filters.customerId);
      if (!customer) {
        throw new Error('Selected customer not found');
      }

      // Get assessment if selected
      const assessment = filters.loanId 
        ? assessments.find(a => String(a.id) === filters.loanId)
        : undefined;

      // Get collaterals
      const customerCollaterals = collaterals.filter(c => 
        String(c.customer_id) === filters.customerId
      );

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      // Generate documents
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templates: selectedTemplates.map(id => {
            const template = templates.find(t => t.id === id);
            if (!template) return null;

            const templateType = getTemplateTypeName(template.type);
            const fileName = `${templateType}_${customer.customer_id}_${dateStr}.${downloadOnly ? 'docx' : 'pdf'}`;
            
            return {
              ...template,
              fileName,
              data: {
                ...template.data,
                customer: {
                  id: customer.customer_id,
                  name: customer.full_name,
                  dob: customer.date_of_birth,
                  gender: customer.gender,
                  address: customer.address
                },
                assessment: assessment ? {
                  id: assessment.id,
                  loanAmount: assessment.loan_amount,
                  purpose: assessment.purpose,
                  status: assessment.status
                } : null,
                collaterals: customerCollaterals.map(col => ({
                  id: col.collateral_id,
                  value: col.value,
                  location: col.location,
                  type: col.collateral_type
                })),
                generatedDate: dateStr
              }
            };
          }).filter(Boolean),
          email: downloadOnly ? null : email,
          downloadOnly,
          outputFormat: downloadOnly ? 'docx' : 'pdf'
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

  // Loading state
  const isDataLoading = customersLoading || collateralsLoading || assessmentsLoading;

  // Render functions
  const renderFilters = () => (
    <div className="space-y-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search templates..."
        className="w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          value={filters.customerId || ''}
          onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.customer_id} value={String(customer.customer_id)}>
              {customer.full_name}
            </option>
          ))}
        </select>

        <select
          value={filters.loanId || ''}
          onChange={(e) => setFilters({ ...filters, loanId: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Loan</option>
          {assessments
            .filter((assessment) => !filters.customerId || String(assessment.customer_id) === filters.customerId)
            .map((assessment) => (
              <option key={assessment.id} value={String(assessment.id)}>
                {assessment.loan_amount} - {assessment.status}
              </option>
            ))}
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Select Templates</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates
          .filter(template => !searchTerm || getTemplateTypeName(template.type).toLowerCase().includes(searchTerm.toLowerCase()))
          .map(template => (
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
                  <p className="font-medium">{getTemplateTypeName(template.type)}</p>
                  <p className="text-sm text-gray-500">Template {template.id}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderActions = () => (
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
  );

  const renderGeneratedFiles = () => (
    files.length > 0 && (
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
    )
  );

  return (
    <div className="space-y-6">
      {isDataLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
        </div>
      ) : (
        <>
          {renderFilters()}
          {renderTemplateList()}
          {renderActions()}
          {error && <p className="text-red-500">{error}</p>}
          {renderGeneratedFiles()}
        </>
      )}
    </div>
  );
}
