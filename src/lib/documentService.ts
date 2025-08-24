import { supabase } from '@/lib/supabase';
import { format, addMonths } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob, uploadBufferToVercelBlob, deleteDocumentFromVercelBlob } from '@/lib/vercelBlob';
import * as XLSX from 'xlsx';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';

// Type definitions
export type DocumentType =
  | 'hop_dong_tin_dung'
  | 'to_trinh_tham_dinh'
  | 'giay_de_nghi_vay_von'
  | 'bien_ban_dinh_gia'
  | 'hop_dong_the_chap'
  | 'bang_tinh_lai'
  | 'lich_tra_no';

export type ExportType = 'docx' | 'pdf' | 'xlsx';

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

export interface ExcelRow {
  [key: string]: string | number | Date;
}

// Content type mapping
const CONTENT_TYPE_MAP: Record<ExportType, string> = {
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'pdf': 'application/pdf',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};



// Excel generation functions
function generateInterestCalculationSheet(creditAssessment: any, customer: any): any[][] {
  const rows: any[][] = [];
  
  // Validate required data
  if (!creditAssessment?.approved_amount || !creditAssessment?.interest_rate || !creditAssessment?.loan_term) {
    throw new Error('Missing required credit assessment data for interest calculation');
  }

  // Header section
  rows.push(['INTEREST CALCULATION TABLE', '', '', '', '']);
  rows.push(['Customer:', customer.full_name || 'N/A', '', 'ID Number:', customer.id_number || 'N/A']);
  rows.push(['Loan Amount:', creditAssessment.loan_info?.amount?.approved || 0, 'VND', '', '']);
  rows.push(['Interest Rate:', creditAssessment.loan_info?.interest?.final_rate || 0, '%/year', '', '']);
  rows.push(['Loan Term:', creditAssessment.loan_info?.term?.approved_months || 0, 'months', '', '']);
  rows.push(['', '', '', '', '']);
  rows.push(['Period', 'Date', 'Principal Balance', 'Interest Due', 'Total Payment']);

  const startDate = new Date();
  const loanAmount = creditAssessment.loan_info?.amount?.approved || 0;
  const annualRate = creditAssessment.loan_info?.interest?.final_rate || 0;
  const termInMonths = creditAssessment.loan_info?.term?.approved_months || 0;
  
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = (loanAmount * monthlyRate) / 
                        (1 - Math.pow(1 + monthlyRate, -termInMonths));
  let balance = loanAmount;

  for (let month = 1; month <= termInMonths; month++) {
    const date = addMonths(startDate, month - 1);
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    
    rows.push([
      month,
      format(date, 'dd/MM/yyyy'),
      Math.round(balance),
      Math.round(interest),
      Math.round(monthlyPayment)
    ]);
    
    balance -= principal;
  }

  return rows;
}

function generateRepaymentScheduleSheet(creditAssessment: any, customer: any): any[][] {
  const rows: any[][] = [];
  
  // Validate required data
  const loanAmount = creditAssessment?.loan_info?.amount?.approved || 0;
  const termInMonths = creditAssessment?.loan_info?.term?.approved_months || 0;
  
  if (!loanAmount || !termInMonths) {
    throw new Error('Missing required credit assessment data for repayment schedule');
  }

  // Header section
  rows.push(['REPAYMENT SCHEDULE', '', '', '']);
  rows.push(['Customer:', customer.full_name || 'N/A', 'ID Number:', customer.id_number || 'N/A']);
  rows.push(['Loan Amount:', loanAmount, 'VND', '']);
  rows.push(['', '', '', '']);
  rows.push(['Period', 'Due Date', 'Amount', 'Status']);

  const startDate = new Date();
  const monthlyPayment = loanAmount / termInMonths;

  for (let month = 1; month <= termInMonths; month++) {
    const dueDate = addMonths(startDate, month);
    rows.push([
      month,
      format(dueDate, 'dd/MM/yyyy'),
      Math.round(monthlyPayment),
      'Pending' // Status will be updated manually
    ]);
  }

  return rows;
}

