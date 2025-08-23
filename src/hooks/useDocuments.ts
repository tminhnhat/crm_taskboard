import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Document, DocumentType, DocumentExportType } from '@/lib/supabase';

export interface GenerateDocumentParams {
  documentType: DocumentType;
  customerId: number;
  collateralId?: number;
  assessmentId?: number;
  exportType: DocumentExportType;
}

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  generateDocument: (params: GenerateDocumentParams) => Promise<{ filename: string; url: string }>;
  downloadDocument: (params: GenerateDocumentParams) => Promise<void>; // New download function
  deleteDocument: (documentId: number) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  sendDocumentByEmail: (filename: string, email: string) => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all documents with related data
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use separate queries to avoid JOIN issues that cause 300 errors
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (documentsError) throw documentsError;
      
      if (documentsData && documentsData.length > 0) {
        // Get unique IDs for related data
        const customerIds = [...new Set(documentsData.map(d => d.customer_id).filter(id => id))];
        const collateralIds = [...new Set(documentsData.map(d => d.collateral_id).filter(id => id))];
        const assessmentIds = [...new Set(documentsData.map(d => d.assessment_id).filter(id => id))];
        
        // Fetch related data in parallel
        const [customersResult, collateralsResult, assessmentsResult] = await Promise.all([
          customerIds.length > 0 ? supabase
            .from('customers')
            .select('customer_id, full_name, phone, email')
            .in('customer_id', customerIds) : Promise.resolve({ data: [] }),
          collateralIds.length > 0 ? supabase
            .from('collaterals')
            .select('collateral_id, collateral_type, description')
            .in('collateral_id', collateralIds) : Promise.resolve({ data: [] }),
          assessmentIds.length > 0 ? supabase
            .from('credit_assessments')
            .select('assessment_id, status, approval_decision')
            .in('assessment_id', assessmentIds) : Promise.resolve({ data: [] })
        ]);
        
        // Combine the data
        const enrichedDocuments = documentsData.map(doc => ({
          ...doc,
          customer: customersResult.data?.find(c => c.customer_id === doc.customer_id),
          collateral: collateralsResult.data?.find(c => c.collateral_id === doc.collateral_id),
          assessment: assessmentsResult.data?.find(a => a.assessment_id === doc.assessment_id)
        }));
        
        setDocuments(enrichedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate and save a new document
  const generateDocument = async ({
    documentType,
    customerId,
    collateralId,
    assessmentId,
    exportType
  }: GenerateDocumentParams): Promise<{ filename: string; url: string }> => {
    try {
      setError(null);

      // Validate required parameters
      if (!documentType || !customerId || !exportType) {
        throw new Error('Missing required parameters: documentType, customerId, exportType');
      }

      // Generate document and save to blob storage
      const response = await fetch('/api/documents?return=json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          customerId,
          collateralId,
          creditAssessmentId: assessmentId,
          exportType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Document generation failed with status ${response.status}`);
      }

      const result = await response.json();
      const { filename, blobUrl } = result;

      if (!filename) {
        throw new Error('Could not get filename from response');
      }

      // Use blob URL if available, otherwise fallback to local path
      const fileUrl = blobUrl || `/ketqua/${filename}`;

      // Record the document in the database
      const { data: newDoc, error: saveError } = await supabase
        .from('documents')
        .insert([{
          document_type: documentType,
          customer_id: customerId,
          collateral_id: collateralId,
          assessment_id: assessmentId,
          file_name: filename,
          file_url: fileUrl // Store blob URL or fallback path
        }])
        .select('*');

      if (saveError) {
        console.warn('Failed to save document record to database:', saveError);
      } else if (newDoc && newDoc.length > 0) {
        // Fetch related data for the new document
        const doc = newDoc[0];
        const [customerResult, collateralResult, assessmentResult] = await Promise.all([
          doc.customer_id ? supabase
            .from('customers')
            .select('customer_id, full_name, phone, email')
            .eq('customer_id', doc.customer_id)
            .single() : Promise.resolve({ data: null }),
          doc.collateral_id ? supabase
            .from('collaterals')
            .select('collateral_id, collateral_type, description')
            .eq('collateral_id', doc.collateral_id)
            .single() : Promise.resolve({ data: null }),
          doc.assessment_id ? supabase
            .from('credit_assessments')
            .select('assessment_id, status, approval_decision')
            .eq('assessment_id', doc.assessment_id)
            .single() : Promise.resolve({ data: null })
        ]);
        
        const enrichedDoc = {
          ...doc,
          customer: customerResult.data,
          collateral: collateralResult.data,
          assessment: assessmentResult.data
        };
        
        setDocuments(prevDocs => [enrichedDoc, ...prevDocs]);
      }

      return { filename, url: fileUrl };
    } catch (err) {
      console.error('Error generating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate document');
      throw err;
    }
  };

  // Delete a document
  const deleteDocument = async (documentId: number): Promise<void> => {
    try {
      setError(null);

      // First, try to delete the file from storage
      const document = documents.find(d => d.document_id === documentId);
      if (document?.file_name) {
        // Delete the physical file
        await fetch(`/api/documents?file=${encodeURIComponent(document.file_name)}`, {
          method: 'DELETE',
        });
      }
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);

      if (error) throw error;

      setDocuments(prevDocs => prevDocs.filter(doc => doc.document_id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  };

  // Send document by email
  const sendDocumentByEmail = async (filename: string, email: string): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/documents/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: filename, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending document by email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send document by email');
      throw err;
    }
  };

  // Download document directly to user's browser
  const downloadDocument = async ({
    documentType,
    customerId,
    collateralId,
    assessmentId,
    exportType
  }: GenerateDocumentParams): Promise<void> => {
    try {
      setError(null);

      // Validate required parameters
      if (!documentType || !customerId || !exportType) {
        throw new Error('Missing required parameters: documentType, customerId, exportType');
      }

      // Generate document for direct download (original behavior)
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          customerId,
          collateralId,
          creditAssessmentId: assessmentId,
          exportType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Document generation failed with status ${response.status}`);
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]?.replace(/['"]/g, '')
        : `${documentType}_${customerId}_${Date.now()}.${exportType}`;

      if (!filename) {
        throw new Error('Could not determine filename from response');
      }

      // Create download blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to download document');
      throw err;
    }
  };

  // Effect to load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    generateDocument,
    downloadDocument,
    deleteDocument,
    fetchDocuments,
    sendDocumentByEmail,
  };
}
