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
    console.log('🔧 Flattening metadata:', typeof metadata, metadata);
    
    if (typeof metadata === 'string') {
      // Try to parse JSON string
      const parsed = JSON.parse(metadata);
      console.log('  ✅ Parsed JSON metadata:', parsed);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } else if (typeof metadata === 'object' && metadata !== null) {
      // Already an object, return as-is
      console.log('  ✅ Object metadata used as-is:', metadata);
      return metadata;
    }
  } catch (error) {
    console.warn('  ❌ Failed to parse metadata as JSON:', error);
  }
  
  console.log('  ⚠️ Returning empty object for metadata');
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

    // Debug: Log document data being used
    console.log('=== DEBUG: Raw Database Data ===');
    console.log('Customer data:', JSON.stringify(documentData.customer, null, 2));
    console.log('Collateral data:', JSON.stringify(documentData.collateral, null, 2));
    console.log('Credit assessment data:', JSON.stringify(documentData.creditAssessment, null, 2));
    console.log('Template info:', JSON.stringify(template, null, 2));
    
    // Debug: Log specific fields for mapping verification
    console.log('=== DEBUG: Field Mapping Verification ===');
    
    // Customer fields
    console.log('🔍 Customer Fields:');
    console.log('  - customer_id:', documentData.customer?.customer_id);
    console.log('  - customer_name:', documentData.customer?.customer_name);
    console.log('  - full_name:', documentData.customer?.full_name);
    console.log('  - id_number:', documentData.customer?.id_number);
    console.log('  - phone:', documentData.customer?.phone);
    console.log('  - email:', documentData.customer?.email);
    console.log('  - address:', documentData.customer?.address);
    console.log('  - customer_type:', documentData.customer?.customer_type);
    console.log('  - date_of_birth:', documentData.customer?.date_of_birth);
    console.log('  - gender:', documentData.customer?.gender);
    console.log('  - marital_status:', documentData.customer?.marital_status);
    console.log('  - occupation:', documentData.customer?.occupation);
    console.log('  - income:', documentData.customer?.income);
    console.log('  - cif_number:', documentData.customer?.cif_number);
    console.log('  - metadata:', documentData.customer?.metadata);
    console.log('  - All customer keys:', documentData.customer ? Object.keys(documentData.customer) : 'null');
    
    // Collateral fields
    console.log('🏢 Collateral Fields:');
    if (documentData.collateral) {
      console.log('  - collateral_id:', documentData.collateral.collateral_id);
      console.log('  - collateral_type:', documentData.collateral.collateral_type);
      console.log('  - description:', documentData.collateral.description);
      console.log('  - market_value:', documentData.collateral.market_value);
      console.log('  - appraised_value:', documentData.collateral.appraised_value);
      console.log('  - location:', documentData.collateral.location);
      console.log('  - condition:', documentData.collateral.condition);
      console.log('  - ownership_status:', documentData.collateral.ownership_status);
      console.log('  - metadata:', documentData.collateral.metadata);
      console.log('  - All collateral keys:', Object.keys(documentData.collateral));
    } else {
      console.log('  - No collateral data provided');
    }
    
    // Credit assessment fields
    console.log('💰 Credit Assessment Fields:');
    if (documentData.creditAssessment) {
      console.log('  - assessment_id:', documentData.creditAssessment.assessment_id);
      console.log('  - requested_amount:', documentData.creditAssessment.requested_amount);
      console.log('  - approved_amount:', documentData.creditAssessment.approved_amount);
      console.log('  - interest_rate:', documentData.creditAssessment.interest_rate);
      console.log('  - loan_term:', documentData.creditAssessment.loan_term);
      console.log('  - loan_purpose:', documentData.creditAssessment.loan_purpose);
      console.log('  - loan_type:', documentData.creditAssessment.loan_type);
      console.log('  - status:', documentData.creditAssessment.status);
      console.log('  - assessment_details:', documentData.creditAssessment.assessment_details);
      console.log('  - All credit assessment keys:', Object.keys(documentData.creditAssessment));
    } else {
      console.log('  - No credit assessment data provided');
    }
    console.log('=== END Field Mapping Verification ===');

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
          marital_status: documentData.customer?.marital_status || '',
          occupation: documentData.customer?.occupation || '',
          income: documentData.customer?.income || '',
          cif_number: documentData.customer?.cif_number || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          market_value: documentData.collateral?.market_value || '',
          appraised_value: documentData.collateral?.appraised_value || '',
          location: documentData.collateral?.location || '',
          condition: documentData.collateral?.condition || '',
          ownership_status: documentData.collateral?.ownership_status || '',
          
          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_amount: documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '',
          interest_rate: documentData.creditAssessment?.interest_rate || '',
          loan_term: documentData.creditAssessment?.loan_term || '',
          loan_purpose: documentData.creditAssessment?.loan_purpose || '',
          loan_type: documentData.creditAssessment?.loan_type || '',
          assessment_status: documentData.creditAssessment?.status || '',
          
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

        console.log('Template data prepared with keys:', Object.keys(templateData));
        
        // Log metadata processing for DOCX
        console.log('🔄 DOCX Template - Metadata Processing:');
        if (documentData.customer?.metadata) {
          console.log('  Customer metadata found:', documentData.customer.metadata);
          console.log('  Customer metadata type:', typeof documentData.customer.metadata);
        }
        if (documentData.collateral?.metadata) {
          console.log('  Collateral metadata found:', documentData.collateral.metadata);
          console.log('  Collateral metadata type:', typeof documentData.collateral.metadata);
        }
        if (documentData.creditAssessment?.assessment_details) {
          console.log('  Credit assessment details found:', documentData.creditAssessment.assessment_details);
          console.log('  Credit assessment details type:', typeof documentData.creditAssessment.assessment_details);
        }
        
        console.log('=== DEBUG: Template Data for DOCX ===');
        
        // Log flattened fields that will be used in templates
        console.log('📋 Flattened Customer Fields for Template:');
        console.log('  customer_id:', templateData.customer_id);
        console.log('  customer_name:', templateData.customer_name);
        console.log('  full_name:', templateData.full_name);
        console.log('  id_number:', templateData.id_number);
        console.log('  phone:', templateData.phone);
        console.log('  email:', templateData.email);
        console.log('  address:', templateData.address);
        console.log('  customer_type:', templateData.customer_type);
        console.log('  date_of_birth:', templateData.date_of_birth);
        console.log('  gender:', templateData.gender);
        console.log('  marital_status:', templateData.marital_status);
        console.log('  occupation:', templateData.occupation);
        console.log('  income:', templateData.income);
        console.log('  cif_number:', templateData.cif_number);
        
        console.log('🏢 Flattened Collateral Fields for Template:');
        console.log('  collateral_id:', templateData.collateral_id);
        console.log('  collateral_type:', templateData.collateral_type);
        console.log('  collateral_value:', templateData.collateral_value);
        console.log('  collateral_description:', templateData.collateral_description);
        console.log('  market_value:', templateData.market_value);
        console.log('  appraised_value:', templateData.appraised_value);
        console.log('  location:', templateData.location);
        console.log('  condition:', templateData.condition);
        console.log('  ownership_status:', templateData.ownership_status);
        
        console.log('💰 Flattened Credit Assessment Fields for Template:');
        console.log('  assessment_id:', templateData.assessment_id);
        console.log('  loan_amount:', templateData.loan_amount);
        console.log('  interest_rate:', templateData.interest_rate);
        console.log('  loan_term:', templateData.loan_term);
        console.log('  loan_purpose:', templateData.loan_purpose);
        console.log('  loan_type:', templateData.loan_type);
        console.log('  assessment_status:', templateData.assessment_status);
        
        console.log('📅 System Generated Fields:');
        console.log('  current_date:', templateData.current_date);
        console.log('  current_year:', templateData.current_year);
        console.log('  current_month:', templateData.current_month);
        console.log('  current_day:', templateData.current_day);
        console.log('  current_time:', templateData.current_time);
        console.log('  current_datetime:', templateData.current_datetime);
        
        console.log('💵 Formatted Values:');
        console.log('  loan_amount_formatted:', templateData.loan_amount_formatted);
        console.log('  collateral_value_formatted:', templateData.collateral_value_formatted);
        
        console.log('📦 Complete Objects (with metadata flattened):');
        console.log('Customer object in template:', JSON.stringify(templateData.customer, null, 2));
        console.log('Collateral object in template:', JSON.stringify(templateData.collateral, null, 2));
        console.log('Credit assessment object in template:', JSON.stringify(templateData.creditAssessment, null, 2));
        
        console.log('🔍 Template Placeholder Examples:');
        console.log('Use {{customer_name}} for customer name');
        console.log('Use {{loan_amount}} for loan amount');
        console.log('Use {{collateral_value}} for collateral value');
        console.log('Use {{current_date}} for current date');
        console.log('Use {{customer.metadata.custom_field}} for custom metadata fields');
        console.log('=== END DEBUG ===');
        
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
          marital_status: documentData.customer?.marital_status || '',
          occupation: documentData.customer?.occupation || '',
          income: documentData.customer?.income || '',
          cif_number: documentData.customer?.cif_number || '',
          
          // Collateral data - flattened  
          collateral_id: documentData.collateral?.collateral_id || '',
          collateral_type: documentData.collateral?.collateral_type || '',
          collateral_value: documentData.collateral?.appraised_value || documentData.collateral?.market_value || '',
          collateral_description: documentData.collateral?.description || '',
          market_value: documentData.collateral?.market_value || '',
          appraised_value: documentData.collateral?.appraised_value || '',
          location: documentData.collateral?.location || '',
          condition: documentData.collateral?.condition || '',
          ownership_status: documentData.collateral?.ownership_status || '',
          
          // Credit assessment data - flattened
          assessment_id: documentData.creditAssessment?.assessment_id || '',
          loan_amount: documentData.creditAssessment?.approved_amount || documentData.creditAssessment?.requested_amount || '',
          interest_rate: documentData.creditAssessment?.interest_rate || '',
          loan_term: documentData.creditAssessment?.loan_term || '',
          loan_purpose: documentData.creditAssessment?.loan_purpose || '',
          loan_type: documentData.creditAssessment?.loan_type || '',
          assessment_status: documentData.creditAssessment?.status || '',
          
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
        
        // Log metadata processing for Excel
        console.log('🔄 Excel Template - Metadata Processing:');
        if (documentData.customer?.metadata) {
          console.log('  Customer metadata found:', documentData.customer.metadata);
          console.log('  Customer metadata type:', typeof documentData.customer.metadata);
        }
        if (documentData.collateral?.metadata) {
          console.log('  Collateral metadata found:', documentData.collateral.metadata);
          console.log('  Collateral metadata type:', typeof documentData.collateral.metadata);
        }
        if (documentData.creditAssessment?.assessment_details) {
          console.log('  Credit assessment details found:', documentData.creditAssessment.assessment_details);
          console.log('  Credit assessment details type:', typeof documentData.creditAssessment.assessment_details);
        }
        
        console.log('=== DEBUG: Excel Template Data ===');
        
        // Log flattened fields that will be used in Excel templates
        console.log('📋 Flattened Customer Fields for Excel Template:');
        console.log('  customer_id:', templateData.customer_id);
        console.log('  customer_name:', templateData.customer_name);
        console.log('  full_name:', templateData.full_name);
        console.log('  id_number:', templateData.id_number);
        console.log('  phone:', templateData.phone);
        console.log('  email:', templateData.email);
        console.log('  address:', templateData.address);
        console.log('  customer_type:', templateData.customer_type);
        console.log('  date_of_birth:', templateData.date_of_birth);
        console.log('  gender:', templateData.gender);
        console.log('  marital_status:', templateData.marital_status);
        console.log('  occupation:', templateData.occupation);
        console.log('  income:', templateData.income);
        console.log('  cif_number:', templateData.cif_number);
        
        console.log('🏢 Flattened Collateral Fields for Excel Template:');
        console.log('  collateral_id:', templateData.collateral_id);
        console.log('  collateral_type:', templateData.collateral_type);
        console.log('  collateral_value:', templateData.collateral_value);
        console.log('  collateral_description:', templateData.collateral_description);
        console.log('  market_value:', templateData.market_value);
        console.log('  appraised_value:', templateData.appraised_value);
        console.log('  location:', templateData.location);
        console.log('  condition:', templateData.condition);
        console.log('  ownership_status:', templateData.ownership_status);
        
        console.log('💰 Flattened Credit Assessment Fields for Excel Template:');
        console.log('  assessment_id:', templateData.assessment_id);
        console.log('  loan_amount:', templateData.loan_amount);
        console.log('  interest_rate:', templateData.interest_rate);
        console.log('  loan_term:', templateData.loan_term);
        console.log('  loan_purpose:', templateData.loan_purpose);
        console.log('  loan_type:', templateData.loan_type);
        console.log('  assessment_status:', templateData.assessment_status);
        
        console.log('📅 System Generated Fields for Excel:');
        console.log('  current_date:', templateData.current_date);
        console.log('  current_year:', templateData.current_year);
        console.log('  current_month:', templateData.current_month);
        console.log('  current_day:', templateData.current_day);
        console.log('  current_time:', templateData.current_time);
        console.log('  current_datetime:', templateData.current_datetime);
        
        console.log('🔢 Numeric Fields for Excel (proper number format):');
        console.log('  loan_amount_number:', templateData.loan_amount_number, '(type:', typeof templateData.loan_amount_number, ')');
        console.log('  interest_rate_number:', templateData.interest_rate_number, '(type:', typeof templateData.interest_rate_number, ')');
        console.log('  loan_term_number:', templateData.loan_term_number, '(type:', typeof templateData.loan_term_number, ')');
        console.log('  collateral_value_number:', templateData.collateral_value_number, '(type:', typeof templateData.collateral_value_number, ')');
        
        console.log('💵 Formatted Values for Excel:');
        console.log('  loan_amount_formatted:', templateData.loan_amount_formatted);
        console.log('  collateral_value_formatted:', templateData.collateral_value_formatted);
        
        console.log('📦 Complete Objects for Excel (with metadata flattened):');
        console.log('Customer object in Excel template:', JSON.stringify(templateData.customer, null, 2));
        console.log('Collateral object in Excel template:', JSON.stringify(templateData.collateral, null, 2));
        console.log('Credit assessment object in Excel template:', JSON.stringify(templateData.creditAssessment, null, 2));
        
        console.log('🔍 Excel Template Placeholder Examples:');
        console.log('Use {{customer_name}} for customer name');
        console.log('Use {{loan_amount_number}} for numeric loan amount (Excel numbers)');
        console.log('Use {{loan_amount_formatted}} for formatted loan amount (display)');
        console.log('Use {{collateral_value_number}} for numeric collateral value');
        console.log('Use {{current_date}} for current date');
        console.log('=== END Excel DEBUG ===');
        
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

    // Final mapping summary log
    console.log('📋 FINAL MAPPING SUMMARY - Document Generation Complete');
    console.log('======================================================');
    console.log('Template used:', template.template_name, '(' + template.template_type + ')');
    console.log('Export type:', exportType);
    console.log('Generated filename:', filename);
    console.log('Buffer size:', outBuffer.length, 'bytes');
    console.log('Blob URL:', blobUrl || 'Not saved to blob');
    console.log('Customer ID used:', customerId);
    console.log('Collateral ID used:', collateralId || 'None');
    console.log('Credit Assessment ID used:', creditAssessmentId || 'None');
    console.log('======================================================');

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