function generateExcelBuffer(documentType: DocumentType, data: DocumentData): Buffer {
  try {
    const workbook = XLSX.utils.book_new();
    let worksheet: XLSX.WorkSheet;
    let rows: any[][];

    switch (documentType) {
      case 'bang_tinh_lai': {
        rows = generateInterestCalculationSheet(data.creditAssessment, data.customer);
        worksheet = XLSX.utils.aoa_to_sheet(rows);
        break;
      }
      
      case 'lich_tra_no': {
        rows = generateRepaymentScheduleSheet(data.creditAssessment, data.customer);
        worksheet = XLSX.utils.aoa_to_sheet(rows);
        break;
      }

      default:
        throw new Error(`Excel generation not supported for document type: ${documentType}`);
    }

    // Apply styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!cols'] = [
      { wch: 8 },   // Column A
      { wch: 15 },  // Column B
      { wch: 15 },  // Column C
      { wch: 15 },  // Column D
      { wch: 15 }   // Column E
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
  } catch (error) {
    throw new Error(`Excel generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface GenerateDocumentResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/**
 * Validates a DOCX template file for common corruption issues
 */
function validateDocxTemplate(buffer: Buffer): { isValid: boolean; error?: string } {
  try {
    // Check minimum file size (empty DOCX is around 6KB)
    if (buffer.length < 1000) {
      return { isValid: false, error: 'Template file is too small (likely corrupted)' };
    }

    // Check ZIP signature
    const firstBytes = buffer.subarray(0, 4);
    if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
      return { isValid: false, error: 'Not a valid ZIP/DOCX file (invalid signature)' };
    }

    // Try to read as ZIP
    try {
      const zip = new PizZip(buffer);
      
      // Check for required DOCX files
      const requiredFiles = [
        '[Content_Types].xml',
        'word/document.xml',
        '_rels/.rels'
      ];

      for (const file of requiredFiles) {
        if (!zip.file(file)) {
          return { isValid: false, error: `Missing required file: ${file}` };
        }
      }

      // Try to read document.xml content
      const documentXml = zip.file('word/document.xml');
      if (documentXml) {
        const content = documentXml.asText();
        if (!content || content.length < 100) {
          return { isValid: false, error: 'Document content is empty or too small' };
        }
        
        // Check for basic XML structure
        if (!content.includes('<w:document') || !content.includes('</w:document>')) {
          return { isValid: false, error: 'Invalid document XML structure' };
        }
      }

      return { isValid: true };
    } catch (zipError) {
      return { isValid: false, error: `ZIP parsing failed: ${zipError instanceof Error ? zipError.message : 'Unknown ZIP error'}` };
    }
  } catch (error) {
    return { isValid: false, error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

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

    if (exportType === 'xlsx' && (documentType === 'bang_tinh_lai' || documentType === 'lich_tra_no')) {
      // Handle Excel files
      outBuffer = generateExcelBuffer(documentType, documentData);
      contentType = CONTENT_TYPE_MAP[exportType];
    } else if (exportType === 'docx') {
      // Handle Word documents - fetch template from Vercel Blob
      try {
        console.log(`Fetching template for document type: ${documentType}`);
        const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${documentType}.docx`);
        
        console.log(`Template fetched successfully, size: ${templateBuffer.length} bytes`);
        
        // Validate template using our comprehensive validation function
        const validation = validateDocxTemplate(templateBuffer);
        if (!validation.isValid) {
          throw new Error(`Template file is corrupted or invalid: ${validation.error}. Please re-upload a valid DOCX template.`);
        }
        console.log('Template validation passed');

        // Validate DOCX file signature (should start with PK for ZIP format)
        const firstBytes = new Uint8Array(templateBuffer.slice(0, 4));
        if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
          throw new Error('Template file is not a valid DOCX format (invalid ZIP signature)');
        }

        // Initialize Docxtemplater with better error handling for serverless
        let doc: any;
        try {
          console.log('Initializing PizZip with template buffer...');
          const zip = new PizZip(templateBuffer);
          
          // Validate that it's a proper DOCX by checking for required files
          try {
            const contentTypesFile = zip.file('[Content_Types].xml');
            if (!contentTypesFile) {
              throw new Error('Template file is corrupted: missing [Content_Types].xml');
            }
            
            const documentFile = zip.file('word/document.xml');
            if (!documentFile) {
              throw new Error('Template file is corrupted: missing word/document.xml');
            }
            console.log('Template structure validation passed');
          } catch (structureError) {
            console.error('Template structure validation failed:', structureError);
            throw new Error(`Template file is corrupted or invalid. Please re-upload a valid DOCX template. Details: ${structureError instanceof Error ? structureError.message : 'Unknown structure error'}`);
          }

          doc = new Docxtemplater(zip, { 
            paragraphLoop: true, 
            linebreaks: true,
            nullGetter: function(part: any) {
              // Return empty string for missing data instead of throwing error
              console.log(`Missing template variable: ${part.value || part.module || part.tag || 'unknown'}`);
              return '';
            }
          });
          console.log('Docxtemplater initialized successfully');
        } catch (initError: any) {
          console.error('Template initialization error:', initError);
          
          // Handle specific PizZip errors
          if (initError.message && initError.message.includes('Can\'t read the data')) {
            throw new Error('Template file is corrupted or invalid. Please re-upload a valid DOCX template.');
          }
          
          if (initError.message && initError.message.includes('corrupted')) {
            throw new Error('Template file is corrupted or invalid. Please re-upload a valid DOCX template.');
          }
          
          // Handle Docxtemplater initialization errors
          if (initError.message && initError.message.includes('Missing template variable')) {
            throw new Error(`Template has invalid structure: ${initError.message}`);
          }
          
          throw new Error(`Template file is corrupted or invalid. Please re-upload a valid DOCX template. Details: ${initError.message || 'Unknown initialization error'}`);
        }
        
        // Add comprehensive error handling for template rendering
        try {
          console.log('Rendering document with data keys:', Object.keys(documentData));
          
          // Prepare flattened template data for better compatibility
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
          console.log('Sample template data:', {
            customer_name: templateData.customer_name,
            customer_id: templateData.customer_id,
            loan_amount: templateData.loan_amount
          });
          
          // Try to get template variables before rendering
          try {
            const templateText = doc.getFullText();
            console.log('Template text length:', templateText.length);
            console.log('Template contains placeholders:', templateText.includes('{'));
          } catch (textError) {
            console.log('Could not extract template text:', textError);
          }

          doc.render(templateData);
          console.log('Document rendered successfully');
          
          outBuffer = doc.getZip().generate({ 
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          });
          console.log(`Generated document buffer size: ${outBuffer.length} bytes`);
          contentType = CONTENT_TYPE_MAP[exportType];
        } catch (renderError: any) {
          console.error('Template rendering error:', renderError);
          console.error('Render error type:', typeof renderError);
          console.error('Render error name:', renderError.name);
          
          // Handle Docxtemplater-specific errors with detailed logging
          if (renderError.properties && renderError.properties.errors) {
            console.error('Docxtemplater errors:', renderError.properties.errors);
            const errorDetails = renderError.properties.errors.map((err: any) => {
              console.error('Template error detail:', err);
              
              // Handle specific error types
              if (err.message && err.message.includes('Unclosed tag')) {
                return `Unclosed template tag: {${err.part || 'unknown'}} - check template syntax`;
              }
              if (err.message && err.message.includes('Unopened tag')) {
                return `Unopened template tag: ${err.part || 'unknown'} - check template syntax`;
              }
              
              return `${err.message || err.name || 'Template syntax error'} at ${err.part || 'unknown location'}`;
            }).join('; ');
            throw new Error(`Template has syntax errors: ${errorDetails}`);
          }
          
          // Handle Multi error with enhanced debugging
          if (renderError.message && renderError.message.includes('Multi error')) {
            console.error('Multi error detected, extracting detailed information...');
            console.error('Full render error object:', JSON.stringify(renderError, null, 2));
            
            // Try to extract detailed error information
            let errorDetails = [];
            
            // Check if error has properties with detailed errors
            if (renderError.properties) {
              console.error('Error properties:', JSON.stringify(renderError.properties, null, 2));
              
              if (renderError.properties.errors && Array.isArray(renderError.properties.errors)) {
                errorDetails = renderError.properties.errors.map((err: any, index: number) => {
                  console.error(`Error ${index + 1}:`, JSON.stringify(err, null, 2));
                  
                  let errorDesc = `Error ${index + 1}: `;
                  if (err.name) errorDesc += `${err.name} - `;
                  if (err.message) errorDesc += `${err.message} `;
                  if (err.properties && err.properties.part) {
                    errorDesc += `at "${err.properties.part.value || err.properties.part}" `;
                  }
                  if (err.properties && err.properties.offset !== undefined) {
                    errorDesc += `(offset: ${err.properties.offset}) `;
                  }
                  
                  return errorDesc.trim();
                }).filter(Boolean);
              }
            }
            
            // Also check for common template issues
            let diagnosticInfo = [];
            try {
              const fullText = doc.getFullText();
              console.log('Template full text preview:', fullText.substring(0, 200));
              
              if (fullText.includes('{') && fullText.includes('}')) {
                const openBrackets = (fullText.match(/\{/g) || []).length;
                const closeBrackets = (fullText.match(/\}/g) || []).length;
                if (openBrackets !== closeBrackets) {
                  diagnosticInfo.push(`Bracket mismatch: ${openBrackets} opening, ${closeBrackets} closing`);
                }
                
                if (fullText.includes('{{') || fullText.includes('}}')) {
                  diagnosticInfo.push('Double brackets detected {{ }}');
                }
                if (fullText.includes('{#') || fullText.includes('{/')) {
                  diagnosticInfo.push('Loop syntax detected {# } {/ }');
                }
              }
            } catch (textError) {
              diagnosticInfo.push('Cannot analyze template structure');
            }
            
            // Combine all error information
            let finalError = 'Template Multi error details:\n';
            if (errorDetails.length > 0) {
              finalError += `Specific errors: ${errorDetails.join('; ')}\n`;
            }
            if (diagnosticInfo.length > 0) {
              finalError += `Diagnostics: ${diagnosticInfo.join('; ')}\n`;
            }
            finalError += 'Please check template syntax and ensure all placeholders use simple {variable_name} format.';
            
            throw new Error(finalError);
          }
          
          // Handle other specific Docxtemplater errors
          if (renderError.message && renderError.message.includes('Unclosed tag')) {
            throw new Error(`Template syntax error: Found unclosed template tag. Please check that all {placeholders} are properly closed.`);
          }
          
          if (renderError.message && renderError.message.includes('Unopened tag')) {
            throw new Error(`Template syntax error: Found unopened template tag. Please check that all }placeholders{ have matching opening brackets.`);
          }
          
          throw new Error(`Template rendering failed: ${renderError.message || 'Unknown rendering error'}. Please verify template format and syntax.`);
        }
      } catch (templateError) {
        console.error('Template processing error:', templateError);
        
        // Provide a more user-friendly error message
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`Template file missing: Please upload a template for document type "${documentType}" in the Templates dashboard before generating documents.`);
        }
        
        if (errorMessage.includes('Template rendering failed') || errorMessage.includes('Template format error') || errorMessage.includes('Template initialization failed')) {
          // Re-throw specific errors as they already have good context
          throw templateError;
        }
        
        // Handle generic "Multi error" from Docxtemplater
        if (errorMessage.includes('Multi error')) {
          throw new Error(`Template processing failed: The template file for "${documentType}" appears to be corrupted or incompatible. Please re-upload the template file with proper .docx format.`);
        }
        
        throw new Error(`Template loading failed: ${errorMessage}`);
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

