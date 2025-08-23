'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDocuments } from '@/hooks/useDocuments';
import { useCustomers } from '@/hooks/useCustomers';
import { useCollaterals } from '@/hooks/useCollaterals';
import useCreditAssessments from '@/hooks/useCreditAssessments';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DocumentGenerationForm {
  documentType: string;
  customerId: string;
  collateralId?: string;
  assessmentId?: string;
  exportType: 'docx' | 'xlsx';
  sendViaEmail?: boolean;
  emailAddress?: string;
}

// Component that uses useSearchParams - must be wrapped in Suspense
function DocumentsContent() {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showSendmailModal, setShowSendmailModal] = useState(false);
  const [selectedDocumentForEmail, setSelectedDocumentForEmail] = useState<any>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [formData, setFormData] = useState<DocumentGenerationForm>({
    documentType: '',
    customerId: '',
    collateralId: '',
    assessmentId: '',
    exportType: 'docx',
    sendViaEmail: false,
    emailAddress: ''
  });

  const { 
    documents, 
    loading: documentsLoading, 
    error: documentsError, 
    generateDocument, 
    downloadDocument,
    deleteDocument, 
    fetchDocuments,
    sendDocumentByEmail
  } = useDocuments();
  
  const { customers, refetch: fetchCustomers } = useCustomers();
  const { collaterals, refetch: fetchCollaterals } = useCollaterals();
  const { fetchAssessments } = useCreditAssessments();
  
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [collateralsList, setCollateralsList] = useState<any[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);

  const searchParams = useSearchParams();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCustomers(),
          fetchCollaterals()
        ]);
        
        const assessmentsData = await fetchAssessments();
        setAssessmentsList(assessmentsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Load available templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (data.templates) {
          // Extract template names without .docx extension
          const templateNames = data.templates.map((t: string) => t.replace('.docx', ''));
          setAvailableTemplates(templateNames);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, []);
  
  // Update local state when hook data changes
  useEffect(() => {
    setCustomersList(customers || []);
  }, [customers]);
  
  useEffect(() => {
    setCollateralsList(collaterals || []);
  }, [collaterals]);

  const documentTypes = [
    { value: 'hop_dong_tin_dung', label: 'Hợp đồng tín dụng' },
    { value: 'to_trinh_tham_dinh', label: 'Tờ trình thẩm định' },
    { value: 'giay_de_nghi_vay_von', label: 'Giấy đề nghị vay vốn' },
    { value: 'bien_ban_dinh_gia', label: 'Biên bản định giá' },
    { value: 'hop_dong_the_chap', label: 'Hợp đồng thế chấp' },
    { value: 'bang_tinh_lai', label: 'Bảng tính lãi' },
    { value: 'lich_tra_no', label: 'Lịch trả nợ' }
  ];

  const getDocumentTypeWithTemplate = (type: any) => {
    const hasTemplate = availableTemplates.includes(type.value);
    return {
      ...type,
      hasTemplate,
      displayLabel: hasTemplate ? type.label : `${type.label} (Chưa có mẫu)`
    };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentType || !formData.customerId) {
      alert('Vui lòng chọn loại tài liệu và khách hàng');
      return;
    }

    // Check if template is available for DOCX export
    if (formData.exportType === 'docx' && !availableTemplates.includes(formData.documentType)) {
      const selectedType = documentTypes.find(dt => dt.value === formData.documentType);
      alert(`Không thể tạo tài liệu Word cho "${selectedType?.label || formData.documentType}" vì chưa có mẫu. Vui lòng tải lên mẫu trong trang Templates hoặc chọn xuất Excel.`);
      return;
    }

    if (formData.sendViaEmail && !formData.emailAddress) {
      alert('Vui lòng nhập địa chỉ email để gửi tài liệu');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDocument({
        documentType: formData.documentType as any, // Cast to DocumentType
        customerId: parseInt(formData.customerId),
        collateralId: formData.collateralId ? parseInt(formData.collateralId) : undefined,
        assessmentId: formData.assessmentId ? parseInt(formData.assessmentId) : undefined,
        exportType: formData.exportType
      });
      
      // If user wants to send via email, send it
      if (formData.sendViaEmail && formData.emailAddress) {
        try {
          await sendDocumentByEmail(result.filename, formData.emailAddress);
          alert('Tạo tài liệu và gửi email thành công!');
        } catch (emailError) {
          alert(`Tạo tài liệu thành công nhưng gửi email thất bại: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
      } else {
        alert('Tạo tài liệu thành công!');
      }
      
      setShowGenerateForm(false);
      setFormData({
        documentType: '',
        customerId: '',
        collateralId: '',
        assessmentId: '',
        exportType: 'docx',
        sendViaEmail: false,
        emailAddress: ''
      });
    } catch (error) {
      alert(`Lỗi tạo tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      if (document.file_url && document.file_url.startsWith('http')) {
        // For blob URLs, open directly
        window.open(document.file_url, '_blank');
      } else {
        // For other documents, use downloadDocument function
        await downloadDocument({
          documentType: document.document_type,
          customerId: document.customer_id,
          collateralId: document.collateral_id,
          assessmentId: document.assessment_id,
          exportType: document.file_name.split('.').pop() || 'docx'
        });
      }
    } catch (error) {
      alert(`Lỗi tải tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    
    try {
      await deleteDocument(documentId);
      alert('Xóa tài liệu thành công!');
    } catch (error) {
      alert(`Lỗi xóa tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendmail = (document: any) => {
    setSelectedDocumentForEmail(document);
    // Pre-fill email if customer has email
    if (document.customer?.email) {
      setEmailAddress(document.customer.email);
    } else {
      setEmailAddress('');
    }
    setShowSendmailModal(true);
  };

  const handleSendmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentForEmail || !emailAddress) return;

    setIsSending(true);
    try {
      await sendDocumentByEmail(selectedDocumentForEmail.file_name, emailAddress);
      alert('Gửi email thành công!');
      setShowSendmailModal(false);
      setSelectedDocumentForEmail(null);
      setEmailAddress('');
    } catch (error) {
      alert(`Lỗi gửi email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || type;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tài liệu</h1>
            <p className="text-gray-600">
              Tạo và quản lý tài liệu cho khách hàng, tài sản đảm bảo và thẩm định tín dụng.
            </p>
          </div>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo Tài liệu Mới
          </button>
        </div>
      </div>

      {documentsError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <p className="mt-1 text-sm text-red-700">{documentsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Document Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Tạo Tài liệu Mới</h3>
              <button
                onClick={() => setShowGenerateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại Tài liệu *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Chọn loại tài liệu --</option>
                    {documentTypes.map(type => {
                      const typeWithTemplate = getDocumentTypeWithTemplate(type);
                      return (
                        <option 
                          key={type.value} 
                          value={type.value}
                          style={{
                            color: typeWithTemplate.hasTemplate ? 'inherit' : '#666'
                          }}
                        >
                          {typeWithTemplate.displayLabel}
                        </option>
                      );
                    })}
                  </select>
                  {formData.documentType && formData.exportType === 'docx' && (
                    <div className="mt-2">
                      {availableTemplates.includes(formData.documentType) ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Mẫu tài liệu có sẵn
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Chưa có mẫu - Vui lòng tải lên trong <a href="/templates" className="underline hover:text-orange-800">trang Templates</a> hoặc chọn Excel
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khách hàng *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customersList.map((customer: any) => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.full_name} ({customer.id_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tài sản đảm bảo (tùy chọn)
                  </label>
                  <select
                    value={formData.collateralId}
                    onChange={(e) => setFormData(prev => ({ ...prev, collateralId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Không chọn --</option>
                    {collateralsList.map((collateral: any) => (
                      <option key={collateral.collateral_id} value={collateral.collateral_id}>
                        {collateral.collateral_type} - {collateral.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thẩm định tín dụng (tùy chọn)
                  </label>
                  <select
                    value={formData.assessmentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assessmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Không chọn --</option>
                    {assessmentsList.map((assessment: any) => (
                      <option key={assessment.assessment_id} value={assessment.assessment_id}>
                        {assessment.customer?.full_name} - {assessment.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Định dạng
                  </label>
                  <select
                    value={formData.exportType}
                    onChange={(e) => setFormData(prev => ({ ...prev, exportType: e.target.value as 'docx' | 'xlsx' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="docx">Word (.docx)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                  </select>
                </div>

                {/* Email Options */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendViaEmail}
                      onChange={(e) => {
                        const sendViaEmail = e.target.checked;
                        setFormData(prev => ({ 
                          ...prev, 
                          sendViaEmail,
                          emailAddress: sendViaEmail ? (
                            customersList.find(c => c.customer_id === parseInt(formData.customerId))?.email || ''
                          ) : ''
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Gửi tài liệu qua email</span>
                  </label>
                </div>

                {formData.sendViaEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ email người nhận *
                    </label>
                    <input
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example@email.com"
                      required={formData.sendViaEmail}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email sẽ được gửi sau khi tạo tài liệu thành công
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Đang tạo...' : (formData.sendViaEmail ? 'Tạo & Gửi Email' : 'Tạo Tài liệu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showSendmailModal && selectedDocumentForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Gửi Tài liệu qua Email</h3>
              <button
                onClick={() => {
                  setShowSendmailModal(false);
                  setSelectedDocumentForEmail(null);
                  setEmailAddress('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSendmailSubmit} className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin tài liệu:</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Loại:</strong> {getDocumentTypeLabel(selectedDocumentForEmail.document_type)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tên file:</strong> {selectedDocumentForEmail.file_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Khách hàng:</strong> {selectedDocumentForEmail.customer?.full_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email người nhận *
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="example@email.com"
                    required
                  />
                  {selectedDocumentForEmail.customer?.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      Email mặc định từ thông tin khách hàng
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendmailModal(false);
                    setSelectedDocumentForEmail(null);
                    setEmailAddress('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSending || !emailAddress}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Gửi Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Tài liệu đã tạo</h2>
        </div>

        {documentsLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner message="Đang tải tài liệu..." />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tài liệu nào</h3>
            <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo tài liệu đầu tiên</p>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Tạo Tài liệu Mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại Tài liệu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getDocumentTypeLabel(doc.document_type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.customer?.full_name}</div>
                      <div className="text-sm text-gray-500">{doc.customer?.id_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.file_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Tải xuống tài liệu"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tải xuống
                        </button>
                        <button
                          onClick={() => handleSendmail(doc)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Gửi qua email"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Gửi email
                        </button>
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          title="Xóa tài liệu"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Đang tải trang quản lý tài liệu..." />}>
      <DocumentsContent />
    </Suspense>
  );
}
