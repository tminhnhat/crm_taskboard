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
      
      const { data, error } = await supabase
        .from('documents')
        .select('*, customer:customers!inner(*), collateral:collaterals(*), assessment:credit_assessments(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
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

      // Generate document via API
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

      // Record the document in the database
      const { data: newDoc, error: saveError } = await supabase
        .from('documents')
        .insert([{
          document_type: documentType,
          customer_id: customerId,
          collateral_id: collateralId,
          assessment_id: assessmentId,
          file_name: filename,
          file_url: `/ketqua/${filename}` // Store relative path to the file
        }])
        .select('*, customer:customers!inner(*), collateral:collaterals(*), assessment:credit_assessments(*)');

      if (saveError) {
        console.warn('Failed to save document record to database:', saveError);
      } else if (newDoc) {
        setDocuments(prevDocs => [...newDoc, ...prevDocs]);
      }

      return { filename, url };
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

  // Effect to load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    generateDocument,
    deleteDocument,
    fetchDocuments,
    sendDocumentByEmail,
  };
}