// Hàm gửi mail tài liệu
export async function sendDocumentByEmail(documentPath: string, email: string): Promise<void> {
  // Validate inputs
  if (!documentPath || !email) {
    throw new Error('Document path and email are required');
  }

  if (!existsSync(documentPath)) {
    throw new Error(`Document not found: ${documentPath}`);
  }

  // Read file
  const fileName = documentPath.split('/').pop() || 'document';
  const fileBuffer = readFileSync(documentPath);

  // Cấu hình transporter (cần cấu hình biến môi trường thực tế)
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

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Tài liệu hồ sơ tín dụng: ${fileName}`,
    text: 'Vui lòng xem file đính kèm.',
    attachments: [
      {
        filename: fileName,
        content: fileBuffer,
      },
    ],
  });
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
      // Try to delete from Vercel Blob first
      const blobPath = `ketqua/${sanitizedFileName}`;
      await deleteDocumentFromVercelBlob(blobPath);
      console.log(`Document deleted from Vercel Blob: ${blobPath}`);
      return true;
    } catch (blobError) {
      console.warn('Failed to delete from Vercel Blob:', blobError);
      
      // Fallback to local file system deletion
      const filePath = join(process.cwd(), 'ketqua', sanitizedFileName);
      
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        console.log(`Document deleted from local storage: ${filePath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
