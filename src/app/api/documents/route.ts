import { NextRequest, NextResponse } from 'next/server';
import { generateCreditDocument, deleteDocument } from '@/lib/documentService';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// POST /api/documents - Generate and download document
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let templateId = '';
  let customerId = '';
  let collateralId = '';
  let creditAssessmentId = '';
  let exportType = '';
  
  try {
    console.log('Document generation request started');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    let body;
    try {
      body = await req.json();
      console.log('Parsed request body:', body);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'
      }, { status: 400 });
    }
    
    ({ templateId, customerId, collateralId, creditAssessmentId, exportType } = body);
    
    console.log('Extracted params:', { templateId, customerId, collateralId, creditAssessmentId, exportType });
    
    // Check if response should be JSON (for saving) or binary (for download)
    const returnJson = req.nextUrl.searchParams.get('return') === 'json';
    console.log('Return type:', returnJson ? 'JSON' : 'binary');
    
    // Validate required fields with detailed logging
    const missingFields = [];
    if (!templateId) missingFields.push('templateId');
    if (!customerId) missingFields.push('customerId'); 
    if (!exportType) missingFields.push('exportType');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      console.error('Received values:', { templateId, customerId, exportType });
      return NextResponse.json({ 
        error: 'Missing required fields: ' + missingFields.join(', '),
        received: { templateId, customerId, exportType },
        required: ['templateId', 'customerId', 'exportType']
      }, { status: 400 });
    }
    
    // Validate export type
    const validExportTypes = ['docx', 'xlsx'];
    
    if (!validExportTypes.includes(exportType)) {
      console.error('Invalid export type:', exportType);
      console.error('Valid export types:', validExportTypes);
      return NextResponse.json({ 
        error: `Invalid export type: ${exportType}`,
        received: exportType,
        validTypes: validExportTypes,
        suggestion: 'Use either "docx" for Word documents or "xlsx" for Excel files'
      }, { status: 400 });
    }
    
    console.log('✅ All validations passed, proceeding with document generation...');
    
    console.log('Calling generateCreditDocument...');
    const result = await generateCreditDocument({
      templateId: parseInt(templateId),
      customerId,
      collateralId,
      creditAssessmentId,
      exportType: exportType as any,
    });
    
    console.log(`Document generation completed in ${Date.now() - startTime}ms`);

    // Return JSON response with blob URL if requested
    if (returnJson) {
      return NextResponse.json({
        filename: result.filename,
        contentType: result.contentType,
        blobUrl: result.blobUrl,
        size: result.buffer.length
      });
    }

    // Otherwise return the document for direct download
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Document generation failed after ${duration}ms:`, error);
    
    // Log detailed error information for debugging in Vercel
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log additional context for serverless debugging
      console.error('Request context:', {
        templateId: templateId || 'undefined',
        exportType: exportType || 'undefined', 
        customerId: customerId || 'undefined',
        collateralId: collateralId || 'undefined',
        creditAssessmentId: creditAssessmentId || 'undefined',
        userAgent: req.headers.get('user-agent'),
        runtime: process.env.VERCEL ? 'vercel-serverless' : 'local'
      });
    }
    
    // Provide user-friendly error messages based on error type
    let userMessage = 'Document generation failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('template không tìm thấy') || errorMsg.includes('template file missing')) {
        userMessage = 'Template file not found. Please upload the required template in the Templates section.';
        statusCode = 404;
      } else if (errorMsg.includes('template format error') || errorMsg.includes('template initialization failed')) {
        userMessage = 'Template file is corrupted or invalid. Please re-upload a valid DOCX template.';
        statusCode = 400;
      } else if (errorMsg.includes('multi error') || errorMsg.includes('template processing failed')) {
        userMessage = 'Template processing failed. The template file may be corrupted or incompatible. Please re-upload the template.';
        statusCode = 400;
      } else if (errorMsg.includes('customer not found')) {
        userMessage = 'Customer data not found. Please ensure the customer exists in the database.';
        statusCode = 404;
      } else if (errorMsg.includes('blob_read_write_token')) {
        userMessage = 'File storage configuration error. Please contact support.';
        statusCode = 500;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
        userMessage = 'Request timeout or network error. Please try again.';
        statusCode = 408;
      } else {
        userMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      error: userMessage,
      debug: process.env.NODE_ENV === 'development' ? {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      } : undefined
    }, { status: statusCode });
  }
}

// GET /api/documents?file=filename - Download existing document
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'ketqua', filename);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = readFileSync(filePath);
    const extension = filename.split('.').pop()?.toLowerCase();
    
    // Determine content type
    const contentTypeMap: Record<string, string> = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'pdf': 'application/pdf',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'File download failed' 
    }, { status: 500 });
  }
}

// DELETE /api/documents?file=filename - Delete document
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    const success = await deleteDocument(filename);
    
    if (!success) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Document deletion failed' 
    }, { status: 500 });
  }
}
