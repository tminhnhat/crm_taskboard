import { supabase } from '@/lib/supabase';
import { format, addMonths } from 'date-fns';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
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
        const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${documentType}.docx`);
        
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.render(documentData);
        outBuffer = doc.getZip().generate({ type: 'nodebuffer' });
        contentType = CONTENT_TYPE_MAP[exportType];
      } catch (templateError) {
        // Provide a more user-friendly error message
        const errorMessage = templateError instanceof Error ? templateError.message : 'Unknown template error';
        if (errorMessage.includes('Template không tìm thấy') || errorMessage.includes('not found')) {
          throw new Error(`Template file missing: Please upload a template for document type "${documentType}" in the Templates dashboard before generating documents.`);
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

    return {
      buffer: outBuffer,
      filename,
      contentType,
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
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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

    const filePath = join(process.cwd(), 'ketqua', sanitizedFileName);
    
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
