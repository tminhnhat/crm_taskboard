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
 * Helper function to safely flatten metadata
 */
function safelyFlattenMetadata(metadata: any): Record<string, any> {
  if (!metadata) return {};
  
  try {
    if (typeof metadata === 'string') {
      // Try to parse JSON string
      const parsed = JSON.parse(metadata);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } else if (typeof metadata === 'object' && metadata !== null) {
      // Already an object, return as-is
      return metadata;
    }
  } catch (error) {
    // Ignore parse errors
  }
  return {};
}

/**
 * Helper function to create template data objects safely
 */
function createTemplateDataObject(data: any, metadataField: string): Record<string, any> {
  if (!data) return {};
  
  return {
    ...data,
    ...safelyFlattenMetadata(data[metadataField]),
  };
}

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

        // Prepare comprehensive template data for rendering
        const templateData = {
          // === FLATTENED FIELDS FOR BACKWARD COMPATIBILITY ===
          
          // Customer data - flattened
          customer_id: documentData.customer?.customer_id || '',
          customer_name: documentData.customer?.full_name || documentData.customer?.customer_name || '',
          full_name: documentData.customer?.full_name || '',
          id_number: documentData.customer?.id_number || '',
          phone: documentData.customer?.phone || '',
          email: documentData.customer?.email || '',
          address: documentData.customer?.address || '',
          customer_type: documentData.customer?.customer_type || '',
          date_of_birth: documentData.customer?.date_of_birth || '',
          gender: documentData.customer?.gender || '',
          // ...fields removed as requested
          cif_number: documentData.customer?.cif_number || '',
          id_issue_date: documentData.customer?.id_issue_date ? format(documentData.customer.id_issue_date, 'dd/MM/yyyy') : '',
          id_issue_authority: documentData.customer?.id_issue_authority || '',
          account_number: documentData.customer?.account_number || '',
          numerology_data: documentData.customer?.numerology_data || '',
          hobbys: documentData.customer?.hobbies || '',
          company_name: documentData.customer?.company_name || '',
          business_registration_number: documentData.customer?.business_registration_number || '',
          registration_date: documentData.customer?.registration_date ? format(documentData.customer.registration_date, 'dd/MM/yyyy') : '',
          legal_representative: documentData.customer?.legal_representative || '',
          business_sector: documentData.customer?.business_sector || '',
          legal_representative_cif_number: documentData.customer?.legal_representative_cif_number || '',
          business_registration_authority: documentData.customer?.business_registration_authority || '',
          relationship_manager: documentData.customer?.relationship_manager || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          location: documentData.collateral?.location || '',
          description: documentData.collateral?.description || '',
          value: documentData.collateral?.value || '',
          valuation_date: documentData.collateral?.valuation_date || '',
          owner_info: documentData.collateral?.owner_info || '',
          metadata: documentData.collateral?.metadata || '',
          re_evaluation_date: documentData.collateral?.re_evaluation_date || '',


          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_type: documentData.creditAssessment?.loan_type || '',
          assessment_status: documentData.creditAssessment?.status || '',
          staff_id: documentData.creditAssessment?.staff_id || '',
          product_id: documentData.creditAssessment?.product_id || '',
          department: documentData.creditAssessment?.department || '',
          department_head: documentData.creditAssessment?.department_head || '',
          fee_amount: documentData.creditAssessment?.fee_amount || '',
          assessment_details: documentData.creditAssessment?.assessment_details || '',
          
          
          // === COMPLETE OBJECTS FOR FULL ACCESS ===
          
          // Complete customer object with all fields and metadata
          customer: documentData.customer ? {
            ...documentData.customer,
            // Flatten metadata if it exists as JSON
            ...(documentData.customer.metadata && typeof documentData.customer.metadata === 'object' 
              ? documentData.customer.metadata 
              : {}),
          } : {},
          
          // Complete collateral object with all fields and metadata
          collateral: documentData.collateral ? {
            ...documentData.collateral,
            // Flatten metadata if it exists as JSON
            ...(documentData.collateral.metadata && typeof documentData.collateral.metadata === 'object' 
              ? documentData.collateral.metadata 
              : {}),
          } : {},
          
          // Complete credit assessment object with all fields and assessment_details
          creditAssessment: documentData.creditAssessment ? {
            ...documentData.creditAssessment,
            // Flatten assessment_details if it exists as JSON
            ...(documentData.creditAssessment.assessment_details && typeof documentData.creditAssessment.assessment_details === 'object' 
              ? documentData.creditAssessment.assessment_details 
              : {}),
          } : {},
          
          // === SYSTEM FIELDS ===
          
          // Date fields
          current_date: format(new Date(), 'dd/MM/yyyy'),
          current_year: format(new Date(), 'yyyy'),
          current_month: format(new Date(), 'MM'),
          current_day: format(new Date(), 'dd'),
          current_time: format(new Date(), 'HH:mm:ss'),
          current_datetime: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
          
          // Formatted currency values (for display)
          loan_amount_formatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(parseFloat(documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '0')),
          collateral_value_formatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(parseFloat(documentData.collateral?.appraised_value || documentData.collateral?.market_value || '0')),
        };

        // Render template with data
        doc.render(templateData);
        outBuffer = doc.getZip().generate({ 
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        contentType = CONTENT_TYPE_MAP[exportType];
        
      } catch (templateError) {
  // Handle DOCX template processing error
        
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`DOCX template file missing: ${template.template_name}`);
        }
        
        throw new Error(`DOCX template processing failed: ${errorMessage}`);
      }
    } else if (exportType === 'xlsx') {
      // Handle Excel documents with content rendering
      try {
  const templateBuffer = await fetchTemplateFromVercelBlob(template.file_url);
        
        // Read the Excel template
        const workbook = XLSX.read(templateBuffer, { type: 'buffer' });
        
        // Prepare comprehensive template data for Excel (similar to DOCX)
        const templateData = {
          // === FLATTENED FIELDS FOR BACKWARD COMPATIBILITY ===
          
          // Customer data - flattened
          customer_id: documentData.customer?.customer_id || '',
          customer_name: documentData.customer?.full_name || documentData.customer?.customer_name || '',
          full_name: documentData.customer?.full_name || '',
          id_number: documentData.customer?.id_number || '',
          phone: documentData.customer?.phone || '',
          email: documentData.customer?.email || '',
          address: documentData.customer?.address || '',
          customer_type: documentData.customer?.customer_type || '',
          date_of_birth: documentData.customer?.date_of_birth || '',
          gender: documentData.customer?.gender || '',
          cif_number: documentData.customer?.cif_number || '',
          id_issue_date: documentData.customer?.id_issue_date ? format(documentData.customer.id_issue_date, 'dd/MM/yyyy') : '',
          id_issue_authority: documentData.customer?.id_issue_authority || '',
          account_number: documentData.customer?.account_number || '',
          numerology_data: documentData.customer?.numerology_data || '',
          hobbys: documentData.customer?.hobbies || '',
          company_name: documentData.customer?.company_name || '',
          business_registration_number: documentData.customer?.business_registration_number || '',
          registration_date: documentData.customer?.registration_date ? format(documentData.customer.registration_date, 'dd/MM/yyyy') : '',
          legal_representative: documentData.customer?.legal_representative || '',
          business_sector: documentData.customer?.business_sector || '',
          legal_representative_cif_number: documentData.customer?.legal_representative_cif_number || '',
          business_registration_authority: documentData.customer?.business_registration_authority || '',
          relationship_manager: documentData.customer?.relationship_manager || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          location: documentData.collateral?.location || '',
          description: documentData.collateral?.description || '',
          value: documentData.collateral?.value || '',
          valuation_date: documentData.collateral?.valuation_date || '',
          owner_info: documentData.collateral?.owner_info || '',
          metadata: documentData.collateral?.metadata || '',
          re_evaluation_date: documentData.collateral?.re_evaluation_date || '',

          
          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_type: documentData.creditAssessment?.loan_type || '',
          assessment_status: documentData.creditAssessment?.status || '',
          staff_id: documentData.creditAssessment?.staff_id || '',
          product_id: documentData.creditAssessment?.product_id || '',
          department: documentData.creditAssessment?.department || '',
          department_head: documentData.creditAssessment?.department_head || '',
          fee_amount: documentData.creditAssessment?.fee_amount || '',
          assessment_details: documentData.creditAssessment?.assessment_details || '',
          
          // === COMPLETE OBJECTS FOR FULL ACCESS ===
          
          // Complete customer object with all fields and metadata
          customer: documentData.customer ? {
            ...documentData.customer,
            // Flatten metadata if it exists as JSON
            ...(documentData.customer.metadata && typeof documentData.customer.metadata === 'object' 
              ? documentData.customer.metadata 
              : {}),
          } : {},
          
          // Complete collateral object with all fields and metadata
          collateral: documentData.collateral ? {
            ...documentData.collateral,
            // Flatten metadata if it exists as JSON
            ...(documentData.collateral.metadata && typeof documentData.collateral.metadata === 'object' 
              ? documentData.collateral.metadata 
              : {}),
          } : {},
          
          // Complete credit assessment object with all fields and assessment_details
          creditAssessment: documentData.creditAssessment ? {
            ...documentData.creditAssessment,
            // Flatten assessment_details if it exists as JSON
            ...(documentData.creditAssessment.assessment_details && typeof documentData.creditAssessment.assessment_details === 'object' 
              ? documentData.creditAssessment.assessment_details 
              : {}),
          } : {},
          
          // === SYSTEM FIELDS ===
          
          // Date fields
          current_date: format(new Date(), 'dd/MM/yyyy'),
          current_year: format(new Date(), 'yyyy'),
          current_month: format(new Date(), 'MM'),
          current_day: format(new Date(), 'dd'),
          current_time: format(new Date(), 'HH:mm:ss'),
          current_datetime: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
          
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
          const worksheet = workbook.Sheets[sheetName];
          replaceExcelPlaceholders(worksheet, templateData);
        });
        
        // Generate the Excel buffer
        outBuffer = XLSX.write(workbook, { 
          type: 'buffer',
          bookType: 'xlsx',
          compression: true
        });
        
        contentType = CONTENT_TYPE_MAP[exportType];
  // XLSX document buffer generated
        
      } catch (templateError) {
  // Handle XLSX template processing error
        
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
    } catch (blobError) {
      // Continue without blob storage if it fails
    }

  // Final mapping summary log removed

    return {
      buffer: outBuffer,
      filename,
      contentType,
      blobUrl, // Add blob URL to response
    };

  } catch (error) {
  // Handle document generation error
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
  throw new Error('Template upload functionality not yet implemented');
}

// Send document by email from Vercel Blob storage
export async function sendDocumentByEmailFromBlob(fileName: string, email: string): Promise<void> {
  try {
    // Validate inputs
    if (!fileName || !email) {
      throw new Error('File name and email are required');
    }


    // Construct blob path - handle both full blob URLs and filenames
    let blobPath: string;
    if (fileName.startsWith('https://') && fileName.includes('vercel-blob')) {
      // Extract filename from blob URL
      const urlParts = fileName.split('/');
      const actualFileName = urlParts[urlParts.length - 1];
      blobPath = `ketqua/${actualFileName}`;
    } else {
      // Use filename as-is
      blobPath = fileName.startsWith('ketqua/') ? fileName : `ketqua/${fileName}`;
    }
    
    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration is not properly set up. Please configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and optionally EMAIL_USE_SSL environment variables.');
    }


    // Fetch document from Vercel Blob
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fetchTemplateFromVercelBlob(blobPath);
    } catch (fetchError) {
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
    } catch (verifyError) {
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
