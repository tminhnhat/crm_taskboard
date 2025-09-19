import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Document, DocumentType, DocumentExportType, DocumentTemplate } from '@/lib/supabase';

export interface GenerateDocumentParams {
  templateId: number;
  customerId: number;
  collateralId?: number;
  assessmentId?: number;
  exportType: DocumentExportType;
}

export interface UseDocumentsReturn {
  documents: Document[];
  templates: DocumentTemplate[];
  loading: boolean;
  error: string | null;
  generateDocument: (params: GenerateDocumentParams) => Promise<{ filename: string; url: string }>;
  downloadDocument: (params: GenerateDocumentParams) => Promise<void>;
  deleteDocument: (documentId: number) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  sendDocumentByEmail: (filename: string, email: string) => Promise<void>;
  fetchTemplates: (templateType?: string) => Promise<void>;
  addTemplate: (template: Omit<DocumentTemplate, 'template_id' | 'created_at'>) => Promise<void>;
  updateTemplate: (template_id: number, updates: Partial<Omit<DocumentTemplate, 'template_id' | 'created_at'>>) => Promise<void>;
  deleteTemplate: (template_id: number) => Promise<void>;
  uploadTemplate: (file: File, templateName: string, templateType: string) => Promise<DocumentTemplate>;
  deleteTemplateFile: (template: DocumentTemplate) => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch templates (optionally by template_type)
  const fetchTemplates = useCallback(async (templateType?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('templates').select('*').order('created_at', { ascending: false });
      if (templateType) {
        query = query.eq('template_type', templateType);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new template
  const addTemplate = async (template: Omit<DocumentTemplate, 'template_id' | 'created_at'>): Promise<void> => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('templates')
        .insert([template])
        .select('*');
      if (insertError) throw insertError;
      if (data && data.length > 0) {
        setTemplates(prev => [data[0], ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
      throw err;
    }
  };

  // Update a template
  const updateTemplate = async (template_id: number, updates: Partial<Omit<DocumentTemplate, 'template_id' | 'created_at'>>): Promise<void> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('templates')
        .update(updates)
        .eq('template_id', template_id)
        .select('*');
      if (updateError) throw updateError;
      if (data && data.length > 0) {
        setTemplates(prev => prev.map(t => t.template_id === template_id ? data[0] : t));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  // Delete a template
  const deleteTemplate = async (template_id: number): Promise<void> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('template_id', template_id);
      if (deleteError) throw deleteError;
      setTemplates(prev => prev.filter(t => t.template_id !== template_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  // Upload template file to Vercel Blob and save metadata to Supabase
  const uploadTemplate = async (file: File, templateName: string, templateType: string): Promise<DocumentTemplate> => {
    try {
      setError(null);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('templateName', templateName);
      formData.append('templateType', templateType);
      
      // Upload file to Vercel Blob Storage in maubieu/ folder
      const uploadResponse = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload template file');
      }
      
      const { fileUrl } = await uploadResponse.json();
      
      // Save template metadata to Supabase
      const { data, error: insertError } = await supabase
        .from('templates')
        .insert([{
          template_name: templateName,
          template_type: templateType,
          file_url: fileUrl
        }])
        .select('*');
        
      if (insertError) throw insertError;
      
      if (data && data.length > 0) {
        const newTemplate = data[0];
        setTemplates(prev => [newTemplate, ...prev]);
        return newTemplate;
      }
      
      throw new Error('Failed to save template metadata');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload template');
      throw err;
    }
  };

  // Delete template file from Vercel Blob and remove metadata from Supabase
  const deleteTemplateFile = async (template: DocumentTemplate): Promise<void> => {
    try {
      setError(null);
      
      // Extract filename from file_url for blob deletion
      const filename = template.file_url.split('/').pop();
      if (filename) {
        // Delete file from Vercel Blob Storage
        const deleteResponse = await fetch(`/api/templates?file=maubieu/${filename}`, {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          console.warn('Failed to delete template file from blob storage');
        }
      }
      
      // Delete metadata from Supabase
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('template_id', template.template_id);
        
      if (deleteError) throw deleteError;
      
      setTemplates(prev => prev.filter(t => t.template_id !== template.template_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

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
            .select('assessment_id, status')
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
    templateId,
    customerId,
    collateralId,
    assessmentId,
    exportType
  }: GenerateDocumentParams): Promise<{ filename: string; url: string }> => {
    try {
      setError(null);

      // Validate required parameters
      if (!templateId || !customerId || !exportType) {
        throw new Error('Missing required parameters: templateId, customerId, exportType');
      }

      // === CLIENT-SIDE DATA LOGGING FOR DEBUGGING ===
      console.log('🚀 CLIENT-SIDE: Document Generation Started');
      console.log('======================================');
      console.log('Parameters:', { templateId, customerId, collateralId, assessmentId, exportType });
      
      // Fetch data for logging before API call
      console.log('📋 Fetching data for logging...');
      
      try {
        // Fetch customer data
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single();
          
        if (!customerError && customerData) {
          console.log('👤 CLIENT-SIDE Customer Data:');
          console.log('  - customer_id:', customerData.customer_id);
          console.log('  - customer_name:', customerData.customer_name);
          console.log('  - full_name:', customerData.full_name);
          console.log('  - id_number:', customerData.id_number);
          console.log('  - phone:', customerData.phone);
          console.log('  - email:', customerData.email);
          console.log('  - address:', customerData.address);
          console.log('  - metadata:', customerData.metadata);
          console.log('  - All customer keys:', Object.keys(customerData));
        }
        
        // Fetch collateral data if provided
        if (collateralId) {
          const { data: collateralData, error: collateralError } = await supabase
            .from('collaterals')
            .select('*')
            .eq('collateral_id', collateralId)
            .single();
            
          if (!collateralError && collateralData) {
            console.log('🏢 CLIENT-SIDE Collateral Data:');
            console.log('  - collateral_id:', collateralData.collateral_id);
            console.log('  - collateral_type:', collateralData.collateral_type);
            console.log('  - description:', collateralData.description);
            console.log('  - market_value:', collateralData.market_value);
            console.log('  - appraised_value:', collateralData.appraised_value);
            console.log('  - location:', collateralData.location);
            console.log('  - condition:', collateralData.condition);
            console.log('  - metadata:', collateralData.metadata);
            console.log('  - All collateral keys:', Object.keys(collateralData));
          }
        }
        
        // Fetch credit assessment data if provided
        if (assessmentId) {
          const { data: assessmentData, error: assessmentError } = await supabase
            .from('credit_assessments')
            .select('*')
            .eq('assessment_id', assessmentId)
            .single();
            
          if (!assessmentError && assessmentData) {
            console.log('💰 CLIENT-SIDE Credit Assessment Data:');
            console.log('  - assessment_id:', assessmentData.assessment_id);
            console.log('  - requested_amount:', assessmentData.requested_amount);
            console.log('  - approved_amount:', assessmentData.approved_amount);
            console.log('  - interest_rate:', assessmentData.interest_rate);
            console.log('  - loan_term:', assessmentData.loan_term);
            console.log('  - loan_purpose:', assessmentData.loan_purpose);
            console.log('  - loan_type:', assessmentData.loan_type);
            console.log('  - status:', assessmentData.status);
            console.log('  - assessment_details:', assessmentData.assessment_details);
            console.log('  - All assessment keys:', Object.keys(assessmentData));
          }
        }
        
        // Fetch template data
        const { data: templateData, error: templateError } = await supabase
          .from('templates')
          .select('*')
          .eq('template_id', templateId)
          .single();
          
        if (!templateError && templateData) {
          console.log('📄 CLIENT-SIDE Template Data:');
          console.log('  - template_id:', templateData.template_id);
          console.log('  - template_name:', templateData.template_name);
          console.log('  - template_type:', templateData.template_type);
          console.log('  - file_url:', templateData.file_url);
          console.log('  - All template keys:', Object.keys(templateData));
          console.log('  - value:', templateData.value);
        }
        
      } catch (debugError) {
        console.warn('⚠️ Error fetching debug data:', debugError);
      }
      
      console.log('======================================');
      console.log('🌐 Making API call to generate document...');

      // Generate document and save to blob storage
      const response = await fetch('/api/documents?return=json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          customerId,
          collateralId,
          creditAssessmentId: assessmentId,
          exportType,
        }),
      });

      if (!response.ok) {
        console.error('❌ API call failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error details:', errorData);
        throw new Error(errorData.error || `Document generation failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ API Response received:', result);
      
      const { filename, blobUrl } = result;

      if (!filename) {
        throw new Error('Could not get filename from response');
      }

      // Use blob URL if available, otherwise fallback to local path
      const fileUrl = blobUrl || `/ketqua/${filename}`;

      // Fetch template information to get the document type
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('template_type')
        .eq('template_id', templateId)
        .single();

      if (templateError) {
        throw new Error(`Failed to fetch template: ${templateError.message}`);
      }

      // Record the document in the database
      const { data: newDoc, error: saveError } = await supabase
        .from('documents')
        .insert([{
          document_type: templateData.template_type as DocumentType,
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
            .select('assessment_id, status')
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

      // Final success logging
      console.log('🎉 CLIENT-SIDE: Document Generation Completed Successfully!');
      console.log('===============================================');
      console.log('Generated filename:', filename);
      console.log('File URL:', fileUrl);
      console.log('Blob URL:', blobUrl);
      console.log('Template ID used:', templateId);
      console.log('Customer ID used:', customerId);
      console.log('Collateral ID used:', collateralId || 'None');
      console.log('Assessment ID used:', assessmentId || 'None');
      console.log('Export type:', exportType);
      console.log('===============================================');

      return { filename, url: fileUrl };
    } catch (err) {
      console.error('❌ CLIENT-SIDE: Document Generation Failed!');
      console.error('Error details:', err);
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
    templateId,
    customerId,
    collateralId,
    assessmentId,
    exportType
  }: GenerateDocumentParams): Promise<void> => {
    try {
      setError(null);

      // Validate required parameters
      if (!templateId || !customerId || !exportType) {
        throw new Error('Missing required parameters: templateId, customerId, exportType');
      }

      // Log download initiation
      console.log('📥 CLIENT-SIDE: Document Download Started');
      console.log('Parameters:', { templateId, customerId, collateralId, assessmentId, exportType });

      // Generate document for direct download (original behavior)
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          customerId,
          collateralId,
          creditAssessmentId: assessmentId,
          exportType,
        }),
      });

      if (!response.ok) {
        console.error('❌ Download API call failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Download error details:', errorData);
        throw new Error(errorData.error || `Document generation failed with status ${response.status}`);
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]?.replace(/['"]/g, '')
        : `template_${templateId}_${customerId}_${Date.now()}.${exportType}`;

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
      
      // Log successful download
      console.log('✅ CLIENT-SIDE: Document Download Completed Successfully!');
      console.log('Downloaded filename:', filename);
      console.log('Blob size:', blob.size, 'bytes');
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('❌ CLIENT-SIDE: Document Download Failed!');
      console.error('Download error details:', err);
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
    templates,
    loading,
    error,
    generateDocument,
    downloadDocument,
    deleteDocument,
    fetchDocuments,
    sendDocumentByEmail,
    fetchTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    uploadTemplate,
    deleteTemplateFile,
  };
}
