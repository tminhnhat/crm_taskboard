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
}

// Component that uses useSearchParams - must be wrapped in Suspense
function DocumentsContent() {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<DocumentGenerationForm>({
    documentType: '',
    customerId: '',
    collateralId: '',
    assessmentId: '',
    exportType: 'docx'
  });

  const { 
    documents, 
    loading: documentsLoading, 
    error: documentsError, 
    generateDocument, 
    downloadDocument,
    deleteDocument, 
    fetchDocuments 
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentType || !formData.customerId) {
      alert('Vui lòng chọn loại tài liệu và khách hàng');
      return;
    }

    setIsGenerating(true);
    try {
      await generateDocument({
        documentType: formData.documentType as any, // Cast to DocumentType
        customerId: parseInt(formData.customerId),
        collateralId: formData.collateralId ? parseInt(formData.collateralId) : undefined,
        assessmentId: formData.assessmentId ? parseInt(formData.assessmentId) : undefined,
        exportType: formData.exportType
      });
      
      alert('Tạo tài liệu thành công!');
      setShowGenerateForm(false);
      setFormData({
        documentType: '',
        customerId: '',
        collateralId: '',
        assessmentId: '',
        exportType: 'docx'
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
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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
                  {isGenerating ? 'Đang tạo...' : 'Tạo Tài liệu'}
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
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tải xuống
                        </button>
                        <button
                          onClick={() => handleDelete(doc.document_id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
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
