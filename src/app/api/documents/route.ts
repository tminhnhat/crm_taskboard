import { NextRequest, NextResponse } from 'next/server';
import { generateCreditDocument, deleteDocument } from '@/lib/documentService';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// POST /api/documents - Generate and download document
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let documentType = '';
  let customerId = '';
  let collateralId = '';
  let creditAssessmentId = '';
  let exportType = '';
  
  try {
    console.log('Document generation request started');
    
    const body = await req.json();
    ({ documentType, customerId, collateralId, creditAssessmentId, exportType } = body);
    
    console.log('Request params:', { documentType, customerId, collateralId, creditAssessmentId, exportType });
    
    // Check if response should be JSON (for saving) or binary (for download)
    const returnJson = req.nextUrl.searchParams.get('return') === 'json';
    
    // Validate required fields
    if (!documentType || !customerId || !exportType) {
      console.error('Missing required fields:', { documentType, customerId, exportType });
      return NextResponse.json({ 
        error: 'Missing required fields: documentType, customerId, exportType' 
      }, { status: 400 });
    }
    
    // Validate document type and export type
    const validDocumentTypes = ['hop_dong_tin_dung', 'to_trinh_tham_dinh', 'giay_de_nghi_vay_von', 'bien_ban_dinh_gia', 'hop_dong_the_chap', 'bang_tinh_lai', 'lich_tra_no'];
    const validExportTypes = ['docx', 'xlsx'];
    
    if (!validDocumentTypes.includes(documentType)) {
      console.error('Invalid document type:', documentType);
      return NextResponse.json({ 
        error: `Invalid document type: ${documentType}. Valid types: ${validDocumentTypes.join(', ')}` 
      }, { status: 400 });
    }
    
    if (!validExportTypes.includes(exportType)) {
      console.error('Invalid export type:', exportType);
      return NextResponse.json({ 
        error: `Invalid export type: ${exportType}. Valid types: ${validExportTypes.join(', ')}` 
      }, { status: 400 });
    }
    
    console.log('Calling generateCreditDocument...');
    const result = await generateCreditDocument({
      documentType: documentType as any,
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
        documentType: documentType || 'undefined',
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
