import { NextRequest, NextResponse } from 'next/server';
import { generateCreditDocument, deleteDocument } from '@/lib/documentService';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// POST /api/documents - Generate and download document
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentType, customerId, collateralId, creditAssessmentId, exportType } = body;
    
    // Check if response should be JSON (for saving) or binary (for download)
    const returnJson = req.nextUrl.searchParams.get('return') === 'json';
    
    // Validate required fields
    if (!documentType || !customerId || !exportType) {
      return NextResponse.json({ 
        error: 'Missing required fields: documentType, customerId, exportType' 
      }, { status: 400 });
    }
    
    const result = await generateCreditDocument({
      documentType,
      customerId,
      collateralId,
      creditAssessmentId,
      exportType,
    });

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
    console.error('Document generation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Document generation failed' 
    }, { status: 500 });
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
