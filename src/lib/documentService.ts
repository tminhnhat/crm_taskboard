import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fetchTemplateFromVercelBlob, uploadBufferToVercelBlob, deleteDocumentFromVercelBlob } from '@/lib/vercelBlob';
import nodemailer from 'nodemailer';

// Type definitions
export type DocumentType =
  | 'hop_dong_tin_dung'
  | 'to_trinh_tham_dinh'
  | 'giay_de_nghi_vay_von'
  | 'bien_ban_dinh_gia'
  | 'hop_dong_the_chap'
  | 'don_dang_ky_the_chap'
  | 'hop_dong_thu_phi'
  | 'tai_lieu_khac';

export type ExportType = 'docx' | 'xlsx';

export interface GenerateDocumentOptions {
  documentType: DocumentType;
  customerId: string;
  collateralId?: string;
  creditAssessmentId?: string;
  exportType: ExportType;
}

export interface GenerateDocumentResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
  blobUrl?: string; // URL to document stored in Vercel Blob
}

export interface DocumentData {
  customer: any;
  collateral?: any;
  creditAssessment?: any;
}

// Content type mapping
const CONTENT_TYPE_MAP: Record<ExportType, string> = {
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export interface GenerateDocumentResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/**
 * Validates a DOCX template file for common corruption issues
 */
export async function generateCreditDocument({
  documentType,
  customerId,
  collateralId,
  creditAssessmentId,
  exportType,
}: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
  try {
    // Validate inputs
    if (!documentType || !customerId || !exportType) {
      throw new Error('Missing required parameters: documentType, customerId, exportType');
    }

    // Fetch data from database
    const [customerResult, collateralResult, creditAssessmentResult] = await Promise.all([
      // Always fetch customer
      supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId)
        .single(),
      
      // Conditionally fetch collateral
      collateralId ? supabase
        .from('collaterals')
        .select('*')
        .eq('collateral_id', collateralId)
        .single() : Promise.resolve({ data: null, error: null }),
      
      // Conditionally fetch credit assessment
      creditAssessmentId ? supabase
        .from('credit_assessments')
        .select('*')
        .eq('assessment_id', creditAssessmentId)
        .single() : Promise.resolve({ data: null, error: null }),
    ]);

    // Check for errors
    if (customerResult.error || !customerResult.data) {
      throw new Error(`Customer not found: ${customerResult.error?.message || 'Unknown error'}`);
    }

    if (collateralId && collateralResult.error) {
      throw new Error(`Collateral not found: ${collateralResult.error.message}`);
    }

    if (creditAssessmentId && creditAssessmentResult.error) {
      throw new Error(`Credit assessment not found: ${creditAssessmentResult.error.message}`);
    }

    const documentData: DocumentData = {
      customer: customerResult.data,
      collateral: collateralResult.data,
      creditAssessment: creditAssessmentResult.data,
    };

    // Generate document based on export type
    let outBuffer: Buffer;
    let contentType: string;

    if (exportType === 'docx') {
      // Handle Word documents - fetch template from Vercel Blob (simplified approach)
      try {
        console.log(`Fetching DOCX template for document type: ${documentType}`);
        const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${documentType}.docx`);
        
        console.log(`DOCX template fetched successfully, size: ${templateBuffer.length} bytes`);
        
        // Basic validation - check if it's a valid ZIP file (DOCX format)
        const firstBytes = new Uint8Array(templateBuffer.slice(0, 4));
        if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
          throw new Error('Template file is not a valid DOCX format (invalid ZIP signature)');
        }
        
        // For DOCX, we just return the template as-is for now (simplified approach)
        // No content generation - just template management like XLSX
        outBuffer = templateBuffer;
        contentType = CONTENT_TYPE_MAP[exportType];
        
        console.log('DOCX template processed successfully');
      } catch (templateError) {
        console.error('DOCX template processing error:', templateError);
        
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`DOCX template file missing: Please upload a DOCX template for document type "${documentType}" in the Templates dashboard.`);
        }
        
        throw new Error(`DOCX template loading failed: ${errorMessage}`);
      }
    } else if (exportType === 'xlsx') {
      // Handle Excel documents - fetch template from Vercel Blob
      try {
        console.log(`Fetching XLSX template for document type: ${documentType}`);
        const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${documentType}.xlsx`);
        
        console.log(`XLSX template fetched successfully, size: ${templateBuffer.length} bytes`);
        
        // For XLSX, we just return the template as-is for now (management/rendering only)
        // No content generation - just template management
        outBuffer = templateBuffer;
        contentType = CONTENT_TYPE_MAP[exportType];
        
        console.log('XLSX template processed successfully');
      } catch (templateError) {
        console.error('XLSX template processing error:', templateError);
        
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`XLSX template file missing: Please upload an XLSX template for document type "${documentType}" in the Templates dashboard.`);
        }
        
        throw new Error(`XLSX template loading failed: ${errorMessage}`);
      }
    } else if (exportType === 'pdf') {
      throw new Error('PDF export not yet implemented');
    } else {
      throw new Error(`Unsupported export type: ${exportType}`);
    }

    // Create filename with timestamp
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${documentType}_${customerId}_${timestamp}.${exportType}`;

    // Save document to Vercel Blob in ketqua folder
    let blobUrl: string | undefined = undefined;
    try {
      const blobPath = `ketqua/${filename}`;
      blobUrl = await uploadBufferToVercelBlob(outBuffer, blobPath);
      console.log(`Document saved to Vercel Blob: ${blobPath}`);
    } catch (blobError) {
      console.warn('Failed to save document to Vercel Blob:', blobError);
      // Continue without blob storage if it fails
    }

    return {
      buffer: outBuffer,
      filename,
      contentType,
      blobUrl, // Add blob URL to response
    };

  } catch (error) {
    console.error('Document generation error:', error);
    throw new Error(`Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search and filter documents (stub function for future implementation)
 */
