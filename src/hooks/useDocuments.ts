import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Document, DocumentType, DocumentExportType } from '@/lib/supabase'

export interface GenerateDocumentParams {
  documentType: DocumentType
  customerId: number
  collateralId?: number
  assessmentId?: number
  exportType: DocumentExportType
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all documents with related data
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('documents')
        .select('*, customer:customers!inner(*), collateral:collaterals(*), assessment:credit_assessments(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  // Generate and save a new document
  const generateDocument = async ({
    documentType,
    customerId,
    collateralId,
    assessmentId,
    exportType
  }: GenerateDocumentParams) => {
    try {
      setError(null)

      // First, fetch all required data
      const [customerRes, collateralRes, assessmentRes] = await Promise.all([
        // Always fetch customer
        supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single(),

        // Only fetch collateral if provided
        collateralId ? supabase
          .from('collaterals')
          .select('*')
          .eq('collateral_id', collateralId)
          .single() : null,

        // Only fetch assessment if provided
        assessmentId ? supabase
          .from('credit_assessments')
          .select('*')
          .eq('assessment_id', assessmentId)
          .single() : null
      ])

      // Check for errors
      if (customerRes.error) throw new Error(`Error fetching customer: ${customerRes.error.message}`)
      if (collateralId && collateralRes?.error) throw new Error(`Error fetching collateral: ${collateralRes.error.message}`)
      if (assessmentId && assessmentRes?.error) throw new Error(`Error fetching assessment: ${assessmentRes.error.message}`)

      // Prepare the request to the API
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
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generating document')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${documentType}_${customerId}_${new Date().getTime()}.${exportType}`

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Record the document in the database
      const { data: newDoc, error: saveError } = await supabase
        .from('documents')
        .insert([{
          document_type: documentType,
          customer_id: customerId,
          collateral_id: collateralId,
          assessment_id: assessmentId,
          file_name: filename,
          file_url: url // You might want to store this in a more permanent location
        }])
        .select('*, customer:customers!inner(*), collateral:collaterals(*), assessment:credit_assessments(*)')

      if (saveError) throw saveError

      // Update the documents list with the new document
      if (newDoc) {
        setDocuments(prevDocs => [...newDoc, ...prevDocs])
      }

      return { filename, url }
    } catch (err) {
      console.error('Error generating document:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate document')
      throw err
    }
  }

  // Delete a document
  const deleteDocument = async (documentId: number) => {
    try {
      setError(null)

      // First, try to delete the file from storage (if implemented)
      const document = documents.find(d => d.document_id === documentId)
      if (document?.file_url) {
        // You might want to add file deletion from storage here
        // For example: await storage.deleteFile(document.file_url)
      }
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId)

      if (error) throw error

      setDocuments(prevDocs => prevDocs.filter(doc => doc.document_id !== documentId))
    } catch (err) {
      console.error('Error deleting document:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      throw err
    }
  }

  // Effect to load documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  return {
    documents,
    loading,
    error,
    generateDocument,
    deleteDocument,
    fetchDocuments
  }
}
