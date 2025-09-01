import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as XLSX from 'xlsx';
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
  templateId: number; // ID of selected template from database
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

/**
 * Helper function to format values for Excel cells
 */
function formatValueForExcel(value: any): string | number {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's a number string, try to convert to actual number for Excel
  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return numValue;
    }
  }
  
  // For dates, format appropriately
  if (value instanceof Date) {
    return format(value, 'dd/MM/yyyy');
  }
  
  return String(value);
}

/**
 * Helper function to replace placeholders in Excel worksheets
 */
function replaceExcelPlaceholders(worksheet: XLSX.WorkSheet, templateData: Record<string, any>): void {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Iterate through all cells in the worksheet
  for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v && typeof cell.v === 'string') {
        let cellValue = cell.v;
        let hasReplacement = false;
        
        // Replace placeholders with actual data
        Object.entries(templateData).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          if (cellValue.includes(placeholder)) {
            const formattedValue = formatValueForExcel(value);
            cellValue = cellValue.replace(new RegExp(placeholder, 'g'), String(formattedValue));
            hasReplacement = true;
          }
        });
        
        // Update cell if there were replacements
        if (hasReplacement) {
          // Try to determine if the final value should be a number
          const finalValue = /^\d+(\.\d+)?$/.test(cellValue) ? parseFloat(cellValue) : cellValue;
          
          worksheet[cellAddress] = {
            ...cell,
            v: finalValue,
            w: String(finalValue), // Display value
            t: typeof finalValue === 'number' ? 'n' : 's' // Cell type: number or string
          };
        }
      }
    }
  }
}

/**
 * Generate document with template content rendering
 * 
 * Supports both DOCX and XLSX templates with content generation:
 * 
 * DOCX Templates:
 * - Use Docxtemplater for content rendering
 * - Supports complex document structures
 * - Placeholders: {{customer_name}}, {{loan_amount}}, etc.
 * 
 * XLSX Templates:
 * - Use XLSX library for content rendering
 * - Supports multiple worksheets
 * - Placeholders: {{customer_name}}, {{loan_amount}}, etc.
 * - Numbers are automatically converted to Excel number format
 * - Available placeholders include:
 *   - Customer: {{customer_name}}, {{full_name}}, {{id_number}}, {{phone}}, {{email}}, {{address}}
 *   - Collateral: {{collateral_type}}, {{collateral_value}}, {{collateral_description}}
 *   - Credit: {{loan_amount}}, {{interest_rate}}, {{loan_term}}
 *   - Dates: {{current_date}}, {{current_year}}, {{current_month}}, {{current_day}}
 *   - Numbers: {{loan_amount_number}}, {{interest_rate_number}}, {{collateral_value_number}}
 *   - Formatted: {{loan_amount_formatted}}, {{collateral_value_formatted}}
 */