export function searchDocuments({ 
  customerId, 
  loanId, 
  status 
}: { 
  customerId?: string; 
  loanId?: string; 
  status?: string; 
}): Promise<any[]> {
  // TODO: Implement document search functionality
  // This could read from ketqua folder and filter by filename patterns or metadata
  console.warn('searchDocuments function not yet implemented');
  return Promise.resolve([]);
}

/**
 * Upload template to Vercel Blob (stub function for future implementation)
 */
export async function uploadTemplateToVercelBlob(
  file: File, 
  documentType: DocumentType
): Promise<void> {
  // TODO: Implement template upload functionality
  // This would upload the file to Vercel Blob Storage under maubieu/ folder
  console.warn('uploadTemplateToVercelBlob function not yet implemented');
  throw new Error('Template upload functionality not yet implemented');
}

// Send document by email from Vercel Blob storage
export async function sendDocumentByEmailFromBlob(fileName: string, email: string): Promise<void> {
  try {
    // Validate inputs
    if (!fileName || !email) {
      throw new Error('File name and email are required');
    }

    console.log(`Attempting to send document: ${fileName} to ${email}`);

    // Construct blob path - handle both full blob URLs and filenames
    let blobPath: string;
    if (fileName.startsWith('https://') && fileName.includes('vercel-blob')) {
      // Extract filename from blob URL
      const urlParts = fileName.split('/');
      const actualFileName = urlParts[urlParts.length - 1];
      blobPath = `ketqua/${actualFileName}`;
      console.log(`Extracted filename from URL: ${actualFileName}`);
    } else {
      // Use filename as-is
      blobPath = fileName.startsWith('ketqua/') ? fileName : `ketqua/${fileName}`;
    }
    
    console.log(`Using blob path: ${blobPath}`);
    
    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration is not properly set up. Please configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and optionally EMAIL_USE_SSL environment variables.');
    }

    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      ssl: process.env.EMAIL_USE_SSL
    });

    // Fetch document from Vercel Blob
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fetchTemplateFromVercelBlob(blobPath);
      console.log(`Document fetched from blob: ${blobPath}, size: ${fileBuffer.length} bytes`);
    } catch (fetchError) {
      console.error('Failed to fetch document from blob:', fetchError);
      console.error('Blob path attempted:', blobPath);
      throw new Error(`Document not found: ${fileName}. Please ensure the document exists in blob storage.`);
    }

    // Configure transporter
    const useSSL = process.env.EMAIL_USE_SSL === 'true' || process.env.EMAIL_USE_SSL === 'True';
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: useSSL,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('SMTP configuration verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      throw new Error('Email server configuration error. Please check SMTP settings.');
    }

    // Extract clean filename for attachment
    const attachmentFileName = fileName.split('/').pop() || fileName;

    // Send email with attachment
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Tài liệu hồ sơ tín dụng: ${attachmentFileName}`,
      text: `Kính gửi,\n\nVui lòng xem tài liệu đính kèm.\n\nTrân trọng,\nHệ thống CRM`,
      html: `
        <p>Kính gửi,</p>
        <p>Vui lòng xem tài liệu đính kèm.</p>
        <p>Trân trọng,<br/>Hệ thống CRM</p>
      `,
      attachments: [
        {
          filename: attachmentFileName,
          content: fileBuffer,
        },
      ],
    });

    console.log(`Document ${fileName} sent to ${email} successfully`);
  } catch (error) {
    console.error('Error sending document by email from blob:', error);
    throw error;
  }
}

export async function deleteDocument(fileName: string): Promise<boolean> {
  try {
    // Validate input
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid filename provided');
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedFileName !== fileName) {
      throw new Error('Invalid characters in filename');
    }

    try {
      // Delete from Vercel Blob
      const blobPath = `ketqua/${sanitizedFileName}`;
      await deleteDocumentFromVercelBlob(blobPath);
      console.log(`Document deleted from Vercel Blob: ${blobPath}`);
      return true;
    } catch (blobError) {
      console.warn('Failed to delete from Vercel Blob:', blobError);
      return false;
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
