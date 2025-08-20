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
    <div className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <div className="relative">
          <select
            id="customer"
            value={filters.customerId || ''}
            onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={String(customer.customer_id)}>
                {customer.full_name}
              </option>
            ))}
          </select>
        </div>
        {filters.customerId && customers.find(c => String(c.customer_id) === filters.customerId) && (
          <div className="mt-2 text-sm text-gray-500">
            Selected: {customers.find(c => String(c.customer_id) === filters.customerId)?.full_name}
          </div>
        )}
      </div>

      {/* Loan Assessment Selection */}
      <div className="space-y-2">
        <label htmlFor="loan" className="block text-sm font-medium text-gray-700">
          Loan Assessment
        </label>
        <div className="relative">
          <select
            id="loan"
            value={filters.loanId || ''}
            onChange={(e) => setFilters({ ...filters, loanId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!filters.customerId}
          >
            <option value="">Select Loan Assessment</option>
            {assessments
              .filter((assessment) => !filters.customerId || String(assessment.customer_id) === filters.customerId)
              .map((assessment) => (
                <option key={assessment.id} value={String(assessment.id)}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                    .format(assessment.loan_amount)} - {assessment.status}
                </option>
              ))}
          </select>
        </div>
        {!filters.customerId && (
          <p className="mt-2 text-sm text-amber-600">
            Please select a customer first
          </p>
        )}
      </div>

      {/* Document Status */}
      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Document Status
        </label>
        <div className="relative">
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          setFilters({});
          setSearchTerm('');
        }}
        className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Filters
      </button>
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {selectedTemplates.length} selected
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {templates
          .filter(template => !searchTerm || getTemplateTypeName(template.type).toLowerCase().includes(searchTerm.toLowerCase()))
          .map(template => (
            <div
              key={template.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTemplates.includes(template.id)
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleTemplate(template.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTemplates.includes(template.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedTemplates.includes(template.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {getTemplateTypeName(template.type)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Template {template.id}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {template.data?.preview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add preview functionality here
                      }}
                      className="text-gray-400 hover:text-gray-500"
                      title="Preview template"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {templates.filter(template => !searchTerm || 
        getTemplateTypeName(template.type).toLowerCase().includes(searchTerm.toLowerCase())
      ).length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg">
        {isDataLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Document Generator</h2>
              <p className="mt-1 text-sm text-gray-500">Generate and manage your documents based on templates.</p>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left panel - Filters */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                  {renderFilters()}
                </div>
              </div>

              {/* Right panel - Templates and Actions */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Search and template selection */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Document Templates</h3>
                    {renderTemplateList()}
                  </div>

                  {/* Generation options */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Options</h3>
                    <div className="space-y-4">
                      {renderActions()}
                      {selectedTemplates.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Templates</h4>
                          <ul className="list-disc list-inside text-sm text-blue-700">
                            {selectedTemplates.map(id => {
                              const template = templates.find(t => t.id === id);
                              return template && (
                                <li key={id}>{getTemplateTypeName(template.type)}</li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status and results */}
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                    {renderGeneratedFiles()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