export async function generateCreditDocument({
  templateId,
  customerId,
  collateralId,
  creditAssessmentId,
  exportType,
}: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
  try {
    // Validate inputs
    if (!templateId || !customerId || !exportType) {
      throw new Error('Missing required parameters: templateId, customerId, exportType');
    }

    // Fetch template information first
    const templateResult = await supabase
      .from('templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (templateResult.error) {
      throw new Error(`Template not found: ${templateResult.error.message}`);
    }

    const template = templateResult.data;
    console.log(`Using template: ${template.template_name} (${template.template_type})`);

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
        .single() : Promise.resolve({ data: null, error: null })
    ]);

    // Validate required data
    if (customerResult.error) {
      throw new Error(`Customer not found: ${customerResult.error.message}`);
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
      // Handle Word documents with content rendering
      try {
        console.log(`Fetching DOCX template: ${template.template_name}`);
        const templateBuffer = await fetchTemplateFromVercelBlob(template.file_url);
        
        console.log(`DOCX template fetched successfully, size: ${templateBuffer.length} bytes`);
        
        // Basic validation - check if it's a valid ZIP file (DOCX format)
        const firstBytes = new Uint8Array(templateBuffer.slice(0, 4));
        if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
          throw new Error('Template file is not a valid DOCX format (invalid ZIP signature)');
        }
        
        // Initialize Docxtemplater for content generation
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: function(part: any) {
            // Return empty string for missing data instead of throwing error
            console.log(`Missing template variable: ${part.value || part.module || part.tag || 'unknown'}`);
            return '';
          }
        });

        // Prepare template data for rendering
        const templateData = {
          // Customer data - flattened
          customer_id: documentData.customer?.customer_id || '',
          customer_name: documentData.customer?.full_name || documentData.customer?.customer_name || '',
          full_name: documentData.customer?.full_name || '',
          id_number: documentData.customer?.id_number || '',
          phone: documentData.customer?.phone || '',
          email: documentData.customer?.email || '',
          address: documentData.customer?.address || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          
          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_amount: documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '',
          interest_rate: documentData.creditAssessment?.interest_rate || '',
          loan_term: documentData.creditAssessment?.loan_term || '',
          
          // Date fields
          current_date: format(new Date(), 'dd/MM/yyyy'),
          current_year: format(new Date(), 'yyyy'),
          
          // Keep original nested structure as backup
          customer: documentData.customer || {},
          collateral: documentData.collateral || {},
          creditAssessment: documentData.creditAssessment || {}
        };

        console.log('Template data prepared with keys:', Object.keys(templateData));
        
        // Render template with data
        doc.render(templateData);
        console.log('Document rendered successfully');
        
        outBuffer = doc.getZip().generate({ 
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        
        contentType = CONTENT_TYPE_MAP[exportType];
        console.log(`Generated DOCX document buffer size: ${outBuffer.length} bytes`);
        
      } catch (templateError) {
        console.error('DOCX template processing error:', templateError);
        
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`DOCX template file missing: ${template.template_name}`);
        }
        
        throw new Error(`DOCX template processing failed: ${errorMessage}`);
      }
    } else if (exportType === 'xlsx') {
      // Handle Excel documents with content rendering
      try {
        console.log(`Fetching XLSX template: ${template.template_name}`);
        const templateBuffer = await fetchTemplateFromVercelBlob(template.file_url);
        
        console.log(`XLSX template fetched successfully, size: ${templateBuffer.length} bytes`);
        
        // Read the Excel template
        const workbook = XLSX.read(templateBuffer, { type: 'buffer' });
        
        // Prepare template data for Excel (similar to DOCX)
        const templateData = {
          // Customer data - flattened
          customer_id: documentData.customer?.customer_id || '',
          customer_name: documentData.customer?.full_name || documentData.customer?.customer_name || '',
          full_name: documentData.customer?.full_name || '',
          id_number: documentData.customer?.id_number || '',
          phone: documentData.customer?.phone || '',
          email: documentData.customer?.email || '',
          address: documentData.customer?.address || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          
          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_amount: documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '',
          interest_rate: documentData.creditAssessment?.interest_rate || '',
          loan_term: documentData.creditAssessment?.loan_term || '',
          
          // Date fields
          current_date: format(new Date(), 'dd/MM/yyyy'),
          current_year: format(new Date(), 'yyyy'),
          current_month: format(new Date(), 'MM'),
          current_day: format(new Date(), 'dd'),
          
          // Additional Excel-friendly numeric fields
          loan_amount_number: parseFloat(documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '0'),
          interest_rate_number: parseFloat(documentData.creditAssessment?.interest_rate || '0'),
          loan_term_number: parseInt(documentData.creditAssessment?.loan_term || '0'),
          collateral_value_number: parseFloat(documentData.collateral?.appraised_value || documentData.collateral?.market_value || '0'),
          
          // Formatted currency values (for display)
          loan_amount_formatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(parseFloat(documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '0')),
          collateral_value_formatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(parseFloat(documentData.collateral?.appraised_value || documentData.collateral?.market_value || '0')),
        };

        console.log('Excel template data prepared with keys:', Object.keys(templateData));
        
        // Process each worksheet using the helper function
        workbook.SheetNames.forEach(sheetName => {
          console.log(`Processing Excel worksheet: ${sheetName}`);
          const worksheet = workbook.Sheets[sheetName];
          replaceExcelPlaceholders(worksheet, templateData);
        });
        
        console.log('Excel template rendered successfully');
        
        // Generate the Excel buffer
        outBuffer = XLSX.write(workbook, { 
          type: 'buffer',
          bookType: 'xlsx',
          compression: true
        });
        
        contentType = CONTENT_TYPE_MAP[exportType];
        console.log(`Generated XLSX document buffer size: ${outBuffer.length} bytes`);
        
      } catch (templateError) {
        console.error('XLSX template processing error:', templateError);
        
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`XLSX template file missing: ${template.template_name}`);
        }
        
        throw new Error(`XLSX template processing failed: ${errorMessage}`);
      }
    } else {
      throw new Error(`Unsupported export type: ${exportType}`);
    }

    // Create filename with timestamp
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${template.template_type}_${customerId}_${timestamp}.${exportType}`;

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
